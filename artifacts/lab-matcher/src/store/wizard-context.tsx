import React, { createContext, useContext, useState, ReactNode } from "react";
import type { StudentProfile, TargetLab, AnalyzeMatchResponse } from "@workspace/api-client-react";

interface WizardContextType {
  step: number;
  studentProfile: StudentProfile | null;
  targetLab: TargetLab | null;
  analysisResult: AnalyzeMatchResponse | null;
  setStep: (step: number) => void;
  setStudentProfile: (profile: StudentProfile) => void;
  setTargetLab: (lab: TargetLab) => void;
  setAnalysisResult: (result: AnalyzeMatchResponse) => void;
  reset: () => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [targetLab, setTargetLab] = useState<TargetLab | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeMatchResponse | null>(null);

  const reset = () => {
    setStep(1);
    setStudentProfile(null);
    setTargetLab(null);
    setAnalysisResult(null);
  };

  return (
    <WizardContext.Provider
      value={{
        step,
        studentProfile,
        targetLab,
        analysisResult,
        setStep,
        setStudentProfile,
        setTargetLab,
        setAnalysisResult,
        reset,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
