import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '../types';
import { formatINR } from '../utils';
import LucideIcon from './LucideIcon';

interface CustomChartProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function CustomChart({ transactions, categories }: CustomChartProps) {
  const [chartType, setChartType] = useState<'TREND' | 'CATEGORIES'>('TREND');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // 1. DATA PREPARATION FOR TREND LINE CHART (Last 7 Days)
  const trendData = useMemo(() => {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    let runningBalance = 0;
    // Calculate initial running balance for transactions before these 7 days
    const oldestDateInChart = dates[0];
    const previousTransactions = transactions.filter(t => t.date < oldestDateInChart);
    
    const preIncome = previousTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const preExpense = previousTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    runningBalance = preIncome - preExpense;

    return dates.map((date) => {
      // Net change for this specific day
      const dayTxs = transactions.filter(t => t.date === date);
      const dayIncome = dayTxs.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
      const dayExpense = dayTxs.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
      
      runningBalance += (dayIncome - dayExpense);

      // Human-friendly date label (e.g., "26 Jun")
      const dateObj = new Date(date);
      const dayLabel = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      return {
        date,
        label: dayLabel,
        balance: runningBalance,
        income: dayIncome,
        expense: dayExpense
      };
    });
  }, [transactions]);

  // SVG dimensions for Trend Line
  const width = 340;
  const height = 160;
  const padding = 20;

  const trendCoordinates = useMemo(() => {
    if (trendData.length === 0) return [];

    const balances = trendData.map(d => d.balance);
    const maxVal = Math.max(...balances, 10000); // Guard division by zero
    const minVal = Math.min(...balances, 0);
    const range = maxVal - minVal;

    return trendData.map((d, index) => {
      const x = padding + (index * (width - 2 * padding)) / (trendData.length - 1);
      // Flip Y because SVG 0,0 is top-left
      const y = height - padding - ((d.balance - minVal) / range) * (height - 2 * padding);
      return { x, y, ...d };
    });
  }, [trendData]);

