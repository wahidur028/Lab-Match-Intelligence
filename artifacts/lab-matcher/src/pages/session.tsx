import React, { useEffect } from 'react';
import { useRoute } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { ResultsDashboard } from '@/components/results/ResultsDashboard';
import { useGetSession } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useWizard } from '@/store/wizard-context';

export default function SessionPage() {
  const [, params] = useRoute('/sessions/:id');
  const id = params?.id ? parseInt(params.id) : 0;
  
  const { reset } = useWizard();
  
  // Clear wizard state when viewing a saved session so "New Analysis" starts fresh
  useEffect(() => {
    reset();
  }, [id, reset]);

  const { data: session, isLoading, isError } = useGetSession(id, {
    query: {
      enabled: !!id,
      retry: 1
    }
  });

  return (
    <AppLayout>
      <div className="flex-1 w-full pt-4 md:pt-10 pb-20">
        {isLoading ? (
          <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
            <div className="flex gap-4 mb-10">
              <Skeleton className="h-16 w-64 rounded-xl" />
              <Skeleton className="h-16 w-32 rounded-xl ml-auto" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
            </div>
            <Skeleton className="h-96 rounded-2xl w-full mt-6" />
          </div>
        ) : isError || !session ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="p-4 bg-destructive/10 rounded-full mb-4">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Session Not Found</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              The analysis session you are looking for does not exist or has been deleted.
            </p>
          </div>
        ) : (
          <ResultsDashboard 
            result={session.analysisResult} 
            student={session.studentProfile} 
            lab={session.targetLab} 
            isSavedSession={true}
          />
        )}
      </div>
    </AppLayout>
  );
}
