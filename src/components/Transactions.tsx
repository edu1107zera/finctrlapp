import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, cn } from '../lib/utils';
import { Plus, Trash2, Landmark, Search, Filter, ArrowUpRight, ArrowDownRight, Tag, CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { TransactionType, TransactionStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function Transactions() {
  const { transactions, addTransaction, deleteTransaction, updateTransaction, accounts } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [frequency, setFrequency] = useState<'once' | 'installment' | 'fixed'>('once');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
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
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    accountId: accounts[0]?.id || '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'paid' as TransactionStatus,
    installments: '1',
    installmentsPaid: '0'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.date || !formData.description || !formData.accountId) return;
    
    const baseAmount = parseFloat(formData.amount);
    
    let installments = 1;
    let installmentsPaid = 0;
    let instAmount = baseAmount;
    
    if (frequency === 'installment') {
      installments = parseInt(formData.installments) || 1;
      installmentsPaid = parseInt(formData.installmentsPaid) || 0;
      instAmount = baseAmount / installments;
    } else if (frequency === 'fixed') {
      installments = 24; // 2 anos de recorrência
      installmentsPaid = 0;
      instAmount = baseAmount;
    }

    const baseDate = new Date(formData.date);

    for (let i = installmentsPaid; i < installments; i++) {
      const txDate = new Date(baseDate);
      txDate.setMonth(txDate.getMonth() + (i - installmentsPaid));
      
      addTransaction({
        type: formData.type,
        accountId: formData.accountId,
        amount: instAmount,
        category: formData.category,
        date: txDate.toISOString().split('T')[0],
        description: formData.description + (frequency === 'installment' && installments > 1 ? ` (${i+1}/${installments})` : ''),
        status: i === installmentsPaid ? formData.status : 'pending', // Apenas a primeira pode ser marcada como paga no momento da criação
        installmentCurrent: frequency === 'installment' ? i + 1 : undefined,
        installmentTotal: frequency === 'installment' ? installments : undefined
      });
    }

    setFormData({ ...formData, amount: '', category: '', description: '', status: 'paid', installments: '1', installmentsPaid: '0' });
    setFrequency('once');
    setIsAdding(false);
  };

  const filteredTransactions = transactions.filter(t => 
    (t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    t.date.startsWith(monthKey)
  );

  const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold font-heading text-zinc-900 dark:text-zinc-50 tracking-tight">Transações</h2>
           <p className="text-zinc-500 dark:text-zinc-400 mt-1">Gerencie suas entradas e saídas de forma detalhada.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20"
        >
          <Plus size={18} />
          <span className="font-medium">Nova Transação</span>
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, height: 'auto', filter: "blur(0px)" }}
            exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
            onSubmit={handleSubmit} 
            className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Tipo da Movimentação</label>
                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={cn("flex-1 py-2 rounded-xl text-sm font-medium transition-all", formData.type === 'expense' ? "bg-white dark:bg-zinc-800 text-rose-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>
                    Saída (Despesa)
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={cn("flex-1 py-2 rounded-xl text-sm font-medium transition-all", formData.type === 'income' ? "bg-white dark:bg-zinc-800 text-emerald-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>
                    Entrada (Receita)
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Status (Pago ou Agendado?)</label>
                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <button type="button" onClick={() => setFormData({...formData, status: 'paid'})} className={cn("flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1", formData.status === 'paid' ? "bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>
                    <CheckCircle2 size={16} /> Pago
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, status: 'pending'})} className={cn("flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1", formData.status === 'pending' ? "bg-white dark:bg-zinc-800 text-amber-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>
                    <Clock size={16} /> Pendente / Futuro
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Conta/Instituição</label>
                <select 
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-shadow appearance-none"
                  value={formData.accountId}
                  onChange={e => setFormData({...formData, accountId: e.target.value})}
                  required
                >
                  <option value="" disabled>Selecione uma conta...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Data da Operação</label>
                <input 
                  type="date" required
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 [color-scheme:light] dark:[color-scheme:dark] transition-shadow"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Valor (R$)</label>
                <input 
                  type="number" step="0.01" min="0" required
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-shadow"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Categoria</label>
                <input 
                  type="text" required
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-shadow"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  placeholder="Ex: Alimentação, Moradia, Salário..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Frequência</label>
                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <button type="button" onClick={() => setFrequency('once')} className={cn("flex-1 py-2 rounded-xl text-sm font-medium transition-all", frequency === 'once' ? "bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>
                    Única
                  </button>
                  {formData.type === 'expense' && (
                    <button type="button" onClick={() => setFrequency('installment')} className={cn("flex-1 py-2 rounded-xl text-sm font-medium transition-all", frequency === 'installment' ? "bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>
                      Parcelada
                    </button>
                  )}
                  <button type="button" onClick={() => setFrequency('fixed')} className={cn("flex-1 py-2 rounded-xl text-sm font-medium transition-all", frequency === 'fixed' ? "bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>
                    Fixa (Mensalidade)
                  </button>
                </div>
              </div>

              {frequency === 'installment' && formData.type === 'expense' && (
                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Total de Parcelas</label>
                    <input 
                      type="number" min="1" max="120" required={frequency === 'installment'}
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-shadow"
                      value={formData.installments}
                      onChange={e => setFormData({...formData, installments: e.target.value})}
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">O valor será dividido.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Já Pagas</label>
                    <input 
                      type="number" min="0" max="120" required={frequency === 'installment'}
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-shadow"
                      value={formData.installmentsPaid}
                      onChange={e => setFormData({...formData, installmentsPaid: e.target.value})}
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">Quantas parcelas já quitou.</p>
                  </div>
                </div>
              )}

              {frequency === 'fixed' && (
                <div className="md:col-span-2 bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg shrink-0">
                    <Clock size={20} />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold mb-0.5">Assinatura / Conta Fixa</p>
                    <p className="opacity-90 leading-relaxed">O Nixx vai replicar esse registro para os próximos <strong>2 anos</strong>. O valor {formData.type === 'expense' ? 'será cobrado' : 'será adicionado'} integralmente a cada mês. Você poderá marcar como "Pago" individualmente no momento certo ou alterar o valor de um mês específico se houver reajuste.</p>
                  </div>
                </div>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Descrição Curta</label>
                <input 
                  type="text" required
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-shadow"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Supermercado Extra, Mensalidade, Freelance..."
                />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition font-medium">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm font-medium">Salvar Registro</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
           
           <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-full border border-zinc-200 dark:border-zinc-700/50">
             <button onClick={handlePrevMonth} className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-full transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"><ChevronLeft size={18} /></button>
             <button onClick={handleToday} className="px-4 py-1.5 font-bold capitalize text-sm text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 rounded-full transition min-w-[140px] text-center">
               {monthName}
             </button>
             <button onClick={handleNextMonth} className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-full transition text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"><ChevronRight size={18} /></button>
           </div>

           <div className="relative w-full max-w-sm">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search size={18} className="text-zinc-400" />
             </div>
             <input 
               type="text"
               placeholder="Buscar transações..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 text-sm"
             />
           </div>
           <button className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition">
             <Filter size={16} />
             <span>Filtros</span>
           </button>
        </div>
        
        {sortedTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-950/30 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Instituição</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 text-center">Status / Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {sortedTransactions.map(tx => {
                  const account = accounts.find(a => a.id === tx.accountId);
                  const isPending = tx.status === 'pending';
                  
                  return (
                    <tr key={tx.id} className={cn("hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group", isPending && "opacity-75")}>
                      <td className="px-6 py-4">
                         <span className="text-sm text-zinc-600 dark:text-zinc-400">{new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                           <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400')}>
                              {tx.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                           </div>
                           <div>
                             <p className="font-semibold font-heading text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                               {tx.description}
                               {isPending && <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">Pendente</span>}
                             </p>
                             <div className="flex items-center space-x-1 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                               <Tag size={12} />
                               <span>{tx.category}</span>
                             </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {account ? (
                          <div className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800/80 w-fit px-3 py-1.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
                            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: account.color }}></span>
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{account.name}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 flex items-center space-x-1 text-sm"><Landmark size={14} /> <span>Desconhecida</span></span>
                        )}
                      </td>
                      <td className={cn(
                        "px-6 py-4 text-right whitespace-nowrap",
                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'
                      )}>
                        <span className="font-bold font-heading text-lg">
                           {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center justify-center space-x-2">
                          {isPending && (
                            <button 
                              onClick={() => updateTransaction(tx.id, { status: 'paid' })}
                              className="p-2 text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl transition"
                              title="Marcar como Pago"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-2 text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400">
             <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <Search size={28} className="opacity-40" />
             </div>
             <p className="font-medium text-zinc-600 dark:text-zinc-300">Nenhuma transação encontrada</p>
             <p className="text-sm mt-1">Registre novos dados ou limpe sua busca.</p>
          </div>
        )}
      </div>
    </div>
  );
}
