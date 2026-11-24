import { z } from "zod";
import type {
  DeepDiveFocusMode,
  DeepDivePersona,
  DiscussionRound,
  Idea,
  Persona,
} from "../types.js";
import { CREATIVE_MODEL, FAST_MODEL, type Prompt } from "./claude.js";

export const MAX_IDEA_WORDS = 40;
export const MAX_PROBLEM_CHARS = 500;

/** Wraps team-written text in a tag so the model reads it as material, not instructions. */
function tag(name: string, value: string): string {
  return `<${name}>\n${value.trim()}\n</${name}>`;
}

// ---------------------------------------------------------------------------
// 1. Eccentric persona
// ---------------------------------------------------------------------------

/** Field order here is the order of the persona sheet shown to the idea-generating model. */
export const PERSONA_FIELDS: Array<{ key: keyof Persona; label: string; guidance: string }> = [
  { key: "nameAlias", label: "Name / alias", guidance: "A short, memorable name or alias." },
  {
    key: "archetypeDefiningEssence",
    label: "Archetype",
    guidance: "A phrase of under ten words capturing who they are, built on their trade or obsession.",
  },
  {
    key: "originStoryCatalyst",
    label: "Origin story",
    guidance: "The event or circumstance that made them think the way they do.",
  },
  {
    key: "apparentAgeTrueAge",
    label: "Apparent and true age",
    guidance: "A short phrase. Give both ages only if they differ.",
  },
  { key: "coreEnvironmentHabitat", label: "Habitat", guidance: "Where they live and work, in concrete detail." },
  {
    key: "coreBeliefSystemWorldview",
    label: "Worldview",
    guidance: "The central belief about how the world works that everything else follows from.",
  },
  { key: "primaryValuesMotivations", label: "Values and motivations", guidance: "What they care about and pursue." },
  {
    key: "informationProcessingLearningStyle",
    label: "How they take in information",
    guidance: "What they pay attention to and which sense, signal, or kind of experience they trust most.",
  },
  {
    key: "primaryModeOfReasoningHeuristics",
    label: "Reasoning heuristics",
    guidance:
      "Two or three specific rules of thumb they apply to any problem, concrete enough that someone else could apply them.",
  },
  {
    key: "relationshipWithLogicRationality",
    label: "Relationship with logic",
    guidance: "Where they follow conventional logic and where they depart from it.",
  },
  {
    key: "signatureEccentricitiesQuirks",
    label: "Quirks",
    guidance: "Two or three behavioural quirks that follow from their beliefs.",
  },
  { key: "communicationStyleLexicon", label: "Voice", guidance: "How they speak: vocabulary, metaphors, rhythm." },
  {
    key: "emotionalLandscapeExpression",
    label: "Emotional expression",
    guidance: "What moves them and how it shows.",
  },
  {
    key: "interactionWithNormalWorldPeople",
    label: "Dealing with ordinary people",
    guidance: "How they get on with conventional people and institutions.",
  },
  {
    key: "uniquePerspectiveOnDesignProblemDomain",
    label: "How they see this problem",
    guidance: "Their reinterpretation of the team's exact design problem through their worldview.",
  },
  {
    key: "eccentricCriteriaForGoodIdeaSolution",
    label: "Their criteria for a good idea",
    guidance: "Two or three tests an idea must pass to satisfy them.",
  },
  {
    key: "potentialSourcesOfNoveltyInspiration",
    label: "Sources of inspiration",
    guidance: "The specific places, materials, or phenomena they draw ideas from.",
  },
  {
    key: "forbiddenApproachesAntiGoals",
    label: "Forbidden approaches",
    guidance: "Kinds of solution they refuse on principle.",
  },
];

export const personaSchema = z.object(
  Object.fromEntries(
    PERSONA_FIELDS.map((field) => [field.key, z.string().describe(`${field.label}. ${field.guidance}`)])
  ) as Record<string, z.ZodString>
);

