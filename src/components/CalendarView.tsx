import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, cn } from '../lib/utils';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle, Landmark } from 'lucide-react';
import { motion } from 'motion/react';

export default function CalendarView() {
  const { transactions, loans } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Pending transactions for this month
  const pendingBills = useMemo(() => {
    return transactions.filter(t => {
      if (t.status !== 'pending') return false;
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year && tDate.getMonth() === month;
    });
  }, [transactions, year, month]);

  // Active loans (show dueDay every month)
  const activeLoans = useMemo(() => loans.filter(l => {
    if (l.status !== 'active') return false;
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);
    const current = new Date(year, month, 1);
    return current >= new Date(start.getFullYear(), start.getMonth(), 1) && current <= new Date(end.getFullYear(), end.getMonth(), 1);
  }), [loans, year, month]);

  const getBillsForDay = (day: number) => {
    return pendingBills.filter(t => {
      const tDate = new Date(t.date);
      tDate.setMinutes(tDate.getMinutes() + tDate.getTimezoneOffset());
      return tDate.getDate() === day;
    });
  };

  const getLoansForDay = (day: number) => activeLoans.filter(l => l.dueDay === day);

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]">
          <CalendarIcon className="text-indigo-500" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-[var(--fg)] tracking-tight">Calendário de Contas</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Contas pendentes e vencimentos de empréstimos por mês.</p>
        </div>
      </div>

      <div className="fin-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-heading text-[var(--fg)] capitalize">
            {monthName} {year}
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 bg-[var(--surface-2)] rounded-lg hover:bg-[var(--border)] transition">
              <ChevronLeft size={20} className="text-[var(--fg)]" />
            </button>
            <button onClick={nextMonth} className="p-2 bg-[var(--surface-2)] rounded-lg hover:bg-[var(--border)] transition">
              <ChevronRight size={20} className="text-[var(--fg)]" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>Conta pendente</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>Vencimento empréstimo</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="text-center text-xs font-semibold uppercase text-[var(--text-muted)] mb-2">
              {d}
            </div>
          ))}

          {blanks.map(b => (
            <div key={`blank-${b}`} className="min-h-[100px] p-2 rounded-xl bg-[var(--bg)] opacity-30"></div>
          ))}

          {days.map(day => {
            const bills = getBillsForDay(day);
            const dayLoans = getLoansForDay(day);
            const hasBills = bills.length > 0;
            const hasLoans = dayLoans.length > 0;
            const totalDay = bills.reduce((acc, b) => acc + (b.type === 'expense' ? b.amount : -b.amount), 0);
            const totalLoans = dayLoans.reduce((acc, l) => acc + l.monthlyPayment, 0);
            
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

            return (
              <motion.div 
                key={day}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "min-h-[100px] p-2 rounded-xl border transition-all",
                  isToday ? "border-indigo-500 bg-indigo-500/5" : "border-[var(--border)] bg-[var(--surface-2)]",
                  hasBills ? "border-rose-500/50" : "",
                  hasLoans && !hasBills ? "border-indigo-500/30" : ""
                )}
              >
                <div className="flex justify-between items-start">
                  <span className={cn("text-sm font-bold", isToday ? "text-indigo-500" : "text-[var(--text-muted)]")}>
                    {day}
                  </span>
                  <div className="flex gap-1">
                    {hasBills && <AlertCircle size={12} className="text-rose-500" />}
                    {hasLoans && <Landmark size={12} className="text-indigo-500" />}
                  </div>
                </div>
                
                <div className="mt-2 space-y-1">
                  {bills.slice(0, 2).map(b => (
                    <div key={b.id} className="text-[10px] truncate bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded">
                      {b.description || b.category}
                    </div>
                  ))}
                  {dayLoans.slice(0, 2).map(l => (
                    <div key={l.id} className="text-[10px] truncate bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Landmark size={8} /> {l.bank}
                    </div>
                  ))}
                  {(hasBills || hasLoans) && (
                    <div className="text-xs font-bold mt-1 space-y-0.5">
                      {hasBills && <div className="text-rose-500">-{formatCurrency(totalDay)}</div>}
                      {hasLoans && <div className="text-indigo-500">-{formatCurrency(totalLoans)}</div>}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
