import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizard } from '@/store/wizard-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useScrapeLabInfo } from '@workspace/api-client-react';
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Link as LinkIcon,
  GraduationCap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Star,
  Quote,
  Pencil,
  RefreshCw,
} from 'lucide-react';

const formSchema = z.object({
  professorName: z.string().min(2, 'Professor name is required'),
  university: z.string().min(2, 'University is required'),
  department: z.string().min(2, 'Department is required'),
  researchFocus: z.string().min(10, 'Please describe the lab focus'),
  labWebsite: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  recentPapers: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ScrapedData = {
  professorName?: string;
  university?: string;
  department?: string;
  researchFocus?: string;
  recentPapers?: string;
  activeKeywords?: string[];
  hIndex?: number | null;
  citationCount?: number | null;
  fetchErrors?: string[];
};

export function LabForm({ onSubmitLab }: { onSubmitLab: (data: FormValues) => void }) {
  const { targetLab, setStep } = useWizard();

  const [googleScholarUrl, setGoogleScholarUrl] = useState('');
  const [labWebsiteUrl, setLabWebsiteUrl] = useState(targetLab?.labWebsite || '');
  const [scraped, setScraped] = useState<ScrapedData | null>(null);
  const [showManual, setShowManual] = useState(false);

  const { mutate: scrapeLabInfo, isPending: isScraping } = useScrapeLabInfo();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professorName: targetLab?.professorName || '',
      university: targetLab?.university || '',
      department: targetLab?.department || '',
      researchFocus: targetLab?.researchFocus || '',
      labWebsite: targetLab?.labWebsite || '',
      recentPapers: targetLab?.recentPapers || '',
    },
  });

  const handleFetch = () => {
    if (!googleScholarUrl && !labWebsiteUrl) return;
    scrapeLabInfo(
      { data: { googleScholarUrl: googleScholarUrl || undefined, labWebsiteUrl: labWebsiteUrl || undefined } },
      {
        onSuccess: (data) => {
          setScraped(data as ScrapedData);
          if (data.professorName) setValue('professorName', data.professorName);
          if (data.university) setValue('university', data.university);
          if (data.department) setValue('department', data.department);
          if (data.researchFocus) setValue('researchFocus', data.researchFocus);
          if (data.recentPapers) setValue('recentPapers', data.recentPapers);
          if (labWebsiteUrl) setValue('labWebsite', labWebsiteUrl);
        },
        onError: () => {
          setScraped(null);
          setShowManual(true);
        },
      }
    );
  };

  const hasUrls = googleScholarUrl.trim() || labWebsiteUrl.trim();
  const formValues = watch();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto w-full"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Target Laboratory</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Paste the professor's Google Scholar profile link and lab website — we'll automatically extract their research profile.
        </p>
      </div>

      <div className="space-y-5">

        {/* URL Import Card */}
        <Card className="border-primary/20 bg-primary/5 rounded-2xl shadow-lg">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">1</div>
              <h3 className="text-base font-semibold text-foreground">Import from links</h3>
              <Badge variant="secondary" className="text-xs ml-auto">Recommended</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Google Scholar URL
                </Label>
                <Input
                  value={googleScholarUrl}
                  onChange={(e) => setGoogleScholarUrl(e.target.value)}
                  placeholder="https://scholar.google.com/citations?user=..."
                  className="bg-background/80 text-sm"
                />
                <p className="text-xs text-muted-foreground">Extracts recent papers, h-index, and research keywords</p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <LinkIcon className="w-4 h-4 text-primary" />
                  Lab / Faculty Website URL
                </Label>
                <Input
                  value={labWebsiteUrl}
                  onChange={(e) => setLabWebsiteUrl(e.target.value)}
                  placeholder="https://cs.university.edu/~professor"
                  className="bg-background/80 text-sm"
                />
                <p className="text-xs text-muted-foreground">Extracts research focus and team overview</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={handleFetch}
                disabled={isScraping || !hasUrls}
                className="rounded-xl px-6 shadow-md"
              >
                {isScraping ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching & Analyzing...</>
                ) : scraped ? (
                  <><RefreshCw className="w-4 h-4 mr-2" /> Re-fetch</>
                ) : (
                  <><GraduationCap className="w-4 h-4 mr-2" /> Fetch Lab Info</>
                )}
              </Button>
              <button
                type="button"
                className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                onClick={() => setShowManual((v) => !v)}
              >
                {showManual ? 'Hide manual fields' : 'Fill manually instead'}
              </button>
            </div>

            {isScraping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-background/60 rounded-xl border border-border/50"
              >
                <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Fetching pages...</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Reading the professor's publications and research areas</p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Scraped Preview Card */}
        <AnimatePresence>
          {scraped && !isScraping && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card className="border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl shadow-lg overflow-hidden">
                <CardContent className="p-6 space-y-5">
                  {/* Success header */}
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Lab information extracted successfully</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Review below — fields are pre-filled and editable</p>
                    </div>
                    {(scraped.hIndex || scraped.citationCount) && (
                      <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground shrink-0">
                        {scraped.hIndex && (
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> h-index: <b className="text-foreground">{scraped.hIndex}</b></span>
                        )}
                        {scraped.citationCount && (
                          <span className="flex items-center gap-1"><Quote className="w-3.5 h-3.5 text-blue-500" /> Citations: <b className="text-foreground">{scraped.citationCount.toLocaleString()}</b></span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Research summary preview */}
                  {scraped.researchFocus && (
                    <div className="p-4 bg-background/70 rounded-xl border border-border/50">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Research Focus (AI Summary)</p>
                      <p className="text-sm text-foreground leading-relaxed">{scraped.researchFocus}</p>
                    </div>
                  )}

                  {/* Keywords */}
                  {scraped.activeKeywords && scraped.activeKeywords.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Active Research Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {scraped.activeKeywords.map((kw, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent papers preview */}
                  {scraped.recentPapers && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> Recent Papers
                      </p>
                      <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{scraped.recentPapers}</p>
                    </div>
                  )}

                  {/* Fetch errors (partial) */}
                  {scraped.fetchErrors && scraped.fetchErrors.length > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-700 dark:text-amber-300">
                        <p className="font-semibold mb-0.5">Partial fetch:</p>
                        {scraped.fetchErrors.map((e, i) => <p key={i}>{e}</p>)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual / Editable Fields */}
        <AnimatePresence>
          {(scraped || showManual) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-xl rounded-2xl">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-foreground text-sm font-bold">2</div>
                    <h3 className="text-base font-semibold text-foreground">Review & confirm details</h3>
                    <Pencil className="w-4 h-4 text-muted-foreground ml-1" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="professorName">Professor Name *</Label>
                      <Input id="professorName" {...register('professorName')} className="bg-background/60" placeholder="Dr. Alan Turing" />
                      {errors.professorName && <p className="text-xs text-destructive">{errors.professorName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="university">University *</Label>
                      <Input id="university" {...register('university')} className="bg-background/60" placeholder="Stanford University" />
                      {errors.university && <p className="text-xs text-destructive">{errors.university.message}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="department">Department *</Label>
                      <Input id="department" {...register('department')} className="bg-background/60" placeholder="Computer Science" />
                      {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="researchFocus">Research Focus *</Label>
                    <Textarea
                      id="researchFocus"
                      {...register('researchFocus')}
                      className="min-h-[100px] bg-background/60 resize-y text-sm"
                      placeholder="Describe what the lab works on..."
                    />
                    {errors.researchFocus && <p className="text-xs text-destructive">{errors.researchFocus.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recentPapers" className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Recent Papers
                    </Label>
                    <Textarea
                      id="recentPapers"
                      {...register('recentPapers')}
                      className="min-h-[110px] bg-background/60 text-sm resize-y"
                      placeholder="Paper titles will appear here after fetch, or paste them manually..."
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show prompt if nothing shown yet */}
        {!scraped && !showManual && !isScraping && (
          <p className="text-center text-sm text-muted-foreground pt-2">
            Paste at least one URL above and click <strong>Fetch Lab Info</strong> to continue, or fill manually.
          </p>
        )}
      </div>

      {/* Nav footer */}
      <form onSubmit={handleSubmit(onSubmitLab)}>
        <div className="mt-6 flex justify-between items-center">
          <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-xl">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Profile
          </Button>
          {(scraped || showManual) && (
            <Button
              type="submit"
              size="lg"
              className="rounded-xl px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              Analyze Match <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
