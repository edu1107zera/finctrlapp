import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Target, CreditCard, Wallet, Info } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, cn } from '../lib/utils';

interface Insight {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  value?: string;
}

export default function InsightsView() {
  const { transactions, settings, goals, loans, cards } = useFinance();

  const now = new Date();
  const currentMK = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMK = (() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();

  const insights = useMemo<Insight[]>(() => {
    const list: Insight[] = [];

    const salary = settings?.fixedSalary || 0;

    // Current month expenses
    const currExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMK));
    const prevExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(prevMK));

    const currTotal = currExpenses.reduce((s, t) => s + t.amount, 0);
    const prevTotal = prevExpenses.reduce((s, t) => s + t.amount, 0);

    // Not enough data
    if (transactions.length < 3) {
      return [{
        id: 'no-data',
        icon: <Info size={20} />,
        title: 'Dados insuficientes',
        description: 'Ainda não temos dados suficientes para gerar insights. Continue registrando suas transações e eles aparecerão automaticamente.',
        type: 'neutral',
      }];
    }

    // 1. Biggest spending category this month
    const catMap: Record<string, number> = {};
    currExpenses.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
      list.push({
        id: 'top-category',
        icon: <TrendingUp size={20} />,
        title: 'Maior categoria de gasto',
        description: `Seu maior gasto neste mês é com ${topCat[0]}, representando ${salary > 0 ? Math.round((topCat[1] / salary) * 100) + '% da sua renda' : formatCurrency(topCat[1])}.`,
        type: 'neutral',
        value: formatCurrency(topCat[1]),
      });
    }

    // 2. Month-over-month expense change
    if (prevTotal > 0) {
      const variation = ((currTotal - prevTotal) / prevTotal) * 100;
      if (Math.abs(variation) > 5) {
        list.push({
          id: 'expense-variation',
          icon: variation > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />,
          title: variation > 0 ? 'Gastos aumentaram' : 'Gastos reduziram',
          description: `Você gastou ${Math.abs(variation).toFixed(1)}% ${variation > 0 ? 'a mais' : 'a menos'} do que no mês passado (${formatCurrency(prevTotal)} → ${formatCurrency(currTotal)}).`,
          type: variation > 0 ? 'negative' : 'positive',
          value: `${variation > 0 ? '+' : ''}${variation.toFixed(1)}%`,
        });
      }
    }

    // 3. Fixed expenses as % of income
    if (salary > 0) {
      const loanTotal = loans
        .filter(l => {
          if (l.status !== 'active') return false;
          const start = new Date(l.startDate + 'T12:00:00');
          const end = new Date(l.endDate + 'T12:00:00');
          return now >= start && now <= end;
        })
        .reduce((s, l) => s + l.monthlyPayment, 0);
      const fixedPct = Math.round(((currTotal + loanTotal) / salary) * 100);
      if (fixedPct > 0) {
        list.push({
          id: 'fixed-expenses',
          icon: <Wallet size={20} />,
          title: 'Comprometimento da renda',
          description: `Suas despesas deste mês representam ${fixedPct}% da sua renda mensal. ${fixedPct > 80 ? 'Isso é alto — considere revisar seus gastos.' : fixedPct > 50 ? 'Fique de olho para não ultrapassar 80%.' : 'Você está dentro de um patamar saudável!'}`,
          type: fixedPct > 80 ? 'warning' : fixedPct > 50 ? 'neutral' : 'positive',
          value: `${fixedPct}%`,
        });
      }
    }

    // 4. Category with biggest growth vs prev month
    const prevCatMap: Record<string, number> = {};
    prevExpenses.forEach(t => { prevCatMap[t.category] = (prevCatMap[t.category] || 0) + t.amount; });
    const biggestGrowth = Object.entries(catMap)
      .map(([cat, curr]) => ({ cat, curr, prev: prevCatMap[cat] || 0 }))
      .filter(x => x.prev > 0)
      .sort((a, b) => ((b.curr - b.prev) / b.prev) - ((a.curr - a.prev) / a.prev))[0];
    if (biggestGrowth && biggestGrowth.prev > 0) {
      const pct = ((biggestGrowth.curr - biggestGrowth.prev) / biggestGrowth.prev) * 100;
      if (pct > 15) {
        list.push({
          id: 'category-growth',
          icon: <AlertTriangle size={20} />,
          title: `Aumento em ${biggestGrowth.cat}`,
          description: `Você gastou ${pct.toFixed(1)}% a mais com ${biggestGrowth.cat} este mês (${formatCurrency(biggestGrowth.prev)} → ${formatCurrency(biggestGrowth.curr)}).`,
          type: 'warning',
          value: `+${pct.toFixed(1)}%`,
        });
      }
    }

    // 5. Goals status
    const lateGoals = goals.filter(g => {
      const deadline = new Date(g.deadline);
      return deadline < now && g.currentAmount < g.targetAmount;
    });
    if (lateGoals.length > 0) {
      list.push({
        id: 'late-goals',
        icon: <Target size={20} />,
        title: lateGoals.length === 1 ? 'Meta atrasada' : `${lateGoals.length} metas atrasadas`,
        description: `${lateGoals.map(g => g.name).join(', ')} passou${lateGoals.length > 1 ? 'ram' : ''} do prazo sem atingir o objetivo. Revise as contribuições mensais.`,
        type: 'warning',
      });
    }

    const onTrackGoals = goals.filter(g => {
      const deadline = new Date(g.deadline);
      const monthsLeft = Math.max(0, (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth()));
      const projectedAmount = g.currentAmount + g.monthlyContribution * monthsLeft;
      return projectedAmount >= g.targetAmount && deadline >= now;
    });
    if (onTrackGoals.length > 0) {
      list.push({
        id: 'on-track-goals',
        icon: <Target size={20} />,
        title: onTrackGoals.length === 1 ? '1 meta no ritmo certo' : `${onTrackGoals.length} metas no ritmo`,
        description: `${onTrackGoals.map(g => g.name).join(', ')} est${onTrackGoals.length > 1 ? 'ão' : 'á'} projetada${onTrackGoals.length > 1 ? 's' : ''} para ser concluída${onTrackGoals.length > 1 ? 's' : ''} dentro do prazo. Continue assim!`,
        type: 'positive',
      });
    }

    // 6. Cards usage
    const cardWithHighUsage = cards.find(card => {
      const inv = transactions
        .filter(t => t.cardId === card.id)
        .reduce((s, t) => s + t.amount, 0);
      return card.limitAmount > 0 && (inv / card.limitAmount) > 0.7;
    });
    if (cardWithHighUsage) {
      const used = transactions.filter(t => t.cardId === cardWithHighUsage.id).reduce((s, t) => s + t.amount, 0);
      list.push({
        id: 'card-usage',
        icon: <CreditCard size={20} />,
        title: `Cartão ${cardWithHighUsage.name} com uso elevado`,
        description: `Você utilizou ${Math.round((used / cardWithHighUsage.limitAmount) * 100)}% do limite do ${cardWithHighUsage.name}. Fique atento para não ultrapassar o limite.`,
        type: 'warning',
        value: `${Math.round((used / cardWithHighUsage.limitAmount) * 100)}%`,
      });
    }

    // 7. Pending transactions
    const pending = transactions.filter(t => t.status === 'pending' && t.type === 'expense');
    if (pending.length > 0) {
      const pendingTotal = pending.reduce((s, t) => s + t.amount, 0);
      list.push({
        id: 'pending',
        icon: <AlertTriangle size={20} />,
        title: `${pending.length} despesa${pending.length > 1 ? 's' : ''} pendente${pending.length > 1 ? 's' : ''}`,
        description: `Você tem ${formatCurrency(pendingTotal)} em despesas pendentes de quitação. Acesse "Despesas" para marcar como pagas.`,
        type: 'neutral',
        value: formatCurrency(pendingTotal),
      });
    }

    return list.slice(0, 8); // max 8 insights
  }, [transactions, settings, goals, loans, cards, currentMK, prevMK]);

  const typeConfig = {
    positive: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-500', badge: 'bg-emerald-500/20 text-emerald-500' },
    negative: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: 'text-rose-500', badge: 'bg-rose-500/20 text-rose-500' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-500', badge: 'bg-amber-500/20 text-amber-500' },
    neutral: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: 'text-indigo-500', badge: 'bg-indigo-500/20 text-indigo-500' },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold font-heading text-[var(--fg)] tracking-tight">Insights Financeiros</h2>
        <p className="text-[var(--text-muted)] mt-1">
          Análises automáticas baseadas nos seus dados reais. Atualizadas a cada acesso.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl">
        <Info size={16} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Os insights são gerados com base nos dados que você registrou. Quanto mais transações você lançar, mais precisas serão as análises.
          Quando indicado, os valores são estimativas baseadas no comportamento histórico.
        </p>
      </div>

      {/* Insights grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((insight, idx) => {
          const cfg = typeConfig[insight.type];
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={cn('fin-card p-5 border', cfg.border)}
            >
              <div className="flex items-start gap-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', cfg.bg, cfg.icon)}>
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-[var(--fg)] font-heading text-sm">{insight.title}</h3>
                    {insight.value && (
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', cfg.badge)}>
                        {insight.value}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {insights.length === 0 && (
        <div className="fin-card p-16 flex flex-col items-center justify-center text-center">
          <Lightbulb size={40} className="text-[var(--text-muted)] mb-4" />
          <p className="font-semibold text-[var(--fg)]">Nenhum insight disponível</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Registre mais transações para começar a receber análises personalizadas.
          </p>
        </div>
      )}
    </div>
  );
}
