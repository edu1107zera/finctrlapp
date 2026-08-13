import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, Target, Calendar } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function NotificationBell() {
  const { transactions, loans, goals, cards } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const fiveDaysFromNow = new Date();
  fiveDaysFromNow.setDate(now.getDate() + 5);
  const limitStr = fiveDaysFromNow.toISOString().split('T')[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = useMemo(() => {
    const alerts = [];

    // 1. Pending transactions (overdue and soon)
    const pendingExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'pending');
    
    pendingExpenses.forEach(t => {
      if (t.date < todayStr) {
        alerts.push({
          id: `t-overdue-${t.id}`,
          type: 'danger',
          title: 'Despesa Vencida',
          message: `${t.description} (${formatCurrency(t.amount)}) venceu em ${new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}.`,
          icon: <AlertTriangle size={16} />
        });
      } else if (t.date <= limitStr) {
        alerts.push({
          id: `t-soon-${t.id}`,
          type: 'warning',
          title: 'Despesa Próxima',
          message: `${t.description} (${formatCurrency(t.amount)}) vence em ${new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}.`,
          icon: <Clock size={16} />
        });
      }
    });

    // 2. Active loans
    loans.filter(l => l.status === 'active').forEach(loan => {
      // Find the next due date for this loan
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      let dueThisMonth = new Date(currentYear, currentMonth, loan.dueDay);
      
      // If we already passed this month's due date, look at next month
      // For notifications, we only care if it's coming up very soon or overdue in the current month cycle
      const diffDays = Math.round((dueThisMonth.getTime() - now.getTime()) / (1000 * 3600 * 24));
      
      if (diffDays < 0 && diffDays >= -15) { // Assuming overdue if within last 15 days
        alerts.push({
          id: `l-overdue-${loan.id}`,
          type: 'danger',
          title: 'Parcela Vencida',
          message: `O empréstimo ${loan.name} (${formatCurrency(loan.monthlyPayment)}) venceu dia ${loan.dueDay}.`,
          icon: <AlertTriangle size={16} />
        });
      } else if (diffDays >= 0 && diffDays <= 5) {
        alerts.push({
          id: `l-soon-${loan.id}`,
          type: 'warning',
          title: 'Empréstimo Próximo',
          message: `O empréstimo ${loan.name} vence dia ${loan.dueDay} (${formatCurrency(loan.monthlyPayment)}).`,
          icon: <Clock size={16} />
        });
      }
    });

    // 3. Cards close to due date
    cards.forEach(card => {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      let dueThisMonth = new Date(currentYear, currentMonth, card.dueDay);
      const diffDays = Math.round((dueThisMonth.getTime() - now.getTime()) / (1000 * 3600 * 24));
      
      if (diffDays < 0 && diffDays >= -10) {
        alerts.push({
          id: `c-overdue-${card.id}`,
          type: 'danger',
          title: 'Fatura Vencida',
          message: `A fatura do cartão ${card.name} venceu dia ${card.dueDay}.`,
          icon: <AlertTriangle size={16} />
        });
      } else if (diffDays >= 0 && diffDays <= 5) {
        alerts.push({
          id: `c-soon-${card.id}`,
          type: 'warning',
          title: 'Fatura Próxima',
          message: `A fatura do cartão ${card.name} vence dia ${card.dueDay}.`,
          icon: <Clock size={16} />
        });
      }
    });

    // Sort: danger first, then warning
    return alerts.sort((a, b) => a.type === 'danger' ? -1 : 1);
  }, [transactions, loans, cards, limitStr, todayStr]);

  const hasUnread = notifications.length > 0;
  const dangerCount = notifications.filter(n => n.type === 'danger').length;

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[var(--text-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] rounded-xl transition-colors"
      >
        <Bell size={20} />
        {hasUnread && (
          <span className={cn(
            "absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full border-2 border-[var(--surface)]",
            dangerCount > 0 ? "bg-rose-500 animate-pulse" : "bg-amber-500"
          )} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 p-2"
          >
            <div className="px-3 py-2 border-b border-[var(--border)] mb-2 flex justify-between items-center">
              <span className="font-bold font-heading text-[var(--fg)]">Notificações</span>
              <span className="text-xs bg-[var(--surface-2)] text-[var(--text-muted)] px-2 py-0.5 rounded-full">
                {notifications.length}
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="mx-auto text-[var(--border)] mb-2" />
                <p className="text-sm font-medium text-[var(--fg)]">Tudo em dia!</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Nenhuma conta vencida ou próxima do vencimento.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={cn(
                      "p-3 rounded-xl flex gap-3 items-start",
                      notif.type === 'danger' ? 'bg-rose-500/10' : 'bg-amber-500/10'
                    )}
                  >
                    <div className={cn(
                      "mt-0.5",
                      notif.type === 'danger' ? 'text-rose-500' : 'text-amber-500'
                    )}>
                      {notif.icon}
                    </div>
                    <div>
                      <p className={cn(
                        "text-sm font-bold font-heading",
                        notif.type === 'danger' ? 'text-rose-500' : 'text-amber-600 dark:text-amber-500'
                      )}>
                        {notif.title}
                      </p>
                      <p className={cn(
                        "text-xs mt-0.5 leading-relaxed",
                        notif.type === 'danger' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'
                      )}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
