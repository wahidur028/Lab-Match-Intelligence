import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useWizard } from '@/store/wizard-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Building2, Microscope, ArrowRight, ArrowLeft, Link as LinkIcon, BookOpen } from 'lucide-react';

const formSchema = z.object({
  professorName: z.string().min(2, 'Professor name is required'),
  university: z.string().min(2, 'University is required'),
  department: z.string().min(2, 'Department is required'),
  researchFocus: z.string().min(10, 'Please describe the lab focus'),
  labWebsite: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  recentPapers: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export function LabForm({ onSubmitLab }: { onSubmitLab: (data: FormValues) => void }) {
  const { targetLab, setStep } = useWizard();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professorName: targetLab?.professorName || '',
      university: targetLab?.university || '',
      department: targetLab?.department || '',
      researchFocus: targetLab?.researchFocus || '',
      labWebsite: targetLab?.labWebsite || '',
      recentPapers: targetLab?.recentPapers || ''
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto w-full"
    >
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-secondary/10 rounded-full mb-4">
          <Building2 className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Target Laboratory</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Who are you applying to work with? We'll analyze their recent work to find the perfect synergy.
        </p>
      </div>

      <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-xl rounded-2xl overflow-hidden">
        <form onSubmit={handleSubmit(onSubmitLab)}>
          <CardContent className="p-6 md:p-8 space-y-8">
            
            {/* Core Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <UserIcon /> Principal Investigator
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="professorName">Professor Name *</Label>
                  <Input id="professorName" {...register('professorName')} className="bg-background/50" placeholder="Dr. Alan Turing" />
                  {errors.professorName && <p className="text-xs text-destructive">{errors.professorName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labWebsite" className="flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Lab Website (Optional)</Label>
                  <Input id="labWebsite" {...register('labWebsite')} className="bg-background/50" placeholder="https://..." />
                  {errors.labWebsite && <p className="text-xs text-destructive">{errors.labWebsite.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">University *</Label>
                  <Input id="university" {...register('university')} className="bg-background/50" placeholder="Stanford University" />
                  {errors.university && <p className="text-xs text-destructive">{errors.university.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input id="department" {...register('department')} className="bg-background/50" placeholder="Computer Science" />
                  {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
                </div>
              </div>
            </div>

            {/* Research Context */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <Microscope className="w-5 h-5 text-muted-foreground" /> Lab Intelligence
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="researchFocus">Lab Research Focus *</Label>
                  <Textarea 
                    id="researchFocus" 
                    {...register('researchFocus')} 
                    className="min-h-[100px] bg-background/50 resize-y" 
                    placeholder="Describe what the lab generally works on. What are their main themes?"
                  />
                  {errors.researchFocus && <p className="text-xs text-destructive">{errors.researchFocus.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recentPapers" className="flex items-center gap-2"><BookOpen className="w-4 h-4"/> Recent Papers (Optional but recommended)</Label>
                  <Textarea 
                    id="recentPapers" 
                    {...register('recentPapers')} 
                    className="min-h-[120px] bg-background/50 text-sm resize-y" 
                    placeholder="Paste titles or abstracts of 2-3 recent papers from the lab..."
                  />
                  {errors.recentPapers && <p className="text-xs text-destructive">{errors.recentPapers.message}</p>}
                </div>
              </div>
            </div>

          </CardContent>
          <div className="p-6 md:p-8 bg-muted/30 border-t border-border/50 flex justify-between items-center">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-xl">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Profile
            </Button>
            <Button type="submit" size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
              Analyze Match <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  );
}
