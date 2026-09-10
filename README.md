# Dynamic Portfolio Dashboard

A full-stack portfolio performance and analytics dashboard built for the **Octa Byte AI Pvt Ltd** case study.

The platform monitors a multi-sector portfolio of 29 Indian equity holdings (Financials, Tech, Consumer, Power, Pipes, and Others). It fetches real-time Current Market Price (CMP) via **Yahoo Finance** and key fundamental ratios (P/E Ratio and Latest Earnings/EPS) via **Google Finance**, with dynamic updates refreshed automatically every 15 seconds.

---

## 🏗️ Architecture & Project Structure

The project is cleanly decoupled into two standalone modules:

```text
├── backend/                  # Node.js + Express financial scraping and caching service
│   ├── src/
│   │   ├── server.js         # REST endpoints (/api/portfolio, /api/stocks/live)
│   │   ├── financeService.js # Yahoo Finance & Google Finance scrapers + in-memory cache
│   │   ├── tickerMap.js      # Mapping 29 Indian securities to .NS / .BO and Google tickers
│   │   └── portfolio_seed.json # Parsed portfolio base data from Excel
│   └── package.json
│
├── frontend/                 # Next.js 14+ (App Router) + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   └── page.tsx      # Main dashboard with 15s interval polling engine
│   │   ├── components/
│   │   │   ├── DashboardHeader.tsx # KPI summary cards & live countdown timer
│   │   │   ├── PortfolioTable.tsx  # TanStack Table v8 with sector accordions & flash updates
│   │   │   └── PortfolioCharts.tsx # Recharts Donut (Asset allocation) & Bar chart (Sector PnL)
│   │   ├── lib/
│   │   │   └── formatters.ts # Indian currency (INR) and percentage formatters
│   │   └── types/
│   │       └── portfolio.ts  # TypeScript interfaces for holdings, sectors, and KPIs
│   └── package.json
│
├── TECHNICAL_DOCUMENT.md     # In-depth engineering report on scraping, caching, and rate-limits
└── README.md
```

---

## ✨ Features

- **Crisp White / Light Mode Terminal**: Tailored UI designed for clarity, with emerald/rose visual indicators for gains/losses.
- **Dynamic Updates (15s polling)**: Automatically refreshes CMP, Present Value, and Net Gain/Loss every 15 seconds with visual change animations.
- **Sector Grouping & Rollups**: Holdings grouped by sector (Financial, Tech, Consumer, Power, Pipe, Others) with sector-level summary metrics (Invested, Current Value, Net PnL, Portfolio Weight %).
- **Interactive Visualizations**:
  - **Asset Allocation Donut**: Visual breakdown of portfolio exposure by sector.
  - **Sector Net Return Bar Chart**: Comparison of absolute profitability across sectors.
- **Search & Filters**: Instant full-text search across stock names and tickers, plus sector filter chips.
- **Resilience & Rate-Limiting Mitigation**: Built-in 30-second TTL cache and fallback micro-simulation to ensure 100% dashboard uptime even if third-party scrapers throttle requests or during off-market hours.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- [Git](https://git-scm.com/)

### 2. Start the Backend (Port 5000)
Open a terminal in the root directory:
```bash
cd backend
npm install
npm run dev
```
The backend will run at `http://localhost:5000`.

### 3. Start the Frontend (Port 3000)
Open a second terminal in the root directory:
```bash
cd frontend
npm install
npm run dev
```
The dashboard will be available at `http://localhost:3000`.

---

## 🌐 Deploy to GitHub

To push this project to your GitHub account:

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `octabyte-portfolio-dashboard`).
2. Run the following commands in the root folder:

```bash
# Add all files to git
git add .

# Commit changes
git commit -m "feat: complete portfolio dashboard with backend scrapers and frontend UI"

# Link to your remote GitHub repository
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/octabyte-portfolio-dashboard.git

# Set default branch to main and push
git branch -M main
git push -u origin main
```
