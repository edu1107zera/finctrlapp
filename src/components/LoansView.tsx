import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, cn } from '../lib/utils';
import { Loan } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Landmark, Calendar, TrendingDown, CheckCircle2, AlertTriangle, Clock, ChevronRight } from 'lucide-react';

const BANK_COLORS: Record<string, string> = {
  nubank: '#8b5cf6',
  itaú: '#f97316',
  inter: '#f59e0b',
  bradesco: '#cc092f',
  santander: '#ec0000',
  caixa: '#005ca9',
  'banco do brasil': '#f7c000',
  default: '#6366f1',
};

function getBankColor(bank: string): string {
  return BANK_COLORS[bank.toLowerCase()] ?? BANK_COLORS.default;
}

function calcDailyInterest(loan: Loan, salaryDay: number): number {
  if (loan.annualInterestRate === 0) return 0;
  const today = new Date();
  const dayOfMonth = today.getDate();
  // Days between dueDay and salaryDay (if salary comes after dueDay)
  let debtDays = 0;
  if (salaryDay > loan.dueDay) {
    debtDays = salaryDay - loan.dueDay;
  } else if (dayOfMonth > loan.dueDay) {
    // already past due this month
    debtDays = dayOfMonth - loan.dueDay;
  }
  if (debtDays <= 0) return 0;
  const dailyRate = loan.annualInterestRate / 100 / 365;
  return loan.monthlyPayment * dailyRate * debtDays;
}

function calcProgress(loan: Loan): number {
  const start = new Date(loan.startDate).getTime();
  const end = new Date(loan.endDate).getTime();
  const now = Date.now();
  if (now >= end) return 100;
  if (now <= start) return 0;
  return Math.round(((now - start) / (end - start)) * 100);
}

