import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, cn } from '../lib/utils';
import { Plus, Trash2, Building2, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Accounts() {
  const { accounts, addAccount, deleteAccount, transactions } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', color: '#6366f1' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addAccount({ name: formData.name, color: formData.color });
    setFormData({ name: '', color: '#6366f1' });
    setIsAdding(false);
  };

  const getAccountBalance = (accountId: string) => {
    return transactions
      .filter(t => t.accountId === accountId)
      .reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  };

  const totalBalance = accounts.reduce((acc, account) => acc + getAccountBalance(account.id), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold font-heading text-zinc-900 dark:text-zinc-50 tracking-tight">Contas e Instituições</h2>
           <p className="text-zinc-500 dark:text-zinc-400 mt-1">Gerencie seu patrimônio através de múltiplos bancos e carteiras.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20"
        >
          <Plus size={18} />
          <span className="font-medium">Nova Conta</span>
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, height: 'auto', filter: "blur(0px)" }}
            exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
            onSubmit={handleSubmit} 
            className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col md:flex-row gap-6 items-end overflow-hidden"
          >
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Nome da Instituição</label>
              <input 
                type="text" required
                className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-shadow"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Nubank, Itaú, Carteira Física..."
              />
            </div>
            <div className="w-full md:w-32">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Cor Tema</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="color" required
                  className="h-12 w-full rounded-2xl cursor-pointer bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 transition-shadow focus:ring-2 focus:ring-indigo-500 p-1"
                  value={formData.color}
                  onChange={e => setFormData({...formData, color: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 w-full md:w-auto mt-2 md:mt-0">
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition font-medium">Cancelar</button>
              <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm font-medium">Adicionar</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-8 rounded-[2rem] shadow-md text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
             <Wallet size={120} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
               <p className="text-white/80 font-medium mb-1">Patrimônio Consolidado</p>
               <p className="text-4xl font-bold font-heading tracking-tight">{formatCurrency(totalBalance)}</p>
            </div>
            <div className="mt-8 flex items-center space-x-2 text-white/90 text-sm">
               <Building2 size={16} />
               <span>{accounts.length} {accounts.length === 1 ? 'instituição conectada' : 'instituições conectadas'}</span>
            </div>
          </div>
        </div>

        {accounts.map(acc => {
          const balance = getAccountBalance(acc.id);
          return (
            <motion.div 
              layoutId={`account-${acc.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={acc.id} 
              className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 relative overflow-hidden group transition-shadow hover:shadow-md"
            >
              <div 
                className="absolute top-0 left-0 w-2 h-full opacity-80"
                style={{ backgroundColor: acc.color }}
              />
              <div className="flex justify-between items-start mb-6 pl-2">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105" style={{ backgroundColor: acc.color }}>
                    <Building2 size={24} />
                  </div>
                  <h3 className="font-bold font-heading text-xl text-zinc-900 dark:text-zinc-100 tracking-tight">{acc.name}</h3>
                </div>
                <button 
                  onClick={() => deleteAccount(acc.id)} 
                  className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                  title="Remover conta"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="pl-2">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Saldo em Conta</p>
                <p className={cn("text-3xl font-bold font-heading tracking-tight", balance >= 0 ? 'text-zinc-900 dark:text-white' : 'text-rose-600 dark:text-rose-400')}>
                  {formatCurrency(balance)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
