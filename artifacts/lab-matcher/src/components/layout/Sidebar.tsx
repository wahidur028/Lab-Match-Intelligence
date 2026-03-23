import React from 'react';
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { PlusCircle, Search, History, Trash2, GraduationCap, ChevronRight } from "lucide-react";
import { useListSessions, useDeleteSession } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: sessions, isLoading, refetch } = useListSessions();
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession();

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    deleteSession({ id }, {
      onSuccess: () => {
        toast({ title: "Session deleted" });
        refetch();
        if (location === `/sessions/${id}`) {
          setLocation("/");
        }
      },
      onError: () => {
        toast({ title: "Failed to delete session", variant: "destructive" });
      }
    });
  };

  return (
    <div className="w-80 h-full flex flex-col bg-card/90 backdrop-blur-xl border-r border-border shadow-xl z-20 shrink-0">
      <div className="p-6 pb-4 border-b border-border/50">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight text-foreground">Lab Matcher</h1>
              <p className="text-xs text-muted-foreground font-medium">MS/PhD Optimizer</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="p-4">
        <Button 
          onClick={() => setLocation("/")}
          className="w-full justify-start gap-2 shadow-sm font-semibold rounded-xl"
          size="lg"
        >
          <PlusCircle className="w-5 h-5" />
          New Analysis
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="flex items-center gap-2 px-2 pb-3 pt-2 text-sm font-semibold text-muted-foreground tracking-wide uppercase">
          <History className="w-4 h-4" />
          Recent Sessions
        </div>

        {isLoading ? (
          <div className="space-y-3 mt-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : sessions?.length === 0 ? (
          <div className="text-center py-10 px-4 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No saved sessions yet. Run an analysis to see history here.</p>
          </div>
        ) : (
          <div className="space-y-2 mt-1">
            {sessions?.map((session) => {
              const isActive = location === `/sessions/${session.id}`;
              return (
                <Link key={session.id} href={`/sessions/${session.id}`}>
                  <div className={`
                    group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden
                    ${isActive 
                      ? 'bg-primary/5 border-primary/20 shadow-sm' 
                      : 'bg-card border-transparent hover:bg-muted/50 hover:border-border'}
                  `}>
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm truncate pr-6 text-foreground">
                        {session.targetLab.professorName}
                      </p>
                      <span className={`
                        absolute right-3 top-3 text-xs font-bold px-1.5 py-0.5 rounded
                        ${session.matchScore >= 75 ? 'bg-secondary/20 text-secondary' : 
                          session.matchScore >= 50 ? 'bg-accent/20 text-accent-foreground' : 
                          'bg-destructive/20 text-destructive'}
                      `}>
                        {session.matchScore}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {session.targetLab.university}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <p className="text-[10px] text-muted-foreground/80">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                      <button 
                        onClick={(e) => handleDelete(e, session.id)}
                        disabled={isDeleting}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