function totalMonths(loan: Loan): number {
  const start = new Date(loan.startDate);
  const end = new Date(loan.endDate);
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

function monthsRemaining(loan: Loan): number {
  const end = new Date(loan.endDate);
  const now = new Date();
  const diff = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
  return Math.max(0, diff);
}

export default function LoansView() {
  const { loans, addLoan, deleteLoan, updateLoan, addTransaction, addHistoryEntry, accounts, settings } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    bank: '',
    totalAmount: '',
    monthlyPayment: '',
    annualInterestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    dueDay: '10',
  });

  const salaryDay = settings?.salaryDay ?? 5;

  const activeLoans = loans.filter(l => l.status === 'active');
  const paidOffLoans = loans.filter(l => l.status === 'paid_off');

  const totalMonthlyDebt = activeLoans.reduce((s, l) => s + l.monthlyPayment, 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addLoan({
      name: form.name,
      bank: form.bank,
      totalAmount: parseFloat(form.totalAmount) || 0,
      monthlyPayment: parseFloat(form.monthlyPayment) || 0,
      annualInterestRate: parseFloat(form.annualInterestRate) || 0,
      startDate: form.startDate,
      endDate: form.endDate,
      dueDay: parseInt(form.dueDay) || 10,
    });
    setForm({ name: '', bank: '', totalAmount: '', monthlyPayment: '', annualInterestRate: '', startDate: new Date().toISOString().split('T')[0], endDate: '', dueDay: '10' });
    setIsAdding(false);
  };

  const handlePayInstallment = async (loan: Loan) => {
    if (!accounts[0]) return;
    const interest = calcDailyInterest(loan, salaryDay);
    const totalToPay = loan.monthlyPayment + interest;

    // Create a paid transaction
    await addTransaction({
      accountId: accounts[0].id,
      type: 'expense',
      amount: totalToPay,
      category: 'Empréstimo',
      date: new Date().toISOString().split('T')[0],
      description: `Parcela: ${loan.name} (${loan.bank})${interest > 0 ? ` + ${formatCurrency(interest)} juros` : ''}`,
      status: 'paid',
    });

    await addHistoryEntry({
      type: 'loan_payment',
      description: `Parcela paga: ${loan.name} — ${loan.bank}`,
      amount: totalToPay,
      referenceId: loan.id,
    });

    if (monthsRemaining(loan) <= 0) {
      await updateLoan(loan.id, { status: 'paid_off' });
    }

    setPayingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-[var(--fg)] tracking-tight">Empréstimos</h2>
          <p className="text-[var(--text-muted)] mt-1">Gerencie seus empréstimos recorrentes. Cada parcela entra automaticamente.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20"
        >
          <Plus size={18} /><span className="font-medium">Novo Empréstimo</span>
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="fin-card p-4 flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl"><TrendingDown size={20} /></div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Total/mês em parcelas</p>
            <p className="text-xl font-bold font-heading text-[var(--fg)]">{formatCurrency(totalMonthlyDebt)}</p>
          </div>
        </div>
        <div className="fin-card p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><Clock size={20} /></div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Empréstimos ativos</p>
            <p className="text-xl font-bold font-heading text-[var(--fg)]">{activeLoans.length}</p>
          </div>
        </div>
        <div className="fin-card p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><CheckCircle2 size={20} /></div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Quitados</p>
            <p className="text-xl font-bold font-heading text-[var(--fg)]">{paidOffLoans.length}</p>
          </div>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="fin-card p-6 overflow-hidden"
          >
            <h3 className="text-lg font-bold font-heading text-[var(--fg)] mb-4">Novo Empréstimo / Financiamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-style">Nome / Descrição</label>
                <input required className="input-style" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Financiamento Carro, CDC Eletrodoméstico..." />
              </div>
              <div>
                <label className="label-style">Banco / Cartão</label>
                <input required className="input-style" value={form.bank} onChange={e => setForm({...form, bank: e.target.value})} placeholder="Ex: Nubank, Bradesco, Itaú..." />
              </div>
              <div>
                <label className="label-style">Valor Total (R$)</label>
                <input required type="number" min="0" step="0.01" className="input-style" value={form.totalAmount} onChange={e => setForm({...form, totalAmount: e.target.value})} placeholder="0.00" />
              </div>
              <div>
                <label className="label-style">Parcela Mensal (R$)</label>
                <input required type="number" min="0" step="0.01" className="input-style" value={form.monthlyPayment} onChange={e => setForm({...form, monthlyPayment: e.target.value})} placeholder="0.00" />
              </div>
              <div>
                <label className="label-style">Taxa de Juros Anual (%)</label>
                <input type="number" min="0" step="0.01" className="input-style" value={form.annualInterestRate} onChange={e => setForm({...form, annualInterestRate: e.target.value})} placeholder="0 para sem juros" />
              </div>
              <div>
                <label className="label-style">Dia do Vencimento (1-31)</label>
                <input required type="number" min="1" max="31" className="input-style" value={form.dueDay} onChange={e => setForm({...form, dueDay: e.target.value})} />
              </div>
              <div>
                <label className="label-style">Data de Início</label>
                <input required type="date" className="input-style" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
              </div>
              <div>
                <label className="label-style">Data de Quitação (fim)</label>
                <input required type="date" className="input-style" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] rounded-xl transition">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold">Salvar Empréstimo</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Active Loans */}
      <div className="space-y-4">
        {activeLoans.length === 0 && (
          <div className="fin-card p-12 text-center text-[var(--text-muted)]">
            <Landmark size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum empréstimo ativo.</p>
            <p className="text-sm mt-1">Adicione um empréstimo ou financiamento para acompanhar aqui.</p>
          </div>
        )}
        {activeLoans.map(loan => {
          const progress = calcProgress(loan);
          const remaining = monthsRemaining(loan);
          const interest = calcDailyInterest(loan, salaryDay);
          const bankColor = getBankColor(loan.bank);
          const totalWithInterest = loan.monthlyPayment + interest;
          const isPaying = payingId === loan.id;

          return (
            <motion.div key={loan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="fin-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bankColor + '20' }}>
                    <Landmark size={20} style={{ color: bankColor }} />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--fg)] font-heading">{loan.name}</p>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: bankColor }}></span>
                      {loan.bank}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {interest > 0 && (
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded-lg">
                      <AlertTriangle size={12} />
                      +{formatCurrency(interest)} juros
                    </div>
                  )}
                  <button
                    onClick={() => setPayingId(isPaying ? null : loan.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 text-sm font-semibold rounded-xl hover:bg-emerald-500/20 transition"
                  >
                    <CheckCircle2 size={16} /> Pagar Parcela
                  </button>
                  <button onClick={() => deleteLoan(loan.id)} className="p-2 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Pay confirmation */}
              <AnimatePresence>
                {isPaying && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl overflow-hidden"
                  >
                    <p className="text-sm text-[var(--text-muted)] mb-3">
                      Confirmar pagamento da parcela <strong className="text-[var(--fg)]">{formatCurrency(totalWithInterest)}</strong>
                      {interest > 0 && <span className="text-amber-500"> (inclui {formatCurrency(interest)} de juros por atraso)</span>}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setPayingId(null)} className="px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] rounded-lg transition">Cancelar</button>
                      <button onClick={() => handlePayInstallment(loan)} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold">
                        ✓ Confirmar Pagamento
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Parcela</p>
                  <p className="font-bold text-[var(--fg)] font-heading">{formatCurrency(loan.monthlyPayment)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Vence todo dia</p>
                  <p className="font-bold text-[var(--fg)] font-heading">{loan.dueDay}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Meses restantes</p>
                  <p className="font-bold text-[var(--fg)] font-heading">{remaining}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span>Progresso</span><span>{progress}%</span>
                </div>
                <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: bankColor }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                  <span>{new Date(loan.startDate + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}</span>
                  <span>{new Date(loan.endDate + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Paid off */}
      {paidOffLoans.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">Quitados</h3>
          <div className="space-y-2">
            {paidOffLoans.map(loan => (
              <div key={loan.id} className="fin-card p-4 flex items-center justify-between opacity-50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  <div>
                    <p className="font-semibold text-[var(--fg)]">{loan.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{loan.bank}</p>
                  </div>
                </div>
                <button onClick={() => deleteLoan(loan.id)} className="p-2 hover:text-rose-500 text-[var(--text-muted)] rounded-xl transition"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
