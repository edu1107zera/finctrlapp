export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'paid' | 'pending';

export interface Account {
  id: string;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO date string
  description: string;
  status?: TransactionStatus;
  cardId?: string | null;
  installmentCurrent?: number;
  installmentTotal?: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  annualInterestRate: number; // e.g., 10 for 10%
  deadline: string; // ISO date string
}

export interface Settings {
  id?: string;
  fixedSalary: number;
  salaryDay: number;
}

export interface Loan {
  id: string;
  name: string;
  bank: string;
  totalAmount: number;
  monthlyPayment: number;
  annualInterestRate: number;
  startDate: string;
  endDate: string;
  dueDay: number; // day of month (1-31)
  status: 'active' | 'paid_off';
}

export interface HistoryEntry {
  id: string;
  type: 'transaction' | 'loan_payment' | 'bulk_payment';
  description: string;
  amount: number;
  referenceId?: string;
  paidAt: string; // ISO string
}

export interface Card {
  id: string;
  name: string;
  limitAmount: number;
  closingDay: number;
  dueDay: number;
  color: string;
}
