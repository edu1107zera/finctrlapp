import React from 'react';
import { LayoutDashboard, Wallet, CreditCard, Calendar, Target, TrendingUp, Sparkles, Settings, User, Search, Landmark, History } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'transactions', label: 'Transações', icon: <Wallet size={20} /> },
    { id: 'accounts', label: 'Contas', icon: <Wallet size={20} /> },
    { id: 'loans', label: 'Empréstimos', icon: <Landmark size={20} /> },
    { id: 'expenses', label: 'Despesas Gerais', icon: <CreditCard size={20} /> },
    { id: 'settings', label: 'Salário Fixo', icon: <TrendingUp size={20} /> },
    { id: 'calendar', label: 'Calendário', icon: <Calendar size={20} /> },
    { id: 'goals', label: 'Metas', icon: <Target size={20} /> },
    { id: 'investments', label: 'Investimentos', icon: <TrendingUp size={20} /> },
    { id: 'ai', label: 'Fin AI', icon: <Sparkles size={20} /> },
    { id: 'history', label: 'Histórico', icon: <History size={20} /> },
  ];

  const bottomNav = [
    { id: 'profile', label: 'Perfil', icon: <User size={20} /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen border-r border-[var(--border)] bg-[var(--surface)] pt-6 pb-4">
      <div className="px-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-[var(--fg)]">Nixx</h1>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold mt-1">Know your money.</p>
        </div>
      </div>
      
      <div className="px-4 mb-2">
        <button 
          onClick={() => document.dispatchEvent(new CustomEvent('open-command-palette'))}
          className="w-full flex items-center justify-between px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-muted)] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search size={16} />
            <span>Busca rápida...</span>
          </div>
          <kbd className="text-[10px] font-sans px-1.5 py-0.5 rounded border border-[var(--border)]">⌘K</kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
        {mainNav.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              currentView === item.id 
                ? "bg-[var(--fg)] text-[var(--bg)] shadow-md"
                : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-3 pt-4 border-t border-[var(--border)] space-y-1">
        {bottomNav.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}