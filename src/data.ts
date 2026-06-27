import { Category, Transaction } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Income Categories
  {
    id: 'inc-salary',
    name: 'Salary',
    type: 'INCOME',
    icon: 'Briefcase',
    color: 'from-emerald-500/20 to-teal-500/30 border-emerald-500/50 text-emerald-400',
    accentColor: '#10b981'
  },
  {
    id: 'inc-freelance',
    name: 'Freelance',
    type: 'INCOME',
    icon: 'Laptop',
    color: 'from-cyan-500/20 to-blue-500/30 border-cyan-500/50 text-cyan-400',
    accentColor: '#06b6d4'
  },
  {
    id: 'inc-investment',
    name: 'Investments',
    type: 'INCOME',
    icon: 'TrendingUp',
    color: 'from-violet-500/20 to-indigo-500/30 border-violet-500/50 text-violet-400',
    accentColor: '#8b5cf6'
  },
  
  // Expense Categories
  {
    id: 'exp-food',
    name: 'Dining & Food',
    type: 'EXPENSE',
    icon: 'Utensils',
    color: 'from-rose-500/20 to-pink-500/30 border-rose-500/50 text-rose-400',
    accentColor: '#f43f5e'
  },
  {
    id: 'exp-rent',
    name: 'Home & Rent',
    type: 'EXPENSE',
    icon: 'Home',
    color: 'from-indigo-500/20 to-blue-500/30 border-indigo-500/50 text-indigo-400',
    accentColor: '#6366f1'
  },
  {
    id: 'exp-shopping',
    name: 'Shopping',
    type: 'EXPENSE',
    icon: 'ShoppingBag',
    color: 'from-fuchsia-500/20 to-pink-500/30 border-fuchsia-500/50 text-fuchsia-400',
    accentColor: '#d946ef'
  },
  {
    id: 'exp-transport',
    name: 'Transport',
    type: 'EXPENSE',
    icon: 'Car',
    color: 'from-amber-500/20 to-orange-500/30 border-amber-500/50 text-amber-400',
    accentColor: '#f59e0b'
  },
  {
    id: 'exp-entertainment',
    name: 'Entertainment',
    type: 'EXPENSE',
    icon: 'Gamepad2',
    color: 'from-purple-500/20 to-violet-500/30 border-purple-500/50 text-purple-400',
    accentColor: '#a855f7'
  },
  {
    id: 'exp-groceries',
    name: 'Groceries',
    type: 'EXPENSE',
    icon: 'ShoppingBasket',
    color: 'from-lime-500/20 to-emerald-500/30 border-lime-500/50 text-lime-400',
    accentColor: '#84cc16'
  }
];

// Helper to get formatted dates relative to today
const getPastDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    amount: 145000,
    type: 'INCOME',
    categoryId: 'inc-salary',
    description: 'Monthly Prime Salary Credited',
    date: getPastDate(12)
  },
  {
    id: 'tx-2',
    amount: 25000,
    type: 'INCOME',
    categoryId: 'inc-freelance',
    description: 'Web Development Client Payment',
    date: getPastDate(8)
  },
  {
    id: 'tx-3',
    amount: 32000,
    type: 'EXPENSE',
    categoryId: 'exp-rent',
    description: 'Luxury Highrise Rent Auto-debit',
    date: getPastDate(10)
  },
  {
    id: 'tx-4',
    amount: 4500,
    type: 'EXPENSE',
    categoryId: 'exp-food',
    description: 'Premium Cyber-Sushi Dinner with Team',
    date: getPastDate(6)
  },
  {
    id: 'tx-5',
    amount: 12800,
    type: 'EXPENSE',
    categoryId: 'exp-shopping',
    description: 'Mechanical Ergonomic Keyboard',
    date: getPastDate(4)
  },
  {
    id: 'tx-6',
    amount: 1800,
    type: 'EXPENSE',
    categoryId: 'exp-transport',
    description: 'High-speed Cab Transit to Airport',
    date: getPastDate(2)
  },
  {
    id: 'tx-7',
    amount: 3500,
    type: 'EXPENSE',
    categoryId: 'exp-entertainment',
    description: 'VR Arcade & Retro Consoles Ticket',
    date: getPastDate(1)
  },
  {
    id: 'tx-8',
    amount: 15000,
    type: 'INCOME',
    categoryId: 'inc-investment',
    description: 'Stock Portfolio Dividend Earned',
    date: getPastDate(0)
  },
  {
    id: 'tx-9',
    amount: 5200,
    type: 'EXPENSE',
    categoryId: 'exp-groceries',
    description: 'Organic Cold-press Foods & Supermarket',
    date: getPastDate(0)
  }
];
