'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { PortfolioTable } from '@/components/PortfolioTable';
import { PortfolioCharts } from '@/components/PortfolioCharts';
import { StockHolding, SectorSummary, PortfolioKPIs } from '@/types/portfolio';
import { AlertCircle } from 'lucide-react';

const REFRESH_INTERVAL_SECONDS = 15;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function Home() {
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(REFRESH_INTERVAL_SECONDS);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadInitialPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BACKEND_URL}/api/portfolio`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setHoldings(json.data);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        throw new Error(json.error || 'Failed to load portfolio');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching portfolio');
    } finally {
      setLoading(false);
    }
  };

  const pollLiveUpdates = useCallback(async () => {
    if (isRefreshing) return;
    try {
      setIsRefreshing(true);
      const res = await fetch(`${BACKEND_URL}/api/stocks/live`);
      const json = await res.json();

      if (json.success && json.stocks) {
        setHoldings((prevHoldings) =>
          prevHoldings.map((stock) => {
            const update = json.stocks[stock.id];
            if (!update) return stock;

            const newCmp = update.cmp ?? stock.cmp;
            const newPresentValue = Number((newCmp * stock.qty).toFixed(2));
            const newGainLoss = Number((newPresentValue - stock.investment).toFixed(2));
            const newGainLossPercent = stock.investment > 0
              ? Number(((newGainLoss / stock.investment) * 100).toFixed(2))
              : 0;

            return {
              ...stock,
              previousCmp: stock.cmp,
              cmp: newCmp,
              presentValue: newPresentValue,
              gainLoss: newGainLoss,
              gainLossPercent: newGainLossPercent,
              peRatio: update.peRatio ?? stock.peRatio,
              latestEarnings: update.latestEarnings ?? stock.latestEarnings,
              updatedAt: json.timestamp,
              source: update.source
            };
          })
        );
        setLastUpdated(new Date().toLocaleTimeString());
        setSecondsRemaining(REFRESH_INTERVAL_SECONDS);
      }
    } catch (err) {
      console.warn('Live poll error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    loadInitialPortfolio();
  }, []);

  useEffect(() => {
    if (!autoRefreshEnabled || loading) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          pollLiveUpdates();
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, loading, pollLiveUpdates]);

  const sectorSummaries: SectorSummary[] = useMemo(() => {
    const totalPortfolioVal = holdings.reduce((acc, s) => acc + s.presentValue, 0);
    const groups = new Map<string, StockHolding[]>();

    holdings.forEach((stock) => {
      const list = groups.get(stock.sector) || [];
      list.push(stock);
      groups.set(stock.sector, list);
    });

    return Array.from(groups.entries()).map(([sector, stocks]) => {
      const totalInvestment = stocks.reduce((acc, s) => acc + s.investment, 0);
      const totalPresentValue = stocks.reduce((acc, s) => acc + s.presentValue, 0);
      const gainLoss = totalPresentValue - totalInvestment;
      const gainLossPercent = totalInvestment > 0 ? (gainLoss / totalInvestment) * 100 : 0;
      const portfolioWeight = totalPortfolioVal > 0 ? (totalPresentValue / totalPortfolioVal) * 100 : 0;

      return {
        sector,
        totalInvestment,
        totalPresentValue,
        gainLoss,
        gainLossPercent,
        stockCount: stocks.length,
        portfolioWeight
      };
    });
  }, [holdings]);

  const kpis: PortfolioKPIs = useMemo(() => {
    const totalInvestment = holdings.reduce((acc, s) => acc + s.investment, 0);
    const totalPresentValue = holdings.reduce((acc, s) => acc + s.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const totalGainLossPercent = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

    let topGainer = holdings[0];
    let topLoser = holdings[0];

    holdings.forEach((s) => {
      if (!topGainer || s.gainLossPercent > topGainer.gainLossPercent) topGainer = s;
      if (!topLoser || s.gainLossPercent < topLoser.gainLossPercent) topLoser = s;
    });

    return {
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercent,
      topGainer,
      topLoser,
      holdingsCount: holdings.length,
      sectorCount: sectorSummaries.length,
      lastUpdated
    };
  }, [holdings, sectorSummaries, lastUpdated]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <DashboardHeader
          kpis={kpis}
          isRefreshing={isRefreshing}
          onManualRefresh={pollLiveUpdates}
          secondsUntilNextRefresh={secondsRemaining}
          autoRefreshEnabled={autoRefreshEnabled}
          onToggleAutoRefresh={() => setAutoRefreshEnabled((prev) => !prev)}
        />

        <PortfolioCharts sectorSummaries={sectorSummaries} />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Holdings & Fundamentals Breakdown
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Auto-updating every 15s • Color-coded Gain / Loss
            </span>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center space-y-3 shadow-xs">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-500">Connecting to live financial feed...</p>
            </div>
          ) : (
            <PortfolioTable
              data={holdings}
              sectorSummaries={sectorSummaries}
              isRefreshing={isRefreshing}
            />
          )}
        </section>
      </main>
    </div>
  );
}
