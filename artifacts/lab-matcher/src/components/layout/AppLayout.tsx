import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative selection:bg-primary/20">
      {/* Background decoration */}
      <img 
        src={`${import.meta.env.BASE_URL}images/academic-bg.png`} 
        alt="" 
        className="absolute inset-0 z-0 w-full h-full object-cover opacity-[0.03] dark:opacity-10 pointer-events-none" 
      />
      
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar wrapper */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 h-full overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
          <h1 className="font-display font-bold text-lg text-primary">Lab Matcher</h1>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto w-full">
          <div className="container mx-auto max-w-6xl p-4 sm:p-6 md:p-8 lg:p-12 min-h-full flex flex-col">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
