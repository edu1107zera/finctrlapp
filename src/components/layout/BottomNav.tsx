import React from 'react';
import { LayoutDashboard, Wallet, Plus, Target, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onAddTrigger: () => void;
}

export function BottomNav({ currentView, onNavigate, onAddTrigger }: BottomNavProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] px-4 pb-safe pt-2">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate('dashboard')}
          className={cn("flex flex-col items-center p-2 rounded-xl transition-colors", currentView === 'dashboard' ? 'text-[var(--fg)]' : 'text-[var(--text-muted)] hover:text-[var(--fg)]')}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </button>
        
        <button 
          onClick={() => onNavigate('transactions')}
          className={cn("flex flex-col items-center p-2 rounded-xl transition-colors", currentView === 'transactions' ? 'text-[var(--fg)]' : 'text-[var(--text-muted)] hover:text-[var(--fg)]')}
        >
          <Wallet size={24} />
          <span className="text-[10px] mt-1 font-medium">Extrato</span>
        </button>
        
        <div className="relative -top-5">
          <button 
            onClick={onAddTrigger}
            className="w-14 h-14 bg-[var(--fg)] text-[var(--bg)] rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform border-4 border-[var(--bg)]"
          >
            <Plus size={28} />
          </button>
        </div>
        
        <button 
          onClick={() => onNavigate('goals')}
          className={cn("flex flex-col items-center p-2 rounded-xl transition-colors", currentView === 'goals' ? 'text-[var(--fg)]' : 'text-[var(--text-muted)] hover:text-[var(--fg)]')}
        >
          <Target size={24} />
          <span className="text-[10px] mt-1 font-medium">Metas</span>
        </button>
        
        <button 
          onClick={() => onNavigate('ai')}
          className={cn("flex flex-col items-center p-2 rounded-xl transition-colors", currentView === 'ai' ? 'text-[var(--fg)]' : 'text-[var(--text-muted)] hover:text-[var(--fg)]')}
        >
          <Sparkles size={24} />
          <span className="text-[10px] mt-1 font-medium">Fin AI</span>
        </button>
      </div>
    </div>
  );
}
