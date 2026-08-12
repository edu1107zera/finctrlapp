import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion } from 'motion/react';
import { Settings, Save, Check } from 'lucide-react';

export default function SettingsView() {
  const { settings, updateSettings } = useFinance();
  const [salary, setSalary] = useState(settings?.fixedSalary?.toString() || '0');
  const [day, setDay] = useState(settings?.salaryDay?.toString() || '5');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (settings) {
      updateSettings({
        ...settings,
        fixedSalary: Number(salary) || 0,
        salaryDay: Number(day) || 5
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">
          <Settings className="text-[var(--text-muted)]" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-[var(--fg)] tracking-tight">Configurações</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Ajuste seu salário fixo para cálculos inteligentes de fluxo de caixa.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="fin-card p-6"
      >
        <h3 className="text-lg font-bold font-heading mb-4 border-b border-[var(--border)] pb-2 text-[var(--fg)]">Salário e Recebimentos</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Salário Fixo Mensal (R$)
            </label>
            <input 
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--fg)] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="Ex: 5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
              Dia do Recebimento
            </label>
            <input 
              type="number"
              min="1"
              max="31"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--fg)] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="Ex: 5"
            />
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Esse dia será usado para prever se você terá saldo suficiente para pagar as contas que vencem antes de receber.
            </p>
          </div>

          <button 
            onClick={handleSave}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? 'Salvo com Sucesso!' : 'Salvar Configurações'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
