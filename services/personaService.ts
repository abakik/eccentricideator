import { DesignProblem, Persona } from '../types';

async function parseErrorResponse(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    if (data && typeof data.error === 'string' && data.error.trim().length > 0) {
      return data.error;
    }
  } catch {
    // Ignore JSON parse errors on error responses
  }
  return `${fallback} (HTTP ${response.status})`;
}

export const generatePersona = async (
  designProblem: DesignProblem,
  domainHint: string,
  eccentricityLevel: number
): Promise<Persona> => {
  try {
    const response = await fetch('/api/claude/persona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ designProblem, domainHint, eccentricityLevel }),
    });

    if (!response.ok) {
      const message = await parseErrorResponse(response, 'Failed to generate persona');
      throw new Error(message);
    }

    const persona = (await response.json()) as Persona;
    return persona;
  } catch (error) {
    console.error('Error generating persona via API:', error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith('Failed to')) {
      throw new Error(message);
    }
    throw new Error(`Failed to generate persona: ${message}`);
  }
};
