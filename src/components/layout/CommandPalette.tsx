import React, { useEffect, useState } from 'react';
import { Search, ArrowRight, Wallet, Target, CreditCard, Sparkles, LogOut, Settings, Calendar, LineChart, PieChart, BarChart3, Lightbulb, HelpCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen ? onClose() : document.dispatchEvent(new CustomEvent('open-command-palette'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const items = [
    { id: 'dashboard', icon: <LineChart size={18} />, label: 'Dashboard', section: 'Navegação' },
    { id: 'transactions', icon: <Wallet size={18} />, label: 'Transações', section: 'Navegação' },
    { id: 'accounts', icon: <Wallet size={18} />, label: 'Contas', section: 'Navegação' },
    { id: 'cards', icon: <CreditCard size={18} />, label: 'Cartões', section: 'Navegação' },
    { id: 'loans', icon: <TrendingUp size={18} />, label: 'Empréstimos', section: 'Navegação' },
    { id: 'expenses', icon: <CreditCard size={18} />, label: 'Despesas', section: 'Navegação' },
    { id: 'goals', icon: <Target size={18} />, label: 'Metas', section: 'Navegação' },
    { id: 'budget', icon: <PieChart size={18} />, label: 'Orçamento', section: 'Navegação' },
    { id: 'reports', icon: <BarChart3 size={18} />, label: 'Relatórios', section: 'Navegação' },
    { id: 'insights', icon: <Lightbulb size={18} />, label: 'Insights', section: 'Navegação' },
    { id: 'investments', icon: <TrendingUp size={18} />, label: 'Investimentos', section: 'Navegação' },
    { id: 'calendar', icon: <Calendar size={18} />, label: 'Calendário', section: 'Navegação' },
    { id: 'history', icon: <Settings size={18} />, label: 'Histórico', section: 'Navegação' },
    { id: 'ai', icon: <Sparkles size={18} />, label: 'Perguntar para Fin AI', section: 'Ações' },
    { id: 'settings', icon: <Settings size={18} />, label: 'Configurações', section: 'Ações' },
    { id: 'help', icon: <HelpCircle size={18} />, label: 'Ajuda & Tutoriais', section: 'Ações' },
  ];

  const filteredItems = query
    ? items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[20vh] px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-[var(--surface)] dark:border dark:border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          <div className="flex items-center px-4 py-3 border-b border-zinc-200 dark:border-[var(--border)]">
            <Search className="text-[var(--text-muted)] w-5 h-5 mr-3" />
            <input
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-[var(--fg)] placeholder:text-[var(--text-muted)] text-lg"
              placeholder="O que você quer fazer?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="hidden sm:flex items-center gap-1">
              <kbd className="px-2 py-1 bg-[var(--surface-2)] text-[var(--text-muted)] rounded text-xs border border-[var(--border)] font-sans">ESC</kbd>
            </div>
          </div>

          <div className="overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-muted)]">
                Nenhum resultado encontrado para "{query}"
              </div>
            ) : (
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className="w-full flex items-center px-4 py-3 hover:bg-zinc-100 dark:hover:bg-[var(--surface-2)] rounded-xl transition-colors group text-left"
                  >
                    <div className="text-[var(--text-muted)] group-hover:text-indigo-500 transition-colors mr-3">
                      {item.icon}
                    </div>
                    <span className="flex-1 text-[var(--fg)] font-medium">
                      {item.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-zinc-200 dark:border-[var(--border)] bg-zinc-50 dark:bg-[var(--surface-2)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span>Navegação rápida</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border border-[var(--border)] font-sans">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border border-[var(--border)] font-sans">↓</kbd>
              <span>Navegar</span>
              <kbd className="ml-2 px-1.5 py-0.5 bg-[var(--surface)] rounded border border-[var(--border)] font-sans">↵</kbd>
              <span>Selecionar</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
