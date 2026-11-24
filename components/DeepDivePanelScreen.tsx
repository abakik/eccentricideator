import React from 'react';
import {
  Idea,
  DeepDivePersona,
  DiscussionRound,
  DeepDiveLoadingState,
  DesignProblem,
  DeepDiveSubActionSolutionLoadingState,
  DeepDiveSubActionProblemLoadingState,
  Persona as OriginalPersona,
  DeepDiveFocusMode,
} from '../types';
import { Button } from './Button';
import { Spinner } from './Spinner';

interface DeepDivePanelScreenProps {
  selectedIdea: Idea;
  designProblem: DesignProblem;
  originalPersona: OriginalPersona | null;
  personas: DeepDivePersona[] | null;
  discussionRounds: DiscussionRound[];
  activePersona: DeepDivePersona | null;
  onSelectPersona: (persona: DeepDivePersona | null) => void;
  onRunDiscussion: () => Promise<void>;
  loadingState: DeepDiveLoadingState;
  deepDiveFocusMode: DeepDiveFocusMode;
  onSetDeepDiveFocusMode: (mode: DeepDiveFocusMode) => void;
  discussionSummaryPoints: string[] | null;
  selectedSummaryPointTexts: string[];
  revisedIdeaDetails: { text: string; rationale: string } | null;
  subActionSolutionLoadingState: DeepDiveSubActionSolutionLoadingState;
  onSummariseDiscussion: () => Promise<void>;
  onToggleSummaryPoint: (pointText: string) => void;
  onReviseIdea: () => Promise<void>;
  revisedIdeaTechnologicalSolutions: string[] | null;
  revisedIdeaTranslating: boolean;
  revisedIdeaTranslationError: string | null;
  onTranslateRevisedIdea: () => Promise<void>;
  revisedProblemDescription: string | null;
  subActionProblemLoadingState: DeepDiveSubActionProblemLoadingState;
  onReviseProblemDescription: () => Promise<void>;
}

/** One colour per seat, so a speaker is recognisable down the whole thread. */
const SEAT_COLORS: Record<string, string> = {
  'problem-owner': '#D4F23A',
  'domain-expert': '#8FE3FF',
  'critical-designer': '#F5A8E0',
  'visionary-technologist': '#FFB38A',
  'skeptical-investor': '#C9C0D8',
};

