import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWizard } from '@/store/wizard-context';
import { StudentForm } from './StudentForm';
import { LabForm } from './LabForm';
import { AnalyzingState } from './AnalyzingState';
import { ResultsDashboard } from '../results/ResultsDashboard';
import { useAnalyzeMatch, useCreateSession } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export function WizardFlow() {
  const { step, setStep, studentProfile, targetLab, setTargetLab, analysisResult, setAnalysisResult } = useWizard();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { mutate: analyze, isPending: isAnalyzing } = useAnalyzeMatch();
  const { mutate: createSession, isPending: isSaving } = useCreateSession();

  const handleLabSubmit = (labData: any) => {
    setTargetLab(labData);
    if (!studentProfile) {
      toast({ title: "Error", description: "Student profile is missing", variant: "destructive" });
      setStep(1);
      return;
    }
    
    setStep(3); // Analyzing state
    
    analyze(
      { data: { studentProfile, targetLab: labData } },
      {
        onSuccess: (res) => {
          setAnalysisResult(res);
          setStep(4);
        },
        onError: (err) => {
          toast({ title: "Analysis Failed", description: err.error || "An error occurred during analysis", variant: "destructive" });
          setStep(2); // Go back to fix
        }
      }
    );
  };

  const handleSaveSession = () => {
    if (!studentProfile || !targetLab || !analysisResult) return;
    
    createSession(
      { data: { studentProfile, targetLab, analysisResult } },
      {
        onSuccess: (savedSession) => {
          toast({ title: "Session Saved", description: "Your analysis has been saved to history." });
          setLocation(`/sessions/${savedSession.id}`);
        },
        onError: (err) => {
          toast({ title: "Failed to save", description: err.error || "Could not save session.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="w-full pb-20">
      <AnimatePresence mode="wait">
        {step === 1 && <StudentForm key="step1" />}
        {step === 2 && <LabForm key="step2" onSubmitLab={handleLabSubmit} />}
        {step === 3 && <AnalyzingState key="step3" />}
        {step === 4 && analysisResult && studentProfile && targetLab && (
          <ResultsDashboard 
            key="step4" 
            result={analysisResult} 
            student={studentProfile} 
            lab={targetLab} 
            isSavedSession={false}
            onSave={handleSaveSession}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