/** Used when the team gives no hint; there is no temperature control, so variety comes from the seed. */
const PERSONA_SEEDS = [
  // Trades that know things through the body, the senses, timing or other people.
  // Keeper-and-recorder trades (archivists, compilers, night guards) are left out on
  // purpose: they pull every persona towards ledgers and logbooks.
  "a competitive pigeon racer",
  "a perfumer who lost their sense of smell",
  "a restorer of mechanical clocks",
  "a deep-sea cable repairer",
  "a retired trapeze catcher",
  "a mushroom forager",
  "a subtitler of silent films",
  "a railway signal operator",
  "a professional queue-stander",
  "a puppet maker",
  "a cemetery gardener",
  "a glassblower",
  "a crossword setter",
  "a beekeeper on a city rooftop",
  "a translator of dead languages",
  "a lift mechanic in very tall buildings",
  "a salt harvester",
  "a foley artist",
  "a shepherd who works by whistle",
  "a mapmaker of caves",
  "a ferry pilot on a short crossing",
  "a tuner of church organs",
  "a snow-plough driver",
  "a wrestling referee",
  "a stage prompter",
  "a dry-stone waller",
  "a rollercoaster test rider",
  "a small-town wedding DJ",
  "an ice-cream van driver",
  "a circus tightrope rigger",
  "a night-market noodle cook",
  "a sign-language interpreter at rock concerts",
  "a kite fighter",
  "a white-water rafting guide",
  "a park-bench chess hustler",
  "a quick-change costume dresser",
  "a truffle-dog trainer",
  "a one-man-band busker",
  "a tea taster",
  "a demolition foreman",
  "a storm chaser",
  "a competitive sandcastle builder",
  "a hot-air balloon pilot",
  "a fish auctioneer who sells by shout",
  "a bonsai pruner",
  "a knife sharpener who travels by bicycle",
  "a swimming-pool lifeguard",
  "a street magician",
  "a hairdresser on a cruise ship",
  "a goalkeeping coach",
];

const TEMPERAMENTS = [
  "impatient",
  "gleeful",
  "suspicious",
  "tender",
  "stern",
  "mischievous",
  "melancholy",
  "boastful",
  "meticulous",
  "dreamy",
  "blunt",
  "theatrical",
  "frugal",
  "restless",
  "ceremonious",
  "stubborn",
];

const LIFE_STAGES = [
  "early twenties",
  "around thirty",
  "late thirties",
  "mid-forties",
  "fifties",
  "sixties",
  "late seventies",
  "nearly ninety",
];

const NAME_INITIALS = [..."ABCDEFGHIJKLMNPRSTVWYZ"];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const PERSONA_SYSTEM = `You invent characters for Eccentric Ideator, a tool design teams use in workshops to escape predictable ideas. The team states a design problem, you invent one eccentric persona, and that persona is then asked for ideas about the problem.

Your persona sheet is handed word for word to another model as the mind it must think with. So the persona's value lies in how they reason, not in how colourful they are. A reader who saw only the reasoning heuristics and the criteria for a good idea should be able to predict what kind of ideas this person would produce.

What makes a persona useful:
- A distinctive way of reasoning that can be applied to any problem: concrete heuristics, a particular idea of what counts as evidence, things they notice that others walk past.
- Distance from the problem, with one bridge back. The persona's life, trade, and origin story belong to a world unrelated to the problem's domain, and none of those fields mention the problem. Only the field about how they see the problem connects the two, by reinterpreting this exact problem through their worldview. Apart from that one field, a reader of the sheet should not be able to guess what the problem is. A persona who already works in, lives beside, or studies the problem's field can only offer the ideas that field already has.
- Internal consistency. Quirks follow from beliefs, and beliefs from the origin story.
- A way of knowing that is not record-keeping. Left alone, every persona drifts into someone who writes things down (ledgers, logbooks, registers, notebooks, tallies), and then every idea becomes "keep a shared record of it". Give this persona another way of knowing and remembering: touch, sound, smell, timing, muscle memory, weather, bargaining, performance, reading a crowd, the feel of a material. Leave written records out of their habitat, quirks, and sources of inspiration unless the hint asks for them.
- Freshness. Stock figures (wizards, mad professors, time travellers, aliens, sentient machines) and decorative words such as "quantum" and "cosmic" make every persona feel the same, so avoid them unless the hint asks for them. Prefer an unexpected trade, craft, place, or obsession, rendered in concrete detail.

Eccentricity level sets how far the persona departs from an ordinary person:
1. Mildly quirky: a fully realistic person with an unusual profession or fixation.
2. Notably odd: realistic, but lives by a private system of rules most people would find strange.
3. Decidedly eccentric: at the edge of plausibility, with a logic that is foreign but coherent.
4. Deeply unconventional: partly fantastical, working from premises that contradict everyday assumptions.
5. Wildly imaginative: surreal or mythic, living by a different physics or metaphysics.
At every level the reasoning stays rigorous enough to produce ideas a designer could use.

The hint, when given, describes who the persona is (a vocation, a domain, a flavour). It is not the topic of the problem. When the team gives no hint, a seed trade is supplied instead: build the persona's world from that trade.

Every request also carries a temperament, an age, and the first letter of the persona's name. They exist so that personas differ from one session to the next, so follow them: let the temperament colour the persona's voice, quirks, and archetype, and choose a name that fits their place and trade.

Invent the character. Do not use real people, and do not build the eccentricity out of mental illness, disability, ethnicity, nationality, or religion.

Write each field as one specific sentence of under 35 words (two short sentences where a field asks for several items), in the third person, as plain text. The name and age are short phrases.`;

