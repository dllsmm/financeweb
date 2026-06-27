import React, { useState, useEffect } from 'react';
import { Category, TransactionType } from '../types';
import LucideIcon from './LucideIcon';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (data: {
    amount: number;
    type: TransactionType;
    categoryId: string;
    description: string;
    date: string;
  }) => void;
}

export default function TransactionForm({ isOpen, onClose, categories, onSave }: TransactionFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(c => c.type === type);

  // Set default values when modal opens or type changes
  useEffect(() => {
    if (isOpen) {
      setError('');
      // Default to today
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      
      // Auto select first category in the filtered list
      const filtered = categories.filter(c => c.type === type);
      if (filtered.length > 0) {
        setCategoryId(filtered[0].id);
      } else {
        setCategoryId('');
      }
    }
  }, [isOpen, type, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    // Call onSave
    onSave({
      amount: parsedAmount,
      type,
      categoryId,
      description: description.trim() || categories.find(c => c.id === categoryId)?.name || 'Transaction',
      date
    });

    // Reset fields
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-xs">
      {/* Tap-outside background overlay */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Cyberpunk Slide-up Bottom Sheet (Native feel) */}
      <div className="w-full max-w-md rounded-t-3xl border-t border-white/10 bg-[#0a0a12] p-6 shadow-[0_-10px_40px_-15px_rgba(0,242,255,0.15)] transition-transform duration-300 animate-slide-up pb-8 max-h-[92vh] overflow-y-auto">
        {/* Handle bar for native feel */}
        <div className="mx-auto -mt-2 mb-4 h-1 w-12 rounded-full bg-white/10" onClick={onClose} />

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            <LucideIcon name="PlusCircle" size={18} className="text-[#00f2ff]" />
            Add Transaction
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-slate-100"
          >
            <LucideIcon name="X" size={14} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400 flex items-center gap-2">
            <LucideIcon name="Info" size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount field (glowing, large) */}
          <div>
            <label className="block text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-1.5 font-mono">
              Amount (INR ₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-500">₹</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-8 pr-4 font-sans text-xl font-bold text-slate-100 placeholder-zinc-700 focus:border-[#00f2ff]/50 focus:shadow-[0_0_15px_-3px_rgba(0,242,255,0.15)] focus:outline-none transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Type Toggle Tabs */}
          <div>
            <label className="block text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-1.5 font-mono">
              Transaction Type
            </label>
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`flex-1 rounded-lg py-2.5 text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                  type === 'EXPENSE'
                    ? 'bg-gradient-to-r from-rose-500/15 to-rose-600/10 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_-2px_rgba(244,63,94,0.15)]'
                    : 'text-zinc-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <LucideIcon name="ArrowUpRight" size={14} />
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`flex-1 rounded-lg py-2.5 text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                  type === 'INCOME'
                    ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_-2px_rgba(16,185,129,0.15)]'
                    : 'text-zinc-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <LucideIcon name="ArrowDownLeft" size={14} />
                Income
              </button>
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-1.5 font-mono">
              Category
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <LucideIcon name="Tag" size={14} />
              </div>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-xs font-medium text-slate-100 focus:border-[#00f2ff]/50 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                {filteredCategories.length === 0 ? (
                  <option value="" disabled>No categories. Create one first!</option>
                ) : (
                  filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-[#0a0a12] text-slate-100">
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[8px] font-mono">
                ▼
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-1.5 font-mono">
              Description / Notes
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <LucideIcon name="FileText" size={14} />
              </div>
              <input
                type="text"
                placeholder="Rent payment, Groceries, freelance project..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-zinc-700 focus:border-[#00f2ff]/50 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-1.5 font-mono">
              Transaction Date
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                <LucideIcon name="Calendar" size={14} />
              </div>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-xs text-slate-100 focus:border-[#00f2ff]/50 focus:outline-none transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-tr from-[#00f2ff] to-[#7000ff] py-3.5 text-xs font-bold tracking-wide text-white hover:opacity-90 active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(0,242,255,0.2)] flex items-center justify-center gap-2 mt-2"
          >
            <LucideIcon name="Plus" size={14} />
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
