import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useWizard } from '@/store/wizard-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UserCircle, FileText, ArrowRight, Github, Linkedin, GraduationCap } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  researchInterests: z.string().min(10, 'Please describe your research interests'),
  resumeText: z.string().min(20, 'Please paste your resume/CV text'),
  gpa: z.coerce.number().min(0).max(4.0).optional().or(z.literal('')),
  publicationCount: z.coerce.number().min(0).optional().or(z.literal('')),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  scholarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  skills: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export function StudentForm() {
  const { studentProfile, setStudentProfile, setStep } = useWizard();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
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
      skills: studentProfile?.skills?.join(', ') || ''
    }
  });

  const onSubmit = (data: FormValues) => {
    setStudentProfile({
      ...data,
      gpa: data.gpa ? Number(data.gpa) : undefined,
      publicationCount: data.publicationCount ? Number(data.publicationCount) : undefined,
      skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : []
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
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <UserCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Your Academic Profile</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Tell us about your background, skills, and research interests so we can evaluate your fit.
        </p>
      </div>

      <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-xl rounded-2xl overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-muted-foreground" /> Basics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {errors.publicationCount && <p className="text-xs text-destructive">{errors.publicationCount.message}</p>}
                </div>
              </div>
            </div>

            {/* Core Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" /> Core Materials
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="researchInterests">Research Interests *</Label>
                  <Textarea 
                    id="researchInterests" 
                    {...register('researchInterests')} 
                    className="min-h-[100px] bg-background/50 resize-y" 
                    placeholder="Describe the specific areas of research you want to pursue (e.g. reinforcement learning for robotics, NLP in healthcare)..."
                  />
                  {errors.researchInterests && <p className="text-xs text-destructive">{errors.researchInterests.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resumeText">Resume / CV Text *</Label>
                  <Textarea 
                    id="resumeText" 
                    {...register('resumeText')} 
                    className="min-h-[200px] bg-background/50 font-mono text-sm resize-y" 
                    placeholder="Paste the plain text of your resume or CV here..."
                  />
                  {errors.resumeText && <p className="text-xs text-destructive">{errors.resumeText.message}</p>}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-muted-foreground" /> Digital Presence (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl" className="flex items-center gap-2"><Linkedin className="w-4 h-4"/> LinkedIn</Label>
                  <Input id="linkedinUrl" {...register('linkedinUrl')} className="bg-background/50" placeholder="https://linkedin.com/in/..." />
                  {errors.linkedinUrl && <p className="text-xs text-destructive">{errors.linkedinUrl.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl" className="flex items-center gap-2"><Github className="w-4 h-4"/> GitHub</Label>
                  <Input id="githubUrl" {...register('githubUrl')} className="bg-background/50" placeholder="https://github.com/..." />
                  {errors.githubUrl && <p className="text-xs text-destructive">{errors.githubUrl.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scholarUrl" className="flex items-center gap-2"><GraduationCap className="w-4 h-4"/> Scholar</Label>
                  <Input id="scholarUrl" {...register('scholarUrl')} className="bg-background/50" placeholder="https://scholar.google.com/..." />
                  {errors.scholarUrl && <p className="text-xs text-destructive">{errors.scholarUrl.message}</p>}
                </div>
              </div>
            </div>

          </CardContent>
          <div className="p-6 md:p-8 bg-muted/30 border-t border-border/50 flex justify-end">
            <Button type="submit" size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
              Continue to Target Lab <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
