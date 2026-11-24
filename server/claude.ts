import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

/** Persona and idea generation: the steps where originality matters most. */
export const CREATIVE_MODEL = "claude-sonnet-5-5";
/** Panel, summary, translation and revisions: fast and cheap. */
export const FAST_MODEL = "claude-haiku-5-5";
export type Model = typeof CREATIVE_MODEL | typeof FAST_MODEL;

/** How hard the model thinks. These models take no temperature; effort is the control. */
export type Effort = "low" | "medium" | "high";

const MAX_TOKENS = 16000;

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new HttpError(
      500,
      "ANTHROPIC_API_KEY is not configured on the server. Add it to .env.local (or the host's environment variables)."
    );
  }
  // The SDK reads ANTHROPIC_API_KEY itself and retries 429/5xx twice by default.
  client ??= new Anthropic();
  return client;
}

class RefusalError extends HttpError {
  constructor() {
    super(422, "The model declined this request. Try rewording the problem or the idea.");
  }
}

function assertNotRefused(message: Anthropic.Message): void {
  if (message.stop_reason === "refusal") {
    throw new RefusalError();
  }
  if (message.stop_reason === "max_tokens") {
    throw new HttpError(502, "The model's reply was cut off before it finished. Please try again.");
  }
}

export interface Prompt {
  model: Model;
  system: string;
  user: string;
  effort: Effort;
}

/**
 * The two models run different safety classifiers, so a request the creative model
 * declines is retried once on the fast model before the user sees an error.
 */
async function withRefusalRetry<T>(prompt: Prompt, attempt: (model: Model) => Promise<T>): Promise<T> {
  try {
    return await attempt(prompt.model);
  } catch (error) {
    if (error instanceof RefusalError && prompt.model !== FAST_MODEL) {
      return attempt(FAST_MODEL);
    }
    throw error;
  }
}

/** One request whose reply is guaranteed to match `schema`. */
export async function generateStructured<T extends z.ZodType>(
  prompt: Prompt,
  schema: T
): Promise<z.infer<T>> {
  return withRefusalRetry(prompt, async (model) => {
    const message = await getClaudeClient().messages.parse({
      model,
      max_tokens: MAX_TOKENS,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
      output_config: { effort: prompt.effort, format: zodOutputFormat(schema) },
    });
    assertNotRefused(message);
    if (message.parsed_output == null) {
      throw new HttpError(502, "The model's reply did not match the expected format. Please try again.");
    }
    return message.parsed_output as z.infer<T>;
  });
}

/** One request whose reply is plain prose. */
export async function generateText(prompt: Prompt): Promise<string> {
  const message = await getClaudeClient().messages.create({
    model: prompt.model,
    max_tokens: MAX_TOKENS,
    system: prompt.system,
    messages: [{ role: "user", content: prompt.user }],
    output_config: { effort: prompt.effort },
  });
  assertNotRefused(message);
  // The reply can begin with thinking blocks, so pick text blocks by type.
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

/** Streams a schema-constrained reply, calling `onText` with each piece of JSON text. */
export async function streamStructured<T extends z.ZodType>(
  prompt: Prompt,
  schema: T,
  onText: (delta: string) => void
): Promise<void> {
  let sentText = false;
  await withRefusalRetry(prompt, async (model) => {
    const stream = getClaudeClient().messages.stream({
      model,
      max_tokens: MAX_TOKENS,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
      output_config: { effort: prompt.effort, format: zodOutputFormat(schema) },
    });
    stream.on("text", (delta) => {
      sentText = true;
      onText(delta);
    });
    const message = await stream.finalMessage();
    // Once part of a reply has reached the browser, a retry would duplicate it.
    if (message.stop_reason === "refusal" && sentText) {
      throw new HttpError(422, "The model stopped partway through. Please try again.");
    }
    assertNotRefused(message);
  });
}

export function formatClaudeError(
  error: unknown,
  fallbackPrefix: string
): { status: number; message: string } {
  if (error instanceof HttpError) {
    return { status: error.status, message: error.message };
  }
  if (error instanceof Anthropic.AuthenticationError) {
    return { status: 401, message: "The Anthropic API key is invalid. Check ANTHROPIC_API_KEY." };
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return {
      status: 403,
      message: "This Anthropic API key is not allowed to use the configured Claude model.",
    };
  }
  if (error instanceof Anthropic.RateLimitError) {
    return { status: 429, message: "Anthropic rate limit reached. Please try again shortly." };
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return { status: 502, message: `${fallbackPrefix}: could not reach the Anthropic API.` };
  }
  if (error instanceof Anthropic.APIError) {
    const status = typeof error.status === "number" ? error.status : 500;
    return { status, message: `${fallbackPrefix}: ${error.message}` };
  }
  const message = error instanceof Error ? error.message : String(error);
  return { status: 500, message: `${fallbackPrefix}: ${message}` };
}
