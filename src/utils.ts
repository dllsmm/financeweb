import { Transaction, Category } from './types';

// Format currency in Indian Rupees format (e.g., ₹1,50,000)
export const formatINR = (amount: number): string => {
  // Format as INR and strip decimal points if they are zero for premium display
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

// LocalStorage helpers
export const storage = {
  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem('financier_transactions');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading transactions from localStorage', e);
      return [];
    }
  },
  
  saveTransactions: (txs: Transaction[]) => {
    try {
      localStorage.setItem('financier_transactions', JSON.stringify(txs));
    } catch (e) {
      console.error('Error saving transactions to localStorage', e);
    }
  },

  getCategories: (): Category[] => {
    try {
      const data = localStorage.getItem('financier_categories');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading categories from localStorage', e);
      return [];
    }
  },

  saveCategories: (cats: Category[]) => {
    try {
      localStorage.setItem('financier_categories', JSON.stringify(cats));
    } catch (e) {
      console.error('Error saving categories to localStorage', e);
    }
  }
};
