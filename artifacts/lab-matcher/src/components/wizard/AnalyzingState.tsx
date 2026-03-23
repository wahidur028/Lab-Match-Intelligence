import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Search, ShieldCheck, Sparkles } from 'lucide-react';

const steps = [
  { text: "Extracting lab keywords and tech stack...", icon: Search },
  { text: "Auditing profile trust signals...", icon: ShieldCheck },
  { text: "Computing research synergy matrix...", icon: BrainCircuit },
  { text: "Drafting tailored application materials...", icon: Sparkles }
];

export function AnalyzingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const ActiveIcon = steps[currentStep].icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center px-4">
      
      <div className="relative mb-12">
        {/* Pulsing background rings */}
        <motion.div 
          className="absolute inset-0 bg-primary/20 rounded-full"
          animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute inset-0 bg-secondary/30 rounded-full"
          animate={{ scale: [1, 1.8, 2.5], opacity: [0.6, 0.2, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
        />
        
        {/* Center Icon */}
        <div className="relative z-10 bg-gradient-to-br from-primary to-secondary p-6 rounded-full shadow-2xl shadow-primary/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
              transition={{ duration: 0.4 }}
            >
              <ActiveIcon className="w-12 h-12 text-primary-foreground" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 text-foreground">
        AI is analyzing your fit
      </h2>

      <div className="h-8 relative w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-lg text-muted-foreground font-medium absolute inset-0 w-full"
          >
            {steps[currentStep].text}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mt-10 bg-muted rounded-full h-2 overflow-hidden relative">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
