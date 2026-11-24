import {
  Idea,
  Persona,
  DeepDivePersona,
  DiscussionRound,
  DiscussionResponse,
  DeepDiveFocusMode,
} from '../types';

async function postJson<TResponse>(url: string, body: unknown, fallbackError: string): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMessage = `${fallbackError} (HTTP ${response.status})`;
    try {
      const data = await response.json();
      if (data && typeof data.error === 'string' && data.error.trim().length > 0) {
        errorMessage = data.error;
      }
    } catch {
      // Ignore JSON parse errors on error responses
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as TResponse;
}

export const generateDeepDivePersonas = async (
  ideaText: string,
  problemDescription: string
): Promise<DeepDivePersona[]> => {
  try {
    const data = await postJson<{ personas: DeepDivePersona[] }>(
      '/api/claude/deep-dive/personas',
      { ideaText, problemDescription },
      'Failed to generate Deep Dive personas'
    );
    return data.personas;
  } catch (error) {
    console.error('Error generating Deep Dive personas via API:', error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith('Failed to')) {
      throw new Error(message);
    }
    throw new Error(`Failed to generate Deep Dive personas: ${message}`);
  }
};

export const generateDiscussionRound = async (
  idea: Idea,
  deepDivePersonas: DeepDivePersona[],
  previousRounds: DiscussionRound[],
  currentProblemDescription: string,
  focusMode: DeepDiveFocusMode
): Promise<DiscussionResponse[]> => {
  try {
    const data = await postJson<{ responses: DiscussionResponse[] }>(
      '/api/claude/deep-dive/discussion',
      {
        idea,
        deepDivePersonas,
        previousRounds,
        currentProblemDescription,
        focusMode,
      },
      'Failed to generate discussion round'
    );
    return data.responses;
  } catch (error) {
    console.error('Error generating discussion round via API:', error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith('Failed to')) {
      throw new Error(message);
    }
    throw new Error(`Failed to generate discussion round: ${message}`);
  }
};

export const summariseDiscussion = async (
  idea: Idea,
  discussionRounds: DiscussionRound[],
  personas: DeepDivePersona[],
  currentProblemDescription: string,
  focusMode: DeepDiveFocusMode
): Promise<string[]> => {
  if (discussionRounds.length === 0) return [];
  try {
    const data = await postJson<{ summaryPoints: string[] }>(
      '/api/claude/deep-dive/summarise',
      {
        idea,
        discussionRounds,
        personas,
        currentProblemDescription,
        focusMode,
      },
      'Failed to summarise discussion'
    );
    return data.summaryPoints;
  } catch (error) {
    console.error('Error summarising discussion via API:', error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith('Failed to')) {
      throw new Error(message);
    }
    throw new Error(`Failed to summarise discussion: ${message}`);
  }
};

export const reviseIdeaBasedOnFeedback = async (
  originalIdea: Idea,
  selectedSummaryPoints: string[],
  _personas: DeepDivePersona[],
  currentProblemDescription: string,
  originalPersona: Persona | null
): Promise<{ revisedText: string; revisedRationale: string }> => {
  if (selectedSummaryPoints.length === 0) {
    return { revisedText: originalIdea.text, revisedRationale: originalIdea.rationale };
  }
  try {
    return await postJson<{ revisedText: string; revisedRationale: string }>(
      '/api/claude/deep-dive/revise-idea',
      {
        originalIdea,
        selectedSummaryPoints,
        currentProblemDescription,
        originalPersona,
      },
      'Failed to revise idea'
    );
  } catch (error) {
    console.error('Error revising idea via API:', error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith('Failed to')) {
      throw new Error(message);
    }
    throw new Error(`Failed to revise idea: ${message}`);
  }
};

export const reviseProblemDescription = async (
  originalProblemDescription: string,
  selectedSummaryPoints: string[],
  personas: DeepDivePersona[]
): Promise<string> => {
  if (selectedSummaryPoints.length === 0) {
    return originalProblemDescription;
  }
  try {
    const data = await postJson<{ revisedProblemDescription: string }>(
      '/api/claude/deep-dive/revise-problem',
      {
        originalProblemDescription,
        selectedSummaryPoints,
        personas,
      },
      'Failed to revise problem description'
    );
    return data.revisedProblemDescription;
  } catch (error) {
    console.error('Error revising problem description via API:', error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith('Failed to')) {
      throw new Error(message);
    }
    throw new Error(`Failed to revise problem description: ${message}`);
  }
};
