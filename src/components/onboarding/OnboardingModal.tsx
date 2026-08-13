import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen, X, ChevronRight } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

interface OnboardingModalProps {
  onNavigate: (view: string) => void;
}

export default function OnboardingModal({ onNavigate }: OnboardingModalProps) {
  const { showOnboarding, startBasicTutorial, startCompleteTutorial, dismissOnboarding } = useOnboarding();

  return (
    <AnimatePresence>
      {showOnboarding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={dismissOnboarding}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={dismissOnboarding}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] rounded-xl transition-colors z-10"
            >
              <X size={18} />
            </button>

            {/* Header gradient */}
            <div className="relative h-36 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{
                      left: `${(i * 17 + 5) % 100}%`,
                      top: `${(i * 23 + 10) % 100}%`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
              <div className="text-center relative z-10">
                <div className="text-5xl mb-2">👋</div>
                <h1 className="text-2xl font-bold text-white font-heading">Bem-vindo ao Nixx!</h1>
                <p className="text-white/80 text-sm mt-1">Sua plataforma de controle financeiro inteligente</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-[var(--text-muted)] text-sm text-center mb-6">
                Vamos configurar sua vida financeira em poucos passos. Como prefere começar?
              </p>

              <div className="space-y-3">
                {/* Basic Tutorial */}
                <button
                  onClick={() => startBasicTutorial(onNavigate)}
                  className="w-full group flex items-center gap-4 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles size={22} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold font-heading">Começar Tutorial Básico</p>
                    <p className="text-white/75 text-xs mt-0.5">4 etapas essenciais · ~5 minutos</p>
                  </div>
                  <ChevronRight size={20} className="opacity-75 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Complete Tutorial */}
                <button
                  onClick={() => startCompleteTutorial(onNavigate)}
                  className="w-full group flex items-center gap-4 p-4 bg-[var(--surface-2)] hover:bg-[var(--border)] text-[var(--fg)] rounded-2xl transition-all border border-[var(--border)]"
                >
                  <div className="w-12 h-12 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center justify-center shrink-0 text-indigo-500">
                    <BookOpen size={22} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold font-heading">Conhecer todas as funções</p>
                    <p className="text-[var(--text-muted)] text-xs mt-0.5">18 módulos completos · Tutorial avançado</p>
                  </div>
                  <ChevronRight size={20} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Skip */}
                <button
                  onClick={dismissOnboarding}
                  className="w-full py-3 text-sm text-[var(--text-muted)] hover:text-[var(--fg)] transition-colors"
                >
                  Explorar por conta própria
                </button>
              </div>

              {/* Progress indicators */}
              <div className="mt-5 pt-4 border-t border-[var(--border)]">
                <p className="text-[var(--text-muted)] text-xs text-center">
                  Você pode acessar os tutoriais novamente em{' '}
                  <span className="font-semibold text-indigo-500">Ajuda & Tutoriais</span> no menu lateral.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