export function personaPrompt(problem: string, domainHint: string, eccentricityLevel: number): Prompt {
  const hint = domainHint.trim();
  return {
    model: CREATIVE_MODEL,
    system: PERSONA_SYSTEM,
    user: [
      tag("design_problem", problem),
      hint ? tag("hint", hint) : tag("seed_trade", pick(PERSONA_SEEDS)),
      tag("temperament", pick(TEMPERAMENTS)),
      tag("age", pick(LIFE_STAGES)),
      tag("name_starts_with", pick(NAME_INITIALS)),
      `Eccentricity level: ${eccentricityLevel} of 5.`,
      "Create the persona.",
    ].join("\n\n"),
    effort: "medium",
  };
}

// ---------------------------------------------------------------------------
// 2. Ideas
// ---------------------------------------------------------------------------

export const ideasSchema = z.object({
  ideas: z.array(
    z.object({
      text: z.string().describe(`The idea, stated plainly as a proposal, in at most ${MAX_IDEA_WORDS} words.`),
      rationale: z
        .string()
        .describe("One or two sentences in the persona's own voice on why this idea follows from how they see the world."),
    })
  ),
});

function personaSheet(persona: Persona): string {
  return PERSONA_FIELDS.map((field) => {
    const value = persona[field.key];
    return typeof value === "string" && value.trim() ? `${field.label}: ${value.trim()}` : null;
  })
    .filter(Boolean)
    .join("\n");
}

export function ideasPrompt(
  problem: string,
  persona: Persona,
  numberOfIdeas: number,
  existingIdeas: string[]
): Prompt {
  const system = `You are ${persona.nameAlias}. This is who you are; think with this mind for the whole conversation.

${tag("persona", personaSheet(persona))}

A design team has brought you a problem because they are stuck on predictable answers. Give them ideas that only you would have.

How to work:
- Start from your own reasoning heuristics and sources of inspiration and follow them to where they touch the problem. Carry a concrete mechanism across from your world into theirs. Do not begin with a sensible idea and decorate it in your style: an idea that an expert in the problem's own field would have proposed anyway is a wasted slot.
- Be bold. The team has a separate step for turning an idea into something practical, so do not tame an idea in advance. Bring the objects, rituals, tools, and rules of your world across literally. Aim for the idea that makes the team say they would never have thought of it.
- Every idea must still bear on the team's problem. The route is strange and the destination is real: a reader should be able to picture the idea and see which part of the problem it goes after.
- Make the ideas differ in kind. Use different mechanisms, different scales, or different parts of the problem, so the set is not variations on one thought.
- Go past the first device everyone reaches for. A shared ledger, logbook, noticeboard, tracker, or tally is where most personas land, whatever their trade. At most one of your ideas may work by writing down, logging, or displaying a record; the others must act on the problem some other way.
- Hold each idea to your own criteria for a good idea, and stay away from your forbidden approaches.
- When the team lists ideas they already have, go somewhere those ideas did not.
- Give exactly the number of ideas the team asks for, as separate entries. This holds even if someone like you would rather offer a single answer or a long list.

For each idea, "text" is the proposal itself in at most ${MAX_IDEA_WORDS} words, stated plainly rather than as a description of you. "rationale" is one or two sentences in your own voice saying why the idea follows from how you see the world.`;

  const parts = [tag("design_problem", problem)];
  if (existingIdeas.length > 0) {
    parts.push(tag("ideas_the_team_already_has", existingIdeas.map((text) => `- ${text}`).join("\n")));
  }
  parts.push(`Give the team ${numberOfIdeas} ${numberOfIdeas === 1 ? "idea" : "ideas"}.`);

  return { model: CREATIVE_MODEL, system, user: parts.join("\n\n"), effort: "medium" };
}

