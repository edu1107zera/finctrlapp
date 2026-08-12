import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { History, ArrowDownRight, ArrowUpRight, Layers, CreditCard, Search } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  transaction: 'Transação',
  loan_payment: 'Pagamento de Empréstimo',
  bulk_payment: 'Pagamento em Massa',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  transaction: <ArrowDownRight size={18} />,
  loan_payment: <CreditCard size={18} />,
  bulk_payment: <Layers size={18} />,
};

const TYPE_COLORS: Record<string, string> = {
  transaction: 'text-rose-500 bg-rose-500/10',
  loan_payment: 'text-indigo-500 bg-indigo-500/10',
  bulk_payment: 'text-violet-500 bg-violet-500/10',
};

export default function HistoryView() {
  const { history } = useFinance();
  const [filter, setFilter] = useState<'all' | 'transaction' | 'loan_payment' | 'bulk_payment'>('all');
  const [search, setSearch] = useState('');

  const filtered = history.filter(h => {
    const matchesFilter = filter === 'all' || h.type === filter;
    const matchesSearch = h.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const total = filtered.reduce((s, h) => s + h.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-[var(--fg)] tracking-tight">Histórico Geral</h2>
        <p className="text-[var(--text-muted)] mt-1">Tudo que foi registrado, pago ou quitado no app.</p>
      </div>

      {/* Filters */}
      <div className="fin-card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar no histórico..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm text-[var(--fg)] outline-none focus:border-indigo-500 transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'transaction', 'loan_payment', 'bulk_payment'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold transition-all", filter === f ? "bg-indigo-600 text-white" : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--fg)]")}
            >
              {f === 'all' ? 'Todos' : TYPE_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-[var(--text-muted)]">
        <span className="font-semibold text-[var(--fg)]">{filtered.length}</span> registro(s) — Total registrado: <span className="font-semibold text-rose-500">{formatCurrency(total)}</span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="fin-card p-12 text-center text-[var(--text-muted)]">
            <History size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum registro encontrado.</p>
            <p className="text-sm mt-1">Pague contas ou empréstimos para ver o histórico aqui.</p>
          </div>
        )}
        {filtered.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="fin-card p-4 flex items-center gap-4"
          >
            <div className={cn("p-2.5 rounded-xl shrink-0", TYPE_COLORS[entry.type])}>
              {TYPE_ICONS[entry.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--fg)] truncate">{entry.description}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {TYPE_LABELS[entry.type]} · {new Date(entry.paidAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <p className="font-bold font-heading text-rose-500 text-lg shrink-0">
              -{formatCurrency(entry.amount)}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
