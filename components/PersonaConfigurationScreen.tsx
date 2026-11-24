import React, { useState } from 'react';
import { DesignProblem, PersonaDraft } from '../types';
import { ECCENTRICITY_LABELS } from '../constants';
import { Input } from './Input';
import { Slider } from './Slider';
import { Button } from './Button';
import PersonaForm from './PersonaForm';
import PersonaPortrait from './PersonaPortrait';
import { Spinner } from './Spinner';
import { DownloadIcon } from './icons/DownloadIcon';

interface PersonaConfigurationScreenProps {
  designProblem: DesignProblem;
  personaDraft: PersonaDraft | null;
  onGeneratePersona: (domainHint: string, eccentricityLevel: number) => Promise<void>;
  onUpdatePersonaDraft: (updatedDraft: PersonaDraft) => void;
  onLockPersona: () => void;
  isLoading: boolean;
}

const PersonaConfigurationScreen: React.FC<PersonaConfigurationScreenProps> = ({
  designProblem,
  personaDraft,
  onGeneratePersona,
  onUpdatePersonaDraft,
  onLockPersona,
  isLoading,
}) => {
  const [domainHint, setDomainHint] = useState('');
  const [eccentricityLevel, setEccentricityLevel] = useState(3);

  const canLockPersona = !!personaDraft && !!personaDraft.nameAlias?.trim();

  const handleDownloadPersona = () => {
    if (!personaDraft) return;
    const blob = new Blob([JSON.stringify(personaDraft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (personaDraft.nameAlias || 'persona').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
    a.download = `${safeName}_details.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-1 flex-wrap">
      <aside className="w-full flex-none bg-panel px-5 py-8 md:px-9 lg:w-[360px]">
        <div className="lg:sticky lg:top-24">
          <p className="eyebrow">The problem</p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink">{designProblem.description}</p>

          <div className="mt-8 border-t border-line pt-7">
            <Input
              label="Persona hint (optional)"
              name="domainHint"
              value={domainHint}
              onChange={(e) => setDomainHint(e.target.value)}
              placeholder="a bell founder, a tide-table compiler…"
              wrapperClassName="!mb-1.5"
            />
            <p className="mb-6 text-sm text-muted">Says who the persona is. Leave it blank for a surprise.</p>

            <Slider
              label="Eccentricity"
              value={eccentricityLevel}
              min={1}
              max={5}
              onChange={setEccentricityLevel}
              valueLabel={(val) => ECCENTRICITY_LABELS[val]}
              wrapperClassName="mb-6"
            />

            <Button onClick={() => onGeneratePersona(domainHint, eccentricityLevel)} isLoading={isLoading} className="w-full" size="lg">
              {personaDraft ? 'Invent someone else' : 'Invent a persona'}
            </Button>
          </div>
        </div>
      </aside>

      <section className="min-w-0 flex-1 basis-[520px] px-5 py-8 md:px-11">
        {isLoading && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center" role="status">
            <Spinner size="lg" />
            <p className="mt-6 font-display text-2xl italic text-ink">Someone is on their way…</p>
            <p className="mt-2 text-sm text-muted">Inventing a persona takes about fifteen seconds.</p>
          </div>
        )}

        {!isLoading && !personaDraft && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <PersonaPortrait seed="nobody yet" className="h-36 w-36 opacity-60" />
            <h2 className="mt-6 font-display text-3xl text-ink">Nobody here yet</h2>
            <p className="mt-2 max-w-sm text-base text-muted">
              Choose how eccentric they should be, then invent a persona to think about your problem.
            </p>
          </div>
        )}

        {!isLoading && personaDraft && (
          <>
            <div className="flex flex-wrap items-start gap-x-8 gap-y-6 pb-8">
              <PersonaPortrait seed={personaDraft.nameAlias || ''} className="h-32 w-32 flex-none" />
              <div className="min-w-0 flex-1 basis-80">
                <p className="eyebrow">Your eccentric</p>
                <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] text-ink md:text-5xl">
                  {personaDraft.nameAlias || 'Unnamed'}
                </h1>
                {personaDraft.archetypeDefiningEssence && (
                  <p className="mt-2 font-display text-xl italic text-muted">{personaDraft.archetypeDefiningEssence}</p>
                )}
                {personaDraft.coreBeliefSystemWorldview && (
                  <blockquote className="mt-5 max-w-2xl font-display text-xl leading-snug text-ink">
                    “{personaDraft.coreBeliefSystemWorldview}”
                  </blockquote>
                )}
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button onClick={onLockPersona} variant="primary" size="lg" disabled={!canLockPersona}>
                    Keep this persona and get ideas
                  </Button>
                  <Button onClick={handleDownloadPersona} variant="secondary" size="lg" leftIcon={<DownloadIcon className="h-5 w-5" />}>
                    Download
                  </Button>
                </div>
              </div>
            </div>

            <p className="pb-3 text-sm text-muted">Everything below is editable. Changes shape the ideas this persona gives you.</p>
            <PersonaForm personaDraft={personaDraft} onUpdatePersonaDraft={onUpdatePersonaDraft} />
            <div className="border-t border-line" />
          </>
        )}
      </section>
    </div>
  );
};

export default PersonaConfigurationScreen;