  // Generate SVG Path for Line and Area
  const { linePath, areaPath } = useMemo(() => {
    if (trendCoordinates.length === 0) return { linePath: '', areaPath: '' };

    let lPath = `M ${trendCoordinates[0].x} ${trendCoordinates[0].y}`;
    for (let i = 1; i < trendCoordinates.length; i++) {
      // Smooth curve calculation using bezier control points
      const cpX1 = trendCoordinates[i - 1].x + (trendCoordinates[i].x - trendCoordinates[i - 1].x) / 2;
      const cpY1 = trendCoordinates[i - 1].y;
      const cpX2 = trendCoordinates[i - 1].x + (trendCoordinates[i].x - trendCoordinates[i - 1].x) / 2;
      const cpY2 = trendCoordinates[i].y;
      lPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${trendCoordinates[i].x} ${trendCoordinates[i].y}`;
    }

    // Area starts at line, slants down to bottom, goes back to start bottom, closes
    const firstX = trendCoordinates[0].x;
    const lastX = trendCoordinates[trendCoordinates.length - 1].x;
    const bottomY = height - padding;
    const aPath = `${lPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    return { linePath: lPath, areaPath: aPath };
  }, [trendCoordinates]);

  // 2. DATA PREPARATION FOR CATEGORY BREAKDOWN (Expenses only)
  const categoryBreakdown = useMemo(() => {
    const expenseTxs = transactions.filter(t => t.type === 'EXPENSE');
    const totalExpenses = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

    const dataMap: Record<string, number> = {};
    expenseTxs.forEach((tx) => {
      dataMap[tx.categoryId] = (dataMap[tx.categoryId] || 0) + tx.amount;
    });

    const items = Object.entries(dataMap).map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === categoryId) || {
        name: 'Uncategorized',
        icon: 'Tag',
        color: 'from-slate-500/20 to-slate-600/30 border-slate-500/50 text-slate-400',
        accentColor: '#94a3b8'
      };

      return {
        categoryId,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        category
      };
    });

    // Sort by amount descending
    return items.sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  const totalExpenseSum = useMemo(() => {
    return transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_80px_rgba(0,242,255,0.05)] backdrop-blur-md">
      {/* Header with Switcher */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-zinc-300 uppercase">
          <LucideIcon name={chartType === 'TREND' ? 'TrendingUp' : 'Grid'} size={14} className="text-[#00f2ff]" />
          {chartType === 'TREND' ? 'Balance Trend' : 'Expense Analytics'}
        </span>
        <div className="flex gap-1.5 rounded-lg bg-white/5 p-0.5 border border-white/10">
          <button
            onClick={() => setChartType('TREND')}
            className={`rounded-md px-2.5 py-1 text-[10px] font-medium tracking-wide transition-all ${
              chartType === 'TREND'
                ? 'bg-gradient-to-r from-[#00f2ff]/20 to-purple-500/20 text-[#00f2ff] border border-[#00f2ff]/30'
                : 'text-zinc-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Trend
          </button>
          <button
            onClick={() => setChartType('CATEGORIES')}
            className={`rounded-md px-2.5 py-1 text-[10px] font-medium tracking-wide transition-all ${
              chartType === 'CATEGORIES'
                ? 'bg-gradient-to-r from-[#00f2ff]/20 to-purple-500/20 text-[#00f2ff] border border-[#00f2ff]/30'
                : 'text-zinc-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Category
          </button>
        </div>
      </div>

      {/* Main Chart Rendering Container */}
      <div className="mt-3 relative min-h-[160px] flex flex-col justify-center">
        {chartType === 'TREND' ? (
          /* TREND LINE CHART */
          transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-zinc-500">
              <LucideIcon name="Info" size={24} className="text-zinc-600 mb-2" />
              <p className="text-xs">No transaction history to display trend.</p>
            </div>
          ) : (
            <div className="relative">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                <defs>
                  {/* Glowing line gradients */}
                  <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00f2ff" />
                    <stop offset="100%" stopColor="#7000ff" />
                  </linearGradient>
                  {/* Area fill gradients */}
                  <linearGradient id="areaGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
                  </linearGradient>
                  {/* Glow filter */}
                  <filter id="neonShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Gridlines */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" />
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" />

                {/* Glow Area Under Curve */}
                {areaPath && <path d={areaPath} fill="url(#areaGlow)" />}

                {/* Main Neon Spline Path */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="url(#lineGlow)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter="url(#neonShadow)"
                  />
                )}

                {/* Point Indicators with Touch Target */}
                {trendCoordinates.map((pt, idx) => (
                  <g key={idx}>
                    {/* Glowing outer hover circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="7"
                      fill="#00f2ff"
                      fillOpacity={hoveredPoint?.label === pt.label ? '0.4' : '0'}
                      className="transition-all duration-150"
                    />
                    {/* Tiny sharp center point */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="3.5"
                      fill="#e2e8f0"
                      stroke="#00f2ff"
                      strokeWidth="2"
                    />
                    {/* Invisible large touch targets */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="16"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredPoint({
                          x: pt.x,
                          y: pt.y - 10,
                          label: pt.label,
                          value: pt.balance
                        });
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onTouchStart={() => {
                        setHoveredPoint({
                          x: pt.x,
                          y: pt.y - 10,
                          label: pt.label,
                          value: pt.balance
                        });
                      }}
                    />
                  </g>
                ))}

                {/* Date Labels below X axis */}
                {trendCoordinates.map((pt, idx) => (
                  <text
                    key={idx}
                    x={pt.x}
                    y={height - 5}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="7"
                    fontFamily="JetBrains Mono"
                  >
                    {pt.label}
                  </text>
                ))}
              </svg>

              {/* Floating Glowing Tooltip UI */}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none rounded-lg border border-[#00f2ff]/30 bg-slate-950/90 px-2.5 py-1.5 shadow-[0_0_15px_-3px_rgba(0,242,255,0.3)] backdrop-blur-md transition-all duration-150 text-center"
                  style={{
                    left: `${(hoveredPoint.x / width) * 100}%`,
                    top: `${(hoveredPoint.y / height) * 100}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <p className="text-[8px] font-mono tracking-wider text-[#00f2ff] uppercase">{hoveredPoint.label}</p>
                  <p className="text-xs font-bold text-white font-sans mt-0.5">{formatINR(hoveredPoint.value)}</p>
                </div>
              )}
            </div>
          )
        ) : (
          /* CATEGORIES SHARE (Expense Breakdown Bars) */
          categoryBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-zinc-500">
              <LucideIcon name="Info" size={24} className="text-zinc-600 mb-2" />
              <p className="text-xs">No expenses tracked yet for this period.</p>
            </div>
          ) : (
            <div className="space-y-3.5 py-1.5 max-h-[220px] overflow-y-auto pr-1">
              {/* Overall Expense Header */}
              <div className="flex justify-between items-center text-[10px] text-zinc-400 px-1 font-mono">
                <span>TOTAL SPENT</span>
                <span className="text-rose-400 font-bold">{formatINR(totalExpenseSum)}</span>
              </div>

              {categoryBreakdown.map((item) => (
                <div
                  key={item.categoryId}
                  className="group relative rounded-2xl border border-white/5 bg-[#0a0a12]/60 p-2.5 transition-all duration-300 hover:border-white/10 hover:bg-[#0a0a12]"
                  onMouseEnter={() => setHoveredCategory(item.categoryId)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {/* Title and stats layout */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5">
                        <LucideIcon name={item.category.icon} size={12} className={item.category.color.split(' ').pop()} />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-200">{item.category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-100 font-sans">{formatINR(item.amount)}</span>
                      <span className="text-[8px] font-mono text-zinc-500 ml-1.5">{item.percentage.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Progressive glowing progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden border border-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.category.accentColor,
                        backgroundImage: `linear-gradient(to right, ${item.category.accentColor}dd, ${item.category.accentColor})`,
                        boxShadow: hoveredCategory === item.categoryId ? `0 0 8px ${item.category.accentColor}` : 'none'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