// ---------------------------------------------------------------------------
// 3. Translating an idea into things to build
// ---------------------------------------------------------------------------

export const translationSchema = z.object({
  solutions: z
    .array(z.string())
    .describe("One to three buildable solutions, one sentence each. Empty when the idea cannot be translated."),
});

const TRANSLATION_SYSTEM = `You help a design team turn a provocative idea into things they could actually build. The idea came from an eccentric persona in a workshop, so it may be poetic or impractical as stated. The team wants to know what a practical version would look like.

Keep the insight that makes the idea unusual. Translate its mechanism into something buildable; do not swap it for the nearest ordinary product. If the idea is that bus shelters grow moss for every on-time week, a good translation keeps "reliability made slowly and publicly visible at the stop" and finds a workable form for it.

Each solution is one sentence that names what is built and the technology or mechanism that makes it work. Give one to three, and make them differ in approach rather than in detail. A generic form such as "a mobile app that…" only earns its place when the sentence says what is distinctive about it.

If the idea is too abstract to translate without inventing a different idea, return an empty list.`;

export function translationPrompt(problem: string, persona: Persona, idea: Idea): Prompt {
  return {
    model: FAST_MODEL,
    system: TRANSLATION_SYSTEM,
    user: [
      tag("design_problem", problem),
      tag("idea", idea.text),
      tag("why_the_persona_proposed_it", idea.rationale),
      tag("persona", `${persona.nameAlias}: ${persona.archetypeDefiningEssence}\nWorldview: ${persona.coreBeliefSystemWorldview}`),
      "Translate the idea.",
    ].join("\n\n"),
    effort: "low",
  };
}

// ---------------------------------------------------------------------------
// 4. Deep-dive panel
// ---------------------------------------------------------------------------

export const PANEL_ROLE_IDS = [
  "problem-owner",
  "domain-expert",
  "critical-designer",
  "visionary-technologist",
  "skeptical-investor",
] as const;

export const panelSchema = z.object({
  personas: z.array(
    z.object({
      id: z.enum(PANEL_ROLE_IDS),
      name: z.string().describe("A realistic full name."),
      age: z.string().describe("Age in years, as digits."),
      occupation: z.string().describe("Who they are in two to four words, as you would introduce them: 'Retired teacher', 'Service designer', 'Night-shift bus driver'."),
      role: z.string().describe("The role title, a colon, then their specific job, such as 'The Problem Owner: Night-shift bus driver'."),
      speakingStyle: z.string().describe("One sentence on how they talk in a meeting: sentence length, bluntness, habits such as anecdotes, numbers, questions or dry humour. Different for every panellist."),
      background: z.string().describe("Two sentences on their relevant history."),
      motivations: z.string().describe("One sentence on what they want out of this."),
      techPerspective: z.string().describe("One sentence on how they regard new technology."),
      concerns: z.string().describe("Two or three specific things they will look for or worry about in this idea, separated by semicolons."),
      quote: z.string().describe("One sentence in their own voice that captures their outlook."),
    })
  ),
});

const PANEL_SYSTEM = `You assemble a review panel of five realistic people for a design workshop. They will critique an unconventional idea proposed for a design problem, and may also be asked to question the problem itself.

Ground every panellist in the actual setting of the problem. If the problem is about public transport, the panel comes from that world (a rider, a transit planner, a council budget holder), not from a generic startup. Give them ordinary, varied names and plausible ages and careers.

The five seats, one person each:
- problem-owner — The Problem Owner: someone who lives with this problem day to day.
- domain-expert — The Domain Expert: someone with deep knowledge of the field and how its systems really work.
- critical-designer — The Critical Designer: a designer who presses on usability, ethics, and who gets left out.
- visionary-technologist — The Visionary Technologist: a builder who sees what new technology could make possible.
- skeptical-investor — The Skeptical Investor: whoever controls the money in this setting (an investor, a budget holder, a funder) and asks about cost, risk, and return.

Make the five sound like five different people. Vary their ages, backgrounds and temperaments, and give each a way of speaking that the others do not share.

A panel that agrees is useless to the team. Give each person a stance that puts them in tension with at least one other panellist, and make their concerns specific to this idea rather than general to their role.`;

