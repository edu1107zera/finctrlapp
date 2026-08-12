import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, Goal, Account, Settings, Loan, HistoryEntry, Card } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  accounts: Account[];
  addAccount: (acc: Omit<Account, 'id'>) => void;
  deleteAccount: (id: string) => void;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<Transaction>;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  deleteGoal: (id: string) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  settings: Settings | null;
  updateSettings: (s: Settings) => void;
  loans: Loan[];
  addLoan: (loan: Omit<Loan, 'id' | 'status'>) => void;
  deleteLoan: (id: string) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  history: HistoryEntry[];
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'paidAt'>) => void;
  bulkPayPending: (amountPaid: number) => Promise<void>;
  cards: Card[];
  addCard: (card: Omit<Card, 'id'>) => Promise<Card>;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const getDefaultAccounts = (): Account[] => [
  { id: uuidv4(), name: 'Nubank', color: '#8b5cf6' },
  { id: uuidv4(), name: 'Itaú', color: '#f97316' },
  { id: uuidv4(), name: 'Inter', color: '#f59e0b' },
];

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setTransactions([]);
      setGoals([]);
      setSettings(null);
      setLoans([]);
      setHistory([]);
      setCards([]);
      return;
    }

    async function fetchData() {
      // Settings
      const { data: settingsData } = await supabase.from('settings').select('*').eq('user_id', user.id).limit(1);
      if (settingsData && settingsData.length > 0) {
        setSettings({ id: settingsData[0].id, fixedSalary: Number(settingsData[0].fixed_salary), salaryDay: Number(settingsData[0].salary_day) });
      } else {
        const { data: newS } = await supabase.from('settings').insert([{ fixed_salary: 0, salary_day: 5, user_id: user.id }]).select('*');
        if (newS && newS.length > 0) setSettings({ id: newS[0].id, fixedSalary: 0, salaryDay: 5 });
      }

      // Accounts
      const { data: accData } = await supabase.from('accounts').select('*').eq('user_id', user.id);
      if (accData && accData.length > 0) { setAccounts(accData); }
      else { 
        const defaults = getDefaultAccounts();
        setAccounts(defaults); 
        await supabase.from('accounts').insert(defaults.map(a => ({ ...a, user_id: user.id }))); 
      }

      // Transactions
      const { data: txData } = await supabase.from('transactions').select('*').eq('user_id', user.id);
      if (txData) {
        setTransactions(txData.map((t: any) => ({
          id: t.id, accountId: t.account_id, type: t.type,
          amount: Number(t.amount), category: t.category,
          date: t.date, description: t.description, status: t.status || 'paid',
          cardId: t.card_id, installmentCurrent: t.installment_current, installmentTotal: t.installment_total
        })));
      }

      // Goals
      const { data: goalsData } = await supabase.from('goals').select('*').eq('user_id', user.id);
      if (goalsData) {
        setGoals(goalsData.map((g: any) => ({
          id: g.id, name: g.name, targetAmount: Number(g.target_amount),
          currentAmount: Number(g.current_amount), monthlyContribution: Number(g.monthly_contribution),
          annualInterestRate: Number(g.annual_interest_rate), deadline: g.deadline
        })));
      }

      // Loans
      const { data: loansData } = await supabase.from('loans').select('*').eq('user_id', user.id);
      if (loansData) {
        setLoans(loansData.map((l: any) => ({
          id: l.id, name: l.name, bank: l.bank,
          totalAmount: Number(l.total_amount), monthlyPayment: Number(l.monthly_payment),
          annualInterestRate: Number(l.annual_interest_rate), startDate: l.start_date,
          endDate: l.end_date, dueDay: Number(l.due_day), status: l.status
        })));
      }

      // History
      const { data: histData } = await supabase.from('history').select('*').eq('user_id', user.id).order('paid_at', { ascending: false }).limit(200);
      if (histData) {
        setHistory(histData.map((h: any) => ({
          id: h.id, type: h.type, description: h.description,
          amount: Number(h.amount), referenceId: h.reference_id, paidAt: h.paid_at
        })));
      }

      // Cards
      const { data: cardsData } = await supabase.from('cards').select('*').eq('user_id', user.id);
      if (cardsData) {
        setCards(cardsData.map((c: any) => ({
          id: c.id, name: c.name, limitAmount: Number(c.limit_amount),
          closingDay: Number(c.closing_day), dueDay: Number(c.due_day), color: c.color
        })));
      }
    }
    fetchData();
  }, [user]);

  // ---- ACCOUNTS ----
  const addAccount = async (acc: Omit<Account, 'id'>) => {
    const id = uuidv4();
    const newAcc = { ...acc, id };
    setAccounts(prev => [...prev, newAcc]);
    await supabase.from('accounts').insert([{ ...newAcc, user_id: user?.id }]);
  };
  const deleteAccount = async (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    await supabase.from('accounts').delete().eq('id', id).eq('user_id', user?.id);
  };

  // ---- TRANSACTIONS ----
  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const { data } = await supabase.from('transactions').insert([{
      account_id: tx.accountId, type: tx.type, amount: tx.amount,
      category: tx.category, date: tx.date, description: tx.description, status: tx.status || 'paid',
      card_id: tx.cardId, installment_current: tx.installmentCurrent, installment_total: tx.installmentTotal,
      user_id: user?.id
    }]).select('*');
    
    if (data && data[0]) {
      const t = data[0];
      const newTx: Transaction = {
        id: t.id, accountId: t.account_id, type: t.type,
        amount: Number(t.amount), category: t.category, date: t.date,
        description: t.description, status: t.status,
        cardId: t.card_id, installmentCurrent: t.installment_current, installmentTotal: t.installment_total
      };
      setTransactions([...transactions, newTx]);
      return newTx;
    }
    throw new Error('Failed to insert transaction');
  };
  
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const payload: any = {};
    if (updates.accountId) payload.account_id = updates.accountId;
    if (updates.type) payload.type = updates.type;
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.category) payload.category = updates.category;
    if (updates.date) payload.date = updates.date;
    if (updates.description) payload.description = updates.description;
    if (updates.status) payload.status = updates.status;
    if (updates.cardId !== undefined) payload.card_id = updates.cardId;
    if (updates.installmentCurrent !== undefined) payload.installment_current = updates.installmentCurrent;
    if (updates.installmentTotal !== undefined) payload.installment_total = updates.installmentTotal;
    
    await supabase.from('transactions').update(payload).eq('id', id).eq('user_id', user?.id);
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    await supabase.from('transactions').delete().eq('id', id).eq('user_id', user?.id);
  };

  // ---- GOALS ----
  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    const id = uuidv4();
    const newGoal = { ...goal, id };
    setGoals(prev => [...prev, newGoal]);
    await supabase.from('goals').insert([{
      id: newGoal.id, name: newGoal.name, target_amount: newGoal.targetAmount,
      current_amount: newGoal.currentAmount, monthly_contribution: newGoal.monthlyContribution,
      annual_interest_rate: newGoal.annualInterestRate, deadline: newGoal.deadline,
      user_id: user?.id
    }]);
  };
  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    await supabase.from('goals').delete().eq('id', id).eq('user_id', user?.id);
  };
  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.targetAmount !== undefined) payload.target_amount = updates.targetAmount;
    if (updates.currentAmount !== undefined) payload.current_amount = updates.currentAmount;
    if (updates.monthlyContribution !== undefined) payload.monthly_contribution = updates.monthlyContribution;
    if (updates.annualInterestRate !== undefined) payload.annual_interest_rate = updates.annualInterestRate;
    if (updates.deadline) payload.deadline = updates.deadline;

    await supabase.from('goals').update(payload).eq('id', id).eq('user_id', user?.id);
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  // ---- SETTINGS ----
  const updateSettings = async (s: Settings) => {
    setSettings(s);
    if (s.id) await supabase.from('settings').update({ fixed_salary: s.fixedSalary, salary_day: s.salaryDay }).eq('id', s.id).eq('user_id', user?.id);
  };

  // ---- LOANS ----
  const addLoan = async (loan: Omit<Loan, 'id' | 'status'>) => {
    const id = uuidv4();
    const newLoan: Loan = { ...loan, id, status: 'active' };
    setLoans(prev => [...prev, newLoan]);
    await supabase.from('loans').insert([{
      id: newLoan.id, name: newLoan.name, bank: newLoan.bank,
      total_amount: newLoan.totalAmount, monthly_payment: newLoan.monthlyPayment,
      annual_interest_rate: newLoan.annualInterestRate, start_date: newLoan.startDate,
      end_date: newLoan.endDate, due_day: newLoan.dueDay, status: 'active',
      user_id: user?.id
    }]);
  };
  const deleteLoan = async (id: string) => {
    setLoans(prev => prev.filter(l => l.id !== id));
    await supabase.from('loans').delete().eq('id', id).eq('user_id', user?.id);
  };
  const updateLoan = async (id: string, updates: Partial<Loan>) => {
    const payload: any = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.monthlyPayment !== undefined) payload.monthly_payment = updates.monthlyPayment;
    
    await supabase.from('loans').update(payload).eq('id', id).eq('user_id', user?.id);
    setLoans(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  // ---- HISTORY ----
  const addHistoryEntry = async (entry: Omit<HistoryEntry, 'id' | 'paidAt'>) => {
    const id = uuidv4();
    const paidAt = new Date().toISOString();
    const newEntry: HistoryEntry = { ...entry, id, paidAt };
    setHistory(prev => [newEntry, ...prev]);
    await supabase.from('history').insert([{
      id: newEntry.id, type: newEntry.type, description: newEntry.description,
      amount: newEntry.amount, reference_id: newEntry.referenceId || null,
      paid_at: newEntry.paidAt, user_id: user?.id
    }]);
  };

  // ---- BULK PAY ----
  const bulkPayPending = async (amountPaid: number) => {
    const pending = transactions.filter(t => t.status === 'pending');
    for (const p of pending) {
      await updateTransaction(p.id, { status: 'paid' });
    }
    addHistoryEntry({
      type: 'bulk_payment',
      description: 'Pagamento de despesas gerais',
      amount: amountPaid
    });
  };

  // ---- CARDS ----
  const addCard = async (card: Omit<Card, 'id'>) => {
    const id = uuidv4();
    const { data } = await supabase.from('cards').insert([{
      id, name: card.name, limit_amount: card.limitAmount,
      closing_day: card.closingDay, due_day: card.dueDay, color: card.color,
      user_id: user?.id
    }]).select('*');
    if (data && data[0]) {
      const c = data[0];
      const newCard: Card = {
        id: c.id, name: c.name, limitAmount: Number(c.limit_amount),
        closingDay: Number(c.closing_day), dueDay: Number(c.due_day), color: c.color
      };
      setCards([...cards, newCard]);
      return newCard;
    }
    throw new Error('Failed to insert card');
  };

  const updateCard = async (id: string, updates: Partial<Card>) => {
    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.limitAmount !== undefined) payload.limit_amount = updates.limitAmount;
    if (updates.closingDay !== undefined) payload.closing_day = updates.closingDay;
    if (updates.dueDay !== undefined) payload.due_day = updates.dueDay;
    if (updates.color) payload.color = updates.color;
    
    await supabase.from('cards').update(payload).eq('id', id).eq('user_id', user?.id);
    setCards(cards.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCard = async (id: string) => {
    await supabase.from('cards').delete().eq('id', id).eq('user_id', user?.id);
    setCards(cards.filter(c => c.id !== id));
  };

  return (
    <FinanceContext.Provider value={{
      accounts, addAccount, deleteAccount,
      transactions, addTransaction, deleteTransaction, updateTransaction,
      goals, addGoal, deleteGoal, updateGoal,
      settings, updateSettings,
      loans, addLoan, deleteLoan, updateLoan,
      history, addHistoryEntry, bulkPayPending,
      cards, addCard, updateCard, deleteCard
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
}

