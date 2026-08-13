import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, cn } from '../lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

export default function ReportsView() {
  const { transactions, settings, loans, cards } = useFinance();
  const [monthsBack, setMonthsBack] = useState(6);

  const now = new Date();

  // Helper: get month key
  const getMonthKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  const getInvoiceMonth = (dateStr: string, closingDay: number) => {
    const d = new Date(dateStr);
    if (d.getDate() >= closingDay) d.setMonth(d.getMonth() + 1);
    return getMonthKey(d);
  };

  // Last N months data
  const monthlyData = useMemo(() => {
    const data = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mk = getMonthKey(d);
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase();

      const salary = settings?.fixedSalary || 0;
      const extraIncome = transactions
        .filter(t => t.type === 'income' && t.date.startsWith(mk))
        .reduce((s, t) => s + t.amount, 0);
      const income = salary + extraIncome;

      const bankExp = transactions
        .filter(t => t.type === 'expense' && !t.cardId && t.date.startsWith(mk))
        .reduce((s, t) => s + t.amount, 0);
      const cardExp = cards.reduce((s, card) => {
        const inv = transactions
          .filter(t => t.cardId === card.id && getInvoiceMonth(t.date, card.closingDay) === mk)
          .reduce((ss, t) => ss + t.amount, 0);
        return s + inv;
      }, 0);
      const loanExp = loans
        .filter(l => {
          if (l.status !== 'active') return false;
          const start = new Date(l.startDate + 'T12:00:00');
          const end = new Date(l.endDate + 'T12:00:00');
          const mid = new Date(d.getFullYear(), d.getMonth(), 15);
          return mid >= start && mid <= end;
        })
        .reduce((s, l) => s + l.monthlyPayment, 0);
      const expenses = bankExp + cardExp + loanExp;

      data.push({ month: label, Receitas: income, Despesas: expenses, Resultado: income - expenses });
    }
    return data;
  }, [transactions, settings, loans, cards, monthsBack]);

  // Current month spending by category
  const currentMK = getMonthKey(now);
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMK))
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions, currentMK]);

  // Month-over-month comparison
  const prevMK = getMonthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const currExp = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMK))
    .reduce((s, t) => s + t.amount, 0);
  const prevExp = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(prevMK))
    .reduce((s, t) => s + t.amount, 0);
  const expVariation = prevExp > 0 ? ((currExp - prevExp) / prevExp) * 100 : 0;

  const currInc = (settings?.fixedSalary || 0) + transactions
    .filter(t => t.type === 'income' && t.date.startsWith(currentMK))
    .reduce((s, t) => s + t.amount, 0);
  const prevInc = (settings?.fixedSalary || 0) + transactions
    .filter(t => t.type === 'income' && t.date.startsWith(prevMK))
    .reduce((s, t) => s + t.amount, 0);
  const incVariation = prevInc > 0 ? ((currInc - prevInc) / prevInc) * 100 : 0;

  // Category comparison current vs prev month
  const categoryComparison = useMemo(() => {
    const currMap: Record<string, number> = {};
    const prevMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMK)).forEach(t => {
      currMap[t.category] = (currMap[t.category] || 0) + t.amount;
    });
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(prevMK)).forEach(t => {
      prevMap[t.category] = (prevMap[t.category] || 0) + t.amount;
    });
    const allCats = new Set([...Object.keys(currMap), ...Object.keys(prevMap)]);
    return [...allCats]
      .map(cat => ({
        category: cat,
        current: currMap[cat] || 0,
        previous: prevMap[cat] || 0,
        variation: prevMap[cat] ? ((currMap[cat] || 0) - prevMap[cat]) / prevMap[cat] * 100 : 0,
      }))
      .sort((a, b) => b.current - a.current)
      .slice(0, 8);
  }, [transactions, currentMK, prevMK]);

  const currentMonthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const prevMonthLabel = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-[var(--fg)] tracking-tight">Relatórios</h2>
          <p className="text-[var(--text-muted)] mt-1">Analise a evolução dos seus gastos e compare períodos.</p>
        </div>
        {/* Period selector */}
        <div className="flex items-center gap-2 bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)]">
          {[3, 6, 12].map(m => (
            <button
              key={m}
              onClick={() => setMonthsBack(m)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-semibold transition-all',
                monthsBack === m
                  ? 'bg-[var(--fg)] text-[var(--bg)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--fg)]'
              )}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Month vs Month comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Despesas (mês atual)',
            value: currExp, prev: prevExp,
            variation: expVariation,
            color: expVariation > 0 ? 'text-rose-500' : 'text-emerald-500',
            bg: expVariation > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10',
            icon: expVariation > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />,
          },
          {
            label: 'Receitas (mês atual)',
            value: currInc, prev: prevInc,
            variation: incVariation,
            color: incVariation >= 0 ? 'text-emerald-500' : 'text-rose-500',
            bg: incVariation >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
            icon: incVariation >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />,
          },
          {
            label: 'Resultado (mês atual)',
            value: currInc - currExp, prev: prevInc - prevExp,
            variation: 0,
            color: currInc - currExp >= 0 ? 'text-emerald-500' : 'text-rose-500',
            bg: currInc - currExp >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
            icon: null,
          },
          {
            label: 'Maior categoria',
            value: categoryData[0]?.value || 0,
            prev: 0,
            variation: 0,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
            icon: null,
            subtitle: categoryData[0]?.name || '—',
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="fin-card p-5"
          >
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-2">{card.label}</p>
            <p className={cn('text-2xl font-bold font-heading', card.color)}>
              {formatCurrency(card.value)}
            </p>
            {card.variation !== 0 && (
              <div className={cn('flex items-center gap-1 text-xs font-medium mt-1', card.color, card.bg, 'w-fit px-2 py-0.5 rounded-full')}>
                {card.icon}
                {Math.abs(card.variation).toFixed(1)}% vs {prevMonthLabel}
              </div>
            )}
            {card.subtitle && (
              <p className="text-xs text-[var(--text-muted)] mt-1">{card.subtitle}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Evolution chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="fin-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={18} className="text-[var(--text-muted)]" />
          <h3 className="font-bold text-[var(--fg)] font-heading">Evolução — Últimos {monthsBack} meses</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: number) => formatCurrency(v)}
                contentStyle={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} />
              <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Category charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="fin-card p-6">
          <h3 className="font-bold text-[var(--fg)] font-heading mb-4">Gastos por Categoria — {currentMonthLabel}</h3>
          {categoryData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-[var(--text-muted)] text-sm">Sem despesas neste mês.</div>
          )}
        </motion.div>

        {/* Category comparison table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="fin-card p-6">
          <h3 className="font-bold text-[var(--fg)] font-heading mb-4">Comparação por Categoria</h3>
          {categoryComparison.length > 0 ? (
            <div className="space-y-3">
              {categoryComparison.map((cat, i) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--fg)] truncate">{cat.category}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[var(--text-muted)]">{formatCurrency(cat.previous)}</span>
                        <span className="text-sm font-bold text-[var(--fg)]">{formatCurrency(cat.current)}</span>
                        {cat.previous > 0 && (
                          <span className={cn('text-xs font-bold', cat.variation > 0 ? 'text-rose-500' : 'text-emerald-500')}>
                            {cat.variation > 0 ? '+' : ''}{cat.variation.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (cat.current / (categoryComparison[0]?.current || 1)) * 100)}%`,
                          backgroundColor: COLORS[i % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-[var(--text-muted)] text-sm">Sem dados para comparar.</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