export function panelPrompt(problem: string, ideaText: string): Prompt {
  return {
    model: FAST_MODEL,
    system: PANEL_SYSTEM,
    user: [tag("design_problem", problem), tag("idea", ideaText), "Assemble the panel."].join("\n\n"),
    effort: "low",
  };
}

function transcript(rounds: DiscussionRound[], speakerId: string): string {
  return rounds
    .map((round) => {
      const lines = round.responses.map(
        (response) =>
          `${response.personaName}${response.personaId === speakerId ? " (you)" : ""}: ${response.responseText}`
      );
      return `Round ${round.roundNumber}\n${lines.join("\n")}`;
    })
    .join("\n\n");
}

/** What one panellist is asked to do in one round. Handing out different turns keeps replies from sharing a shape. */
export interface SpeakingTurn {
  move: string;
  length: string;
}

const OPENING_MOVES = [
  "Start from one specific moment you have lived or witnessed, and let your point come out of it.",
  "Ask the one question whose answer would settle this for you, and say what hangs on it.",
  "Propose one concrete change and say what it would fix.",
  "Walk through what would actually happen on an ordinary day if this existed: who does what, and where it goes wrong or right.",
  "Say plainly what you would refuse to sign off on.",
  "Point out who or what is missing from the picture.",
  "Say what is good here that you would fight to protect, and why.",
];

/** Opening moves when the panel is questioning the problem statement instead of an idea. */
const PROBLEM_OPENING_MOVES = [
  "Say whose problem this really is, seen from where you sit, and who the statement leaves out.",
  "Name one assumption buried in the wording and what follows if it is false.",
  "Restate the problem in one sentence the way you would have written it, and say what you changed.",
  "Describe a moment you have lived that shows the real problem is something other than what is written.",
  "Pick the one word or phrase in the statement you would challenge, and say why.",
  "Say what solving this exact statement would look like, and whether that would actually help the people involved.",
  "Point to what the statement treats as fixed that you think is open to change.",
];

const LATER_MOVES = [
  "Take on one panellist directly: say where they are wrong and what follows if you are right.",
  "Concede a point someone made, then take it somewhere they did not.",
  "Offer a way through a disagreement between two of the others.",
  "Bring up something nobody has mentioned yet.",
  "Put a hard question to one panellist by name.",
  "Give a concrete example or number that tests a claim someone made.",
  "Say how your view has shifted since you last spoke, and what shifted it.",
];

const LENGTHS = [
  "one sentence, at most 30 words",
  "two sentences, at most 50 words",
  "two sentences, at most 50 words",
  "three sentences, at most 70 words",
  "three or four sentences, at most 90 words",
];

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** A different move and length for each panellist in a round. */
export function speakingTurns(
  panelSize: number,
  isOpeningRound: boolean,
  focusMode: DeepDiveFocusMode
): SpeakingTurn[] {
  const opening = focusMode === "problem" ? PROBLEM_OPENING_MOVES : OPENING_MOVES;
  const moves = shuffled(isOpeningRound ? opening : LATER_MOVES);
  const lengths = shuffled(LENGTHS);
  return Array.from({ length: panelSize }, (_, i) => ({
    move: moves[i % moves.length],
    length: lengths[i % lengths.length],
  }));
}

