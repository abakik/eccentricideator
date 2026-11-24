

import React, { useState, useEffect, useCallback } from 'react';
import { DesignProblem, Persona, PersonaDraft, Idea, AppStep, ToastMessage, DeepDivePersona, DiscussionRound, DeepDiveFocusMode, DeepDiveLoadingState, DeepDiveSubActionSolutionLoadingState, DeepDiveSubActionProblemLoadingState } from './types';
import { APP_STEPS_CONFIG } from './constants';
import Header from './components/Header';
import ProblemDefinitionScreen from './components/ProblemDefinitionScreen';
import PersonaConfigurationScreen from './components/PersonaConfigurationScreen';
import IdeaStudioScreen from './components/IdeaStudioScreen';
import DeepDivePanelScreen from './components/DeepDivePanelScreen'; // New Screen
import ToastContainer from './components/ToastContainer';
import { generatePersona as apiGeneratePersona } from './services/personaService';
import { generateIdeas as apiGenerateIdeas } from './services/ideaService';
import * as deepDiveService from './services/deepDiveService'; // New Service
import { translateIdeaToSolutions as apiTranslateIdea } from './services/translationService';
import { ThemeProvider } from './ThemeContext';

const AppContent: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.DefineProblem);
  const [designProblem, setDesignProblem] = useState<DesignProblem | null>(null);
  const [personaDraft, setPersonaDraft] = useState<PersonaDraft | null>(null);
  const [personaFinal, setPersonaFinal] =useState<Persona | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(false); // General loading for steps 1-3
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [sessionName, setSessionName] = useState<string>('current_session_v3'); // Incremented session version
  const [problemScreenKey, setProblemScreenKey] = useState<string>(Date.now().toString());
  // Saving waits until the saved session has been read, so a fresh mount cannot overwrite it with blanks.
  const [hasLoadedSession, setHasLoadedSession] = useState(false);

  // State for Deep Dive (Step 4)
  const [selectedIdeaForDeepDive, setSelectedIdeaForDeepDive] = useState<Idea | null>(null);
  const [deepDivePersonas, setDeepDivePersonas] = useState<DeepDivePersona[] | null>(null);
  const [activeDeepDivePersona, setActiveDeepDivePersona] = useState<DeepDivePersona | null>(null);
  const [deepDiveLoadingState, setDeepDiveLoadingState] = useState<DeepDiveLoadingState>('idle');
  const [deepDiveFocusMode, setDeepDiveFocusMode] = useState<DeepDiveFocusMode>('solution');

  // Focus-specific Deep Dive states
  const [discussionRoundsSolution, setDiscussionRoundsSolution] = useState<DiscussionRound[]>([]);
  const [discussionRoundsProblem, setDiscussionRoundsProblem] = useState<DiscussionRound[]>([]);

  const [discussionSummaryPointsSolution, setDiscussionSummaryPointsSolution] = useState<string[] | null>(null);
  const [discussionSummaryPointsProblem, setDiscussionSummaryPointsProblem] = useState<string[] | null>(null);
  
  const [selectedSummaryPointTextsSolution, setSelectedSummaryPointTextsSolution] = useState<string[]>([]);
  const [selectedSummaryPointTextsProblem, setSelectedSummaryPointTextsProblem] = useState<string[]>([]);

  // Solution-specific states
  const [revisedIdeaDetails, setRevisedIdeaDetails] = useState<{ text: string; rationale: string } | null>(null);
  const [deepDiveSubActionSolutionLoading, setDeepDiveSubActionSolutionLoading] = useState<DeepDiveSubActionSolutionLoadingState>(null);
  const [revisedIdeaTechnologicalSolutions, setRevisedIdeaTechnologicalSolutions] = useState<string[] | null>(null);
  const [revisedIdeaTranslating, setRevisedIdeaTranslating] = useState<boolean>(false);
  const [revisedIdeaTranslationError, setRevisedIdeaTranslationError] = useState<string | null>(null);
  
  // Problem-specific states
  const [revisedProblemDescription, setRevisedProblemDescription] = useState<string | null>(null);
  const [deepDiveSubActionProblemLoading, setDeepDiveSubActionProblemLoading] = useState<DeepDiveSubActionProblemLoadingState>(null);


  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(sessionName);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setCurrentStep(parsedState.currentStep || AppStep.DefineProblem);
        setDesignProblem(parsedState.designProblem || null);
        setPersonaDraft(parsedState.personaDraft || null);
        setPersonaFinal(parsedState.personaFinal || null);
        setIdeas(parsedState.ideas || []);
        
        // Load Deep Dive states
        setSelectedIdeaForDeepDive(parsedState.selectedIdeaForDeepDive || null);
        setDeepDivePersonas(parsedState.deepDivePersonas || null);
        setActiveDeepDivePersona(parsedState.activeDeepDivePersona || null);
        setDeepDiveFocusMode(parsedState.deepDiveFocusMode || 'solution');

        setDiscussionRoundsSolution(parsedState.discussionRoundsSolution || []);
        setDiscussionRoundsProblem(parsedState.discussionRoundsProblem || []);
        setDiscussionSummaryPointsSolution(parsedState.discussionSummaryPointsSolution || null);
        setDiscussionSummaryPointsProblem(parsedState.discussionSummaryPointsProblem || null);
        setSelectedSummaryPointTextsSolution(parsedState.selectedSummaryPointTextsSolution || []);
        setSelectedSummaryPointTextsProblem(parsedState.selectedSummaryPointTextsProblem || []);

        setRevisedIdeaDetails(parsedState.revisedIdeaDetails || null);
        setRevisedIdeaTechnologicalSolutions(parsedState.revisedIdeaTechnologicalSolutions || null);
        setRevisedProblemDescription(parsedState.revisedProblemDescription || null);

        // Reset transient loading states
        setDeepDiveLoadingState('idle');
        setDeepDiveSubActionSolutionLoading(null);
        setDeepDiveSubActionProblemLoading(null);
        setRevisedIdeaTranslating(false);
        setRevisedIdeaTranslationError(null);
        
        if (parsedState.currentStep === AppStep.DefineProblem) {
            setProblemScreenKey(Date.now().toString());
        }
      }
    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
      addToast('Could not load previous session', 'error');
    }
    setHasLoadedSession(true);
  }, [sessionName, addToast]);

  useEffect(() => {
    if (!hasLoadedSession) return;
    const stateToSave = {
      currentStep,
      designProblem,
      personaDraft,
      personaFinal,
      ideas,
      // Deep Dive states to persist
      selectedIdeaForDeepDive,
      deepDivePersonas,
      activeDeepDivePersona,
      deepDiveFocusMode,
      discussionRoundsSolution,
      discussionRoundsProblem,
      discussionSummaryPointsSolution,
      discussionSummaryPointsProblem,
      selectedSummaryPointTextsSolution,
      selectedSummaryPointTextsProblem,
      revisedIdeaDetails,
      revisedIdeaTechnologicalSolutions,
      revisedProblemDescription,
    };
    try {
      localStorage.setItem(sessionName, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }, [
        hasLoadedSession,
        currentStep, designProblem, personaDraft, personaFinal, ideas, sessionName,
        selectedIdeaForDeepDive, deepDivePersonas, activeDeepDivePersona,
        deepDiveFocusMode, 
        discussionRoundsSolution, discussionRoundsProblem,
        discussionSummaryPointsSolution, discussionSummaryPointsProblem,
        selectedSummaryPointTextsSolution, selectedSummaryPointTextsProblem,
        revisedIdeaDetails, revisedIdeaTechnologicalSolutions, revisedProblemDescription
    ]);

  const clearDeepDiveTransientStates = () => {
    setDeepDiveLoadingState('idle');
    setDeepDiveSubActionSolutionLoading(null);
    setDeepDiveSubActionProblemLoading(null);
    setRevisedIdeaTranslating(false);
    setRevisedIdeaTranslationError(null);
  };
  
  const clearAllDeepDiveStates = () => {
    setSelectedIdeaForDeepDive(null);
    setDeepDivePersonas(null);
    setActiveDeepDivePersona(null);
    setDeepDiveFocusMode('solution'); 
    
    setDiscussionRoundsSolution([]);
    setDiscussionRoundsProblem([]);
    setDiscussionSummaryPointsSolution(null);
    setDiscussionSummaryPointsProblem(null);
    setSelectedSummaryPointTextsSolution([]);
    setSelectedSummaryPointTextsProblem([]);
    
    setRevisedIdeaDetails(null);
    setRevisedIdeaTechnologicalSolutions(null);
    setRevisedProblemDescription(null);

    clearDeepDiveTransientStates();
  };


  const handleNewSession = () => {
    setDesignProblem(null);
    setPersonaDraft(null);
    setPersonaFinal(null);
    setIdeas([]);
    clearAllDeepDiveStates();
    setCurrentStep(AppStep.DefineProblem);
    setProblemScreenKey(Date.now().toString());
    addToast('Current work cleared. Ready for a new problem!', 'success');
  };

  const handleProblemDefined = (description: string) => {
    const newProblem: DesignProblem = {
        id: designProblem?.id || Date.now().toString(), 
        description: description
    };
    setDesignProblem(newProblem);
    setCurrentStep(AppStep.ConfigurePersona);
  };

  const handleGeneratePersona = async (domainHint: string, eccentricityLevel: number) => {
    if (!designProblem) {
      addToast('Please define a problem first.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const newPersona = await apiGeneratePersona(designProblem, domainHint, eccentricityLevel);
      setPersonaDraft(newPersona);
    } catch (error) {
      console.error("Error generating persona:", error);
      addToast(`Error generating persona: ${(error as Error).message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePersonaDraft = (updatedDraft: PersonaDraft) => {
    setPersonaDraft(updatedDraft);
  };
  
  const handleLockPersona = () => {
    if (!personaDraft || !personaDraft.id || !personaDraft.nameAlias) { 
      addToast('Persona draft is incomplete or invalid.', 'error');
      return;
    }
    setPersonaFinal(personaDraft as Persona); 
    setCurrentStep(AppStep.GenerateIdeas);
  };

  const handleGenerateIdeas = async (numberOfIdeas: number) => {
    if (!designProblem || !personaFinal) {
      addToast('Problem and locked persona are required to generate ideas.', 'error');
      return;
    }
    setIsLoading(true);
    // Sent so the new batch avoids repeating what is already on screen.
    const existingIdeaTexts = ideas.map(idea => idea.text);
    setIdeas(prevIdeas => prevIdeas.filter(idea => idea.pinned)); 
    try {
      await apiGenerateIdeas(
        designProblem,
        personaFinal,
        numberOfIdeas,
        existingIdeaTexts,
        (ideaChunk) => {
          setIdeas(prevIdeas => {
            if (prevIdeas.find(idea => idea.id === ideaChunk.id)) {
              return prevIdeas;
            }
            return [...prevIdeas, ideaChunk];
          });
        }
      );
    } catch (error) {
      console.error("Error generating ideas:", error);
      addToast(`Error generating ideas: ${(error as Error).message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIdea = (updatedIdea: Idea) => {
    setIdeas(prevIdeas => prevIdeas.map(idea => idea.id === updatedIdea.id ? updatedIdea : idea));
  };

  const handleDeleteIdea = (ideaId: string) => {
    setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== ideaId));
    addToast('Idea discarded.', 'info');
  };

  // --- Deep Dive Functions ---
  const handleInitiateDeepDive = async (idea: Idea) => {
    if (!designProblem) {
        addToast('Design problem context is missing for Deep Dive.', 'error');
        return;
    }
    clearAllDeepDiveStates(); 
    setSelectedIdeaForDeepDive(idea);
    setDeepDiveLoadingState('loadingPersonas');
    setCurrentStep(AppStep.DeepDive);
    try {
      const personas = await deepDiveService.generateDeepDivePersonas(idea.text, designProblem.description);
      setDeepDivePersonas(personas);
      setDeepDiveLoadingState('idle');
    } catch (error) {
      console.error("Error generating deep dive personas:", error);
      addToast(`Failed to generate Deep Dive personas: ${(error as Error).message}`, 'error');
      setDeepDiveLoadingState('error');
      setCurrentStep(AppStep.GenerateIdeas); 
    }
  };

  const handleSetDeepDiveFocusMode = (mode: DeepDiveFocusMode) => {
    if (mode !== deepDiveFocusMode) {
      setDeepDiveFocusMode(mode);
      clearDeepDiveTransientStates();
    }
  };

  const handleRunDiscussionRound = async () => {
    if (!selectedIdeaForDeepDive || !deepDivePersonas || !designProblem) {
      addToast('Selected idea, Deep Dive personas, or problem context missing.', 'error');
      return;
    }
    setDeepDiveLoadingState('loadingDiscussion');
    
    // Clear downstream data for the current focus mode
    if (deepDiveFocusMode === 'solution') {
        setDiscussionSummaryPointsSolution(null); 
        setSelectedSummaryPointTextsSolution([]);
        setRevisedIdeaDetails(null);
        setDeepDiveSubActionSolutionLoading(null);
        setRevisedIdeaTechnologicalSolutions(null);
        setRevisedIdeaTranslating(false);
        setRevisedIdeaTranslationError(null);
    } else { // problem focus
        setDiscussionSummaryPointsProblem(null); 
        setSelectedSummaryPointTextsProblem([]);
        setRevisedProblemDescription(null); 
        setDeepDiveSubActionProblemLoading(null);
    }

    const currentDiscussionRounds = deepDiveFocusMode === 'solution' ? discussionRoundsSolution : discussionRoundsProblem;

    try {
      const newResponses = await deepDiveService.generateDiscussionRound(
        selectedIdeaForDeepDive,
        deepDivePersonas,
        currentDiscussionRounds,
        revisedProblemDescription || designProblem.description, 
        deepDiveFocusMode 
      );
      
      const newRound = { roundNumber: currentDiscussionRounds.length + 1, responses: newResponses };
      if (deepDiveFocusMode === 'solution') {
        setDiscussionRoundsSolution(prevRounds => [...prevRounds, newRound]);
      } else {
        setDiscussionRoundsProblem(prevRounds => [...prevRounds, newRound]);
      }

      setDeepDiveLoadingState('idle');
    } catch (error) {
      console.error("Error running discussion round:", error);
      addToast(`Failed to generate discussion: ${(error as Error).message}`, 'error');
      setDeepDiveLoadingState('error');
    }
  };
  
  const handleSelectDeepDivePersona = (persona: DeepDivePersona | null) => {
    setActiveDeepDivePersona(persona);
  };

  const handleSummariseDiscussion = async () => {
    const currentDiscussionRounds = deepDiveFocusMode === 'solution' ? discussionRoundsSolution : discussionRoundsProblem;
    if (!selectedIdeaForDeepDive || currentDiscussionRounds.length === 0 || !deepDivePersonas || !designProblem) {
        addToast(`Cannot summarise without context for ${deepDiveFocusMode} focus.`, 'error');
        return;
    }

    if (deepDiveFocusMode === 'solution') {
        setDeepDiveSubActionSolutionLoading('summarizing');
        setSelectedSummaryPointTextsSolution([]); 
        setRevisedIdeaDetails(null);      
        setRevisedIdeaTechnologicalSolutions(null);
        setRevisedIdeaTranslating(false);
        setRevisedIdeaTranslationError(null);
    } else { // problem focus
        setDeepDiveSubActionProblemLoading('revisingProblem'); // Using revisingProblem as a generic loading for problem summary step
        setSelectedSummaryPointTextsProblem([]);
        setRevisedProblemDescription(null); // Clear old revised problem before new summary
    }

    try {
        const summary = await deepDiveService.summariseDiscussion(
            selectedIdeaForDeepDive, 
            currentDiscussionRounds, 
            deepDivePersonas, 
            revisedProblemDescription || designProblem.description,
            deepDiveFocusMode 
        );
        
        if (deepDiveFocusMode === 'solution') {
            setDiscussionSummaryPointsSolution(summary);
        } else {
            setDiscussionSummaryPointsProblem(summary);
        }
    } catch (error) {
        console.error("Error summarising discussion:", error);
        addToast(`Failed to summarise discussion: ${(error as Error).message}`, 'error');
        if (deepDiveFocusMode === 'solution') setDiscussionSummaryPointsSolution(null);
        else setDiscussionSummaryPointsProblem(null);
    } finally {
        if (deepDiveFocusMode === 'solution') setDeepDiveSubActionSolutionLoading(null);
        else setDeepDiveSubActionProblemLoading(null); // Reset loading after summary attempt
    }
  };

  const handleToggleSummaryPoint = (pointText: string) => {
    if (deepDiveFocusMode === 'solution') {
        setSelectedSummaryPointTextsSolution(prev =>
            prev.includes(pointText) ? prev.filter(p => p !== pointText) : [...prev, pointText]
        );
    } else {
        setSelectedSummaryPointTextsProblem(prev =>
            prev.includes(pointText) ? prev.filter(p => p !== pointText) : [...prev, pointText]
        );
    }
  };

  const handleReviseIdea = async () => {
    if (deepDiveFocusMode === 'problem') {
        addToast('Cannot revise idea when exploring the problem. Switch focus to solution.', 'error');
        return;
    }
    if (!selectedIdeaForDeepDive || selectedSummaryPointTextsSolution.length === 0 || !deepDivePersonas || !designProblem) {
        addToast('Cannot revise idea without selected feedback for solution focus.', 'error');
        return;
    }
    setDeepDiveSubActionSolutionLoading('revising');
    setRevisedIdeaTechnologicalSolutions(null);
    setRevisedIdeaTranslating(false);
    setRevisedIdeaTranslationError(null);
    try {
        const revision = await deepDiveService.reviseIdeaBasedOnFeedback(
            selectedIdeaForDeepDive, 
            selectedSummaryPointTextsSolution, 
            deepDivePersonas, 
            revisedProblemDescription || designProblem.description,
            personaFinal
        );
        setRevisedIdeaDetails({ text: revision.revisedText, rationale: revision.revisedRationale });
    } catch (error) {
        console.error("Error revising idea:", error);
        addToast(`Failed to revise idea: ${(error as Error).message}`, 'error');
        setRevisedIdeaDetails(null);
    } finally {
        setDeepDiveSubActionSolutionLoading(null);
    }
  };

  const handleReviseProblemDescription = async () => {
    if (deepDiveFocusMode === 'solution') {
        addToast('Cannot revise problem when focusing on solution. Switch focus to problem.', 'error');
        return;
    }
    if (!designProblem || selectedSummaryPointTextsProblem.length === 0 || !deepDivePersonas) {
        addToast('Cannot revise problem without selected feedback for problem focus.', 'error');
        return;
    }
    setDeepDiveSubActionProblemLoading('revisingProblem');
    try {
        const newDescription = await deepDiveService.reviseProblemDescription(
            revisedProblemDescription || designProblem.description, 
            selectedSummaryPointTextsProblem,
            deepDivePersonas
        );
        setRevisedProblemDescription(newDescription);
    } catch (error) {
        console.error("Error revising problem description:", error);
        addToast(`Failed to revise problem: ${(error as Error).message}`, 'error');
    } finally {
        setDeepDiveSubActionProblemLoading(null);
    }
  };


  const handleTranslateRevisedIdea = async () => {
    if (deepDiveFocusMode === 'problem' || !revisedIdeaDetails || !selectedIdeaForDeepDive || !personaFinal || !designProblem) {
      addToast('Cannot translate revised idea without necessary context or when in problem exploration mode.', 'error');
      return;
    }
    setRevisedIdeaTranslating(true);
    setRevisedIdeaTechnologicalSolutions(null);
    setRevisedIdeaTranslationError(null);

    const tempRevisedIdeaForTranslation: Idea = {
      id: selectedIdeaForDeepDive.id + '-revised', 
      text: revisedIdeaDetails.text,
      rationale: revisedIdeaDetails.rationale,
      personaId: personaFinal.id, 
      pinned: false,
      note: '', 
      timestamp: new Date().toISOString(),
    };

    try {
      const solutions = await apiTranslateIdea(tempRevisedIdeaForTranslation, personaFinal, {
        ...designProblem,
        description: revisedProblemDescription || designProblem.description 
      });
      setRevisedIdeaTechnologicalSolutions(solutions);
    } catch (error) {
      console.error("Error translating revised idea:", error);
      setRevisedIdeaTranslationError((error as Error).message || "Failed to translate revised idea.");
      addToast(`Translation failed: ${(error as Error).message}`, 'error');
    } finally {
      setRevisedIdeaTranslating(false);
    }
  };
  
  const navigateToStep = (step: AppStep) => {
    if (step < currentStep) { 
      setCurrentStep(step);
      if (step === AppStep.DefineProblem) {
        setProblemScreenKey(Date.now().toString());
      }
      return;
    }
    if (step === AppStep.ConfigurePersona && !designProblem) {
        addToast('Please define a problem first.', 'error'); return;
    }
    if (step === AppStep.GenerateIdeas && (!designProblem || !personaFinal)) {
        addToast('Please define a problem and lock your persona first.', 'error'); return;
    }
    if (step === AppStep.DeepDive && !selectedIdeaForDeepDive) {
        addToast('Please select an idea for Deep Dive from Step 3.', 'error'); return;
    }
    if (step === AppStep.DeepDive && selectedIdeaForDeepDive && !deepDivePersonas) {
      addToast('Deep Dive panel personas not available. Please re-select an idea from Step 3 to initiate Deep Dive.', 'error');
      return;
    }
    setCurrentStep(step);
  };

  return (
    <div className="flex min-h-screen flex-col bg-ground text-ink">
      <Header 
        currentStep={currentStep} 
        stepsConfig={APP_STEPS_CONFIG}
        onNavigate={navigateToStep}
        onNewSession={handleNewSession}
        canNavigateToDeepDive={!!selectedIdeaForDeepDive && !!deepDivePersonas}
      />
      <main className="flex flex-1 flex-col">
        {currentStep === AppStep.DefineProblem && (
          <ProblemDefinitionScreen
            key={problemScreenKey}
            onProblemDefined={handleProblemDefined} 
            initialDescription={designProblem?.description} 
          />
        )}
        {currentStep === AppStep.ConfigurePersona && designProblem && (
          <PersonaConfigurationScreen
            designProblem={designProblem}
            personaDraft={personaDraft}
            onGeneratePersona={handleGeneratePersona}
            onUpdatePersonaDraft={handleUpdatePersonaDraft}
            onLockPersona={handleLockPersona}
            isLoading={isLoading}
          />
        )}
        {currentStep === AppStep.GenerateIdeas && designProblem && personaFinal && (
          <IdeaStudioScreen
            designProblem={designProblem}
            persona={personaFinal}
            ideas={ideas}
            onGenerateIdeas={handleGenerateIdeas}
            onUpdateIdea={handleUpdateIdea}
            onDeleteIdea={handleDeleteIdea}
            isLoading={isLoading}
            onDeepDive={handleInitiateDeepDive} 
          />
        )}
        {currentStep === AppStep.DeepDive && selectedIdeaForDeepDive && designProblem && (
          <DeepDivePanelScreen
            selectedIdea={selectedIdeaForDeepDive}
            designProblem={designProblem}
            originalPersona={personaFinal} 
            personas={deepDivePersonas}
            discussionRounds={deepDiveFocusMode === 'solution' ? discussionRoundsSolution : discussionRoundsProblem}
            activePersona={activeDeepDivePersona}
            onSelectPersona={handleSelectDeepDivePersona}
            onRunDiscussion={handleRunDiscussionRound}
            loadingState={deepDiveLoadingState}
            // Focus mode
            deepDiveFocusMode={deepDiveFocusMode}
            onSetDeepDiveFocusMode={handleSetDeepDiveFocusMode}
            // Summarise & Revise (Solution)
            discussionSummaryPoints={deepDiveFocusMode === 'solution' ? discussionSummaryPointsSolution : discussionSummaryPointsProblem}
            selectedSummaryPointTexts={deepDiveFocusMode === 'solution' ? selectedSummaryPointTextsSolution : selectedSummaryPointTextsProblem}
            revisedIdeaDetails={revisedIdeaDetails} // Solution specific
            subActionSolutionLoadingState={deepDiveSubActionSolutionLoading} // Solution specific
            onSummariseDiscussion={handleSummariseDiscussion}
            onToggleSummaryPoint={handleToggleSummaryPoint}
            onReviseIdea={handleReviseIdea} // Solution specific
            // Revised Idea Translation (Solution)
            revisedIdeaTechnologicalSolutions={revisedIdeaTechnologicalSolutions} // Solution specific
            revisedIdeaTranslating={revisedIdeaTranslating} // Solution specific
            revisedIdeaTranslationError={revisedIdeaTranslationError} // Solution specific
            onTranslateRevisedIdea={handleTranslateRevisedIdea} // Solution specific
            // Revise Problem (Problem)
            revisedProblemDescription={revisedProblemDescription} // Problem specific
            subActionProblemLoadingState={deepDiveSubActionProblemLoading} // Problem specific
            onReviseProblemDescription={handleReviseProblemDescription} // Problem specific
          />
        )}
      </main>
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
