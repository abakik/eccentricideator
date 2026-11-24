import express from "express";
import type { Request, Response } from "express";
import type {
  DesignProblem,
  Persona,
  Idea,
  DeepDivePersona,
  DiscussionRound,
  DiscussionResponse,
  DeepDiveFocusMode,
} from "../../types.js";
import {
  HttpError,
  formatClaudeError,
  generateStructured,
  generateText,
  streamStructured,
} from "../claude.js";
import {
  MAX_IDEA_WORDS,
  PANEL_ROLE_IDS,
  PERSONA_FIELDS,
  discussionPrompt,
  ideaRevisionPrompt,
  ideaRevisionSchema,
  ideasPrompt,
  ideasSchema,
  panelPrompt,
  panelSchema,
  personaPrompt,
  personaSchema,
  problemRevisionPrompt,
  problemRevisionSchema,
  summaryPrompt,
  summarySchema,
  translationPrompt,
  translationSchema,
} from "../prompts.js";

const PANEL_COLORS = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-yellow-500"];

/** The prompt asks for MAX_IDEA_WORDS; this only catches a badly overlong idea. */
const HARD_IDEA_WORD_LIMIT = MAX_IDEA_WORDS + 20;

type RawIdea = { text: string; rationale: string };

function isNonEmptyString(val: unknown): val is string {
  return typeof val === "string" && val.trim().length > 0;
}

function requireProblem(problem: DesignProblem | undefined): string {
  if (!problem || !isNonEmptyString(problem.description)) {
    throw new HttpError(400, "A design problem description is required.");
  }
  return problem.description;
}

function sendError(res: Response, error: unknown, fallbackPrefix: string): void {
  const formatted = formatClaudeError(error, fallbackPrefix);
  res.status(formatted.status).json({ error: formatted.message });
}

