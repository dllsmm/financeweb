export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string; // Name of Lucide icon or emoji character
  color: string; // CSS color or Tailwind class name
  accentColor: string; // Hex color for SVG drawing and border glows (e.g., #06b6d4)
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string; // Refers to Category.id
  description: string;
  date: string; // 'YYYY-MM-DD'
}

export type TabType = 'DASHBOARD' | 'ANALYTICS' | 'CATEGORIES' | 'HISTORY';

export interface DashboardMetrics {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}
