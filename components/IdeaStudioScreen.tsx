import React, { useState, useEffect, useCallback } from 'react';
import { DesignProblem, Persona, Idea } from '../types';
import { Button } from './Button';
import IdeaCard from './IdeaCard';
import PersonaPortrait from './PersonaPortrait';
import { ExportModal } from './ExportModal';
import { Spinner } from './Spinner';

interface IdeaStudioScreenProps {
  designProblem: DesignProblem;
  persona: Persona;
  ideas: Idea[];
  onGenerateIdeas: (numberOfIdeas: number) => Promise<void>;
  onUpdateIdea: (updatedIdea: Idea) => void;
  onDeleteIdea: (ideaId: string) => void;
  onDeepDive: (idea: Idea) => void;
  isLoading: boolean;
}

const REFLECTION_SECONDS = 10;

const firstSentence = (text: string | undefined) => (text || '').split(/(?<=[.!?])\s/)[0];

const IdeaStudioScreen: React.FC<IdeaStudioScreenProps> = ({
  designProblem,
  persona,
  ideas,
  onGenerateIdeas,
  onUpdateIdea,
  onDeleteIdea,
  onDeepDive,
  isLoading,
}) => {
  const [numberOfIdeas, setNumberOfIdeas] = useState(5);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [pauseFirst, setPauseFirst] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [startWhenCountdownEnds, setStartWhenCountdownEnds] = useState(false);

  const handleGenerateClick = useCallback(() => {
    if (pauseFirst) {
      setStartWhenCountdownEnds(true);
      setCountdown(REFLECTION_SECONDS);
    } else {
      onGenerateIdeas(numberOfIdeas);
    }
  }, [pauseFirst, onGenerateIdeas, numberOfIdeas]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (startWhenCountdownEnds) {
      setStartWhenCountdownEnds(false);
      onGenerateIdeas(numberOfIdeas);
    }
  }, [countdown, startWhenCountdownEnds, onGenerateIdeas, numberOfIdeas]);

  const keptCount = ideas.filter((idea) => idea.pinned).length;
  const busy = isLoading || countdown > 0;
  const noun = numberOfIdeas === 1 ? 'idea' : 'ideas';
  const hasIdeas = ideas.length > 0;

  return (
    <div className="flex flex-1 flex-wrap">
      <aside className="w-full flex-none bg-panel px-5 py-8 md:px-9 lg:w-[380px]">
        <div className="lg:sticky lg:top-24">
          <p className="eyebrow">Your eccentric</p>
          <PersonaPortrait seed={persona.nameAlias} className="mt-5 h-32 w-32" />
          <h1 className="mt-5 font-display text-[40px] font-semibold leading-[1.04] text-ink">{persona.nameAlias}</h1>
          <p className="mt-2 font-display text-lg italic text-muted">{persona.archetypeDefiningEssence}</p>
          <blockquote className="mt-5 font-display text-[19px] leading-snug text-ink">
            “{firstSentence(persona.coreBeliefSystemWorldview)}”
          </blockquote>
          {persona.signatureEccentricitiesQuirks && (
            <p className="mt-4 text-sm leading-relaxed text-muted">{firstSentence(persona.signatureEccentricitiesQuirks)}</p>
          )}

          <div className="mt-8 border-t border-line pt-6">
            <div className="flex items-center justify-between gap-4">
              <span id="idea-count-label" className="text-sm font-medium text-ink">How many ideas</span>
              <div role="group" aria-labelledby="idea-count-label" className="flex items-center rounded-full border border-line-strong">
                <button
                  aria-label="Fewer ideas"
                  onClick={() => setNumberOfIdeas((n) => Math.max(1, n - 1))}
                  disabled={busy || numberOfIdeas <= 1}
                  className="h-11 w-11 text-xl text-ink disabled:opacity-40"
                >
                  −
                </button>
                <span aria-live="polite" className="w-7 text-center font-semibold text-ink">{numberOfIdeas}</span>
                <button
                  aria-label="More ideas"
                  onClick={() => setNumberOfIdeas((n) => Math.min(10, n + 1))}
                  disabled={busy || numberOfIdeas >= 10}
                  className="h-11 w-11 text-xl text-ink disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <label className="mt-2 flex min-h-11 items-center gap-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={pauseFirst}
                onChange={(e) => setPauseFirst(e.target.checked)}
                disabled={busy}
                className="h-[18px] w-[18px] accent-[var(--accent-text)]"
              />
              Pause {REFLECTION_SECONDS} seconds to think first
            </label>

            <Button onClick={handleGenerateClick} isLoading={isLoading} disabled={busy} className="mt-4 w-full" size="lg">
              {countdown > 0
                ? `Think of your own first… ${countdown}`
                : isLoading
                  ? 'Thinking…'
                  : hasIdeas
                    ? `Ask for ${numberOfIdeas} more ${noun}`
                    : `Ask for ${numberOfIdeas} ${noun}`}
            </Button>
            {hasIdeas && <p className="mt-3 text-sm text-muted">Kept ideas stay. The rest make way for the new batch.</p>}
          </div>
        </div>
      </aside>

      <section className="min-w-0 flex-1 basis-[520px] px-5 py-8 md:px-11">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div className="max-w-2xl">
            <p className="eyebrow">On the question of</p>
            <p className="mt-1.5 text-base leading-relaxed text-ink">{designProblem.description}</p>
          </div>
          {hasIdeas && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted">
                {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'} · {keptCount} kept
              </span>
              <Button onClick={() => setIsExportModalOpen(true)} variant="secondary" disabled={isLoading}>
                Export
              </Button>
            </div>
          )}
        </div>

        {!hasIdeas && isLoading && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center" role="status">
            <Spinner size="lg" />
            <p className="mt-6 font-display text-2xl italic text-ink">{persona.nameAlias} is thinking…</p>
          </div>
        )}

        {!hasIdeas && !isLoading && (
          <div className="flex min-h-[40vh] flex-col items-start justify-center">
            <h2 className="max-w-xl font-display text-4xl leading-tight text-ink">
              {persona.nameAlias} has not said anything yet.
            </h2>
            <p className="mt-3 max-w-md text-base text-muted">
              Ask for a first batch of ideas. Keep the ones worth discussing, then convene a panel on any of them.
            </p>
          </div>
        )}

        {ideas.map((idea, index) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            number={index + 1}
            onUpdate={onUpdateIdea}
            onDelete={onDeleteIdea}
            onDeepDive={onDeepDive}
            disabled={isLoading}
            persona={persona}
            designProblem={designProblem}
          />
        ))}

        {hasIdeas && isLoading && (
          <div className="flex items-center gap-4 py-6 text-muted" role="status">
            <Spinner size="sm" />
            <span className="font-display text-lg italic">More on the way…</span>
          </div>
        )}
      </section>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        ideas={ideas.filter((idea) => idea.pinned)}
        allIdeas={ideas}
        persona={persona}
        designProblem={designProblem}
      />
    </div>
  );
};

export default IdeaStudioScreen;
