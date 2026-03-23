import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { WizardFlow } from '@/components/wizard/WizardFlow';
import { useWizard } from '@/store/wizard-context';

export default function Home() {
  const { reset } = useWizard();

  // Optionally reset on mount if we want to ensure fresh state, 
  // but if navigating via sidebar "New Analysis" button, the user expects a fresh form.
  // We handle reset in the layout or sidebar button. For safety:
  useEffect(() => {
    // If we land on home via refresh, keep state.
    // If user explicitly clicks "New Analysis", we handle reset there.
  }, []);

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col justify-start pt-4 md:pt-10">
        <WizardFlow />
      </div>
    </AppLayout>
  );
}
