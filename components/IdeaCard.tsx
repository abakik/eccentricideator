import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Idea, Persona, DesignProblem } from '../types';
import { Button } from './Button';
import { translateIdeaToSolutions as apiTranslateIdea } from '../services/translationService';

interface IdeaCardProps {
  idea: Idea;
  /** Position in the list, shown as the idea's number. */
  number: number;
  onUpdate: (updatedIdea: Idea) => void;
  onDelete: (ideaId: string) => void;
  onDeepDive: (idea: Idea) => void;
  disabled?: boolean;
  persona: Persona;
  designProblem: DesignProblem;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, number, onUpdate, onDelete, onDeepDive, disabled, persona, designProblem }) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [currentNote, setCurrentNote] = useState(idea.note);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [isTranslating, setIsTranslating] = useState(false);
  const [solutions, setSolutions] = useState<string[] | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentNote(idea.note);
  }, [idea.note]);

  useEffect(() => {
    if (isEditingNote) noteTextareaRef.current?.focus();
  }, [isEditingNote]);

  const handleSaveNote = () => {
    onUpdate({ ...idea, note: currentNote.trim() });
    setIsEditingNote(false);
  };

  const handleCancelNote = () => {
    setCurrentNote(idea.note);
    setIsEditingNote(false);
  };

  const handleTranslate = useCallback(async () => {
    if (disabled || isTranslating) return;
    setIsTranslating(true);
    setTranslationError(null);
    try {
      setSolutions(await apiTranslateIdea(idea, persona, designProblem));
    } catch (error) {
      console.error('Error translating idea:', error);
      setTranslationError((error as Error).message || 'Could not make this idea practical.');
    } finally {
      setIsTranslating(false);
    }
  }, [idea, persona, designProblem, disabled, isTranslating]);

  return (
    <article className={`flex gap-4 border-b border-line py-6 md:gap-6 ${disabled ? 'opacity-70' : ''}`}>
      <div className={`w-11 flex-none font-display text-[22px] italic ${idea.pinned ? 'text-accent-text' : 'text-muted'}`}>
        Nº {number}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-display text-2xl leading-snug text-ink md:text-[25px]">{idea.text}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{idea.rationale}</p>

        {isEditingNote ? (
          <div className="mt-3">
            <label htmlFor={`note-${idea.id}`} className="sr-only">Your note</label>
            <textarea
              id={`note-${idea.id}`}
              ref={noteTextareaRef}
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Add your note…"
              rows={2}
              className="block w-full rounded-lg border border-line-strong bg-panel px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-accent-text focus:outline-none"
            />
            <div className="mt-2 flex gap-2">
              <Button onClick={handleSaveNote} size="sm" variant="primary">Save note</Button>
              <Button onClick={handleCancelNote} size="sm" variant="ghost">Cancel</Button>
            </div>
          </div>
        ) : (
          idea.note && (
            <p className="mt-3 whitespace-pre-wrap rounded-lg bg-raised px-3.5 py-2.5 text-sm text-ink">
              <span className="text-muted">Your note: </span>{idea.note}
            </p>
          )
        )}

        {solutions && (
          <div className="mt-3 rounded-lg border border-line px-4 py-3">
            <p className="eyebrow">Made practical</p>
            {solutions.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink">
                {solutions.map((solution, index) => <li key={index}>{solution}</li>)}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">This idea is too abstract to turn into something buildable as it stands.</p>
            )}
          </div>
        )}
        {translationError && <p role="alert" className="mt-3 text-sm text-danger">{translationError}</p>}

        <div className="mt-1 flex flex-wrap items-center gap-x-6">
          <button
            onClick={() => onUpdate({ ...idea, pinned: !idea.pinned })}
            aria-pressed={idea.pinned}
            disabled={disabled}
            className={`text-action ${idea.pinned ? 'font-semibold !text-accent-text' : ''}`}
          >
            {idea.pinned ? '● Kept' : '○ Keep'}
          </button>
          <button onClick={() => setIsEditingNote(true)} disabled={disabled || isEditingNote} className="text-action">
            {idea.note ? 'Edit note' : 'Add note'}
          </button>
          <button onClick={handleTranslate} disabled={disabled || isTranslating} className="text-action">
            {isTranslating ? 'Working on it…' : solutions ? 'Try other practical versions' : 'Make it practical'}
          </button>
          <button onClick={() => onDeepDive(idea)} disabled={disabled} className="text-action">
            Convene the panel →
          </button>
          <button onClick={() => onDelete(idea.id)} disabled={disabled} className="text-action ml-auto !text-muted">
            Discard
          </button>
        </div>
      </div>
    </article>
  );
};

export default IdeaCard;
