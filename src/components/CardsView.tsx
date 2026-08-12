import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, cn } from '../lib/utils';
import { Card } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CreditCard, Calendar, CheckCircle2, ChevronRight, Activity, TrendingDown } from 'lucide-react';

function getInvoiceMonth(dateStr: string, closingDay: number): string {
  const d = new Date(dateStr);
  // If the transaction date is on or after the closing day, it falls into the next month's invoice.
  if (d.getDate() >= closingDay) {
    d.setMonth(d.getMonth() + 1);
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function CardsView() {
  const { cards, addCard, deleteCard, transactions, addTransaction, accounts } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  
  const [form, setForm] = useState({
    name: '', limitAmount: '', closingDay: '25', dueDay: '5', color: '#6366f1'
  });
  
  const [expenseForm, setExpenseForm] = useState({
    cardId: '', description: '', amount: '', date: new Date().toISOString().split('T')[0], installments: '1', category: 'Outros'
  });

  const [addingExpenseTo, setAddingExpenseTo] = useState<string | null>(null);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCard({
      name: form.name,
      limitAmount: parseFloat(form.limitAmount) || 0,
      closingDay: parseInt(form.closingDay) || 25,
      dueDay: parseInt(form.dueDay) || 5,
      color: form.color
    });
    setForm({ name: '', limitAmount: '', closingDay: '25', dueDay: '5', color: '#6366f1' });
    setIsAdding(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingExpenseTo) return;
    
    const baseAmount = parseFloat(expenseForm.amount) || 0;
    const installments = parseInt(expenseForm.installments) || 1;
    const instAmount = baseAmount / installments;
    const baseDate = new Date(expenseForm.date);

    for (let i = 0; i < installments; i++) {
      const txDate = new Date(baseDate);
      txDate.setMonth(txDate.getMonth() + i);
      
      await addTransaction({
        accountId: accounts[0]?.id || '', // fallback
        cardId: addingExpenseTo,
        type: 'expense',
        amount: instAmount,
        category: expenseForm.category,
        date: txDate.toISOString().split('T')[0],
        description: expenseForm.description + (installments > 1 ? ` (${i+1}/${installments})` : ''),
        status: 'pending',
        installmentCurrent: i + 1,
        installmentTotal: installments
      });
    }

    setExpenseForm({ cardId: '', description: '', amount: '', date: new Date().toISOString().split('T')[0], installments: '1', category: 'Outros' });
    setAddingExpenseTo(null);
  };

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-[var(--fg)] tracking-tight">Cartões de Crédito</h2>
          <p className="text-[var(--text-muted)] mt-1">Gerencie seus limites e gastos por fatura.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20"
        >
          <Plus size={18} /><span className="font-medium">Novo Cartão</span>
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddCard} className="fin-card p-6 overflow-hidden"
          >
            <h3 className="text-lg font-bold font-heading text-[var(--fg)] mb-4">Adicionar Cartão</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-style">Nome (Ex: Nubank)</label>
                <input required className="input-style" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="label-style">Limite Total (R$)</label>
                <input required type="number" step="0.01" className="input-style" value={form.limitAmount} onChange={e => setForm({...form, limitAmount: e.target.value})} />
              </div>
              <div>
                <label className="label-style">Dia do Fechamento (1-31)</label>
                <input required type="number" min="1" max="31" className="input-style" value={form.closingDay} onChange={e => setForm({...form, closingDay: e.target.value})} />
              </div>
              <div>
                <label className="label-style">Dia do Vencimento (1-31)</label>
                <input required type="number" min="1" max="31" className="input-style" value={form.dueDay} onChange={e => setForm({...form, dueDay: e.target.value})} />
              </div>
              <div>
                <label className="label-style">Cor do Cartão</label>
                <input type="color" className="h-12 w-full rounded-xl cursor-pointer" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] rounded-xl transition">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold">Salvar Cartão</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cards.length === 0 && (
          <div className="col-span-full fin-card p-12 text-center text-[var(--text-muted)]">
            <CreditCard size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum cartão adicionado.</p>
            <p className="text-sm mt-1">Cadastre seu primeiro cartão de crédito.</p>
          </div>
        )}

        {cards.map(card => {
          // Calculate card spent based on transactions linked to it
          const cardTxs = transactions.filter(t => t.cardId === card.id);
          
          // Current invoice
          const currentInvoiceTxs = cardTxs.filter(t => getInvoiceMonth(t.date, card.closingDay) === currentMonthKey);
          const currentInvoiceTotal = currentInvoiceTxs.reduce((s, t) => s + t.amount, 0);

          // Total outstanding (all pending limits)
          const totalSpentAllTime = cardTxs.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
          const availableLimit = card.limitAmount - totalSpentAllTime;
          const limitPct = Math.min(100, Math.max(0, (totalSpentAllTime / card.limitAmount) * 100));

          return (
            <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="fin-card overflow-hidden">
              <div className="p-6 pb-4" style={{ borderTop: `4px solid ${card.color}` }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 rounded bg-gradient-to-br from-white/20 to-transparent border flex items-center justify-center shadow-sm" style={{ backgroundColor: card.color, borderColor: `${card.color}80` }}>
                      <CreditCard size={14} className="text-white drop-shadow-md" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg font-heading text-[var(--fg)]">{card.name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">Vence dia {card.dueDay} · Fecha dia {card.closingDay}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteCard(card.id)} className="p-2 text-[var(--text-muted)] hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)]">
                    <p className="text-xs text-[var(--text-muted)] font-medium mb-1">Fatura Atual (Mês {new Date().getMonth() + 1})</p>
                    <p className="font-bold text-xl font-heading text-[var(--fg)]">{formatCurrency(currentInvoiceTotal)}</p>
                  </div>
                  <div className="bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)]">
                    <p className="text-xs text-[var(--text-muted)] font-medium mb-1">Limite Disponível</p>
                    <p className="font-bold text-xl font-heading text-emerald-500">{formatCurrency(availableLimit)}</p>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1.5">
                    <span>Limite Usado ({limitPct.toFixed(0)}%)</span>
                    <span>{formatCurrency(card.limitAmount)} Total</span>
                  </div>
                  <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${limitPct}%`, backgroundColor: card.color }}></div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-[var(--surface-2)] border-t border-[var(--border)]">
                <button
                  onClick={() => setAddingExpenseTo(addingExpenseTo === card.id ? null : card.id)}
                  className="w-full py-2.5 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--fg)] text-[var(--fg)] rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Lançar Compra neste Cartão
                </button>

                <AnimatePresence>
                  {addingExpenseTo === card.id && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAddExpense}
                      className="mt-4 space-y-4 overflow-hidden"
                    >
                      <div>
                        <label className="label-style">Descrição</label>
                        <input required className="input-style py-2 text-sm" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} placeholder="Ex: Mercado" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label-style">Valor Total (R$)</label>
                          <input required type="number" step="0.01" className="input-style py-2 text-sm" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} />
                        </div>
                        <div>
                          <label className="label-style">Data da Compra</label>
                          <input required type="date" className="input-style py-2 text-sm" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label-style">Parcelas</label>
                          <input required type="number" min="1" max="48" className="input-style py-2 text-sm" value={expenseForm.installments} onChange={e => setExpenseForm({...expenseForm, installments: e.target.value})} />
                        </div>
                        <div>
                          <label className="label-style">Categoria</label>
                          <select className="input-style py-2 text-sm" value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}>
                            <option>Alimentação</option><option>Transporte</option><option>Lazer</option><option>Casa</option><option>Saúde</option><option>Educação</option><option>Outros</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setAddingExpenseTo(null)} className="flex-1 py-2 text-xs font-semibold text-[var(--text-muted)] bg-[var(--surface)] rounded-xl border border-[var(--border)]">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 text-xs font-semibold text-white rounded-xl" style={{ backgroundColor: card.color }}>Salvar Compra</button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
