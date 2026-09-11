'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { SectorSummary } from '@/types/portfolio';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

interface ChartsProps {
  sectorSummaries: SectorSummary[];
}

const SECTOR_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#059669',
  '#d97706',
  '#dc2626',
  '#0891b2'
];

export const PortfolioCharts: React.FC<ChartsProps> = ({ sectorSummaries }) => {
  const allocationData = sectorSummaries.map((s) => ({
    name: s.sector,
    value: s.totalPresentValue,
    weight: s.portfolioWeight
  }));

  const pnlData = sectorSummaries.map((s) => ({
    name: s.sector,
    gainLoss: s.gainLoss,
    pnlPercent: s.gainLossPercent
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Sector Asset Allocation</h3>
            <p className="text-xs text-slate-500 font-medium">Distribution of portfolio value across industry sectors</p>
          </div>
        </div>

        <div className="h-64 w-full outline-none focus:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart style={{ outline: 'none' }} tabIndex={-1}>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {allocationData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} 
                    stroke="#ffffff" 
                    strokeWidth={2} 
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl text-xs space-y-1">
                        <div className="font-bold text-slate-900">{data.name}</div>
                        <div className="text-slate-600 font-semibold">{formatCurrency(data.value)}</div>
                        <div className="text-blue-600 font-mono font-bold">
                          {data.weight ? `${data.weight.toFixed(2)}% of total` : ''}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 mt-2">
          {allocationData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: SECTOR_COLORS[index % SECTOR_COLORS.length] }}
              />
              <span className="text-slate-700 font-medium truncate">{item.name}</span>
              <span className="text-slate-400 font-mono ml-auto text-[11px]">
                {item.weight.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Sector Net Return (PnL)</h3>
            <p className="text-xs text-slate-500 font-medium">Total absolute profit and loss generated per sector</p>
          </div>
        </div>

        <div className="h-64 w-full outline-none focus:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart style={{ outline: 'none' }} tabIndex={-1} data={pnlData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const isPositive = data.gainLoss >= 0;
                    return (
                      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl text-xs space-y-1">
                        <div className="font-bold text-slate-900">{data.name}</div>
                        <div className={`font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          Net: {formatCurrency(data.gainLoss)}
                        </div>
                        <div className="text-slate-500 font-medium">
                          Return: {formatPercentage(data.pnlPercent)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="gainLoss" radius={[4, 4, 0, 0]}>
                {pnlData.map((entry, index) => (
                  <Cell 
                    key={`bar-cell-${index}`} 
                    fill={entry.gainLoss >= 0 ? '#10b981' : '#f43f5e'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            Profitable Sectors
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" />
            Underperforming Sectors
          </span>
        </div>
      </div>
    </div>
  );
};
