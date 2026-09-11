'use client';

import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState
} from '@tanstack/react-table';
import { 
  ArrowUpDown, 
  ChevronDown, 
  ChevronRight, 
  Search
} from 'lucide-react';
import { StockHolding, SectorSummary } from '@/types/portfolio';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/formatters';

interface TableProps {
  data: StockHolding[];
  sectorSummaries: SectorSummary[];
  isRefreshing: boolean;
}

const columnHelper = createColumnHelper<StockHolding>();

export const PortfolioTable: React.FC<TableProps> = ({
  data,
  sectorSummaries
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [collapsedSectors, setCollapsedSectors] = useState<Record<string, boolean>>({});

  const toggleSector = (secName: string) => {
    setCollapsedSectors((prev) => ({
      ...prev,
      [secName]: !prev[secName]
    }));
  };

  const filteredData = useMemo(() => {
    if (selectedSector === 'ALL') return data;
    return data.filter((s) => s.sector === selectedSector);
  }, [data, selectedSector]);

  const groupedSectors = useMemo(() => {
    const map = new Map<string, StockHolding[]>();
    filteredData.forEach((stock) => {
      const list = map.get(stock.sector) || [];
      list.push(stock);
      map.set(stock.sector, list);
    });
    return Array.from(map.entries()).map(([sector, stocks]) => ({
      sector,
      stocks,
      summary: sectorSummaries.find((s) => s.sector === sector)
    }));
  }, [filteredData, sectorSummaries]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('particulars', {
        header: 'Stock Name (Particulars)',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900">{info.getValue()}</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {row.sector}
              </span>
            </div>
          );
        }
      }),
      columnHelper.accessor('exchangeCode', {
        header: 'NSE / BSE',
        cell: (info) => (
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-xs border border-slate-200 font-medium">
            {info.getValue()}
          </span>
        )
      }),
      columnHelper.accessor('purchasePrice', {
        header: 'Purchase Price',
        cell: (info) => (
          <span className="font-mono text-slate-700 font-medium">
            {formatCurrency(info.getValue())}
          </span>
        )
      }),
      columnHelper.accessor('qty', {
        header: 'Qty',
        cell: (info) => (
          <span className="font-mono text-slate-700 font-medium">
            {formatNumber(info.getValue(), 0)}
          </span>
        )
      }),
      columnHelper.accessor('investment', {
        header: 'Investment',
        cell: (info) => (
          <span className="font-mono text-slate-800 font-bold">
            {formatCurrency(info.getValue())}
          </span>
        )
      }),
      columnHelper.accessor('portfolioWeight', {
        header: 'Portfolio (%)',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${Math.min(info.getValue() * 6, 100)}%` }}
              />
            </div>
            <span className="font-mono text-xs text-slate-500 font-medium">
              {info.getValue().toFixed(2)}%
            </span>
          </div>
        )
      }),
      columnHelper.accessor('cmp', {
        header: 'CMP (Yahoo)',
        cell: (info) => {
          const row = info.row.original;
          const hasChanged = row.previousCmp && row.previousCmp !== row.cmp;
          const isHigher = row.previousCmp ? row.cmp > row.previousCmp : false;

          return (
            <div className="flex items-center gap-1.5">
              <span
                className={`font-mono font-bold transition-colors duration-700 ${
                  hasChanged
                    ? isHigher
                      ? 'text-emerald-600 animate-pulse'
                      : 'text-rose-600 animate-pulse'
                    : 'text-slate-900'
                }`}
              >
                {formatCurrency(info.getValue())}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          );
        }
      }),
      columnHelper.accessor('presentValue', {
        header: 'Present Value',
        cell: (info) => (
          <span className="font-mono text-slate-900 font-extrabold">
            {formatCurrency(info.getValue())}
          </span>
        )
      }),
      columnHelper.accessor('gainLoss', {
        header: 'Gain / Loss',
        cell: (info) => {
          const val = info.getValue();
          const percent = info.row.original.gainLossPercent;
          const isPositive = val >= 0;

          return (
            <div className="flex flex-col">
              <span
                className={`font-mono font-bold text-xs ${
                  isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(val)}
              </span>
              <span
                className={`text-[11px] font-mono font-semibold ${
                  isPositive ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {formatPercentage(percent)}
              </span>
            </div>
          );
        }
      }),
      columnHelper.accessor('peRatio', {
        header: 'P/E (Google)',
        cell: (info) => {
          const val = info.getValue();
          return (
            <span className="font-mono text-xs text-slate-600 font-medium">
              {val && val > 0 ? val.toFixed(2) : '-'}
            </span>
          );
        }
      }),
      columnHelper.accessor('latestEarnings', {
        header: 'Latest Earnings (EPS)',
        cell: (info) => {
          const val = info.getValue();
          return (
            <span className="font-mono text-xs text-slate-600 font-medium">
              {val ? `₹${val.toFixed(2)}` : '-'}
            </span>
          );
        }
      })
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search stock name, ticker or sector..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedSector('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSector === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            All Sectors ({data.length})
          </button>
          {sectorSummaries.map((s) => (
            <button
              key={s.sector}
              onClick={() => setSelectedSector(s.sector)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSector === s.sector
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {s.sector} ({s.stockCount})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {groupedSectors.map(({ sector, stocks, summary }) => {
          const filteredStocks = stocks.filter(
            (s) =>
              s.particulars.toLowerCase().includes(globalFilter.toLowerCase()) ||
              s.exchangeCode.toLowerCase().includes(globalFilter.toLowerCase()) ||
              s.sector.toLowerCase().includes(globalFilter.toLowerCase())
          );

          if (filteredStocks.length === 0) return null;

          const isCollapsed = collapsedSectors[sector];
          const isSectorProfit = (summary?.gainLoss ?? 0) >= 0;

          return (
            <div
              key={sector}
              className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm transition-all"
            >
              <div
                onClick={() => toggleSector(sector)}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50/80 hover:bg-slate-100/70 cursor-pointer transition-colors border-b border-slate-200 gap-3"
              >
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-slate-700 p-1">
                    {isCollapsed ? (
                      <ChevronRight className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {sector}
                      </h4>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold shadow-xs">
                        {stocks.length} holdings
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {summary ? `${summary.portfolioWeight.toFixed(1)}% of total portfolio` : ''}
                    </p>
                  </div>
                </div>

                {summary && (
                  <div className="grid grid-cols-3 gap-4 md:gap-8 items-center bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-2xs self-stretch md:self-auto">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Invested</div>
                      <div className="text-xs font-mono font-semibold text-slate-800">
                        {formatCurrency(summary.totalInvestment)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Present Value</div>
                      <div className="text-xs font-mono font-black text-slate-900">
                        {formatCurrency(summary.totalPresentValue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Net Gain/Loss</div>
                      <div
                        className={`text-xs font-mono font-extrabold flex items-center gap-1 ${
                          isSectorProfit ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatCurrency(summary.gainLoss)}
                        <span className="text-[10px] font-semibold">
                          ({formatPercentage(summary.gainLossPercent)})
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <SectorSubTable
                    stocks={filteredStocks}
                    columns={columns}
                    sorting={sorting}
                    setSorting={setSorting}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface SectorSubTableProps {
  stocks: StockHolding[];
  columns: any[];
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
}

const SectorSubTable: React.FC<SectorSubTableProps> = ({
  stocks,
  columns,
  sorting,
  setSorting
}) => {
  const table = useReactTable({
    data: stocks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <table className="w-full text-left border-collapse text-xs">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b border-slate-200 bg-white">
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
                className="py-3 px-4 text-slate-500 font-bold uppercase tracking-wider text-[10px] select-none cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanSort() && (
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className="hover:bg-slate-50/80 transition-colors group"
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="py-3.5 px-4 whitespace-nowrap">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
