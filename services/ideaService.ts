import { DesignProblem, Persona, Idea } from '../types';

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

export const generateIdeas = async (
  designProblem: DesignProblem,
  persona: Persona,
  numberOfIdeas: number,
  existingIdeas: string[],
  onChunkReceived: (ideaChunk: Idea) => void
): Promise<void> => {
  try {
    const response = await fetch('/api/claude/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ designProblem, persona, numberOfIdeas, existingIdeas }),
    });

    if (!response.ok) {
      const message = await parseErrorResponse(response, 'Failed to generate ideas');
      throw new Error(message);
    }

    if (!response.body) {
      throw new Error('Streaming response body is unavailable.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const processEventBlock = async (block: string) => {
      const lines = block.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const jsonPayload = trimmed.slice(5).trim();
        if (!jsonPayload) continue;

        const event = JSON.parse(jsonPayload) as
          | { type: 'idea'; idea: Idea }
          | { type: 'error'; error: string }
          | { type: 'done' };

        if (event.type === 'error') {
          throw new Error(event.error || 'Failed to generate ideas.');
        }
        if (event.type === 'idea' && event.idea) {
          onChunkReceived(event.idea);
        }
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() ?? '';

      for (const block of blocks) {
        if (block.trim()) {
          await processEventBlock(block);
        }
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      await processEventBlock(buffer);
    }
  } catch (error) {
    console.error('Error in generateIdeas:', error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith('Failed to')) {
      throw new Error(message);
    }
    throw new Error(`Failed to generate ideas: ${message}`);
  }
};
