import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Save, CheckCircle, HelpCircle, AlertTriangle, Lightbulb, FileText, Mail, ShieldAlert, Cpu, TrendingUp, ChevronRight, Zap, Clock, BookOpen, Star } from 'lucide-react';
import type { AnalyzeMatchResponse, StudentProfile, TargetLab, Recommendation } from '@workspace/api-client-react';
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

const effortConfig = {
  low: { label: 'Low Effort', icon: Zap, className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  medium: { label: 'Medium Effort', icon: Clock, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  high: { label: 'High Effort', icon: BookOpen, className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
};

const categoryColors: Record<string, string> = {
  Skills: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Publications: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Research Alignment': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'Trust Signals': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  GPA: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  Experience: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  Networking: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
};

function ScoreBar({ current, projected }: { current: number; projected: number }) {
  return (
    <div className="relative h-3 rounded-full bg-muted overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/30"
        style={{ width: `${current}%` }}
      />
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-700"
        style={{ width: `${projected}%` }}
      />
    </div>
  );
}

function RecommendationCard({ rec, index, currentScore }: { rec: Recommendation; index: number; currentScore: number }) {
  const [expanded, setExpanded] = useState(false);
  const effort = effortConfig[rec.effort as keyof typeof effortConfig] ?? effortConfig.medium;
  const EffortIcon = effort.icon;
  const catColor = categoryColors[rec.category] ?? 'bg-gray-100 text-gray-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card
        className="border-border/50 shadow-sm rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Step Number */}
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {index + 1}
            </div>

            <div className="flex-1 min-w-0">
              {/* Header row */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${catColor}`}>
                  {rec.category}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${effort.className}`}>
                  <EffortIcon className="w-3 h-3" />
                  {effort.label}
                </span>
              </div>

              <h4 className="font-semibold text-foreground text-base leading-snug">{rec.title}</h4>

              {/* Score boost */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    +{rec.scoreBoost} pts
                  </span>
                  <span className="text-xs text-muted-foreground">
                    → Score: <span className="font-semibold text-foreground">{rec.projectedScore}</span>
                  </span>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="mt-3">
                <ScoreBar current={currentScore} projected={rec.projectedScore} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Current: {currentScore}</span>
                  <span>After: {rec.projectedScore}</span>
                </div>
              </div>
            </div>

            <ChevronRight
              className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform mt-1 ${expanded ? 'rotate-90' : ''}`}
            />
          </div>

          {/* Expanded details */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 ml-13 pl-1 border-t border-border/40 pt-4 space-y-3"
            >
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">What to do</p>
                <p className="text-sm text-foreground leading-relaxed">{rec.action}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Why it helps</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{rec.impact}</p>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
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

  const recommendations = result.recommendations ?? [];
  const finalProjectedScore = recommendations.length > 0
    ? recommendations[recommendations.length - 1].projectedScore
    : result.matchScore;

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
            {recommendations.length > 0 && (
              <div className="mt-4 w-full p-3 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Potential score: {finalProjectedScore}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">after all recommendations</p>
              </div>
            )}
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

      {/* Recommendations Panel */}
      {recommendations.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-card rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-primary/10 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="flex items-center gap-2 text-xl font-display text-primary">
                  <TrendingUp className="w-5 h-5" /> Score Improvement Roadmap
                </CardTitle>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">Current score:</span>
                  <span className="font-bold text-foreground">{result.matchScore}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Potential:</span>
                  <span className="font-bold text-primary text-base">{finalProjectedScore}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Follow these steps in order to boost your match score. Click any card to see the full action plan.
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {recommendations.map((rec, i) => (
                <RecommendationCard
                  key={i}
                  rec={rec}
                  index={i}
                  currentScore={i === 0 ? result.matchScore : recommendations[i - 1].projectedScore}
                />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

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
                    <ul className="space-y-2">
                      {result.synergy.alignedAreas.map((area, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-foreground">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {result.synergy.gaps.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-2 text-foreground">Identified Gaps</h5>
                      <ul className="space-y-2">
                        {result.synergy.gaps.map((gap, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-destructive shrink-0" />
                            <span className="text-foreground/80">{gap}</span>
                          </li>
                        ))}
                      </ul>
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

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
  );
}
