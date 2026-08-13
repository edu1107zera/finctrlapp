import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet, TrendingUp, ArrowUpRight, ArrowDownRight,
  CreditCard, Banknote, Calendar, ChevronLeft, ChevronRight, Calculator, PieChart as PieChartIcon, Pin, PinOff
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Card } from '../types';

function getInvoiceMonth(dateStr: string, closingDay: number): string {
  const d = new Date(dateStr);
  if (d.getDate() >= closingDay) {
    d.setMonth(d.getMonth() + 1);
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function Dashboard() {
  const { transactions, settings, loans, cards, goals, investments } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNextMonthBudget, setShowNextMonthBudget] = useState(false);
  const [pinnedMonth, setPinnedMonth] = useState<string | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('nixx_pinned_month');
    if (saved) {
      const [y, m] = saved.split('-');
      setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, 1));
      setPinnedMonth(saved);
    }
  }, []);

  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  const handleTogglePin = () => {
    if (pinnedMonth === monthKey) {
      localStorage.removeItem('nixx_pinned_month');
      setPinnedMonth(null);
    } else {
      localStorage.setItem('nixx_pinned_month', monthKey);
      setPinnedMonth(monthKey);
    }
  };
  
  const handlePrevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };
  const handleNextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };
  const handleToday = () => setCurrentDate(new Date());

  // 1. Receitas (Salário fixo + Transações de renda do mês)
  const salary = settings?.fixedSalary || 0;
  const extraIncomeTxs = transactions.filter(t => t.type === 'income' && t.date.startsWith(monthKey));
  const extraIncome = extraIncomeTxs.reduce((s, t) => s + t.amount, 0);
  const totalIncome = salary + extraIncome;

  // 2. Despesas da Conta (Pagas e Pendentes no Mês - que não são de cartão)
  const bankExpenses = transactions.filter(t => 
    t.type === 'expense' && 
    !t.cardId && 
    t.date.startsWith(monthKey)
  );
  
  const bankExpensesPaid = bankExpenses.filter(t => t.status !== 'pending').reduce((s, t) => s + t.amount, 0);
  const bankExpensesPending = bankExpenses.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
  const totalBankExpenses = bankExpensesPaid + bankExpensesPending;

  // 3. Faturas de Cartões do Mês
  const cardInvoices = cards.map(card => {
    const cardTxs = transactions.filter(t => t.cardId === card.id);
    const invoiceTxs = cardTxs.filter(t => getInvoiceMonth(t.date, card.closingDay) === monthKey);
    const total = invoiceTxs.reduce((s, t) => s + t.amount, 0);
    return { ...card, totalInvoice: total };
  });
  const totalCardsInvoice = cardInvoices.reduce((s, c) => s + c.totalInvoice, 0);

  // 4. Empréstimos (parcelas ativas neste mês)
  const activeLoans = loans.filter(l => {
    if (l.status !== 'active') return false;
    const start = new Date(l.startDate + 'T12:00:00');
    const end = new Date(l.endDate + 'T12:00:00');
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15); // meio do mês
    return monthDate >= start && monthDate <= end;
  });
  const totalLoans = activeLoans.reduce((s, l) => s + l.monthlyPayment, 0);

  // 4.5 Metas e Investimentos (Aportes mensais)
  const recurringGoals = goals.filter(g => {
    if (!g.deductMonthly || !g.monthlyContribution) return false;
    const start = new Date(g.startDate + 'T12:00:00');
    const end = new Date(g.deadline + 'T12:00:00');
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
    return monthDate >= start && monthDate <= end;
  });
  const totalRecurringGoals = recurringGoals.reduce((s, g) => s + g.monthlyContribution, 0);

  const recurringInvestments = investments.filter(i => {
    if (!i.deductMonthly || !i.monthlyContribution) return false;
    const start = new Date(i.investmentDate + 'T12:00:00');
    const end = i.endDate ? new Date(i.endDate + 'T12:00:00') : new Date('2099-12-31T12:00:00');
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
    return monthDate >= start && monthDate <= end;
  });
  const totalRecurringInvestments = recurringInvestments.reduce((s, i) => s + i.monthlyContribution, 0);
  const totalSavings = totalRecurringGoals + totalRecurringInvestments;

  // 5. Cálculo Final: Sobra = Receitas - (Despesas Banco + Faturas + Empréstimos + Aportes)
  const totalExpensesAll = totalBankExpenses + totalCardsInvoice + totalLoans + totalSavings;
  const remaining = totalIncome - totalExpensesAll;
  
  const isNegative = remaining < 0;
  const percentUsed = totalIncome > 0 ? (totalExpensesAll / totalIncome) * 100 : 0;

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // 6. Dados para os Gráficos
  const expenseData = [
    { name: 'Contas Fixas / Bancárias', value: totalBankExpenses, color: '#f59e0b' },
    { name: 'Cartões de Crédito', value: totalCardsInvoice, color: '#6366f1' },
    { name: 'Empréstimos', value: totalLoans, color: '#ec4899' },
    { name: 'Aportes / Guardar', value: totalSavings, color: '#10b981' },
  ].filter(d => d.value > 0);

  // 7. Limite Diário (Hoje vs Mês que Vem)
  const now = new Date();
  const isCurrentMonthReal = now.getFullYear() === currentDate.getFullYear() && now.getMonth() === currentDate.getMonth();
  const daysInCurrentViewedMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysLeftCurrent = isCurrentMonthReal ? (daysInCurrentViewedMonth - now.getDate() + 1) : daysInCurrentViewedMonth;
  const currentDailyBudget = Math.max(0, remaining) / (daysLeftCurrent || 1);

  const nextMonthRemaining = useMemo(() => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const mSalary = settings?.fixedSalary || 0;
    const mExtraIncome = transactions.filter(t => t.type === 'income' && t.date.startsWith(mk)).reduce((s, t) => s + t.amount, 0);
    const mTotalIncome = mSalary + mExtraIncome;
    const mBankExp = transactions.filter(t => t.type === 'expense' && !t.cardId && t.date.startsWith(mk)).reduce((s, t) => s + t.amount, 0);
    const mCards = cards.map(card => {
      const cTxs = transactions.filter(t => t.cardId === card.id);
      const invTxs = cTxs.filter(t => getInvoiceMonth(t.date, card.closingDay) === mk);
      return invTxs.reduce((s, t) => s + t.amount, 0);
    }).reduce((s, a) => s + a, 0);
    const mLoans = loans.filter(l => {
      if (l.status !== 'active') return false;
      const start = new Date(l.startDate + 'T12:00:00');
      const end = new Date(l.endDate + 'T12:00:00');
      const monthDate = new Date(d.getFullYear(), d.getMonth(), 15);
      return monthDate >= start && monthDate <= end;
    }).reduce((s, l) => s + l.monthlyPayment, 0);

    const mGoals = goals.filter(g => {
      if (!g.deductMonthly || !g.monthlyContribution) return false;
      const start = new Date(g.startDate + 'T12:00:00');
      const end = new Date(g.deadline + 'T12:00:00');
      const monthDate = new Date(d.getFullYear(), d.getMonth(), 15);
      return monthDate >= start && monthDate <= end;
    }).reduce((s, g) => s + g.monthlyContribution, 0);

    const mInvestments = investments.filter(i => {
      if (!i.deductMonthly || !i.monthlyContribution) return false;
      const start = new Date(i.investmentDate + 'T12:00:00');
      const end = i.endDate ? new Date(i.endDate + 'T12:00:00') : new Date('2099-12-31T12:00:00');
      const monthDate = new Date(d.getFullYear(), d.getMonth(), 15);
      return monthDate >= start && monthDate <= end;
    }).reduce((s, i) => s + i.monthlyContribution, 0);

    return mTotalIncome - (mBankExp + mCards + mLoans + mGoals + mInvestments);
  }, [currentDate, transactions, settings, cards, loans, goals, investments]);

  const daysInNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).getDate();
  const nextMonthDailyBudget = Math.max(0, nextMonthRemaining) / daysInNextMonth;

  const last6Months = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mName = d.toLocaleDateString('pt-BR', { month: 'short' });

      const mSalary = settings?.fixedSalary || 0;
      const mExtraIncome = transactions.filter(t => t.type === 'income' && t.date.startsWith(mk)).reduce((s, t) => s + t.amount, 0);
      const mTotalIncome = mSalary + mExtraIncome;
      const mBankExp = transactions.filter(t => t.type === 'expense' && !t.cardId && t.date.startsWith(mk)).reduce((s, t) => s + t.amount, 0);
      const mCards = cards.map(card => {
        const cTxs = transactions.filter(t => t.cardId === card.id);
        const invTxs = cTxs.filter(t => getInvoiceMonth(t.date, card.closingDay) === mk);
        return invTxs.reduce((s, t) => s + t.amount, 0);
      }).reduce((s, a) => s + a, 0);
      const mLoans = loans.filter(l => {
        if (l.status !== 'active') return false;
        const start = new Date(l.startDate + 'T12:00:00');
        const end = new Date(l.endDate + 'T12:00:00');
        const monthDate = new Date(d.getFullYear(), d.getMonth(), 15);
        return monthDate >= start && monthDate <= end;
      }).reduce((s, l) => s + l.monthlyPayment, 0);

      const mGoals = goals.filter(g => {
        if (!g.deductMonthly || !g.monthlyContribution) return false;
        const start = new Date(g.startDate + 'T12:00:00');
        const end = new Date(g.deadline + 'T12:00:00');
        const monthDate = new Date(d.getFullYear(), d.getMonth(), 15);
        return monthDate >= start && monthDate <= end;
      }).reduce((s, g) => s + g.monthlyContribution, 0);

      const mInvestments = investments.filter(i => {
        if (!i.deductMonthly || !i.monthlyContribution) return false;
        const start = new Date(i.investmentDate + 'T12:00:00');
        const end = i.endDate ? new Date(i.endDate + 'T12:00:00') : new Date('2099-12-31T12:00:00');
        const monthDate = new Date(d.getFullYear(), d.getMonth(), 15);
        return monthDate >= start && monthDate <= end;
      }).reduce((s, i) => s + i.monthlyContribution, 0);

      data.push({
        name: mName.toUpperCase(),
        Receitas: mTotalIncome,
        Despesas: mBankExp + mCards + mLoans + mGoals + mInvestments,
      });
    }
    return data;
  }, [currentDate, transactions, settings, cards, loans, goals, investments]);

  return (
    <div className="space-y-6">
      {/* HEADER: Seleção de Mês */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-[var(--fg)] tracking-tight">Fluxo de Caixa Mensal</h2>
          <p className="text-[var(--text-muted)] mt-1">Veja exatamente quanto entra e quanto sai neste mês.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={handleTogglePin}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-sm h-10",
              pinnedMonth === monthKey 
                ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" 
                : "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--fg)]"
            )}
            title={pinnedMonth === monthKey ? "Desafixar mês" : "Fixar este mês como padrão"}
          >
            {pinnedMonth === monthKey ? <PinOff size={14} /> : <Pin size={14} />}
            {pinnedMonth === monthKey ? "Mês Fixado" : "Fixar Mês"}
          </button>
          
          <div className="flex items-center gap-3 bg-[var(--surface-2)] p-1.5 rounded-full border border-[var(--border)]">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-[var(--surface)] rounded-full transition text-[var(--text-muted)] hover:text-[var(--fg)]"><ChevronLeft size={18} /></button>
            <button onClick={handleToday} className="px-4 py-1.5 font-bold capitalize text-sm text-[var(--fg)] hover:bg-[var(--surface)] rounded-full transition min-w-[140px] text-center" title="Ir para o mês atual">
              {monthName}
            </button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-[var(--surface)] rounded-full transition text-[var(--text-muted)] hover:text-[var(--fg)]"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {/* GRAND TOTAL: SOBRA */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "fin-card p-6 md:p-8 flex flex-col items-center justify-center text-center overflow-hidden relative shadow-lg",
          isNegative ? "border-rose-500/50" : "border-emerald-500/50"
        )}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50"></div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
          <Calculator size={16} /> O que sobra no fim do mês
        </p>
        <h1 className={cn("text-5xl md:text-6xl font-bold font-heading mb-4", isNegative ? "text-rose-500" : "text-emerald-500")}>
          {formatCurrency(remaining)}
        </h1>
        
        <div className="w-full max-w-xl mx-auto">
          <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-2">
            <span>Usado: {percentUsed.toFixed(1)}%</span>
            <span>Total Receitas: {formatCurrency(totalIncome)}</span>
          </div>
          <div className="h-3 w-full bg-[var(--surface-2)] rounded-full overflow-hidden flex">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${Math.min(100, percentUsed)}%` }} transition={{ duration: 1, ease: 'easeOut' }}
              className={cn("h-full", isNegative ? "bg-rose-500" : "bg-indigo-500")}
            />
          </div>
        </div>
      </motion.div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Entradas */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="fin-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--fg)] text-sm">Receitas do Mês</h3>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><TrendingUp size={18} /></div>
          </div>
          <p className="text-2xl font-bold font-heading text-[var(--fg)]">{formatCurrency(totalIncome)}</p>
          <div className="mt-4 space-y-2 text-xs text-[var(--text-muted)]">
            <div className="flex justify-between"><span>Salário Fixo:</span><span className="font-semibold">{formatCurrency(salary)}</span></div>
            {extraIncome > 0 && <div className="flex justify-between"><span>Renda Extra:</span><span className="font-semibold text-emerald-500">+{formatCurrency(extraIncome)}</span></div>}
          </div>
        </motion.div>

        {/* Já Gasto */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="fin-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--fg)] text-sm">Contas (Já pagas)</h3>
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg"><ArrowDownRight size={18} /></div>
          </div>
          <p className="text-2xl font-bold font-heading text-[var(--fg)]">{formatCurrency(bankExpensesPaid)}</p>
          <div className="mt-4 space-y-2 text-xs text-[var(--text-muted)]">
            <p>Gastos efetuados no débito ou PIX neste mês que já foram quitados.</p>
          </div>
        </motion.div>

        {/* A Pagar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="fin-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--fg)] text-sm">A Pagar (Pendentes)</h3>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><Banknote size={18} /></div>
          </div>
          <p className="text-2xl font-bold font-heading text-[var(--fg)]">{formatCurrency(bankExpensesPending + totalLoans + totalSavings)}</p>
          <div className="mt-4 space-y-2 text-xs text-[var(--text-muted)]">
            <div className="flex justify-between"><span>Contas / Boletos:</span><span className="font-semibold">{formatCurrency(bankExpensesPending)}</span></div>
            {totalLoans > 0 && <div className="flex justify-between"><span>Empréstimos:</span><span className="font-semibold">{formatCurrency(totalLoans)}</span></div>}
            {totalSavings > 0 && <div className="flex justify-between"><span>Aportes / Guardar:</span><span className="font-semibold text-emerald-500">{formatCurrency(totalSavings)}</span></div>}
          </div>
        </motion.div>

        {/* Limite Diário */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} 
          className={cn(
            "fin-card p-5 border-b-4 relative overflow-hidden",
            showNextMonthBudget ? "border-indigo-500" : "border-emerald-500"
          )}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Calculator size={64} />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-bold text-[var(--fg)] text-sm">
              {showNextMonthBudget ? "Limite Diário (Mês que vem)" : "Quanto posso gastar hoje?"}
            </h3>
            <button 
              onClick={() => setShowNextMonthBudget(!showNextMonthBudget)}
              className="p-1.5 bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--fg)] rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold shadow-sm border border-[var(--border)]"
            >
              Mudar <ArrowUpRight size={14} />
            </button>
          </div>
          <p className="text-3xl font-bold font-heading text-[var(--fg)] relative z-10">
            {formatCurrency(showNextMonthBudget ? nextMonthDailyBudget : currentDailyBudget)}
          </p>
          <div className="mt-4 text-xs text-[var(--text-muted)] relative z-10">
            {showNextMonthBudget ? (
              <p>Projeção da sobra ({formatCurrency(nextMonthRemaining)}) dividida por {daysInNextMonth} dias.</p>
            ) : (
              <p>Sobra do mês ({formatCurrency(remaining)}) dividida por {daysLeftCurrent} dia{daysLeftCurrent !== 1 ? 's' : ''} restante{daysLeftCurrent !== 1 ? 's' : ''}.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico de Distribuição */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="fin-card p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon size={18} className="text-[var(--text-muted)]" />
            <h3 className="font-bold text-[var(--fg)] text-sm">Distribuição de Gastos</h3>
          </div>
          <div className="h-64">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[var(--text-muted)]">Nenhum gasto neste mês.</div>
            )}
          </div>
        </motion.div>

        {/* Gráfico Histórico */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="fin-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-[var(--text-muted)]" />
            <h3 className="font-bold text-[var(--fg)] text-sm">Evolução (Últimos 6 meses)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6Months} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'var(--surface-2)', opacity: 0.4}} contentStyle={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--fg)' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} />
                <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
