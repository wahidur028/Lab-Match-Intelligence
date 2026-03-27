import React, { useCallback, useRef, useState } from 'react';
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
import {
  UserCircle,
  FileText,
  ArrowRight,
  Github,
  Linkedin,
  GraduationCap,
  Upload,
  FileCheck2,
  Loader2,
  AlertCircle,
  ClipboardPaste,
  X,
} from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  researchInterests: z.string().min(10, 'Please describe your research interests'),
  resumeText: z.string().min(20, 'Resume/CV text is required'),
  gpa: z.coerce.number().min(0).max(4.0).optional().or(z.literal('')),
  publicationCount: z.coerce.number().min(0).optional().or(z.literal('')),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  scholarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  skills: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type InputMode = 'upload' | 'paste';

export function StudentForm() {
  const { studentProfile, setStudentProfile, setStep } = useWizard();

  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; chars: number } | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: studentProfile?.name || '',
      researchInterests: studentProfile?.researchInterests || '',
      resumeText: studentProfile?.resumeText || '',
      gpa: studentProfile?.gpa || '',
      publicationCount: studentProfile?.publicationCount || '',
      linkedinUrl: studentProfile?.linkedinUrl || '',
      githubUrl: studentProfile?.githubUrl || '',
      scholarUrl: studentProfile?.scholarUrl || '',
      skills: studentProfile?.skills?.join(', ') || '',
    },
  });

  const resumeText = watch('resumeText');

  const parseFile = useCallback(async (file: File) => {
    setIsParsing(true);
    setParseError(null);
    setUploadedFile(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch('/api/matcher/parse-cv', {
        method: 'POST',
        body: formData,
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Failed to parse file');
      }

      setValue('resumeText', data.text, { shouldValidate: true });
      setUploadedFile({ name: file.name, chars: data.text.length });
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsParsing(false);
    }
  }, [setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearFile = () => {
    setUploadedFile(null);
    setParseError(null);
    setValue('resumeText', '', { shouldValidate: false });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = (data: FormValues) => {
    setStudentProfile({
      ...data,
      gpa: data.gpa ? Number(data.gpa) : undefined,
      publicationCount: data.publicationCount ? Number(data.publicationCount) : undefined,
      skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    });
    setStep(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto w-full"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <UserCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Your Academic Profile</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Tell us about your background, skills, and research interests so we can evaluate your fit.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-5">

          {/* ── Basics ── */}
          <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-xl rounded-2xl">
            <CardContent className="p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-muted-foreground" /> Basics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" {...register('name')} className="bg-background/50" placeholder="Jane Doe" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Technical Skills (comma separated)</Label>
                  <Input id="skills" {...register('skills')} className="bg-background/50" placeholder="Python, PyTorch, C++, React" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA (Optional)</Label>
                  <Input id="gpa" type="number" step="0.01" {...register('gpa')} className="bg-background/50" placeholder="3.8" />
                  {errors.gpa && <p className="text-xs text-destructive">{errors.gpa.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publicationCount">Publications (Optional)</Label>
                  <Input id="publicationCount" type="number" {...register('publicationCount')} className="bg-background/50" placeholder="2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Resume / CV ── */}
          <Card className="border-primary/20 shadow-xl bg-card/80 backdrop-blur-xl rounded-2xl">
            <CardContent className="p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-muted-foreground" /> Resume / CV *
                </h3>
                {/* Mode toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setInputMode('upload')}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${
                      inputMode === 'upload'
                        ? 'bg-background shadow text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('paste')}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${
                      inputMode === 'paste'
                        ? 'bg-background shadow text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" /> Paste Text
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {inputMode === 'upload' ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="space-y-4"
                  >
                    {/* Drop zone — hidden once file is loaded */}
                    {!uploadedFile && !isParsing && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${
                          isDragging
                            ? 'border-primary bg-primary/10 scale-[1.01]'
                            : 'border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        <div className="p-4 bg-primary/10 rounded-full">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-foreground">Drag & drop your CV here</p>
                          <p className="text-sm text-muted-foreground mt-1">or click to browse — PDF, DOC, or DOCX · max 10 MB</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    )}

                    {/* Parsing spinner */}
                    {isParsing && (
                      <div className="flex items-center gap-4 p-6 bg-muted/30 border border-border/50 rounded-2xl">
                        <Loader2 className="w-7 h-7 text-primary animate-spin shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">Extracting text from your CV...</p>
                          <p className="text-sm text-muted-foreground mt-0.5">This usually takes a few seconds</p>
                        </div>
                      </div>
                    )}

                    {/* Success state */}
                    {uploadedFile && !isParsing && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                              <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">{uploadedFile.name}</p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                                {uploadedFile.chars.toLocaleString()} characters extracted
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">Parsed</Badge>
                            <button
                              type="button"
                              onClick={clearFile}
                              className="p-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors text-emerald-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Editable preview */}
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Extracted text (editable)</p>
                          <Textarea
                            value={resumeText}
                            onChange={(e) => setValue('resumeText', e.target.value, { shouldValidate: true })}
                            className="min-h-[200px] bg-background/60 font-mono text-xs leading-relaxed resize-y"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Error state */}
                    {parseError && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl"
                      >
                        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-destructive">Upload failed</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{parseError}</p>
                          <button
                            type="button"
                            onClick={() => { setParseError(null); fileInputRef.current?.click(); }}
                            className="text-xs text-primary underline mt-2 hover:no-underline"
                          >
                            Try again
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* hidden registered field for validation */}
                    <input type="hidden" {...register('resumeText')} />
                    {errors.resumeText && !uploadedFile && (
                      <p className="text-xs text-destructive">{errors.resumeText.message}</p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="paste"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="space-y-2"
                  >
                    <Textarea
                      {...register('resumeText')}
                      className="min-h-[220px] bg-background/50 font-mono text-sm resize-y"
                      placeholder="Paste the full text of your resume or CV here..."
                    />
                    {errors.resumeText && <p className="text-xs text-destructive">{errors.resumeText.message}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* ── Research Interests ── */}
          <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-xl rounded-2xl">
            <CardContent className="p-6 md:p-8 space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-muted-foreground" /> Research Interests *
              </h3>
              <Textarea
                id="researchInterests"
                {...register('researchInterests')}
                className="min-h-[100px] bg-background/50 resize-y"
                placeholder="Describe the specific areas you want to pursue (e.g. reinforcement learning for robotics, NLP in healthcare)..."
              />
              {errors.researchInterests && <p className="text-xs text-destructive">{errors.researchInterests.message}</p>}
            </CardContent>
          </Card>

          {/* ── Links ── */}
          <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-xl rounded-2xl">
            <CardContent className="p-6 md:p-8 space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <Github className="w-5 h-5 text-muted-foreground" /> Digital Presence
                <span className="text-xs font-normal text-muted-foreground ml-1">(optional)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl" className="flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</Label>
                  <Input id="linkedinUrl" {...register('linkedinUrl')} className="bg-background/50" placeholder="https://linkedin.com/in/..." />
                  {errors.linkedinUrl && <p className="text-xs text-destructive">{errors.linkedinUrl.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl" className="flex items-center gap-2"><Github className="w-4 h-4" /> GitHub</Label>
                  <Input id="githubUrl" {...register('githubUrl')} className="bg-background/50" placeholder="https://github.com/..." />
                  {errors.githubUrl && <p className="text-xs text-destructive">{errors.githubUrl.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scholarUrl" className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Scholar</Label>
                  <Input id="scholarUrl" {...register('scholarUrl')} className="bg-background/50" placeholder="https://scholar.google.com/..." />
                  {errors.scholarUrl && <p className="text-xs text-destructive">{errors.scholarUrl.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Footer CTA */}
        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="rounded-xl px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
          >
            Continue to Target Lab <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
