import { Idea, Persona, DesignProblem } from '../types';

export const translateIdeaToSolutions = async (
  idea: Idea,
  persona: Persona,
  designProblem: DesignProblem
): Promise<string[]> => {
  try {
    const response = await fetch('/api/claude/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea, persona, designProblem }),
    });

    if (!response.ok) {
      let errorMessage = `Failed to translate idea to solutions (HTTP ${response.status})`;
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

    const data = (await response.json()) as { solutions: string[] };
    return data.solutions;
  } catch (error) {
    console.error('Error translating idea via API:', error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith('Failed to')) {
      throw new Error(message);
    }
    throw new Error(`Failed to translate idea to solutions: ${message}`);
  }
};
