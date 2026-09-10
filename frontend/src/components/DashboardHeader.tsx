'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Layers, 
  RefreshCw,
  Clock,
  CheckCircle2
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
      {/* Top Banner / Nav with Crisp Light Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Octa Byte Portfolio Terminal
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Dynamic Equities Performance • Yahoo Finance (CMP) & Google Finance (P/E, EPS)
              </p>
            </div>
          </div>
        </div>

        {/* Live Controls & Polling Timer */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Polling Timer indicator */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-mono shadow-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500">Sync in:</span>
            <span className="text-indigo-600 font-bold w-6 text-center">
              {autoRefreshEnabled ? `${secondsUntilNextRefresh}s` : 'PAUSED'}
            </span>
          </div>

          {/* Toggle Auto Sync */}
          <button
            onClick={onToggleAutoRefresh}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all shadow-sm ${
              autoRefreshEnabled 
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300' 
                : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
            }`}
            title="Toggle 15-second automatic background polling"
          >
            {autoRefreshEnabled ? 'Pause 15s Sync' : 'Resume Sync'}
          </button>

          {/* Force Refresh Button */}
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Crisp White with subtle borders and shadows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Investment Card */}
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

        {/* Current Portfolio Value */}
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
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Live Yahoo & Google Engine
            </span>
          </div>
        </div>

        {/* Total Net Gain / Loss */}
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

        {/* Top Performer Card */}
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
