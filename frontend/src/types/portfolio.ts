export interface StockHolding {
  id: string;
  no: number;
  particulars: string;
  sector: string;
  purchasePrice: number;
  qty: number;
  investment: number;
  portfolioWeight: number;
  exchangeCode: string;
  cmp: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  marketCap?: number;
  peRatio?: number;
  latestEarnings?: number;
  previousCmp?: number;
  updatedAt?: string;
  source?: string;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  stockCount: number;
  portfolioWeight: number;
}

export interface PortfolioKPIs {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  topGainer?: StockHolding;
  topLoser?: StockHolding;
  holdingsCount: number;
  sectorCount: number;
  lastUpdated: string;
}
