import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, PieChart, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, cn } from '../lib/utils';

interface Budget {
  id: string;
  category: string;
  limitAmount: number;
  month: string; // YYYY-MM or 'all'
}

function getBudgetKey(userId: string) {
  return `nixx_budget_${userId}`;
}

function loadBudgets(userId: string): Budget[] {
  try {
    return JSON.parse(localStorage.getItem(getBudgetKey(userId)) || '[]');
  } catch {
    return [];
  }
}

function saveBudgets(userId: string, budgets: Budget[]) {
  localStorage.setItem(getBudgetKey(userId), JSON.stringify(budgets));
}

const PRESET_CATEGORIES = [
  'Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação',
  'Lazer', 'Vestuário', 'Utilities', 'Streaming', 'Outros'
];

export default function BudgetView() {
  const { user } = useAuth();
  const uid = user?.id || 'guest';
  const { transactions } = useFinance();
  const [budgets, setBudgets] = useState<Budget[]>(() => loadBudgets(uid));
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ category: '', customCategory: '', limitAmount: '' });

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const addBudget = () => {
    const cat = form.category === '__custom__' ? form.customCategory : form.category;
    if (!cat || !form.limitAmount) return;
    const newBudget: Budget = {
      id: crypto.randomUUID(),
      category: cat,
      limitAmount: parseFloat(form.limitAmount),
      month: 'all',
    };
    const next = [...budgets, newBudget];
    setBudgets(next);
    saveBudgets(uid, next);
    setForm({ category: '', customCategory: '', limitAmount: '' });
    setIsAdding(false);
  };

  const deleteBudget = (id: string) => {
    const next = budgets.filter(b => b.id !== id);
    setBudgets(next);
    saveBudgets(uid, next);
  };

  // Calculate spent per category this month
  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonthKey))
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [transactions, currentMonthKey]);

  const totalBudgeted = budgets.reduce((s, b) => s + b.limitAmount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (spentByCategory[b.category] || 0), 0);

  const getStatus = (spent: number, limit: number) => {
    const pct = limit > 0 ? (spent / limit) * 100 : 0;
    if (pct >= 100) return 'exceeded';
    if (pct >= 75) return 'warning';
    return 'ok';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-[var(--fg)] tracking-tight">Orçamento por Categoria</h2>
          <p className="text-[var(--text-muted)] mt-1">Defina limites mensais e acompanhe seus gastos por categoria.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20"
        >
          <Plus size={18} />
          <span className="font-medium">Novo Orçamento</span>
        </button>
      </div>

      {/* Summary cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="fin-card p-5">
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">Total Orçado</p>
            <p className="text-2xl font-bold font-heading text-[var(--fg)]">{formatCurrency(totalBudgeted)}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Soma de todos os limites</p>
          </div>
          <div className="fin-card p-5">
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">Gasto Neste Mês</p>
            <p className="text-2xl font-bold font-heading text-[var(--fg)]">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Nas categorias com orçamento</p>
          </div>
          <div className="fin-card p-5">
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">Disponível</p>
            <p className={cn('text-2xl font-bold font-heading', totalBudgeted - totalSpent < 0 ? 'text-rose-500' : 'text-emerald-500')}>
              {formatCurrency(Math.max(0, totalBudgeted - totalSpent))}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {totalBudgeted > 0 ? `${Math.min(100, Math.round((totalSpent / totalBudgeted) * 100))}% utilizado` : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fin-card p-6 overflow-hidden"
          >
            <h3 className="font-bold text-[var(--fg)] font-heading mb-4">Novo Orçamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label-style">Categoria</label>
                <select
                  className="input-style"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {PRESET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__custom__">Categoria personalizada...</option>
                </select>
              </div>
              {form.category === '__custom__' && (
                <div>
                  <label className="label-style">Nome da categoria</label>
                  <input
                    type="text"
                    className="input-style"
                    placeholder="Ex: Pets, Academia..."
                    value={form.customCategory}
                    onChange={e => setForm({ ...form, customCategory: e.target.value })}
                  />
                </div>
              )}
              <div>
                <label className="label-style">Limite Mensal (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  className="input-style"
                  placeholder="Ex: 800"
                  value={form.limitAmount}
                  onChange={e => setForm({ ...form, limitAmount: e.target.value })}
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={addBudget}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors text-sm"
                >
                  Criar Orçamento
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="py-3 px-4 text-[var(--text-muted)] hover:bg-[var(--surface-2)] rounded-xl transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget list */}
      {budgets.length === 0 ? (
        <div className="fin-card p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-[var(--surface-2)] rounded-2xl flex items-center justify-center mb-4">
            <PieChart size={28} className="text-[var(--text-muted)]" />
          </div>
          <p className="font-semibold text-[var(--fg)]">Nenhum orçamento cadastrado</p>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">
            Crie seu primeiro orçamento para começar a controlar quanto gasta em cada categoria.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-400 font-semibold"
          >
            <Plus size={16} />
            Criar orçamento
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget, idx) => {
            const spent = spentByCategory[budget.category] || 0;
            const pct = budget.limitAmount > 0 ? Math.min(100, (spent / budget.limitAmount) * 100) : 0;
            const status = getStatus(spent, budget.limitAmount);
            const available = Math.max(0, budget.limitAmount - spent);

            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="fin-card p-5 group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-3 h-3 rounded-full shrink-0 mt-0.5', {
                      'bg-emerald-500': status === 'ok',
                      'bg-amber-500': status === 'warning',
                      'bg-rose-500': status === 'exceeded',
                    })} />
                    <div>
                      <p className="font-semibold text-[var(--fg)]">{budget.category}</p>
                      <p className="text-xs text-[var(--text-muted)]">Mês atual</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--fg)]">
                        {formatCurrency(spent)} <span className="text-[var(--text-muted)] font-normal">/ {formatCurrency(budget.limitAmount)}</span>
                      </p>
                      <p className={cn('text-xs font-medium', {
                        'text-emerald-500': status === 'ok',
                        'text-amber-500': status === 'warning',
                        'text-rose-500': status === 'exceeded',
                      })}>
                        {status === 'exceeded' ? (
                          <span className="flex items-center gap-1 justify-end"><AlertTriangle size={12} /> Excedido</span>
                        ) : status === 'warning' ? (
                          <span className="flex items-center gap-1 justify-end"><AlertTriangle size={12} /> Atenção</span>
                        ) : (
                          <span className="flex items-center gap-1 justify-end"><CheckCircle2 size={12} /> Disponível: {formatCurrency(available)}</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteBudget(budget.id)}
                      className="p-2 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', {
                      'bg-emerald-500': status === 'ok',
                      'bg-amber-500': status === 'warning',
                      'bg-rose-500': status === 'exceeded',
                    })}
                  />
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                  <span>{pct.toFixed(0)}% utilizado</span>
                  <span>{formatCurrency(budget.limitAmount - spent > 0 ? budget.limitAmount - spent : 0)} restante</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
