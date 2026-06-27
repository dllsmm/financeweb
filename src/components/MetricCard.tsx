import React from 'react';
import { formatINR } from '../utils';
import LucideIcon from './LucideIcon';

interface MetricCardProps {
  title: string;
  amount: number;
  type: 'balance' | 'income' | 'expense';
  subtext?: string;
  onClick?: () => void;
}

export default function MetricCard({ title, amount, type, subtext, onClick }: MetricCardProps) {
  // Determine styles and icons based on card type
  let cardClass = '';
  let glowClass = '';
  let titleClass = '';
  let amountClass = '';
  let iconName = '';
  let iconBg = '';
  let iconColor = '';
  let trendIcon = '';

  switch (type) {
    case 'income':
      cardClass = 'bg-white/5 border-white/10 hover:border-emerald-500/30';
      glowClass = 'shadow-[0_4px_20px_rgba(16,185,129,0.05)]';
      titleClass = 'text-[10px] uppercase font-bold text-emerald-400 opacity-80 font-mono tracking-wider';
      amountClass = 'text-xl font-semibold mt-1 text-slate-100';
      iconName = 'ArrowDownLeft';
      iconBg = 'bg-emerald-500/10 border-emerald-500/20';
      iconColor = 'text-emerald-400';
      trendIcon = 'TrendingUp';
      break;
    case 'expense':
      cardClass = 'bg-white/5 border-white/10 hover:border-rose-500/30';
      glowClass = 'shadow-[0_4px_20px_rgba(244,63,94,0.05)]';
      titleClass = 'text-[10px] uppercase font-bold text-rose-400 opacity-80 font-mono tracking-wider';
      amountClass = 'text-xl font-semibold mt-1 text-slate-100';
      iconName = 'ArrowUpRight';
      iconBg = 'bg-rose-500/10 border-rose-500/20';
      iconColor = 'text-rose-400';
      trendIcon = 'TrendingDown';
      break;
    case 'balance':
    default:
      // High Density theme premium styling for Total Portfolio
      cardClass = 'bg-transparent border-transparent p-0 shadow-none';
      glowClass = '';
      titleClass = 'text-zinc-500 text-xs uppercase tracking-widest font-bold font-mono';
      amountClass = 'text-4xl font-light tracking-tighter text-[#00f2ff] drop-shadow-[0_0_10px_rgba(0,242,255,0.4)]';
      iconName = 'CreditCard';
      iconBg = 'bg-white/5 border-white/10';
      iconColor = 'text-[#00f2ff]';
      trendIcon = 'TrendingUp';
      break;
  }

  if (type === 'balance') {
    return (
      <div
        onClick={onClick}
        className={`relative overflow-hidden transition-all duration-300 ${
          onClick ? 'cursor-pointer active:scale-[0.98]' : ''
        } ${cardClass}`}
      >
        <div className="flex flex-col">
          <span className={titleClass}>{title}</span>
          <h1 className={`${amountClass} mt-1`}>
            {formatINR(amount)}
          </h1>
          {subtext && (
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse" />
              <span>{subtext}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 active:scale-[0.98] ${
        onClick ? 'cursor-pointer' : ''
      } ${cardClass} ${glowClass}`}
    >
      <div className="flex items-center justify-between">
        <span className={titleClass}>
          {title}
        </span>
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${iconBg}`}>
          <LucideIcon name={iconName} size={14} className={iconColor} />
        </div>
      </div>

      <div className={amountClass}>
        {formatINR(amount)}
      </div>

      {subtext && (
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-500">
          <LucideIcon name={trendIcon} size={10} className={iconColor} />
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
