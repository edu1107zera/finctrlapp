import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, TrendingUp, TrendingDown, Building2, Calendar, DollarSign } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, cn } from '../lib/utils';

export default function InvestmentsView() {
  const { investments, addInvestment, deleteInvestment, addTransaction, accounts } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [deductFromBalance, setDeductFromBalance] = useState(false);
  const [form, setForm] = useState({
    name: '',
    institution: '',
    investedAmount: '',
    currentAmount: '',
    monthlyContribution: '',
    investmentDate: new Date().toISOString().split('T')[0],
    endDate: '',
    objective: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.investedAmount) return;
    await addInvestment({
      name: form.name,
      institution: form.institution,
      investedAmount: parseFloat(form.investedAmount),
      currentAmount: parseFloat(form.currentAmount) || parseFloat(form.investedAmount),
      monthlyContribution: parseFloat(form.monthlyContribution) || 0,
      investmentDate: form.investmentDate,
      endDate: form.endDate,
      objective: form.objective,
      deductMonthly: deductFromBalance
    });

    setForm({ name: '', institution: '', investedAmount: '', currentAmount: '', monthlyContribution: '', investmentDate: new Date().toISOString().split('T')[0], endDate: '', objective: '' });
    setIsAdding(false);
    setDeductFromBalance(false);
  };

  const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);
  const totalCurrent = investments.reduce((s, i) => s + i.currentAmount, 0);
  const totalReturn = totalCurrent - totalInvested;
  const totalReturnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-[var(--fg)] tracking-tight">Investimentos</h2>
          <p className="text-[var(--text-muted)] mt-1">Acompanhe seus investimentos e rentabilidade. Cadastro manual.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20"
        >
          <Plus size={18} />
          <span className="font-medium">Novo Investimento</span>
        </button>
      </div>

      {/* Summary */}
      {investments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="fin-card p-5">
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">Total Aplicado</p>
            <p className="text-2xl font-bold font-heading text-[var(--fg)]">{formatCurrency(totalInvested)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="fin-card p-5">
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">Valor Atual</p>
            <p className="text-2xl font-bold font-heading text-[var(--fg)]">{formatCurrency(totalCurrent)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="fin-card p-5">
            <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1">Rentabilidade Total</p>
            <p className={cn('text-2xl font-bold font-heading', totalReturn >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
              {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)}
            </p>
            <p className={cn('text-xs font-semibold mt-1', totalReturn >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
              {totalReturn >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}%
            </p>
          </motion.div>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="fin-card p-6 overflow-hidden"
          >
            <h3 className="font-bold text-[var(--fg)] font-heading mb-5">Novo Investimento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-style">Nome do Investimento</label>
                <input type="text" required className="input-style" placeholder="Ex: CDB Nubank, Tesouro IPCA+" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label-style">Instituição</label>
                <input type="text" className="input-style" placeholder="Ex: Nubank, XP, BTG..." value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} />
              </div>
              <div>
                <label className="label-style">Valor Aplicado (R$)</label>
                <input type="number" required min="0" step="0.01" className="input-style" placeholder="0,00" value={form.investedAmount} onChange={e => setForm({ ...form, investedAmount: e.target.value })} />
              </div>
              <div>
                <label className="label-style">Valor Atual (R$)</label>
                <input type="number" min="0" step="0.01" className="input-style" placeholder="0,00 (deixe em branco = igual ao aplicado)" value={form.currentAmount} onChange={e => setForm({ ...form, currentAmount: e.target.value })} />
              </div>
              <div>
                <label className="label-style">Aporte Mensal (R$)</label>
                <input type="number" min="0" step="0.01" className="input-style" placeholder="0,00" value={form.monthlyContribution} onChange={e => setForm({ ...form, monthlyContribution: e.target.value })} />
              </div>
              <div>
                <label className="label-style">Mês de Início (Data Aplicação)</label>
                <input type="date" className="input-style [color-scheme:light] dark:[color-scheme:dark]" value={form.investmentDate} onChange={e => setForm({ ...form, investmentDate: e.target.value })} />
              </div>
              <div>
                <label className="label-style">Mês Final (Opcional)</label>
                <input type="date" className="input-style [color-scheme:light] dark:[color-scheme:dark]" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div>
                <label className="label-style">Objetivo (opcional)</label>
                <input type="text" className="input-style" placeholder="Ex: Reserva de emergência, Aposentadoria..." value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} />
              </div>
              <div className="md:col-span-2 flex items-center gap-3 bg-[var(--surface-2)] p-4 rounded-xl border border-[var(--border)] mt-2">
                <input
                  type="checkbox"
                  id="deductInvestment"
                  checked={deductFromBalance}
                  onChange={(e) => setDeductFromBalance(e.target.checked)}
                  className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label htmlFor="deductInvestment" className="text-sm font-medium text-[var(--fg)] cursor-pointer">
                  Descontar "Aporte Mensal" automaticamente do fluxo de caixa do Dashboard
                </label>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 text-[var(--text-muted)] hover:bg-[var(--surface-2)] rounded-xl transition font-medium text-sm">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold text-sm">Cadastrar</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Investments list */}
      {investments.length === 0 && !isAdding ? (
        <div className="fin-card p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-[var(--surface-2)] rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp size={28} className="text-[var(--text-muted)]" />
          </div>
          <p className="font-semibold text-[var(--fg)]">Nenhum investimento cadastrado</p>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">
            Registre seus investimentos para acompanhar o crescimento do seu patrimônio.
          </p>
          <button onClick={() => setIsAdding(true)} className="mt-4 flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-400 font-semibold">
            <Plus size={16} />
            Cadastrar investimento
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {investments.map((inv, idx) => {
            const ret = inv.currentAmount - inv.investedAmount;
            const retPct = inv.investedAmount > 0 ? (ret / inv.investedAmount) * 100 : 0;
            const isPositive = ret >= 0;
            return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="fin-card p-5 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                    <DollarSign size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-[var(--fg)] font-heading">{inv.name}</h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {inv.institution && (
                            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                              <Building2 size={12} /> {inv.institution}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                            <Calendar size={12} /> {new Date(inv.investmentDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </span>
                          {inv.objective && (
                            <span className="text-xs text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded-full">
                              {inv.objective}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteInvestment(inv.id)}
                        className="p-2 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-[var(--text-muted)] mb-0.5">Aplicado</p>
                        <p className="text-sm font-bold text-[var(--fg)]">{formatCurrency(inv.investedAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)] mb-0.5">Valor Atual</p>
                        <p className="text-sm font-bold text-[var(--fg)]">{formatCurrency(inv.currentAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)] mb-0.5">Rentabilidade</p>
                        <p className={cn('text-sm font-bold flex items-center gap-1', isPositive ? 'text-emerald-500' : 'text-rose-500')}>
                          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {isPositive ? '+' : ''}{retPct.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
