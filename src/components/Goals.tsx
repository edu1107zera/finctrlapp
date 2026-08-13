import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, cn } from '../lib/utils';
import { Plus, Trash2, Target, TrendingUp, AlertCircle, CalendarClock, PieChart as PieChartIcon } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

export default function Goals() {
  const { goals, addGoal, deleteGoal, transactions, addTransaction, accounts } = useFinance();
  const { theme } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [deductFromBalance, setDeductFromBalance] = useState(false);

  const totalIncome = useMemo(() => {
    return transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    monthlyContribution: '',
    annualInterestRate: '10',
    deadline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount || !formData.deadline) return;
    
    addGoal({
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      monthlyContribution: parseFloat(formData.monthlyContribution) || 0,
      annualInterestRate: parseFloat(formData.annualInterestRate) || 0,
      deadline: formData.deadline
    });

    if (deductFromBalance && parseFloat(formData.currentAmount) > 0) {
      addTransaction({
        accountId: accounts[0]?.id || '',
        type: 'expense',
        amount: parseFloat(formData.currentAmount),
        category: 'Metas',
        date: new Date().toISOString().split('T')[0],
        description: `Aporte Inicial - Meta: ${formData.name}`,
        status: 'paid'
      });
    }

    setFormData({ name: '', targetAmount: '', currentAmount: '', monthlyContribution: '', annualInterestRate: '10', deadline: '' });
    setIsAdding(false);
    setDeductFromBalance(false);
  };

  // Advanced simulation: calculates exactly when the goal will be hit
  const simulateGoal = (goal: any) => {
    const data = [];
    let current = goal.currentAmount;
    const monthlyRate = goal.annualInterestRate / 100 / 12;
    let monthsToTarget = 0;
    
    // Simulate until target or max 120 months (10 years)
    for (let i = 0; i <= 120; i++) {
      if (i > 0) {
        current = current * (1 + monthlyRate) + goal.monthlyContribution;
      }
      if (i <= 36 || current >= goal.targetAmount) {
         // Keep at least 36 months for the chart, or stop when hit
         data.push({ month: i, amount: Math.round(current * 100) / 100 });
      }
      if (current >= goal.targetAmount && monthsToTarget === 0) {
        monthsToTarget = i;
        break; // Stop simulation after hitting target
      }
    }
    
    // If we didn't hit it in 120 months, return what we have
    return { data, monthsToTarget: monthsToTarget > 0 ? monthsToTarget : null };
  };

  const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
  const gridColor = theme === 'dark' ? '#27272a' : '#f4f4f5';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold font-heading text-zinc-900 dark:text-zinc-50 tracking-tight">Simulação de Metas</h2>
           <p className="text-zinc-500 dark:text-zinc-400 mt-1">Planeje e visualize o impacto dos seus investimentos.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20"
        >
          <Plus size={18} />
          <span className="font-medium">Nova Simulação</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Nome do Projeto</label>
                <input 
                  type="text" required
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-shadow"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Liberdade Financeira, Viagem Europa..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Objetivo (R$)</label>
                <input 
                  type="number" step="0.01" min="0" required
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-shadow"
                  value={formData.targetAmount}
                  onChange={e => setFormData({...formData, targetAmount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Valor Inicial (R$)</label>
                <input 
                  type="number" step="0.01" min="0"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-shadow"
                  value={formData.currentAmount}
                  onChange={e => setFormData({...formData, currentAmount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Data Alvo Desejada</label>
                <input 
                  type="date" required
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 [color-scheme:light] dark:[color-scheme:dark] transition-shadow"
                  value={formData.deadline}
                  onChange={e => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Aporte Mensal (R$)</label>
                <input 
                  type="number" step="0.01" min="0"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-shadow"
                  value={formData.monthlyContribution}
                  onChange={e => setFormData({...formData, monthlyContribution: e.target.value})}
                  placeholder="Quanto vai investir/mês"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Rentabilidade Anual (%)</label>
                <input 
                  type="number" step="0.01" min="0"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 transition-shadow"
                  value={formData.annualInterestRate}
                  onChange={e => setFormData({...formData, annualInterestRate: e.target.value})}
                  placeholder="Ex: 10 para Selic aprox."
                />
              </div>
              <div className="lg:col-span-3 flex items-center gap-3 bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                <input
                  type="checkbox"
                  id="deductGoal"
                  checked={deductFromBalance}
                  onChange={(e) => setDeductFromBalance(e.target.checked)}
                  className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label htmlFor="deductGoal" className="text-sm font-medium text-indigo-900 dark:text-indigo-200 cursor-pointer">
                  Descontar "Valor Inicial" do saldo (registrar como despesa)
                </label>
              </div>
              <div className="lg:col-span-3 flex justify-end space-x-3 mt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition font-medium">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm font-medium">Salvar Simulação</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {goals.length > 0 ? (
          goals.map(goal => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const { data: simData, monthsToTarget } = simulateGoal(goal);
            const budgetImpact = totalIncome > 0 ? (goal.monthlyContribution / totalIncome) * 100 : 0;
            
            return (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={goal.id} className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col justify-between">
                <div>
                   <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center space-x-4">
                       <div className="p-3.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-[1rem]">
                         <Target size={24} />
                       </div>
                       <div>
                         <h3 className="font-bold text-xl font-heading text-zinc-900 dark:text-zinc-100 tracking-tight">{goal.name}</h3>
                         <div className="flex items-center space-x-1.5 text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                           <CalendarClock size={14} />
                           <span>Alvo: {new Date(goal.deadline + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                         </div>
                       </div>
                     </div>
                     <button onClick={() => deleteGoal(goal.id)} className="p-2 text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition">
                       <Trash2 size={18} />
                     </button>
                   </div>
   
                   <div className="mb-8">
                     <div className="flex justify-between text-sm mb-2.5">
                       <span className="font-medium text-zinc-500 dark:text-zinc-400">Status Atual</span>
                       <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)} <span className="text-indigo-600 dark:text-indigo-400 ml-1">({progress.toFixed(1)}%)</span></span>
                     </div>
                     <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-4 overflow-hidden">
                       <div className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                     </div>
                   </div>
   
                   <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                        <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 mb-1.5">
                           <TrendingUp size={16} />
                           <span className="text-sm font-medium">Juros Compostos</span>
                        </div>
                        <p className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{goal.annualInterestRate}% <span className="text-sm font-normal text-zinc-500">a.a.</span></p>
                     </div>
                     <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                        <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 mb-1.5">
                           <PieChartIcon size={16} />
                           <span className="text-sm font-medium">Impacto no Orçamento</span>
                        </div>
                        <p className={cn("font-bold text-lg", budgetImpact > 30 ? "text-rose-500" : "text-emerald-500")}>
                           {budgetImpact > 0 ? `${budgetImpact.toFixed(1)}%` : "N/A"}
                        </p>
                     </div>
                   </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold font-heading text-zinc-900 dark:text-zinc-100">Trajetória Estimada</h4>
                    {monthsToTarget ? (
                       <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-lg">
                          Faltam {monthsToTarget} meses
                       </span>
                    ) : (
                       <span className="text-xs font-medium px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg">
                          Longo prazo (+10 anos)
                       </span>
                    )}
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={simData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`colorAmount-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={theme === 'dark' ? 0.3 : 0.2}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={gridColor} />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(label) => `Mês ${label}`}
                          contentStyle={{ backgroundColor: theme === 'dark' ? '#18181b' : '#fff', borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7', color: textColor, borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill={`url(#colorAmount-${goal.id})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="xl:col-span-2 py-16 flex flex-col items-center justify-center bg-white/50 dark:bg-zinc-900/50 rounded-[2rem] border border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Target size={32} className="text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold font-heading text-zinc-900 dark:text-zinc-100 mb-2">Nenhuma simulação ativa</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-center">Planeje sua independência financeira ou grandes compras adicionando uma nova simulação.</p>
          </div>
        )}
      </div>
    </div>
  );
}