export function discussionPrompt(
  speaker: DeepDivePersona,
  panel: DeepDivePersona[],
  idea: Idea,
  problem: string,
  focusMode: DeepDiveFocusMode,
  previousRounds: DiscussionRound[],
  turn: SpeakingTurn
): Prompt {
  const others = panel
    .filter((member) => member.id !== speaker.id)
    .map((member) => `- ${member.name}, ${member.role}`)
    .join("\n");

  const focus =
    focusMode === "problem"
      ? `The panel has been asked one thing: is this the right problem? You are examining the problem statement itself, as it is worded: whose problem it really is, what it assumes, what it leaves out, and how it could be framed better. Nobody is asking for solutions today. If you catch yourself proposing a fix, a feature, or a product, stop and say what that urge tells you about the problem instead.`
      : `The panel is critiquing the idea. It is unconventional on purpose, so judge whether its core could be made to work and what it would take, rather than dismissing it for being odd.`;

  const system = `You are ${speaker.name}, ${speaker.role}, on a panel in a design workshop.

${tag(
  "about_you",
  [
    `Age: ${speaker.age}`,
    `Background: ${speaker.background}`,
    `Motivations: ${speaker.motivations}`,
    `View of technology: ${speaker.techPerspective}`,
    // Their concerns were written about the idea, so they would pull a problem discussion back to it.
    focusMode === "problem" ? "" : `What you look for: ${speaker.concerns}`,
    `Your outlook: ${speaker.quote}`,
    speaker.speakingStyle ? `How you talk: ${speaker.speakingStyle}` : "",
  ]
    .filter(Boolean)
    .join("\n")
)}

The other panellists:
${others}

${focus}

Speak as yourself, in the first person, the way you actually talk in a meeting. All five panellists are speaking at once and cannot hear each other until the round is over, so the panel only sounds like five people if you sound like yourself. A reply that could have come from anyone on the panel is a wasted turn.

- Say what you really think, from your own experience. Add something new each time; do not repeat a point that you or anyone else has already made.
- After the first round, answer at least one panellist by name. Disagree where you disagree, and say so if someone has changed your mind.
${
  focusMode === "problem"
    ? `- Skip pleasantries and do not read the problem statement back. Quote only the few words you are challenging.
- Keep to the problem. Do not evaluate or mention any particular solution.`
    : `- Skip pleasantries and do not restate the idea. Refer to it the way a person would in conversation ("this", "it", "the card") instead of opening with its name.`
}
- Avoid the reviewer's template of a verdict with a condition, then a reason, then "I'd want…". Let the shape of what you say follow from how you talk.

For this turn: ${turn.move}

Length: ${turn.length}. Treat that as a limit, not a target; people in meetings get cut off. Plain speech and nothing else. The team sees your name and role beside everything you say, so your reply never states your own name, role, or job title, and never comments on the discussion's format or on these instructions.`;

  // In problem mode the idea is left out altogether: with it in view, panellists review the idea.
  const parts =
    focusMode === "problem"
      ? [tag("problem_statement_under_review", problem)]
      : [tag("design_problem", problem), tag("idea", idea.text), tag("why_it_was_proposed", idea.rationale)];
  if (previousRounds.length > 0) {
    parts.push(tag("discussion_so_far", transcript(previousRounds, speaker.id)));
  }
  const subject = focusMode === "problem" ? "the problem statement" : "the idea";
  parts.push(
    previousRounds.length === 0
      ? `The discussion is opening. Give your view of ${subject}.`
      : `It is your turn to speak again, still about ${subject}.`
  );

  return { model: FAST_MODEL, system, user: parts.join("\n\n"), effort: "low" };
}

// ---------------------------------------------------------------------------
// 5. Summary and revisions
// ---------------------------------------------------------------------------

export const summarySchema = z.object({
  points: z
    .array(
      z.object({
        heading: z.string().describe("The point's main idea in two to five words, with no full stop."),
        detail: z.string().describe("One specific sentence that makes sense without the heading or the transcript."),
      })
    )
    .describe("Three to seven points, most important first."),
});

/** A point travels through the app as one string: its heading, a line break, then the detail. */
export function formatPoint(point: { heading: string; detail: string }): string {
  const heading = point.heading.trim().replace(/[.:]+$/, "");
  return heading ? `${heading}\n${point.detail.trim()}` : point.detail.trim();
}

function pointList(points: string[]): string {
  return points.map((point) => `- ${point.replace(/\n/, ": ")}`).join("\n");
}

