import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, CheckCircle2, Circle, RotateCcw, HelpCircle } from 'lucide-react';
import { useOnboarding, BASIC_STEPS, COMPLETE_STEPS } from '../../context/OnboardingContext';
import { cn } from '../../lib/utils';

interface HelpCenterProps {
  onNavigate: (view: string) => void;
}

export default function HelpCenter({ onNavigate }: HelpCenterProps) {
  const {
    basicProgress, completeProgress, completedSteps,
    resetTutorial, startBasicTutorial, startCompleteTutorial,
  } = useOnboarding();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold font-heading text-[var(--fg)] tracking-tight">Ajuda & Tutoriais</h2>
        <p className="text-[var(--text-muted)] mt-1">Aprenda a usar o Nixx no seu próprio ritmo. Retome de onde parou a qualquer momento.</p>
      </div>

      {/* Tutorial cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Basic Tutorial Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="fin-card p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
            <Sparkles size={128} />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--fg)] font-heading">Tutorial Básico</h3>
              <p className="text-xs text-[var(--text-muted)]">4 etapas essenciais · ~5 minutos</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1.5">
              <span>Progresso</span>
              <span className="font-bold text-indigo-500">{basicProgress}%</span>
            </div>
            <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${basicProgress}%` }}
              />
            </div>
          </div>

          {/* Steps list */}
          <div className="space-y-2 mb-5">
            {BASIC_STEPS.map((step) => {
              const done = completedSteps.includes(step.id);
              return (
                <div key={step.id} className="flex items-center gap-2.5">
                  {done
                    ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    : <Circle size={16} className="text-[var(--border)] shrink-0" />
                  }
                  <span className={cn('text-sm', done ? 'text-[var(--text-muted)] line-through' : 'text-[var(--fg)]')}>
                    {step.icon} {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => startBasicTutorial(onNavigate)}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {basicProgress === 0 ? 'Começar' : basicProgress === 100 ? 'Rever Tutorial' : 'Continuar'}
            </button>
            {basicProgress > 0 && (
              <button
                onClick={() => resetTutorial('basic', onNavigate)}
                className="p-2.5 text-[var(--text-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] rounded-xl transition-colors border border-[var(--border)]"
                title="Reiniciar tutorial"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Complete Tutorial Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="fin-card p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
            <BookOpen size={128} />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-violet-500/10 text-violet-500 rounded-xl flex items-center justify-center">
              <BookOpen size={22} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--fg)] font-heading">Tutorial Completo</h3>
              <p className="text-xs text-[var(--text-muted)]">18 módulos · Guia avançado</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1.5">
              <span>Progresso</span>
              <span className="font-bold text-violet-500">{completeProgress}%</span>
            </div>
            <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${completeProgress}%` }}
              />
            </div>
          </div>

          {/* Steps list (compact) */}
          <div className="grid grid-cols-2 gap-1.5 mb-5">
            {COMPLETE_STEPS.map((step) => {
              const done = completedSteps.includes(step.id);
              return (
                <div key={step.id} className="flex items-center gap-1.5">
                  {done
                    ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    : <Circle size={13} className="text-[var(--border)] shrink-0" />
                  }
                  <span className={cn('text-xs truncate', done ? 'text-[var(--text-muted)]' : 'text-[var(--fg)]')}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => startCompleteTutorial(onNavigate)}
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {completeProgress === 0 ? 'Começar' : completeProgress === 100 ? 'Rever Tutorial' : 'Continuar'}
            </button>
            {completeProgress > 0 && (
              <button
                onClick={() => resetTutorial('complete', onNavigate)}
                className="p-2.5 text-[var(--text-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] rounded-xl transition-colors border border-[var(--border)]"
                title="Reiniciar tutorial"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* FAQ / Quick tips section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fin-card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <HelpCircle size={18} className="text-[var(--text-muted)]" />
          <h3 className="font-bold text-[var(--fg)] font-heading">Dicas Rápidas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: '💰', title: 'Salário Fixo', desc: 'Configure em Salário Fixo → define sua receita base mensal automaticamente em todo Dashboard.' },
            { icon: '💳', title: 'Parcelamentos', desc: 'Ao lançar despesas, informe o total de parcelas e quantas já pagou — o Nixx distribui os meses automaticamente.' },
            { icon: '📊', title: 'Faturas de Cartão', desc: 'Compras no cartão após o dia de fechamento entram na fatura do próximo mês, como no mundo real.' },
            { icon: '🤖', title: 'IA Financeira', desc: 'Pergunte à FinControl Intelligence sobre seus gastos. Ela usa seus dados reais para responder.' },
            { icon: '🎯', title: 'Metas com Juros', desc: 'Simule metas com taxa de juros anual para ver o impacto dos rendimentos na sua projeção.' },
            { icon: '⌘K', title: 'Atalho de Busca', desc: 'Use Ctrl+K (ou ⌘K) para abrir a paleta de comandos e navegar rapidamente entre qualquer módulo.' },
          ].map((tip) => (
            <div key={tip.title} className="flex items-start gap-3 p-3 bg-[var(--surface-2)] rounded-xl">
              <span className="text-2xl shrink-0">{tip.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[var(--fg)]">{tip.title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
