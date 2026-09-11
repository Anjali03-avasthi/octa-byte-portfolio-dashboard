'use client';

import React from 'react';
import Image from 'next/image';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  RefreshCw,
  Clock
} from 'lucide-react';
import { PortfolioKPIs } from '@/types/portfolio';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

interface HeaderProps {
  kpis: PortfolioKPIs;
  isRefreshing: boolean;
  onManualRefresh: () => void;
  secondsUntilNextRefresh: number;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
}

export const DashboardHeader: React.FC<HeaderProps> = ({
  kpis,
  isRefreshing,
  onManualRefresh,
  secondsUntilNextRefresh,
  autoRefreshEnabled,
  onToggleAutoRefresh
}) => {
  const isPositive = kpis.totalGainLoss >= 0;

  return (
    <header className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200 bg-white p-1.5 flex items-center justify-center shadow-xs flex-shrink-0 mt-0.5 sm:mt-0">
            <Image 
              src="/favicon.ico" 
              alt="Octa Byte Logo" 
              width={32} 
              height={32} 
              className="w-full h-full object-contain rounded-md"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Octa Byte Portfolio Terminal
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 font-medium">
                Dynamic Equities Performance • Yahoo (CMP) & Google (P/E, EPS)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Feed
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto pt-1 md:pt-0">
          <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-500 text-[11px] sm:text-xs">Sync in:</span>
            <span className="text-indigo-600 font-bold text-[11px] sm:text-xs min-w-[20px]">
              {autoRefreshEnabled ? `${secondsUntilNextRefresh}s` : 'PAUSED'}
            </span>
          </div>

          <button
            onClick={onToggleAutoRefresh}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-2xs ${
              autoRefreshEnabled 
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300' 
                : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
            }`}
          >
            {autoRefreshEnabled ? 'Pause Sync' : 'Resume Sync'}
          </button>

          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Investment</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-slate-900">
            {formatCurrency(kpis.totalInvestment)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span>{kpis.holdingsCount} Total Positions</span>
            <span className="mx-2 font-bold">•</span>
            <span>{kpis.sectorCount} Sectors</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Portfolio Value</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-slate-900">
            {formatCurrency(kpis.totalPresentValue)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span className="text-emerald-600 font-medium">
              Live Equities Feed Connected
            </span>
          </div>
        </div>

        <div className={`rounded-xl p-5 border shadow-sm hover:shadow transition-all ${
          isPositive 
            ? 'bg-emerald-50/50 border-emerald-200' 
            : 'bg-rose-50/50 border-rose-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Net Gain / Loss
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isPositive ? 'bg-emerald-100' : 'bg-rose-100'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-700" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-700" />
              )}
            </div>
          </div>
          <div className={`text-2xl font-black tracking-tight ${
            isPositive ? 'text-emerald-700' : 'text-rose-700'
          }`}>
            {formatCurrency(kpis.totalGainLoss)}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isPositive 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-rose-100 text-rose-800'
            }`}>
              {formatPercentage(kpis.totalGainLossPercent)}
            </span>
            <span className="text-xs text-slate-500 font-medium">Overall ROI</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Performer</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-lg font-black tracking-tight text-slate-900 truncate">
            {kpis.topGainer ? kpis.topGainer.particulars : 'N/A'}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono font-medium">
              {kpis.topGainer ? `${kpis.topGainer.exchangeCode}` : '-'}
            </span>
            <span className="text-emerald-600 font-bold">
              {kpis.topGainer ? `+${kpis.topGainer.gainLossPercent.toFixed(1)}%` : '-'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