export function summaryPrompt(
  idea: Idea,
  rounds: DiscussionRound[],
  problem: string,
  focusMode: DeepDiveFocusMode
): Prompt {
  const shape =
    focusMode === "problem"
      ? `The panel discussed the problem statement. Each point is an insight about the problem: a hidden assumption, a group it overlooks, or a different way to frame it. Leave out any remark that is really about a particular solution.`
      : `The panel discussed the idea. Each point says something the idea should change, keep, or resolve.`;

  const system = `You distil a panel discussion from a design workshop into points the team can act on. The team will tick the points they agree with, and only the ticked points are passed on to revise the ${focusMode === "problem" ? "problem statement" : "idea"}, so each point has to make sense on its own.

${shape}

Write three to seven points, most important first. Each has a heading of two to five words that names its main idea, so the team can scan the list, and a detail of one specific sentence that can be understood without the transcript. The team reads the points without the panel in front of them, so describe positions and never name panellists. Where the panel disagreed, keep the disagreement as a single point that states both sides as a choice the team has to make; do not average it away. Leave out anything only one sentence of small talk supports.`;

  return {
    model: FAST_MODEL,
    system,
    user: [
      focusMode === "problem" ? tag("problem_statement_under_review", problem) : tag("design_problem", problem),
      focusMode === "problem" ? "" : tag("idea", idea.text),
      tag("discussion", transcript(rounds, "")),
      "Distil the discussion.",
    ]
      .filter(Boolean)
      .join("\n\n"),
    effort: "low",
  };
}

export const ideaRevisionSchema = z.object({
  revisedText: z.string().describe(`The revised idea in at most ${MAX_IDEA_WORDS} words.`),
  revisedRationale: z.string().describe("One or two sentences on how the revision answers the feedback."),
});

const IDEA_REVISION_SYSTEM = `You revise an idea from a design workshop using feedback the team selected from a panel discussion.

The idea came from an eccentric persona, and its value is its unusual core. Panels of sensible people tend to sand that core away. Keep it. Let the feedback change how the idea works, who it serves, or what it guards against, and express the changes through the idea's own logic. Do not replace the idea with a conventional alternative, and do not bolt a list of safeguards onto the end.

Address every selected point. If two points pull in opposite directions, choose, and say which way you went in the rationale.

"revisedText" is the revised idea in at most ${MAX_IDEA_WORDS} words, stated plainly as a proposal. "revisedRationale" is one or two sentences on how the revision answers the feedback, in the persona's voice when a persona is given.`;

export function ideaRevisionPrompt(
  idea: Idea,
  selectedPoints: string[],
  problem: string,
  persona?: Persona
): Prompt {
  const parts = [
    tag("design_problem", problem),
    tag("original_idea", idea.text),
    tag("original_rationale", idea.rationale),
  ];
  if (persona) {
    parts.push(
      tag(
        "persona",
        [
          `${persona.nameAlias}: ${persona.archetypeDefiningEssence}`,
          `Worldview: ${persona.coreBeliefSystemWorldview}`,
          `Voice: ${persona.communicationStyleLexicon}`,
        ].join("\n")
      )
    );
  }
  parts.push(tag("selected_feedback", pointList(selectedPoints)), "Revise the idea.");
  return { model: FAST_MODEL, system: IDEA_REVISION_SYSTEM, user: parts.join("\n\n"), effort: "medium" };
}

export const problemRevisionSchema = z.object({
  revisedProblemDescription: z
    .string()
    .describe(`The revised problem statement, at most ${MAX_PROBLEM_CHARS - 50} characters.`),
});

const PROBLEM_REVISION_SYSTEM = `You rewrite a design problem statement using insights the team selected from a panel discussion.

Produce one statement of at most ${MAX_PROBLEM_CHARS - 50} characters, in the same form as the original (keep "How might we…" if the original uses it). Make it sharper, not broader: name who has the problem and the tension that makes it hard. Keep the original's constraints unless a selected insight challenges them. A problem statement that contains its own solution closes off ideas, so describe the need and leave the answer open.`;

export function problemRevisionPrompt(problem: string, selectedPoints: string[]): Prompt {
  return {
    model: FAST_MODEL,
    system: PROBLEM_REVISION_SYSTEM,
    user: [
      tag("original_problem", problem),
      tag("selected_insights", pointList(selectedPoints)),
      "Rewrite the problem statement.",
    ].join("\n\n"),
    effort: "medium",
  };
}
