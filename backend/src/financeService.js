const axios = require('axios');
const cheerio = require('cheerio');
const yahooFinance = require('yahoo-finance2').default;
const { TICKER_MAP } = require('./tickerMap');
const seedData = require('./portfolio_seed.json');

const cache = new Map();
const CACHE_TTL_MS = 30 * 1000;

async function fetchYahooCMP(yahooTicker) {
  // First try yahoo-finance2 with a maximum wait time
  try {
    const quotePromise = yahooFinance.quote(yahooTicker);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Yahoo Finance request timed out'));
      }, 5000);
    });

    const quote = await Promise.race([
      quotePromise,
      timeoutPromise
    ]);

    if (quote && typeof quote.regularMarketPrice === 'number') {
      return quote.regularMarketPrice;
    }
  } catch (err) {
    console.log(`Yahoo quote failed for ${yahooTicker}:`, err.message);
  }

  // Fallback to Yahoo chart API
  try {
    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooTicker)}?interval=1d&range=1d`;

    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 5000
    });

    const price =
      res.data?.chart?.result?.[0]?.meta?.regularMarketPrice;

    if (typeof price === 'number') {
      return price;
    }
  } catch (err) {
    console.log(`Yahoo chart fallback failed for ${yahooTicker}:`, err.message);
  }

  return null;
}

async function fetchGoogleFinanceMetrics(googleTicker) {
  try {
    const url = `https://www.google.com/finance/quote/${encodeURIComponent(googleTicker)}`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 4000
    });

    const $ = cheerio.load(res.data);
    let peRatio;
    let latestEarnings;

    $('.gyFHrc').each((_, el) => {
      const label = $(el).find('.mfs7Fc').text().trim().toLowerCase();
      const valText = $(el).find('.P6K39c').text().trim().replace(/,/g, '');

      if (label.includes('p/e ratio')) {
        const parsed = parseFloat(valText);
        if (!isNaN(parsed)) peRatio = parsed;
      }
      if (label.includes('eps') || label.includes('earnings per share')) {
        const parsed = parseFloat(valText);
        if (!isNaN(parsed)) latestEarnings = parsed;
      }
    });

    return { peRatio, latestEarnings };
  } catch (err) {
    return {};
  }
}

function simulateMicroMovement(basePrice) {
  const deltaFactor = 1 + (Math.random() * 0.004 - 0.002);
  return Number((basePrice * deltaFactor).toFixed(2));
}

async function getStockMetrics(stockId) {
  const now = Date.now();
  const cached = cache.get(stockId);

  if (cached && (now - cached.updatedAt) < CACHE_TTL_MS) {
    return {
      cmp: cached.cmp,
      peRatio: cached.peRatio,
      latestEarnings: cached.latestEarnings,
      source: 'cached'
    };
  }

  const mapping = TICKER_MAP[stockId];
  const baseline = seedData.find((s) => s.id === stockId);

  let liveCmp = null;
  let googleMetrics = {};

  if (mapping) {
    const [cmpResult, metricsResult] = await Promise.allSettled([
      fetchYahooCMP(mapping.yahooTicker),
      fetchGoogleFinanceMetrics(mapping.googleTicker)
    ]);

    if (cmpResult.status === 'fulfilled' && cmpResult.value !== null) {
      liveCmp = cmpResult.value;
    }
    if (metricsResult.status === 'fulfilled') {
      googleMetrics = metricsResult.value;
    }
  }

  const finalCmp = liveCmp ?? (baseline ? simulateMicroMovement(baseline.cmp) : 100);
  const finalPE = googleMetrics.peRatio ?? baseline?.peRatio;
  const finalEarnings = googleMetrics.latestEarnings ?? baseline?.latestEarnings;

  const result = {
    cmp: Number(finalCmp.toFixed(2)),
    peRatio: finalPE ? Number(finalPE.toFixed(2)) : undefined,
    latestEarnings: finalEarnings ? Number(finalEarnings.toFixed(2)) : undefined,
    updatedAt: now,
    source: liveCmp ? 'live' : 'fallback-simulation'
  };

  cache.set(stockId, result);
  return result;
}

module.exports = { getStockMetrics, seedData };
