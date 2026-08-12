/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { CommandPalette } from './components/layout/CommandPalette';
import { ThemeSwitcher } from './components/layout/ThemeSwitcher';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Goals from './components/Goals';
import AIAdvisor from './components/AIAdvisor';
import Accounts from './components/Accounts';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import LoansView from './components/LoansView';
import HistoryView from './components/HistoryView';
import ExpensesView from './components/ExpensesView';
import CardsView from './components/CardsView';
import ProfileView from './components/ProfileView';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import RubikParticles from './components/RubikParticles';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsCommandPaletteOpen(true);
    document.addEventListener('open-command-palette', handleOpen);
    return () => document.removeEventListener('open-command-palette', handleOpen);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions />;
      case 'accounts': return <Accounts />;
      case 'goals': return <Goals />;
      case 'ai': return <AIAdvisor />;
      case 'calendar': return <CalendarView />;
      case 'settings': return <SettingsView />;
      case 'loans': return <LoansView />;
      case 'cards': return <CardsView />;
      case 'history': return <HistoryView />;
      case 'expenses': return <ExpensesView />;
      case 'profile': return <ProfileView />;
      default: return (
        <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
          <div className="text-center">
            <p className="text-xl mb-2 font-heading">Em breve</p>
            <p className="text-sm">O módulo "{activeTab}" está em desenvolvimento.</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--fg)] font-sans selection:bg-indigo-500/30 overflow-hidden transition-colors duration-300">
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(view) => { setActiveTab(view); }}
      />

      <Sidebar 
        currentView={activeTab} 
        onNavigate={setActiveTab} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Desktop header */}
        <header className="hidden lg:flex items-center justify-end gap-3 px-6 py-3 bg-[var(--surface)]/60 backdrop-blur-xl border-b border-[var(--border)] z-30">
          <ThemeSwitcher />
        </header>

        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)] z-30">
          <h1 className="text-xl font-bold font-heading tracking-tight text-[var(--fg)]">Nixx</h1>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <button onClick={() => setIsCommandPaletteOpen(true)} className="p-2 bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--fg)] rounded-xl border border-[var(--border)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--fg)] rounded-xl border border-[var(--border)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 lg:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <BottomNav
        currentView={activeTab}
        onNavigate={setActiveTab}
        onAddTrigger={() => document.dispatchEvent(new CustomEvent('open-command-palette'))}
      />
    </div>
  );
}

function AppRoot() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (user && !loading) {
      window.dispatchEvent(new Event('nixx:expand'));
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-[var(--bg)]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-[#131315] overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <RubikParticles sizePercent={110} color="#6366f1" />
      </div>
      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div key="login" className="w-full h-full" exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.5 }}>
              <LoginScreen />
            </motion.div>
          ) : (
            <motion.div key="app" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.1 }}>
              <ThemeProvider>
                <FinanceProvider>
                  <AppContent />
                </FinanceProvider>
              </ThemeProvider>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  );
}
