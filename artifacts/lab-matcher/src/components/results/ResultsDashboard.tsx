import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Save, CheckCircle, HelpCircle, AlertTriangle, Lightbulb, FileText, Mail, ShieldAlert, Cpu } from 'lucide-react';
import type { AnalyzeMatchResponse, StudentProfile, TargetLab } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CircularProgress } from '@/components/ui/circular-progress';

interface ResultsDashboardProps {
  result: AnalyzeMatchResponse;
  student: StudentProfile;
  lab: TargetLab;
  isSavedSession?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
}

export function ResultsDashboard({ result, student, lab, isSavedSession, onSave, isSaving }: ResultsDashboardProps) {
  const { toast } = useToast();
  const [emailText, setEmailText] = useState(result.emailDraft);

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `Copied ${description} to clipboard` });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="w-full max-w-6xl mx-auto space-y-8"
    >
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-border/60">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Analysis Result</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            <span className="font-semibold text-foreground">{student.name}</span> × <span className="font-semibold text-foreground">{lab.professorName}'s Lab</span>
          </p>
        </div>
        {!isSavedSession && onSave && (
          <Button 
            onClick={onSave} 
            disabled={isSaving}
            className="rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all px-6"
            size="lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? "Saving..." : "Save Session"}
          </Button>
        )}
      </div>

      {/* Top Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-border/50 shadow-xl bg-card/60 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-8 text-center">
            <CircularProgress value={result.matchScore} size={180} strokeWidth={14} />
            <div className="mt-6">
              <h3 className="font-bold text-xl text-foreground mb-1">
                {result.matchScore >= 75 ? 'Excellent Fit' : result.matchScore >= 50 ? 'Moderate Fit' : 'Challenging Fit'}
              </h3>
              <p className="text-sm text-muted-foreground">Based on research synergy and background</p>
            </div>
          </Card>
        </motion.div>

        {/* Lab Intelligence Summary */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full border-border/50 shadow-xl bg-card/60 backdrop-blur-md rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl font-display">
                <Cpu className="w-5 h-5 text-primary" /> Lab Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Research Trajectory</h4>
                <p className="text-foreground leading-relaxed">{result.labIntelligence.researchTrajectory}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Inferred Open Problems</h4>
                <ul className="space-y-2">
                  {result.labIntelligence.openProblems.map((problem, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span className="text-foreground">{problem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl mb-6">
            <TabsTrigger value="analysis" className="rounded-lg py-2.5 font-semibold text-base">Match Details</TabsTrigger>
            <TabsTrigger value="materials" className="rounded-lg py-2.5 font-semibold text-base">Application Package</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Synergy */}
              <Card className="border-border/50 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Research Synergy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <h5 className="text-sm font-medium mb-2 text-foreground">Aligned Areas</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.synergy.alignedAreas.map((area, i) => (
                        <Badge key={i} variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200">{area}</Badge>
                      ))}
                    </div>
                  </div>
                  {result.synergy.gaps.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2 text-foreground">Identified Gaps</h5>
                      <div className="flex flex-wrap gap-2">
                        {result.synergy.gaps.map((gap, i) => (
                          <Badge key={i} variant="outline" className="text-destructive border-destructive/30 bg-destructive/5">{gap}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Tech Match</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {result.synergy.techStackMatch.map((tech, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">{tech}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Missing Tech</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {result.synergy.missingTechStack.map((tech, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md">{tech}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Audit */}
              <Card className="border-border/50 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-primary" /> Profile Trust Audit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl mb-4">
                    <span className="text-sm font-semibold">Overall Verifiability:</span>
                    <Badge className={
                      result.trustAudit.overallTrust === 'high' ? 'bg-green-500 hover:bg-green-600' :
                      result.trustAudit.overallTrust === 'medium' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'
                    }>
                      {result.trustAudit.overallTrust.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {result.trustAudit.flags.map((flag, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/20 transition-colors">
                        {flag.status === 'verified' ? <CheckCircle className="text-green-500 w-5 h-5 shrink-0 mt-0.5" /> :
                         flag.status === 'unverified' ? <HelpCircle className="text-amber-500 w-5 h-5 shrink-0 mt-0.5" /> :
                         <AlertTriangle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-medium text-sm text-foreground">{flag.claim}</p>
                          <p className="text-xs text-muted-foreground mt-1">{flag.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6 focus-visible:outline-none">
            
            {/* Email Draft */}
            <Card className="border-border/50 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="w-5 h-5 text-primary" /> First Contact Email Draft
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(emailText, "email draft")} className="h-8">
                  <Copy className="w-4 h-4 mr-2" /> Copy
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Textarea 
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  className="min-h-[300px] border-0 rounded-none focus-visible:ring-0 resize-y p-6 font-sans text-sm leading-relaxed"
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resume Bullets */}
              <Card className="border-border/50 shadow-lg rounded-2xl flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-primary" /> Tailored Resume Bullets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4 flex-1">
                  {result.tailoredResumeBullets.map((bullet, i) => (
                    <div key={i} className="group relative p-4 rounded-xl bg-muted/30 border border-border/50 pr-12">
                      <p className="text-sm text-foreground">{bullet}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={() => copyToClipboard(bullet, "resume bullet")}
                      >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Strategic Advice */}
              <Card className="border-border/50 shadow-lg rounded-2xl bg-primary/5 border-primary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-primary">
                    <Sparkles className="w-5 h-5" /> Strategic Advice
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {result.strategicAdvice}
                  </p>
                </CardContent>
              </Card>
            </div>

          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

function Sparkles(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
  );
}
