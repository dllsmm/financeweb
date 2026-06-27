import React, { useState } from 'react';
import { Category, TransactionType } from '../types';
import LucideIcon from './LucideIcon';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (cat: { name: string; type: TransactionType; icon: string; accentColor: string }) => void;
  onDeleteCategory: (id: string) => void;
}

const PRESET_COLORS = [
  { hex: '#06b6d4', label: 'Cyan', bg: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' },
  { hex: '#f43f5e', label: 'Rose', bg: 'bg-rose-500/20 border-rose-500/50 text-rose-400' },
  { hex: '#10b981', label: 'Emerald', bg: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' },
  { hex: '#eab308', label: 'Amber', bg: 'bg-amber-500/20 border-amber-500/50 text-amber-400' },
  { hex: '#a855f7', label: 'Purple', bg: 'bg-purple-500/20 border-purple-500/50 text-purple-400' },
  { hex: '#6366f1', label: 'Indigo', bg: 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' },
  { hex: '#f97316', label: 'Orange', bg: 'bg-orange-500/20 border-orange-500/50 text-orange-400' },
  { hex: '#84cc16', label: 'Lime', bg: 'bg-lime-500/20 border-lime-500/50 text-lime-400' }
];

const PRESET_ICONS = [
  { char: '💼', name: 'Briefcase' },
  { char: '📈', name: 'TrendingUp' },
  { char: '💻', name: 'Laptop' },
  { char: '🍔', name: 'Utensils' },
  { char: '🏠', name: 'Home' },
  { char: '🛍️', name: 'ShoppingBag' },
  { char: '🚗', name: 'Car' },
  { char: '🎮', name: 'Gamepad2' },
  { char: '🛒', name: 'ShoppingBasket' },
  { char: '💸', name: 'TrendingUp' }, // Generic income fallback
  { char: '💡', name: 'Laptop' }, // Utilities fallback
  { char: '✈️', name: 'Car' }, // Travel fallback
  { char: '🩺', name: 'HeartPulse' }, // Medical fallback
  { char: '🎬', name: 'Gamepad2' } // Movie fallback
];

export default function CategoryManager({ isOpen, onClose, categories, onAddCategory, onDeleteCategory }: CategoryManagerProps) {
  const [activeTab, setActiveTab] = useState<TransactionType>('EXPENSE');
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please provide a category name.');
      return;
    }

    // Check for duplicate name in the same transaction type
    const isDuplicate = categories.some(
      c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.type === activeTab
    );
    if (isDuplicate) {
      setError(`A category named "${trimmedName}" already exists for ${activeTab.toLowerCase()}s.`);
      return;
    }

    // Call callback
    onAddCategory({
      name: trimmedName,
      type: activeTab,
      icon: selectedIcon.name,
      accentColor: selectedColor.hex
    });

    // Reset state
    setName('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-xs">
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Cyberpunk Slide-up Bottom Sheet */}
      <div className="w-full max-w-md rounded-t-3xl border-t border-white/10 bg-[#0a0a12] p-6 shadow-[0_-10px_40px_-15px_rgba(0,242,255,0.15)] transition-transform duration-300 animate-slide-up pb-8 max-h-[92vh] overflow-y-auto">
        <div className="mx-auto -mt-2 mb-4 h-1 w-12 rounded-full bg-white/10" onClick={onClose} />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            <LucideIcon name="Grid" size={18} className="text-[#00f2ff]" />
            Category Manager
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-slate-100"
          >
            <LucideIcon name="X" size={14} />
          </button>
        </div>

        {/* Categories Tab Toggle */}
        <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('EXPENSE');
              setError('');
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold tracking-wide transition-all ${
              activeTab === 'EXPENSE'
                ? 'bg-gradient-to-r from-rose-500/15 to-rose-600/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_-2px_rgba(244,63,94,0.15)]'
                : 'text-zinc-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Expenses
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('INCOME');
              setError('');
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold tracking-wide transition-all ${
              activeTab === 'INCOME'
                ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_-2px_rgba(16,185,129,0.15)]'
                : 'text-zinc-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Income
          </button>
        </div>

        {/* Existing Categories List */}
        <div className="mb-6">
          <h4 className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-2.5 font-mono">
            Active {activeTab === 'EXPENSE' ? 'Expense' : 'Income'} Categories ({categories.filter(c => c.type === activeTab).length})
          </h4>
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {categories
              .filter(c => c.type === activeTab)
              .map(cat => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-[#0a0a12]/60 p-2.5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Render Category Icon badge with custom styling classes */}
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                      <LucideIcon name={cat.icon} size={13} className={cat.color.split(' ').pop()} />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-all active:scale-95"
                    title="Delete Category"
                  >
                    <LucideIcon name="Trash2" size={13} />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Create Form */}
        <form onSubmit={handleAdd} className="border-t border-white/10 pt-4.5">
          <h4 className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-3 font-mono">
            Create Custom Category
          </h4>

          {error && (
            <div className="mb-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-2.5 text-[10px] text-rose-400 flex items-center gap-1.5">
              <LucideIcon name="Info" size={12} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {/* Name input */}
            <div>
              <input
                type="text"
                placeholder="Category Name (e.g., Tech Subscriptions, Cafe)"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={25}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-xs text-slate-100 placeholder-zinc-700 focus:border-[#00f2ff]/40 focus:outline-none transition-all"
              />
            </div>

            {/* Icon Picker preset row */}
            <div>
              <span className="block text-[9px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 font-mono">
                Select Badge Symbol
              </span>
              <div className="grid grid-cols-7 gap-1.5 rounded-xl bg-[#0a0a12] border border-white/10 p-2 max-h-[85px] overflow-y-auto">
                {PRESET_ICONS.map((ico, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIcon(ico)}
                    className={`h-8 rounded-lg flex items-center justify-center text-sm transition-all border ${
                      selectedIcon.char === ico.char
                        ? 'bg-white/10 border-[#00f2ff]/50 scale-105'
                        : 'border-transparent hover:bg-white/5'
                    }`}
                  >
                    {ico.char}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Accent Picker preset row */}
            <div>
              <span className="block text-[9px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 font-mono">
                Select Cyber Accent Color
              </span>
              <div className="flex gap-2.5 overflow-x-auto py-1 pr-1">
                {PRESET_COLORS.map((col, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: col.hex }}
                  >
                    {selectedColor.hex === col.hex && (
                      <span className="absolute inset-0 rounded-full border-2 border-white scale-110 shadow-[0_0_10px_2px_rgba(255,255,255,0.3)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Action Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-tr from-[#00f2ff] to-[#7000ff] py-2.5 text-xs font-bold tracking-wide text-white hover:opacity-90 active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(0,242,255,0.2)] flex items-center justify-center gap-1.5"
            >
              <LucideIcon name="PlusCircle" size={13} />
              Create Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
