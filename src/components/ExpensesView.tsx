import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet, Landmark, Tag, CheckCircle2, Clock, AlertTriangle,
  ArrowDownRight, ChevronDown, Layers, TrendingDown, BarChart3
} from 'lucide-react';

function getMonthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(key: string) {
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export default function ExpensesView() {
  const { transactions, loans, updateTransaction, bulkPayPending, settings, accounts } = useFinance();
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [bulkAmount, setBulkAmount] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const salaryDay = settings?.salaryDay ?? 5;

  // All expense transactions (paid + pending)
  const allExpenses = transactions.filter(t => t.type === 'expense');

  // Current month key
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Group expenses by month
  const byMonth = useMemo(() => {
    const map: Record<string, typeof allExpenses> = {};
    allExpenses.forEach(t => {
      const key = getMonthKey(t.date);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    // Sort descending
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [allExpenses]);

  // Active loan installments this month
  const activeLoans = loans.filter(l => {
    if (l.status !== 'active') return false;
    const start = new Date(l.startDate + 'T12:00:00');
    const end = new Date(l.endDate + 'T12:00:00');
    return now >= start && now <= end;
  });
  const loansTotalMonth = activeLoans.reduce((s, l) => s + l.monthlyPayment, 0);

  // Pending expenses total
  const pendingExpenses = transactions.filter(t => t.status === 'pending' && t.type === 'expense');
  const pendingTotal = pendingExpenses.reduce((s, t) => s + t.amount, 0);
  const grandTotal = pendingTotal + loansTotalMonth;

  // Category breakdown for current month
  const categoryBreakdown = useMemo(() => {
    const txs = byMonth.find(([k]) => k === currentMonthKey)?.[1] ?? [];
    const map: Record<string, number> = {};
    txs.forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [byMonth, currentMonthKey]);

  // Bank breakdown — combine from accounts and loans
  const bankBreakdown = useMemo(() => {
    const map: Record<string, { paid: number; pending: number; color?: string }> = {};

    // Transactions
    const currentTxs = byMonth.find(([k]) => k === currentMonthKey)?.[1] ?? [];
    currentTxs.forEach(t => {
      const acc = accounts.find(a => a.id === t.accountId);
      const name = acc?.name ?? 'Desconhecido';
      if (!map[name]) map[name] = { paid: 0, pending: 0, color: acc?.color };
      if (t.status === 'pending') map[name].pending += t.amount;
      else map[name].paid += t.amount;
    });

    // Loan installments
    activeLoans.forEach(l => {
      if (!map[l.bank]) map[l.bank] = { paid: 0, pending: 0 };
      map[l.bank].pending += l.monthlyPayment;
    });

    return Object.entries(map).sort((a, b) => (b[1].paid + b[1].pending) - (a[1].paid + a[1].pending));
  }, [byMonth, currentMonthKey, accounts, activeLoans]);

  const handleBulkPay = async () => {
    setIsPaying(true);
    const amount = parseFloat(bulkAmount) || grandTotal;
    await bulkPayPending(amount);
    setBulkAmount('');
    setShowBulkConfirm(false);
    setIsPaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold font-heading text-[var(--fg)] tracking-tight">Despesas Gerais</h2>
        <p className="text-[var(--text-muted)] mt-1">Visão completa de todas as suas despesas — por mês, banco e categoria.</p>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pendente este mês', value: formatCurrency(pendingTotal), icon: <Clock size={18} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Parcelas de Empréstimos', value: formatCurrency(loansTotalMonth), icon: <Landmark size={18} />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Total a Pagar', value: formatCurrency(grandTotal), icon: <Layers size={18} />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Total gasto (mês atual)', value: formatCurrency((byMonth.find(([k]) => k === currentMonthKey)?.[1] ?? []).filter(t => t.status !== 'pending').reduce((s, t) => s + t.amount, 0)), icon: <TrendingDown size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="fin-card p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-lg", card.bg, card.color)}>{card.icon}</div>
              <span className="text-xs text-[var(--text-muted)] font-medium">{card.label}</span>
            </div>
            <p className="text-xl font-bold font-heading text-[var(--fg)]">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* PAGAR TUDO */}
      {grandTotal > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="fin-card p-5 border-l-4 border-rose-500"
          style={{ boxShadow: '0 0 20px rgba(239,68,68,0.1)' }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-[var(--fg)] font-heading text-lg flex items-center gap-2">
                <Layers size={20} className="text-rose-500" /> Pagar Todas as Despesas
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                {pendingExpenses.length} conta(s) pendente(s)
                {activeLoans.length > 0 && ` + ${activeLoans.length} parcela(s) de empréstimo`}
                {' '}· Valor total: <strong className="text-[var(--fg)]">{formatCurrency(grandTotal)}</strong>
              </p>
            </div>
            <button
              onClick={() => setShowBulkConfirm(!showBulkConfirm)}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition text-sm whitespace-nowrap"
            >
              <CheckCircle2 size={16} /> Pagar Tudo
            </button>
          </div>

          {/* Loan status per bank */}
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex flex-wrap gap-2">
            {activeLoans.map(l => (
              <span key={l.id} className="flex items-center gap-1.5 text-xs bg-rose-500/10 text-rose-500 px-2.5 py-1 rounded-full font-medium">
                🔴 {l.bank} — {formatCurrency(l.monthlyPayment)} não pago
              </span>
            ))}
            {pendingExpenses.slice(0, 4).map(t => {
              const acc = accounts.find(a => a.id === t.accountId);
              return (
                <span key={t.id} className="flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full font-medium">
                  ⏳ {t.description} — {formatCurrency(t.amount)}
                </span>
              );
            })}
          </div>

          <AnimatePresence>
            {showBulkConfirm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-[var(--border)] overflow-hidden"
              >
                <p className="text-sm text-[var(--text-muted)] mb-3">
                  Valor sugerido: <strong className="text-[var(--fg)]">{formatCurrency(grandTotal)}</strong>.
                  Edite se pagou um valor diferente (o sistema registra a diferença):
                </p>
                <div className="flex gap-3 flex-wrap">
                  <input type="number" step="0.01" placeholder={grandTotal.toFixed(2)}
                    value={bulkAmount} onChange={e => setBulkAmount(e.target.value)}
                    className="input-style flex-1 min-w-32"
                  />
                  <button onClick={() => setShowBulkConfirm(false)} className="px-4 py-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)] rounded-xl transition">Cancelar</button>
                  <button onClick={handleBulkPay} disabled={isPaying}
                    className="px-5 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition font-semibold disabled:opacity-50"
                  >
                    {isPaying ? 'Processando...' : '✓ Confirmar Pagamento'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* CURRENT MONTH BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Category */}
        <div className="fin-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={18} className="text-[var(--text-muted)]" />
            <h3 className="font-bold font-heading text-[var(--fg)]">Por Categoria (mês atual)</h3>
          </div>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Sem despesas no mês atual.</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map(([cat, total], i) => {
                const max = categoryBreakdown[0][1];
                const pct = (total / max) * 100;
                const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#f97316'];
                const color = COLORS[i % COLORS.length];
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-[var(--fg)]">{cat}</span>
                      <span className="font-bold" style={{ color }}>{formatCurrency(total)}</span>
                    </div>
                    <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* By Bank/Account */}
        <div className="fin-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Landmark size={18} className="text-[var(--text-muted)]" />
            <h3 className="font-bold font-heading text-[var(--fg)]">Por Banco / Conta (mês atual)</h3>
          </div>
          {bankBreakdown.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Sem dados disponíveis.</p>
          ) : (
            <div className="space-y-3">
              {bankBreakdown.map(([bank, data]) => (
                <div key={bank} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: data.color ?? '#6366f1' }} />
                    <span className="text-sm font-medium text-[var(--fg)]">{bank}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {data.paid > 0 && (
                      <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-semibold">
                        ✓ {formatCurrency(data.paid)}
                      </span>
                    )}
                    {data.pending > 0 && (
                      <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-semibold">
                        ⏳ {formatCurrency(data.pending)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MONTHLY HISTORY */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={18} className="text-[var(--text-muted)]" />
          <h3 className="font-bold font-heading text-[var(--fg)]">Histórico por Mês</h3>
        </div>
        <div className="space-y-3">
          {byMonth.map(([monthKey, txs]) => {
            const isOpen = expandedMonth === monthKey;
            const totalMonth = txs.reduce((s, t) => s + t.amount, 0);
            const paidMonth = txs.filter(t => t.status !== 'pending').reduce((s, t) => s + t.amount, 0);
            const pendingMonth = txs.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
            const isCurrent = monthKey === currentMonthKey;

            return (
              <motion.div key={monthKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fin-card overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition"
                  onClick={() => setExpandedMonth(isOpen ? null : monthKey)}
                >
                  <div className="flex items-center gap-3">
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full">Atual</span>
                    )}
                    <span className="font-semibold text-[var(--fg)] capitalize">{formatMonthLabel(monthKey)}</span>
                    <span className="text-xs text-[var(--text-muted)]">{txs.length} transação(ões)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-[var(--text-muted)]">Total</p>
                      <p className="font-bold font-heading text-[var(--fg)]">{formatCurrency(totalMonth)}</p>
                    </div>
                    {pendingMonth > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <AlertTriangle size={10} /> {formatCurrency(pendingMonth)} pendente
                      </span>
                    )}
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={18} className="text-[var(--text-muted)]" />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-[var(--border)]"
                    >
                      <div className="divide-y divide-[var(--border)]">
                        {txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => {
                          const acc = accounts.find(a => a.id === tx.accountId);
                          return (
                            <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-2)] transition">
                              <div className={cn("p-2 rounded-lg shrink-0", tx.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500')}>
                                <ArrowDownRight size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[var(--fg)] truncate flex items-center gap-2">
                                  {tx.description}
                                  {tx.status === 'pending' && (
                                    <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold">Pendente</span>
                                  )}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                  {tx.category} · {new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                  {acc && <span> · {acc.name}</span>}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-bold font-heading text-rose-500">-{formatCurrency(tx.amount)}</p>
                              </div>
                              {tx.status === 'pending' && (
                                <button
                                  onClick={() => updateTransaction(tx.id, { status: 'paid' })}
                                  className="p-1.5 hover:bg-emerald-500/10 text-[var(--text-muted)] hover:text-emerald-500 rounded-lg transition"
                                  title="Marcar como pago"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="px-4 py-3 bg-[var(--surface-2)] flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Pago: <strong className="text-emerald-500">{formatCurrency(paidMonth)}</strong></span>
                        <span className="text-[var(--text-muted)]">Pendente: <strong className="text-amber-500">{formatCurrency(pendingMonth)}</strong></span>
                        <span className="text-[var(--text-muted)]">Total: <strong className="text-[var(--fg)]">{formatCurrency(totalMonth)}</strong></span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {byMonth.length === 0 && (
            <div className="fin-card p-12 text-center text-[var(--text-muted)]">
              <Wallet size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhuma despesa registrada ainda.</p>
              <p className="text-sm mt-1">Adicione transações na aba Transações.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