function buildIdea(raw: RawIdea, personaId: string, index: number): Idea {
  const words = raw.text.trim().split(/\s+/);
  const text =
    words.length > HARD_IDEA_WORD_LIMIT ? `${words.slice(0, HARD_IDEA_WORD_LIMIT).join(" ")}…` : raw.text.trim();
  return {
    id: `idea-${Date.now()}-${index}`,
    text,
    rationale: raw.rationale.trim(),
    personaId,
    pinned: false,
    note: "",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Pulls each complete object out of the first JSON array in a partially streamed document,
 * so ideas can be sent to the browser as soon as each one is finished.
 */
function extractCompletedObjects(
  buffer: string,
  fromIndex: number
): { objects: RawIdea[]; nextIndex: number } {
  const objects: RawIdea[] = [];
  let inArray = fromIndex > 0;
  let objStart = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let lastConsumedIndex = fromIndex;

  for (let i = fromIndex; i < buffer.length; i++) {
    const ch = buffer[i];

    if (!inArray) {
      if (ch === "[") {
        inArray = true;
        lastConsumedIndex = i + 1;
      }
      continue;
    }

    if (objStart === -1) {
      if (ch === "{") {
        objStart = i;
        depth = 1;
        inString = false;
        escaped = false;
      } else if (ch === "]") {
        lastConsumedIndex = i + 1;
        break;
      }
      continue;
    }

    if (escaped) {
      escaped = false;
    } else if (ch === "\\") {
      if (inString) escaped = true;
    } else if (ch === '"') {
      inString = !inString;
    } else if (!inString) {
      if (ch === "{") {
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0) {
          const parsed = JSON.parse(buffer.substring(objStart, i + 1)) as Partial<RawIdea>;
          if (typeof parsed.text === "string" && typeof parsed.rationale === "string") {
            objects.push(parsed as RawIdea);
          }
          objStart = -1;
          lastConsumedIndex = i + 1;
        }
      }
    }
  }

  return { objects, nextIndex: objStart !== -1 ? objStart : lastConsumedIndex };
}

export const claudeRouter = express.Router();

// 1. Generate the eccentric persona
claudeRouter.post("/persona", async (req: Request, res: Response) => {
  try {
    const { designProblem, domainHint, eccentricityLevel } = req.body as {
      designProblem?: DesignProblem;
      domainHint?: string;
      eccentricityLevel?: number;
    };
    const problem = requireProblem(designProblem);
    const level =
      typeof eccentricityLevel === "number" && eccentricityLevel >= 1 && eccentricityLevel <= 5
        ? Math.round(eccentricityLevel)
        : 3;

    const generated = await generateStructured(
      personaPrompt(problem, typeof domainHint === "string" ? domainHint : "", level),
      personaSchema
    );

    const fields = Object.fromEntries(
      PERSONA_FIELDS.map((field) => [field.key, generated[field.key as string] ?? ""])
    );
    const persona = {
      ...fields,
      id: `persona-${Date.now()}`,
      problemId: designProblem?.id,
      createdAt: new Date().toISOString(),
    } as Persona;

    res.json(persona);
  } catch (error) {
    sendError(res, error, "Failed to generate persona");
  }
});

// 2. Generate ideas, streamed to the browser one idea at a time (server-sent events)
claudeRouter.post("/ideas", async (req: Request, res: Response) => {
  let streaming = false;
  try {
    const { designProblem, persona, numberOfIdeas, existingIdeas } = req.body as {
      designProblem?: DesignProblem;
      persona?: Persona;
      numberOfIdeas?: number;
      existingIdeas?: unknown;
    };
    const problem = requireProblem(designProblem);
    if (!persona || !isNonEmptyString(persona.id) || !isNonEmptyString(persona.nameAlias)) {
      throw new HttpError(400, "A locked persona is required.");
    }
    const count =
      typeof numberOfIdeas === "number" && numberOfIdeas >= 1 && numberOfIdeas <= 10
        ? Math.floor(numberOfIdeas)
        : 5;
    const existing = Array.isArray(existingIdeas) ? existingIdeas.filter(isNonEmptyString) : [];

    let buffer = "";
    let cursor = 0;
    let emitted = 0;

    await streamStructured(ideasPrompt(problem, persona, count, existing), ideasSchema, (delta) => {
      if (!streaming) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        streaming = true;
      }
      buffer += delta;
      const { objects, nextIndex } = extractCompletedObjects(buffer, cursor);
      cursor = nextIndex;
      for (const raw of objects) {
        const idea = buildIdea(raw, persona.id, emitted++);
        res.write(`data: ${JSON.stringify({ type: "idea", idea })}\n\n`);
      }
    });

    if (emitted === 0) {
      throw new HttpError(502, "The model returned no ideas. Please try again.");
    }
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (error) {
    if (streaming) {
      const formatted = formatClaudeError(error, "Failed to generate ideas");
      res.write(`data: ${JSON.stringify({ type: "error", error: formatted.message })}\n\n`);
      res.end();
    } else {
      sendError(res, error, "Failed to generate ideas");
    }
  }
});

// 3. Translate an idea into buildable solutions
claudeRouter.post("/translate", async (req: Request, res: Response) => {
  try {
    const { idea, persona, designProblem } = req.body as {
      idea?: Idea;
      persona?: Persona;
      designProblem?: DesignProblem;
    };
    if (!idea || !isNonEmptyString(idea.text)) {
      throw new HttpError(400, "An idea is required.");
    }
    if (!persona || !isNonEmptyString(persona.nameAlias)) {
      throw new HttpError(400, "A persona is required.");
    }
    const problem = requireProblem(designProblem);

    const { solutions } = await generateStructured(
      translationPrompt(problem, persona, idea),
      translationSchema
    );
    res.json({ solutions: solutions.filter(isNonEmptyString) });
  } catch (error) {
    sendError(res, error, "Failed to translate idea to solutions");
  }
});

// 4. Deep dive: assemble the panel
claudeRouter.post("/deep-dive/personas", async (req: Request, res: Response) => {
  try {
    const { ideaText, problemDescription } = req.body as {
      ideaText?: string;
      problemDescription?: string;
    };
    if (!isNonEmptyString(ideaText) || !isNonEmptyString(problemDescription)) {
      throw new HttpError(400, "ideaText and problemDescription are required.");
    }

    const { personas } = await generateStructured(panelPrompt(problemDescription, ideaText), panelSchema);

    // Seats are matched by role id, so the order the model writes them in does not matter.
    const panel: DeepDivePersona[] = PANEL_ROLE_IDS.map((id, index) => {
      const member = personas.find((p) => p.id === id);
      if (!member) {
        throw new HttpError(502, "The model returned an incomplete panel. Please try again.");
      }
      return { ...member, avatarColor: PANEL_COLORS[index] };
    });

    res.json({ personas: panel });
  } catch (error) {
    sendError(res, error, "Failed to generate Deep Dive personas");
  }
});

// 5. Deep dive: one discussion round
claudeRouter.post("/deep-dive/discussion", async (req: Request, res: Response) => {
  try {
    const { idea, deepDivePersonas, previousRounds, currentProblemDescription, focusMode } =
      req.body as {
        idea?: Idea;
        deepDivePersonas?: DeepDivePersona[];
        previousRounds?: DiscussionRound[];
        currentProblemDescription?: string;
        focusMode?: DeepDiveFocusMode;
      };
    if (!idea || !isNonEmptyString(idea.text)) {
      throw new HttpError(400, "An idea is required.");
    }
    if (!Array.isArray(deepDivePersonas) || deepDivePersonas.length === 0) {
      throw new HttpError(400, "deepDivePersonas array is required.");
    }
    if (!isNonEmptyString(currentProblemDescription)) {
      throw new HttpError(400, "currentProblemDescription is required.");
    }
    const mode: DeepDiveFocusMode = focusMode === "problem" ? "problem" : "solution";
    const rounds = Array.isArray(previousRounds) ? previousRounds : [];

    // Panellists speak at the same time within a round, each having heard every earlier round.
    const settled = await Promise.allSettled(
      deepDivePersonas.map((speaker) =>
        generateText(
          discussionPrompt(speaker, deepDivePersonas, idea, currentProblemDescription, mode, rounds)
        )
      )
    );

    if (settled.every((result) => result.status === "rejected")) {
      throw (settled[0] as PromiseRejectedResult).reason;
    }

    const responses: DiscussionResponse[] = settled.map((result, index) => {
      const speaker = deepDivePersonas[index];
      if (result.status === "rejected") {
        console.error(`Discussion response failed for ${speaker.name}:`, result.reason);
      }
      return {
        personaId: speaker.id,
        personaName: speaker.name,
        responseText:
          result.status === "fulfilled"
            ? result.value
            : `(No response: ${formatClaudeError(result.reason, "request failed").message})`,
        avatarColor: speaker.avatarColor,
      };
    });

    res.json({ responses });
  } catch (error) {
    sendError(res, error, "Failed to generate discussion round");
  }
});

// 6. Deep dive: summarise the discussion
claudeRouter.post("/deep-dive/summarise", async (req: Request, res: Response) => {
  try {
    const { idea, discussionRounds, currentProblemDescription, focusMode } = req.body as {
      idea?: Idea;
      discussionRounds?: DiscussionRound[];
      currentProblemDescription?: string;
      focusMode?: DeepDiveFocusMode;
    };
    if (!idea || !isNonEmptyString(idea.text)) {
      throw new HttpError(400, "An idea is required.");
    }
    if (!isNonEmptyString(currentProblemDescription)) {
      throw new HttpError(400, "currentProblemDescription is required.");
    }
    const rounds = Array.isArray(discussionRounds) ? discussionRounds : [];
    if (rounds.length === 0) {
      res.json({ summaryPoints: [] });
      return;
    }
    const mode: DeepDiveFocusMode = focusMode === "problem" ? "problem" : "solution";

    const { points } = await generateStructured(
      summaryPrompt(idea, rounds, currentProblemDescription, mode),
      summarySchema
    );
    res.json({ summaryPoints: points.filter(isNonEmptyString) });
  } catch (error) {
    sendError(res, error, "Failed to summarise discussion");
  }
});

// 7. Deep dive: revise the idea
claudeRouter.post("/deep-dive/revise-idea", async (req: Request, res: Response) => {
  try {
    const { originalIdea, selectedSummaryPoints, currentProblemDescription, originalPersona } =
      req.body as {
        originalIdea?: Idea;
        selectedSummaryPoints?: string[];
        currentProblemDescription?: string;
        originalPersona?: Persona | null;
      };
    if (!originalIdea || !isNonEmptyString(originalIdea.text)) {
      throw new HttpError(400, "An originalIdea is required.");
    }
    if (!Array.isArray(selectedSummaryPoints)) {
      throw new HttpError(400, "selectedSummaryPoints array is required.");
    }
    if (selectedSummaryPoints.length === 0) {
      res.json({ revisedText: originalIdea.text, revisedRationale: originalIdea.rationale });
      return;
    }
    if (!isNonEmptyString(currentProblemDescription)) {
      throw new HttpError(400, "currentProblemDescription is required.");
    }
    const persona =
      originalPersona && isNonEmptyString(originalPersona.nameAlias) ? originalPersona : undefined;

    const revision = await generateStructured(
      ideaRevisionPrompt(originalIdea, selectedSummaryPoints, currentProblemDescription, persona),
      ideaRevisionSchema
    );
    res.json(revision);
  } catch (error) {
    sendError(res, error, "Failed to revise idea");
  }
});

// 8. Deep dive: revise the problem statement
claudeRouter.post("/deep-dive/revise-problem", async (req: Request, res: Response) => {
  try {
    const { originalProblemDescription, selectedSummaryPoints } = req.body as {
      originalProblemDescription?: string;
      selectedSummaryPoints?: string[];
    };
    if (!isNonEmptyString(originalProblemDescription)) {
      throw new HttpError(400, "originalProblemDescription is required.");
    }
    if (!Array.isArray(selectedSummaryPoints)) {
      throw new HttpError(400, "selectedSummaryPoints array is required.");
    }
    if (selectedSummaryPoints.length === 0) {
      res.json({ revisedProblemDescription: originalProblemDescription });
      return;
    }

    const revision = await generateStructured(
      problemRevisionPrompt(originalProblemDescription, selectedSummaryPoints),
      problemRevisionSchema
    );
    res.json(revision);
  } catch (error) {
    sendError(res, error, "Failed to revise problem description");
  }
});