const initials = (name: string) =>
  name
    .replace(/^(dr|prof|mr|mrs|ms)\.?\s+/i, '')
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const Seat: React.FC<{ personaId: string; name: string }> = ({ personaId, name }) => (
  <span
    aria-hidden="true"
    className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-sm font-semibold text-[#15121C] ring-1 ring-line-strong"
    style={{ background: SEAT_COLORS[personaId] ?? '#C9C0D8' }}
  >
    {initials(name)}
  </span>
);

const DeepDivePanelScreen: React.FC<DeepDivePanelScreenProps> = ({
  selectedIdea,
  designProblem,
  originalPersona,
  personas,
  discussionRounds,
  activePersona,
  onSelectPersona,
  onRunDiscussion,
  loadingState,
  deepDiveFocusMode,
  onSetDeepDiveFocusMode,
  discussionSummaryPoints,
  selectedSummaryPointTexts,
  revisedIdeaDetails,
  subActionSolutionLoadingState,
  onSummariseDiscussion,
  onToggleSummaryPoint,
  onReviseIdea,
  revisedIdeaTechnologicalSolutions,
  revisedIdeaTranslating,
  revisedIdeaTranslationError,
  onTranslateRevisedIdea,
  revisedProblemDescription,
  subActionProblemLoadingState,
  onReviseProblemDescription,
}) => {
  if (loadingState === 'error' && !personas) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-20 text-center">
        <h1 className="font-display text-3xl text-ink">The panel could not be assembled</h1>
        <p className="mt-2 max-w-md text-muted">Go back to the ideas and convene the panel again.</p>
      </div>
    );
  }

  if (loadingState === 'loadingPersonas' || !personas) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-20 text-center" role="status">
        <Spinner size="lg" />
        <p className="mt-6 font-display text-2xl italic text-ink">Five people are taking their seats…</p>
        <p className="mt-2 text-sm text-muted">Assembling a panel for this idea takes about fifteen seconds.</p>
      </div>
    );
  }

  const problemMode = deepDiveFocusMode === 'problem';
  const isDiscussing = loadingState === 'loadingDiscussion';
  // In problem mode the app reuses the 'revisingProblem' state while it distils the discussion.
  const isDistilling =
    subActionSolutionLoadingState === 'summarizing' ||
    (subActionProblemLoadingState === 'revisingProblem' && !discussionSummaryPoints);
  const isRevising =
    subActionSolutionLoadingState === 'revising' ||
    (subActionProblemLoadingState === 'revisingProblem' && !!discussionSummaryPoints);
  const isAnyLoading = isDiscussing || isDistilling || isRevising || revisedIdeaTranslating;

  const hasRounds = discussionRounds.length > 0;
  const hasPoints = !!discussionSummaryPoints && discussionSummaryPoints.length > 0;
  const selectedCount = selectedSummaryPointTexts.length;
  const hasRevision = problemMode ? !!revisedProblemDescription : !!revisedIdeaDetails;
  const currentProblem = revisedProblemDescription || designProblem.description;

  const steps = problemMode ? ['Discuss', 'Distil', 'Reframe'] : ['Discuss', 'Distil', 'Revise', 'Make practical'];
  const stepIndex = hasRevision ? (problemMode ? 3 : revisedIdeaTechnologicalSolutions ? 4 : 3) : hasPoints ? 2 : hasRounds ? 1 : 0;

  return (
    <div className="flex flex-1 flex-col">
      {/* What is on the table */}
      <section className="border-b border-line px-5 py-7 md:px-10">
        <div className="flex flex-wrap items-start justify-between gap-x-12 gap-y-5">
          <div className="min-w-0 max-w-3xl flex-1 basis-[480px]">
            <p className="eyebrow">
              {problemMode ? 'On the table · the problem itself' : `On the table · an idea${originalPersona ? ` by ${originalPersona.nameAlias}` : ''}`}
            </p>

            {problemMode ? (
              <>
                {revisedProblemDescription && <p className="mt-3 text-sm font-semibold text-accent-text">Reframed</p>}
                <h1 className="mt-2 font-display text-[28px] leading-snug text-ink md:text-3xl">{currentProblem}</h1>
                {revisedProblemDescription && (
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    <span className="font-semibold">Originally: </span>{designProblem.description}
                  </p>
                )}
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  <span className="font-semibold">The idea that prompted this: </span>{selectedIdea.text}
                </p>
              </>
            ) : (
              <>
                {revisedIdeaDetails && <p className="mt-3 text-sm font-semibold text-accent-text">Revised</p>}
                <h1 className="mt-2 font-display text-[28px] leading-snug text-ink md:text-3xl">
                  {revisedIdeaDetails ? revisedIdeaDetails.text : selectedIdea.text}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {revisedIdeaDetails ? revisedIdeaDetails.rationale : selectedIdea.rationale}
                </p>
                {revisedIdeaDetails && (
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    <span className="font-semibold">Originally: </span>{selectedIdea.text}
                  </p>
                )}
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  <span className="font-semibold">For the problem: </span>{currentProblem}
                </p>

                {revisedIdeaDetails && (
                  <div className="mt-5">
                    <Button
                      onClick={onTranslateRevisedIdea}
                      variant="secondary"
                      isLoading={revisedIdeaTranslating}
                      disabled={isAnyLoading || !originalPersona}
                    >
                      {revisedIdeaTechnologicalSolutions ? 'Try other practical versions' : 'Make the revised idea practical'}
                    </Button>
                    {revisedIdeaTranslationError && <p role="alert" className="mt-3 text-sm text-danger">{revisedIdeaTranslationError}</p>}
                    {revisedIdeaTechnologicalSolutions && (
                      <div className="mt-4 rounded-lg border border-line px-4 py-3">
                        <p className="eyebrow">Made practical</p>
                        {revisedIdeaTechnologicalSolutions.length > 0 ? (
                          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink">
                            {revisedIdeaTechnologicalSolutions.map((solution, index) => <li key={index}>{solution}</li>)}
                          </ul>
                        ) : (
                          <p className="mt-2 text-sm text-muted">This idea is too abstract to turn into something buildable as it stands.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col items-start gap-3">
            <div role="group" aria-label="What the panel discusses" className="flex overflow-hidden rounded-full border border-line-strong text-sm">
              {([['solution', 'Critique the idea'], ['problem', 'Question the problem']] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => onSetDeepDiveFocusMode(mode)}
                  aria-pressed={deepDiveFocusMode === mode}
                  disabled={isAnyLoading}
                  className={`min-h-11 px-5 disabled:opacity-60 ${
                    deepDiveFocusMode === mode ? 'bg-ink font-semibold text-ground' : 'text-ink hover:bg-raised'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <ol className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
              {steps.map((step, index) => (
                <li key={step} aria-current={index === stepIndex ? 'step' : undefined} className={index === stepIndex ? 'font-semibold text-ink' : ''}>
                  {index + 1} {step}{index < stepIndex ? ' ✓' : ''}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div className="flex flex-1 flex-wrap">
        {/* The panel */}
        <aside aria-label="Panel members" className="w-full flex-none bg-panel px-5 py-7 md:px-6 lg:w-[290px]">
          <p className="eyebrow mb-3">The panel</p>
          <div className="flex flex-col gap-1">
            {personas.map((persona) => {
              const isActive = activePersona?.id === persona.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => onSelectPersona(isActive ? null : persona)}
                  aria-pressed={isActive}
                  className={`flex min-h-14 items-center gap-3 rounded-xl border px-2.5 py-1.5 text-left ${
                    isActive ? 'border-line-strong bg-raised' : 'border-transparent hover:bg-raised'
                  }`}
                >
                  <Seat personaId={persona.id} name={persona.name} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{persona.name}</span>
                    <span className="block text-xs leading-snug text-muted">{persona.role.split(':').slice(1).join(':').trim() || persona.role}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {activePersona ? (
            <div className="mt-5 border-t border-line pt-5 text-sm leading-relaxed text-muted">
              <p className="font-display text-base italic leading-snug text-ink">“{activePersona.quote}”</p>
              <p className="mt-3"><span className="font-semibold text-ink">{activePersona.role.split(':')[0]}</span>, {activePersona.age}</p>
              <p className="mt-2">{activePersona.background}</p>
              <p className="mt-2"><span className="font-semibold text-ink">Wants: </span>{activePersona.motivations}</p>
              <p className="mt-2"><span className="font-semibold text-ink">Watching for: </span>{activePersona.concerns}</p>
              <p className="mt-2"><span className="font-semibold text-ink">On technology: </span>{activePersona.techPerspective}</p>
            </div>
          ) : (
            <p className="mt-5 border-t border-line pt-5 text-sm text-muted">Select a panellist to read about them.</p>
          )}
        </aside>

        {/* The discussion */}
        <section className="min-w-0 flex-1 basis-[420px] px-5 py-7 md:px-9">
          {!hasRounds && !isDiscussing && (
            <div className="max-w-xl">
              <h2 className="font-display text-3xl leading-tight text-ink">The panel is seated and waiting.</h2>
              <p className="mt-3 text-base text-muted">
                {problemMode
                  ? 'Each panellist will say what they think of the problem as it is written.'
                  : 'Each panellist will give an opening view of the idea. Further rounds let them answer one another.'}
              </p>
            </div>
          )}

          {discussionRounds.map((round) => (
            <div key={round.roundNumber} className="mb-8">
              <div className="mb-5 flex items-center gap-4">
                <h2 className="eyebrow">Round {round.roundNumber}</h2>
                <span className="h-px flex-1 bg-line" />
              </div>
              <div className="flex flex-col gap-5">
                {round.responses.map((response, index) => (
                  <div key={index} className="flex gap-3.5">
                    <Seat personaId={response.personaId} name={response.personaName} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{response.personaName}</p>
                      <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{response.responseText}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {isDiscussing && (
            <div className="mb-6 flex items-center gap-4 text-muted" role="status">
              <Spinner size="sm" />
              <span className="font-display text-lg italic">The panel is talking…</span>
            </div>
          )}
          {loadingState === 'error' && (
            <p role="alert" className="mb-4 text-sm text-danger">The last round did not complete. Try running it again.</p>
          )}

          <Button onClick={onRunDiscussion} disabled={isAnyLoading} variant={hasRounds ? 'secondary' : 'primary'} size="lg" className={hasRounds ? '' : 'mt-7'}>
            {hasRounds ? `Run round ${discussionRounds.length + 1}` : 'Open the discussion'}
          </Button>
        </section>

        {/* Takeaways */}
        <aside aria-label="Takeaways" className="w-full flex-none border-t border-line px-5 py-7 md:px-7 lg:w-[360px] lg:border-l lg:border-t-0">
          <p className="eyebrow mb-3">Takeaways</p>

          {!hasRounds && <p className="text-sm leading-relaxed text-muted">Once the panel has spoken, you can distil what they said into points and choose which ones to act on.</p>}

          {hasRounds && !discussionSummaryPoints && (
            <>
              <p className="mb-4 text-sm leading-relaxed text-muted">
                Distil the discussion into a few points, then choose the ones {problemMode ? 'the problem statement' : 'the idea'} should absorb.
              </p>
              <Button onClick={onSummariseDiscussion} isLoading={isDistilling} disabled={isAnyLoading} variant="primary" size="lg" className="w-full">
                Distil the discussion
              </Button>
            </>
          )}

          {discussionSummaryPoints && discussionSummaryPoints.length === 0 && (
            <p className="text-sm leading-relaxed text-muted">Nothing clear came out of the discussion yet. Run another round and distil again.</p>
          )}

          {hasPoints && (
            <>
              <p className="mb-3 text-sm leading-relaxed text-muted">
                Choose the points {problemMode ? 'the problem statement' : 'the idea'} should absorb.
              </p>
              <div className="flex flex-col gap-2">
                {discussionSummaryPoints!.map((point, index) => {
                  const checked = selectedSummaryPointTexts.includes(point);
                  return (
                    <label
                      key={index}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-sm leading-snug text-ink ${
                        checked ? 'border-accent-text bg-raised' : 'border-line hover:border-line-strong'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleSummaryPoint(point)}
                        disabled={isRevising}
                        className="mt-0.5 h-[18px] w-[18px] flex-none accent-[var(--accent-text)]"
                      />
                      <span>{point}</span>
                    </label>
                  );
                })}
              </div>
              <Button
                onClick={problemMode ? onReviseProblemDescription : onReviseIdea}
                isLoading={isRevising}
                disabled={selectedCount === 0 || isAnyLoading}
                variant="primary"
                size="lg"
                className="mt-4 w-full"
              >
                {selectedCount === 0
                  ? 'Choose at least one point'
                  : `${problemMode ? 'Reframe the problem' : 'Revise the idea'} with ${selectedCount} ${selectedCount === 1 ? 'point' : 'points'}`}
              </Button>
              {hasRevision && (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  The {problemMode ? 'reframed problem' : 'revised idea'} is at the top of the page, above the original.
                </p>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default DeepDivePanelScreen;
