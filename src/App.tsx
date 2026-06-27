import React, { useState, useMemo } from 'react';
import { TabType, Transaction, Category } from './types';
import { DEFAULT_CATEGORIES, SEED_TRANSACTIONS } from './data';
import { storage, formatINR } from './utils';

// Import Custom Sub-components
import MetricCard from './components/MetricCard';
import CustomChart from './components/CustomChart';
import TransactionForm from './components/TransactionForm';
import CategoryManager from './components/CategoryManager';
import TransactionList from './components/TransactionList';
import LucideIcon from './components/LucideIcon';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');

  // Load Transactions & Categories from LocalStorage (with fallback seeds)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const local = storage.getTransactions();
    if (local.length > 0) return local;
    storage.saveTransactions(SEED_TRANSACTIONS);
    return SEED_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const local = storage.getCategories();
    if (local.length > 0) return local;
    storage.saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  });

  // Bottom Sheet/Modal States
  const [isTxFormOpen, setIsTxFormOpen] = useState(false);
  const [isCatMgrOpen, setIsCatMgrOpen] = useState(false);

  // FINANCIAL CALCULATION ENGINE
  const metrics = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      totalBalance: totalIncome - totalExpense
    };
  }, [transactions]);

  // Welcome Greeting based on current hours
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  }, []);

  // CORE HANDLERS
  const handleAddTransaction = (newTxData: {
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    categoryId: string;
    description: string;
    date: string;
  }) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...newTxData
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    storage.saveTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    storage.saveTransactions(updated);
  };

  const handleAddCategory = (newCatData: {
    name: string;
    type: 'INCOME' | 'EXPENSE';
    icon: string;
    accentColor: string;
  }) => {
    // Generate beautiful border and text colors from hex index mapping
    const classes = [
      'from-cyan-500/10 to-cyan-600/15 border-cyan-500/30 text-cyan-400',
      'from-rose-500/10 to-rose-600/15 border-rose-500/30 text-rose-400',
      'from-emerald-500/10 to-emerald-600/15 border-emerald-500/30 text-emerald-400',
      'from-amber-500/10 to-amber-600/15 border-amber-500/30 text-amber-400',
      'from-purple-500/10 to-purple-600/15 border-purple-500/30 text-purple-400',
      'from-indigo-500/10 to-indigo-600/15 border-indigo-500/30 text-indigo-400',
      'from-orange-500/10 to-orange-600/15 border-orange-500/30 text-orange-400',
      'from-lime-500/10 to-lime-600/15 border-lime-500/30 text-lime-400'
    ];

    // Pick dynamic matching style
    const colors = {
      '#06b6d4': classes[0],
      '#f43f5e': classes[1],
      '#10b981': classes[2],
      '#eab308': classes[3],
      '#a855f7': classes[4],
      '#6366f1': classes[5],
      '#f97316': classes[6],
      '#84cc16': classes[7],
    };

    const colorClass = colors[newCatData.accentColor as keyof typeof colors] || classes[0];

    const newCat: Category = {
      id: `cat-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      name: newCatData.name,
      type: newCatData.type,
      icon: newCatData.icon,
      color: colorClass,
      accentColor: newCatData.accentColor
    };

    const updated = [...categories, newCat];
    setCategories(updated);
    storage.saveCategories(updated);
  };

  const handleDeleteCategory = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    storage.saveCategories(updated);
  };

  // Get most spent category of current period for premium insights
  const spendingInsights = useMemo(() => {
    const expenseTxs = transactions.filter(t => t.type === 'EXPENSE');
    if (expenseTxs.length === 0) return null;

    const dataMap: Record<string, number> = {};
    expenseTxs.forEach(t => {
      dataMap[t.categoryId] = (dataMap[t.categoryId] || 0) + t.amount;
    });

    const entries = Object.entries(dataMap).sort((a, b) => b[1] - a[1]);
    const topCatId = entries[0][0];
    const topCatAmount = entries[0][1];
    
    const cat = categories.find(c => c.id === topCatId);
    const totalExpenses = metrics.totalExpense;
    const ratio = totalExpenses > 0 ? (topCatAmount / totalExpenses) * 100 : 0;

    return {
      categoryName: cat ? cat.name : 'Other Outflows',
      amount: topCatAmount,
      percentage: ratio
    };
  }, [transactions, categories, metrics]);

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center py-0 md:py-8 overflow-hidden text-white font-sans">
      {/* Background radial glowing grid for deep Cyberpunk layout */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#0a0a12_1px,transparent_1px),linear-gradient(to_bottom,#0a0a12_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
      <div className="absolute -left-[10%] -top-[10%] -z-10 h-[500px] w-[500px] rounded-full bg-[#00f2ff]/5 blur-[120px]" />
      <div className="absolute -right-[10%] -bottom-[10%] -z-10 h-[500px] w-[500px] rounded-full bg-[#7000ff]/5 blur-[120px]" />

      {/* Main Native Phone Frame Shell on Desktop, standalone full-screen on Mobile */}
      <div className="w-full max-w-md md:w-[375px] md:h-[720px] bg-[#0a0a12] md:rounded-[48px] md:border-[12px] md:border-[#1c1c24] flex flex-col overflow-hidden relative shadow-[0_0_80px_rgba(0,242,255,0.15)] border-transparent">
        
        {/* iOS status bar simulator on Desktop */}
        <div className="hidden md:flex pt-4 px-8 justify-between items-center opacity-60 text-[12px] font-medium select-none z-40">
          <span>9:41</span>
          <div className="flex gap-1.5">
            <span>5G</span>
            <div className="w-5 h-2.5 border border-white/40 rounded-sm"></div>
          </div>
        </div>

        {/* Scrollable Container inside Phone view */}
        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-24 max-h-full scrollbar-none">
          
          {/* RENDER VIEW ACCORDING TO ACTIVATED TAB */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-5 animate-fade-in">
              {/* Header Profile Greeting Row */}
              <div className="flex items-center justify-between">
                <div>
                  <MetricCard
                    title="Total Portfolio"
                    amount={metrics.totalBalance}
                    type="balance"
                    subtext={`Month savings: ${formatINR(metrics.totalIncome - metrics.totalExpense)}`}
                  />
                </div>
                {/* Premium avatar profile icon badge */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00f2ff] to-[#7000ff] p-[1px] shrink-0">
                  <div className="w-full h-full rounded-full bg-[#0a0a12] flex items-center justify-center">
                    <span className="text-base select-none">🪙</span>
                  </div>
                </div>
              </div>

              {/* Grid for Income vs Expense */}
              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  title="Monthly Income"
                  amount={metrics.totalIncome}
                  type="income"
                />
                <MetricCard
                  title="Monthly Spend"
                  amount={metrics.totalExpense}
                  type="expense"
                />
              </div>

              {/* Interactive Balance Spline Trend Chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Spending Trends</h2>
                  <span className="text-[10px] px-2.5 py-1 bg-white/10 rounded-full font-bold uppercase tracking-wide text-zinc-400">Last 7 Days</span>
                </div>
                <CustomChart transactions={transactions} categories={categories} />
              </div>

              {/* Recent Ledger Entries Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                    Recent History
                  </h3>
                  <button
                    onClick={() => setActiveTab('HISTORY')}
                    className="text-[10px] text-[#00f2ff] uppercase font-bold hover:opacity-80 transition-opacity"
                  >
                    See All
                  </button>
                </div>

                <TransactionList
                  transactions={transactions}
                  categories={categories}
                  onDeleteTransaction={handleDeleteTransaction}
                  limit={3}
                />
              </div>
            </div>
          )}

          {activeTab === 'ANALYTICS' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase font-mono">
                  Advanced Insights
                </p>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-100 font-sans mt-0.5">
                  Financial Analytics
                </h2>
              </div>

              {/* Detailed Breakdown Chart configured directly to CATEGORIES Breakdown */}
              <CustomChart transactions={transactions} categories={categories} />

              {/* Premium Spending Insight Card */}
              {spendingInsights ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 space-y-2 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-rose-400">
                    <LucideIcon name="TrendingDown" size={16} />
                    <h4 className="text-xs font-bold uppercase tracking-wider font-sans">
                      Critical Outflow Alert
                    </h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-300">
                    Your highest spending occurred in <span className="text-rose-400 font-bold font-sans">{spendingInsights.categoryName}</span>, consuming <span className="font-bold text-white font-mono">{spendingInsights.percentage.toFixed(0)}%</span> of your total monthly outflows, totaling <span className="font-bold font-sans text-rose-400">{formatINR(spendingInsights.amount)}</span>.
                  </p>
                  <div className="flex h-1.5 w-full rounded-full bg-white/5 overflow-hidden mt-1 border border-white/10">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${spendingInsights.percentage}%` }} />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 text-center text-zinc-500">
                  <LucideIcon name="Info" size={18} className="mx-auto mb-1.5 text-zinc-600" />
                  <p className="text-xs">No expense metrics logged to compute spending highlights.</p>
                </div>
              )}

              {/* Summary Stats Overview */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3 backdrop-blur-md">
                <h4 className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase font-mono">
                  Financial Health Checklist
                </h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <LucideIcon name="ArrowDownLeft" size={12} className="text-emerald-400" />
                      Net Monthly Inflows
                    </span>
                    <span className="font-bold text-emerald-400 font-sans">{formatINR(metrics.totalIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <LucideIcon name="ArrowUpRight" size={12} className="text-rose-400" />
                      Net Monthly Outflows
                    </span>
                    <span className="font-bold text-rose-400 font-sans">{formatINR(metrics.totalExpense)}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Monthly Retention Ratio</span>
                    <span className="font-bold text-slate-200 font-sans">
                      {metrics.totalIncome > 0
                        ? `${((metrics.totalBalance / metrics.totalIncome) * 100).toFixed(0)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CATEGORIES' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase font-mono">
                    Organizer Workspace
                  </p>
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-100 font-sans mt-0.5">
                    Category Dashboard
                  </h2>
                </div>
                <button
                  onClick={() => setIsCatMgrOpen(true)}
                  className="rounded-xl border border-[#00f2ff]/30 bg-[#00f2ff]/5 px-3 py-1.5 text-[10px] font-bold text-[#00f2ff] hover:bg-[#00f2ff]/10 transition-all flex items-center gap-1 active:scale-95"
                >
                  <LucideIcon name="Settings" size={12} />
                  Manage
                </button>
              </div>

              {/* Interactive Categories list display with dynamic counts */}
              <div className="space-y-4">
                {/* Expense Categories */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase px-1 font-mono">
                    Expense Outlets ({categories.filter(c => c.type === 'EXPENSE').length})
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {categories
                      .filter(c => c.type === 'EXPENSE')
                      .map((cat) => {
                        const count = transactions.filter(t => t.categoryId === cat.id).length;
                        const sum = transactions
                           .filter(t => t.categoryId === cat.id)
                           .reduce((s, t) => s + t.amount, 0);

                        return (
                          <div
                            key={cat.id}
                            className="rounded-2xl border border-white/5 bg-white/5 p-3.5 space-y-1.5 transition-all hover:border-white/10 hover:bg-white/10"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#0a0a12]">
                                <LucideIcon name={cat.icon} size={13} className={cat.color.split(' ').pop()} />
                              </div>
                              <span className="text-[8px] font-mono text-zinc-500 uppercase">
                                {count} {count === 1 ? 'log' : 'logs'}
                              </span>
                            </div>
                            <div>
                              <h5 className="text-[11px] font-bold text-slate-200">{cat.name}</h5>
                              <p className="text-xs font-semibold text-rose-400 font-sans mt-0.5">{formatINR(sum)}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Income Categories */}
                <div className="space-y-2 pt-1">
                  <h4 className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase px-1 font-mono">
                    Income Streams ({categories.filter(c => c.type === 'INCOME').length})
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {categories
                      .filter(c => c.type === 'INCOME')
                      .map((cat) => {
                        const count = transactions.filter(t => t.categoryId === cat.id).length;
                        const sum = transactions
                          .filter(t => t.categoryId === cat.id)
                          .reduce((s, t) => s + t.amount, 0);

                        return (
                          <div
                            key={cat.id}
                            className="rounded-2xl border border-white/5 bg-white/5 p-3.5 space-y-1.5 transition-all hover:border-white/10 hover:bg-white/10"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#0a0a12]">
                                <LucideIcon name={cat.icon} size={13} className={cat.color.split(' ').pop()} />
                              </div>
                              <span className="text-[8px] font-mono text-zinc-500 uppercase">
                                {count} {count === 1 ? 'log' : 'logs'}
                              </span>
                            </div>
                            <div>
                              <h5 className="text-[11px] font-bold text-slate-200">{cat.name}</h5>
                              <p className="text-xs font-semibold text-emerald-400 font-sans mt-0.5">{formatINR(sum)}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase font-mono">
                  Consolidated Ledger
                </p>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-100 font-sans mt-0.5">
                  Ledger History
                </h2>
              </div>

              {/* Complete transactional ledger lists with full searching/sorting filters */}
              <TransactionList
                transactions={transactions}
                categories={categories}
                onDeleteTransaction={handleDeleteTransaction}
                showFilters={true}
              />
            </div>
          )}

        </div>

        {/* Dynamic Glowing Floating Plus (Transaction trigger) sitting above bottom nav bar */}
        <div className="absolute bottom-[40px] left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => setIsTxFormOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00f2ff] to-[#7000ff] border border-white/10 text-white shadow-lg shadow-[#00f2ff]/20 rotate-45 active:scale-90 hover:scale-105 transition-all duration-200 select-none cursor-pointer"
            title="Log New Transaction"
          >
            <div className="-rotate-45 text-2xl font-light">
              <LucideIcon name="Plus" size={20} />
            </div>
          </button>
        </div>

        {/* Sleek, Native Glassmorphic Bottom Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[72px] bg-[#0d0d17]/80 backdrop-blur-xl border-t border-white/10 px-4 flex items-center justify-between pb-safe z-20">
          
          {/* TAB 1: DASHBOARD */}
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex flex-col items-center justify-center w-14 transition-all ${
              activeTab === 'DASHBOARD' ? 'text-[#00f2ff] scale-105 font-bold' : 'text-zinc-500 hover:text-slate-300'
            }`}
          >
            {activeTab === 'DASHBOARD' ? (
              <div className="w-1 h-1 rounded-full bg-[#00f2ff] mb-1" />
            ) : (
              <div className="w-1 h-1 mb-1 opacity-0" />
            )}
            <LucideIcon name="LayoutDashboard" size={17} />
            <span className="text-[8px] tracking-wide mt-1 font-mono uppercase">Home</span>
          </button>

          {/* TAB 2: ANALYTICS */}
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`flex flex-col items-center justify-center w-14 transition-all ${
              activeTab === 'ANALYTICS' ? 'text-[#00f2ff] scale-105 font-bold' : 'text-zinc-500 hover:text-slate-300'
            }`}
          >
            {activeTab === 'ANALYTICS' ? (
              <div className="w-1 h-1 rounded-full bg-[#00f2ff] mb-1" />
            ) : (
              <div className="w-1 h-1 mb-1 opacity-0" />
            )}
            <LucideIcon name="TrendingUp" size={17} />
            <span className="text-[8px] tracking-wide mt-1 font-mono uppercase">Charts</span>
          </button>

          {/* Spacer for floating absolute central add trigger */}
          <div className="w-14" />

          {/* TAB 3: CATEGORIES */}
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`flex flex-col items-center justify-center w-14 transition-all ${
              activeTab === 'CATEGORIES' ? 'text-[#00f2ff] scale-105 font-bold' : 'text-zinc-500 hover:text-slate-300'
            }`}
          >
            {activeTab === 'CATEGORIES' ? (
              <div className="w-1 h-1 rounded-full bg-[#00f2ff] mb-1" />
            ) : (
              <div className="w-1 h-1 mb-1 opacity-0" />
            )}
            <LucideIcon name="Grid" size={17} />
            <span className="text-[8px] tracking-wide mt-1 font-mono uppercase">Outlets</span>
          </button>

          {/* TAB 4: HISTORY */}
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex flex-col items-center justify-center w-14 transition-all ${
              activeTab === 'HISTORY' ? 'text-[#00f2ff] scale-105 font-bold' : 'text-zinc-500 hover:text-slate-300'
            }`}
          >
            {activeTab === 'HISTORY' ? (
              <div className="w-1 h-1 rounded-full bg-[#00f2ff] mb-1" />
            ) : (
              <div className="w-1 h-1 mb-1 opacity-0" />
            )}
            <LucideIcon name="History" size={17} />
            <span className="text-[8px] tracking-wide mt-1 font-mono uppercase">Ledger</span>
          </button>
        </div>

        {/* BOTTOM SHEET SLIDE-UP MODALS */}
        <TransactionForm
          isOpen={isTxFormOpen}
          onClose={() => setIsTxFormOpen(false)}
          categories={categories}
          onSave={handleAddTransaction}
        />

        <CategoryManager
          isOpen={isCatMgrOpen}
          onClose={() => setIsCatMgrOpen(false)}
          categories={categories}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />

      </div>
    </div>
  );
}
