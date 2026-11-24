import React from 'react';
import { AppStep } from '../types';
import { Button } from './Button';
import { useTheme } from '../ThemeContext';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface HeaderProps {
  currentStep: AppStep;
  stepsConfig: { id: number; title: string; name: string }[];
  onNavigate: (step: AppStep) => void;
  onNewSession: () => void;
  canNavigateToDeepDive?: boolean;
}

const NUMERALS = ['I', 'II', 'III', 'IV'];

const Header: React.FC<HeaderProps> = ({ currentStep, stepsConfig, onNavigate, onNewSession, canNavigateToDeepDive }) => {
  const { theme, toggleTheme } = useTheme();

  const isStepDisabled = (targetStepId: number): boolean => {
    if (targetStepId === AppStep.DeepDive) {
      if (currentStep < AppStep.GenerateIdeas) return true;
      return !canNavigateToDeepDive && currentStep !== AppStep.DeepDive;
    }
    // Earlier steps are always open; a later step opens once the one before it is reached.
    return targetStepId > currentStep + 1;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ground/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-10 gap-y-1 px-5 py-2 md:px-10">
        <div className="font-display text-[22px] italic text-ink">Eccentric Ideator</div>

        <nav aria-label="Steps" className="order-3 flex w-full flex-wrap gap-x-7 md:order-none md:w-auto md:flex-1">
          {stepsConfig.map((step, index) => {
            const isCurrent = currentStep === step.id;
            const disabled = isStepDisabled(step.id);
            return (
              <button
                key={step.id}
                onClick={() => onNavigate(step.id as AppStep)}
                disabled={disabled}
                aria-current={isCurrent ? 'step' : undefined}
                className={`min-h-11 text-[13px] uppercase tracking-[0.08em] transition-colors
                  ${isCurrent ? 'font-semibold text-accent-text' : 'text-muted hover:text-ink'}
                  ${disabled ? 'cursor-not-allowed opacity-40 hover:text-muted' : ''}`}
              >
                {NUMERALS[index]} · {step.title}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button onClick={onNewSession} variant="secondary" size="md">
            New session
          </Button>
          <button
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-raised hover:text-ink"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
