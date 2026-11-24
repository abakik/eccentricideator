
import { PersonaField } from './types';

export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_IDEA_TEXT_LENGTH = 40; // words, for mock generation

export const PERSONA_FIELDS: PersonaField[] = [
  // Section I
  { key: 'nameAlias', label: 'Name/Alias', placeholder: 'e.g., Professor Paradox, The Cosmic Weaver', isTextarea: false },
  { key: 'archetypeDefiningEssence', label: 'Archetype/Defining Essence', placeholder: 'e.g., The Perpetual Observer, The Benevolent Anomaly', isTextarea: true, rows: 2 },
  { key: 'originStoryCatalyst', label: 'Origin Story/Catalyst for Eccentricity', placeholder: 'e.g., A miscalculated jump through spacetime, An oath sworn under a binary sunset', isTextarea: true, rows: 3 },
  { key: 'apparentAgeTrueAge', label: 'Apparent Age & True Age (if different)', placeholder: 'e.g., Appears 30, actual age 3 millennia', isTextarea: false },
  { key: 'coreEnvironmentHabitat', label: 'Core Environment/Habitat', placeholder: 'e.g., A library that rearranges itself, A sentient, floating island', isTextarea: true, rows: 2 },
  // Section II
  { key: 'coreBeliefSystemWorldview', label: 'Core Belief System & Worldview', placeholder: 'e.g., Believes all reality is a simulation he can debug, Sees patterns in chaos where others see randomness', isTextarea: true, rows: 3 },
  // Fix for: Object literal may only specify known properties, and 'elegant' does not exist in type 'PersonaField'.
  // Fix for: No value exists in scope for the shorthand property 'elegant'. Either declare one or provide an initializer.
  // Fix for: No value exists in scope for the shorthand property 'absurdity'. Either declare one or provide an initializer.
  { key: 'primaryValuesMotivations', label: 'Primary Values & Motivations', placeholder: "e.g., Uncovering hidden truths, The pursuit of 'elegant absurdity', Protecting forgotten knowledge", isTextarea: true, rows: 2 },
  { key: 'informationProcessingLearningStyle', label: 'Information Processing & Learning Style', placeholder: 'e.g., Learns by deconstructing and illogically reassembling, Absorbs knowledge through empathic resonance with objects', isTextarea: true, rows: 2 },
  // Fix for: Object literal may only specify known properties, and 'Lateral' does not exist in type 'PersonaField'.
  // Fix for: No value exists in scope for the shorthand property 'Lateral'. Either declare one or provide an initializer.
  // Fix for: No value exists in scope for the shorthand property 'leaps'. Either declare one or provide an initializer.
  // Fix for: No value exists in scope for the shorthand property 'of'. Either declare one or provide an initializer.
  // Fix for: No value exists in scope for the shorthand property 'illogic'. Either declare one or provide an initializer.
  { key: 'primaryModeOfReasoningHeuristics', label: 'Primary Mode of Reasoning/Problem-Solving Heuristics', placeholder: "e.g., 'Lateral leaps of illogic', Solves problems by finding the most aesthetically pleasing counter-intuitive path", isTextarea: true, rows: 2 },
  { key: 'relationshipWithLogicRationality', label: 'Relationship with Logic & Rationality', placeholder: 'e.g., Considers logic a useful toy but not a master, Speaks in paradoxes that hold deeper truths', isTextarea: true, rows: 2 },
  // Section III
  { key: 'signatureEccentricitiesQuirks', label: 'Signature Eccentricities/Quirks (Behavioral)', placeholder: 'e.g., Only walks backwards on Tuesdays, Communicates through interpretive dance when stressed', isTextarea: true, rows: 2 },
  { key: 'communicationStyleLexicon', label: 'Communication Style & Lexicon', placeholder: 'e.g., Speaks in riddles and rhymes, Uses metaphors drawn from quantum physics for everyday objects', isTextarea: true, rows: 2 },
  { key: 'emotionalLandscapeExpression', label: 'Emotional Landscape & Expression', placeholder: 'e.g., Expresses joy by reciting prime numbers, Shows anger by perfectly balancing nearby objects', isTextarea: true, rows: 2 },
  { key: 'interactionWithNormalWorldPeople', label: 'Interaction with the "Normal" World/People', placeholder: 'e.g., Treats mundane interactions as anthropological studies, Often forgets social conventions but means well', isTextarea: true, rows: 2 },
  // Section IV
  { key: 'uniquePerspectiveOnDesignProblemDomain', label: 'Unique Perspective on DESIGN_PROBLEM_DOMAIN', placeholder: 'This will be influenced by the Domain Hint. e.g., Sees climate change as a communication breakdown with the planet itself', isTextarea: true, rows: 3 },
  { key: 'eccentricCriteriaForGoodIdeaSolution', label: '"Eccentric" Criteria for a "Good" Idea/Solution', placeholder: 'e.g., Must involve at least three impossible things before breakfast, Should delight and confuse in equal measure', isTextarea: true, rows: 2 },
  { key: 'potentialSourcesOfNoveltyInspiration', label: 'Potential Sources of Novelty/Inspiration', placeholder: 'e.g., Misinterpreted ancient prophecies, The dreams of sleeping algorithms, The negative spaces between thoughts', isTextarea: true, rows: 2 },
  // Fix for: Object literal may only specify known properties, and 't' does not exist in type 'PersonaField'.
  // Fix for: No value exists in scope for the shorthand property 't'. Either declare one or provide an initializer.
  // Fix for: No value exists in scope for the shorthand property 'involve'. Either declare one or provide an initializer.
  // Fix for: No value exists in scope for the shorthand property 'a'. Either declare one or provide an initializer.
  // Fix for: No value exists in scope for the shorthand property 'kazoo'. Either declare one or provide an initializer.
  { key: 'forbiddenApproachesAntiGoals', label: 'Forbidden Approaches/Anti-Goals', placeholder: "e.g., Anything too practical or obvious, Solutions that require consensus, Ideas that don't involve a kazoo", isTextarea: true, rows: 2 },
];

export const ECCENTRICITY_LABELS: { [key: number]: string } = {
  1: "Mildly Quirky",
  2: "Notably Odd",
  3: "Decidedly Eccentric",
  4: "Unconventionally Brilliant",
  5: "Wildly Imaginative"
};

export const APP_STEPS_CONFIG = [
  { id: 1, title: 'Problem', name: 'Define Your Design Challenge' },
  { id: 2, title: 'Persona', name: 'Create an Eccentric Persona' },
  { id: 3, title: 'Ideas', name: 'Harvest Ideas' },
  { id: 4, title: 'Deep dive', name: 'Deep Dive Discussion Panel' }, // New Step
];

export const DEEP_DIVE_PERSONA_ROLES = [
    "The Problem Owner",
    "The Domain Expert",
    "The Critical Designer",
    "The Visionary Technologist",
    "The Skeptical Investor"
];

export const DEEP_DIVE_PERSONA_COLORS = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-pink-500', // Extra color just in case
];