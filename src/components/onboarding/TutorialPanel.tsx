import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, CheckCircle2, Lightbulb } from 'lucide-react';
import { useOnboarding, BASIC_STEPS, COMPLETE_STEPS } from '../../context/OnboardingContext';
import { cn } from '../../lib/utils';

interface TutorialPanelProps {
  onNavigate: (view: string) => void;
}

export default function TutorialPanel({ onNavigate }: TutorialPanelProps) {
  const {
    isTutorialActive, tutorialMode, currentStep, steps,
    goToNext, goToPrev, skipTutorial, markStepComplete,
  } = useOnboarding();

  const [showDoneAnim, setShowDoneAnim] = useState(false);

  if (!isTutorialActive) return null;

  const step = steps[currentStep];
  const totalSteps = steps.length;
  const isLast = currentStep === totalSteps - 1;
  const isFirst = currentStep === 0;
  const progressPct = ((currentStep + 1) / totalSteps) * 100;
  const modeLabel = tutorialMode === 'basic' ? 'Tutorial Básico' : 'Tutorial Completo';

  const handleNext = () => {
    markStepComplete(step.id);
    if (isLast) {
      setShowDoneAnim(true);
      setTimeout(() => {
        setShowDoneAnim(false);
        goToNext(onNavigate);
      }, 1800);
    } else {
      goToNext(onNavigate);
    }
  };

  return (
    <>
      {/* Completion animation overlay */}
      <AnimatePresence>
        {showDoneAnim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-7xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white font-heading mb-2">
                {tutorialMode === 'basic' ? 'Tutorial Básico Concluído!' : 'Tutorial Completo Concluído!'}
              </h2>
              <p className="text-white/70 text-lg">Você está pronto para usar o Nixx!</p>
              <div className="mt-6 flex flex-col gap-2 items-center text-sm text-white/60">
                <span>✓ Salário cadastrado</span>
                <span>✓ Contas configuradas</span>
                <span>✓ Transações registradas</span>
                <span>✓ Empréstimos controlados</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Panel */}
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-[90] lg:bottom-4 lg:left-auto lg:right-4 lg:w-[420px]"
      >
        <div className="bg-[var(--surface)] border-t lg:border border-[var(--border)] lg:rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-[var(--surface-2)]">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  {modeLabel}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  {currentStep + 1} / {totalSteps}
                </span>
              </div>
              <button
                onClick={skipTutorial}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] rounded-lg transition-colors"
                title="Pular tutorial"
              >
                <X size={16} />
              </button>
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl shrink-0">{step.icon}</div>
                  <div>
                    <h3 className="font-bold text-[var(--fg)] font-heading">{step.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Tip box */}
                <div className="flex items-start gap-2 bg-indigo-500/8 border border-indigo-500/20 rounded-xl p-3 mb-4">
                  <Lightbulb size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-300 leading-relaxed">{step.tip}</p>
                </div>

                {/* Step dots */}
                <div className="flex items-center gap-1.5 mb-4 justify-center">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'rounded-full transition-all duration-300',
                        i === currentStep
                          ? 'w-4 h-1.5 bg-indigo-500'
                          : i < currentStep
                            ? 'w-1.5 h-1.5 bg-emerald-500'
                            : 'w-1.5 h-1.5 bg-[var(--border)]'
                      )}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => goToPrev(onNavigate)}
                disabled={isFirst}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  isFirst
                    ? 'opacity-0 pointer-events-none'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]'
                )}
              >
                <ChevronLeft size={16} />
                Voltar
              </button>

              <button
                onClick={() => skipTutorial()}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--fg)] transition-colors px-2"
              >
                Continuar depois
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/25"
              >
                {isLast ? (
                  <>
                    <CheckCircle2 size={16} />
                    Concluir
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
