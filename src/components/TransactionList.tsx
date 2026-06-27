import React, { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { formatINR } from '../utils';
import LucideIcon from './LucideIcon';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDeleteTransaction: (id: string) => void;
  limit?: number;
  showFilters?: boolean;
}

export default function TransactionList({
  transactions,
  categories,
  onDeleteTransaction,
  limit,
  showFilters = false
}: TransactionListProps) {
  // Filter states
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [catFilter, setCatFilter] = useState('ALL');

  // Helper to format date into "Today", "Yesterday", or "DD MMM, YYYY"
  const formatTransactionDate = (dateStr: string): string => {
    const today = new Date().toISOString().split('T')[0];
    
    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterday = yesterdayObj.toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';

    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter and sort transactions
  const processedTransactions = useMemo(() => {
    let list = [...transactions];

    // Sort by date descending, then ID descending (newest first)
    list.sort((a, b) => {
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      return b.id.localeCompare(a.id);
    });

    if (showFilters) {
      // Apply Search Filter
      if (search.trim()) {
        const query = search.toLowerCase();
        list = list.filter(t => t.description.toLowerCase().includes(query));
      }

      // Apply Type Filter
      if (typeFilter !== 'ALL') {
        list = list.filter(t => t.type === typeFilter);
      }

      // Apply Category Filter
      if (catFilter !== 'ALL') {
        list = list.filter(t => t.categoryId === catFilter);
      }
    }

    // Apply Limit (if specified)
    if (limit && limit > 0) {
      list = list.slice(0, limit);
    }

    return list;
  }, [transactions, search, typeFilter, catFilter, showFilters, limit]);

  return (
    <div className="space-y-3">
      {/* Search & Filters block (Only visible on History Tab) */}
      {showFilters && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2.5 shadow-md backdrop-blur-md">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <LucideIcon name="Search" size={13} />
            </span>
            <input
              type="text"
              placeholder="Search descriptions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-8.5 pr-3 text-xs text-slate-100 placeholder-zinc-500 focus:border-[#00f2ff]/40 focus:outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-slate-100 text-[10px]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Toggle & Category dropdown row */}
          <div className="grid grid-cols-2 gap-2">
            {/* Type selector */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-3 pr-8 text-[11px] font-medium text-slate-300 focus:border-[#00f2ff]/40 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0a0a12]">All Types</option>
                <option value="EXPENSE" className="bg-[#0a0a12]">Expenses</option>
                <option value="INCOME" className="bg-[#0a0a12]">Income</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[6px]">
                ▼
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-3 pr-8 text-[11px] font-medium text-slate-300 focus:border-[#00f2ff]/40 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0a0a12]">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-[#0a0a12]">
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[6px]">
                ▼
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction List Entries */}
      <div className="space-y-2">
        {processedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500 rounded-2xl border border-dashed border-white/10 bg-white/5">
            <LucideIcon name="Info" size={24} className="text-zinc-600 mb-2" />
            <p className="text-xs font-medium">No transactions found</p>
            <p className="text-[10px] text-zinc-600 mt-1">Tap the "+" button below to log something.</p>
          </div>
        ) : (
          processedTransactions.map((tx) => {
            // Locate category or fall back gracefully
            const cat = categories.find(c => c.id === tx.categoryId) || {
              name: 'Other / Custom',
              icon: tx.type === 'INCOME' ? 'Briefcase' : 'Tag',
              color: tx.type === 'INCOME'
                ? 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/20 text-emerald-400'
                : 'from-rose-500/10 to-rose-600/10 border-rose-500/20 text-rose-400',
              accentColor: tx.type === 'INCOME' ? '#10b981' : '#f43f5e'
            };

            const isIncome = tx.type === 'INCOME';

            return (
              <div
                key={tx.id}
                className="group relative flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-3 transition-all duration-300 hover:border-white/10 hover:bg-white/10 shadow-xs"
              >
                {/* Left Side: Icon & Title/Date */}
                <div className="flex items-center gap-3">
                  {/* Glowing Icon Badge */}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl border"
                    style={{
                      borderColor: `${cat.accentColor}30`,
                      background: `radial-gradient(circle, ${cat.accentColor}15 0%, ${cat.accentColor}05 100%)`
                    }}
                  >
                    <LucideIcon name={cat.icon} size={15} className={cat.color.split(' ').pop()} />
                  </div>

                  {/* Title & relative date */}
                  <div>
                    <h5 className="text-sm font-medium text-slate-100 line-clamp-1">
                      {tx.description}
                    </h5>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-zinc-400">
                        {cat.name}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-white/20" />
                      <span className="text-[10px] font-mono text-zinc-500">
                        {formatTransactionDate(tx.date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Amount & Delete Button */}
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span
                      className={`font-sans text-sm font-bold ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatINR(tx.amount)}
                    </span>
                  </div>

                  {/* Direct Delete Trigger */}
                  <button
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400 transition-all active:scale-95"
                    title="Delete Entry"
                  >
                    <LucideIcon name="Trash2" size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
