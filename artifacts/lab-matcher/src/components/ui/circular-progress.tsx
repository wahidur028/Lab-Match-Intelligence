import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CircularProgress({ 
  value, 
  size = 160, 
  strokeWidth = 12,
  className 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  const getColorClass = (val: number) => {
    if (val >= 75) return 'text-secondary'; // Teal
    if (val >= 50) return 'text-accent'; // Amber
    return 'text-destructive'; // Red
  };

  return (
    <div 
      className={cn("relative inline-flex items-center justify-center rounded-full shadow-lg bg-card/50 backdrop-blur-sm p-4", className)} 
    >
      <svg 
        className="transform -rotate-90" 
        width={size} 
        height={size}
      >
        {/* Background Track */}
        <circle
          className="text-muted stroke-current"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Fill */}
        <motion.circle
          className={cn("stroke-current transition-colors duration-500", getColorClass(value))}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-display font-bold text-foreground">
          {value}
        </span>
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Score
        </span>
      </div>
    </div>
  );
}
