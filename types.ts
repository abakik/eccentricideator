
export interface DesignProblem {
  id: string;
  description: string;
}

export interface Persona {
  id: string;
  // I. Core Identity & Background
  nameAlias: string;
  archetypeDefiningEssence: string;
  originStoryCatalyst: string;
  apparentAgeTrueAge: string;
  coreEnvironmentHabitat: string;
  // II. Cognitive & Philosophical Framework
  coreBeliefSystemWorldview: string;
  primaryValuesMotivations: string;
  informationProcessingLearningStyle: string;
  primaryModeOfReasoningHeuristics: string;
  relationshipWithLogicRationality: string;
  // III. Eccentric Manifestations & Interaction Style
  signatureEccentricitiesQuirks: string;
  communicationStyleLexicon: string;
  emotionalLandscapeExpression: string;
  interactionWithNormalWorldPeople: string;
  // IV. Application to Design Problem & Idea Generation
  uniquePerspectiveOnDesignProblemDomain: string;
  eccentricCriteriaForGoodIdeaSolution: string;
  potentialSourcesOfNoveltyInspiration: string;
  forbiddenApproachesAntiGoals: string;
  // Meta
  problemId?: string;
  createdAt: string;
}

export type PersonaDraft = Partial<Persona>; // Allows for incomplete persona during generation/editing

export interface Idea {
  id: string;
  text: string;
  rationale: string;
  personaId: string;
  pinned: boolean;
  note: string;
  timestamp: string;
}

export enum AppStep {
  DefineProblem = 1,
  ConfigurePersona = 2,
  GenerateIdeas = 3,
  DeepDive = 4, // New Step
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// For PersonaForm generation
export interface PersonaField {
  key: keyof Persona;
  label: string;
  placeholder: string;
  isTextarea?: boolean;
  rows?: number;
}

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// ---- Deep Dive Feature Types ----
export interface DeepDivePersona {
  id: string; // e.g., "problem-owner", "domain-expert"
  name: string;
  age: string; // e.g., "45", "Timeless"
  role: string; // e.g., "The Problem Owner", "The Visionary Technologist"
  background: string;
  motivations: string;
  techPerspective: string;
  concerns: string;
  quote: string;
  avatarColor?: string; // Optional: for UI
}

export interface DiscussionResponse {
  personaId: string; // Corresponds to DeepDivePersona.id
  personaName: string; // For display
  responseText: string;
  avatarColor?: string;
}

export interface DiscussionRound {
  roundNumber: number;
  responses: DiscussionResponse[];
}

export type DeepDiveLoadingState = 'idle' | 'loadingPersonas' | 'loadingDiscussion' | 'error';
export type DeepDiveSubActionSolutionLoadingState = 'summarizing' | 'revising' | null;
export type DeepDiveSubActionProblemLoadingState = 'revisingProblem' | null; // New for problem revision
export type DeepDiveFocusMode = 'solution' | 'problem';