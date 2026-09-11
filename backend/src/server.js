const express = require('express');
const cors = require('cors');
const { getStockMetrics, seedData } = require('./financeService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'octa-byte-portfolio-backend' });
});

app.get('/api/portfolio', (req, res) => {
  try {
    const holdings = seedData.map((stock) => {
      const investment = stock.purchasePrice * stock.qty;
      const presentValue = stock.cmp * stock.qty;
      const gainLoss = presentValue - investment;
      const gainLossPercent = investment > 0 ? (gainLoss / investment) * 100 : 0;

      return {
        ...stock,
        investment,
        presentValue,
        gainLoss,
        gainLossPercent,
        source: 'cached'
      };
    });

    res.json({
      success: true,
      data: holdings,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/stocks/live', async (req, res) => {
  try {
    const { ids } = req.query;
    const stockIds = ids 
      ? ids.split(',').map((id) => id.trim()).filter(Boolean)
      : seedData.map((s) => s.id);

    const results = {};
    const batchSize = 5;

    for (let i = 0; i < stockIds.length; i += batchSize) {
      const batch = stockIds.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (id) => {
          try {
            results[id] = await getStockMetrics(id);
          } catch (e) {}
        })
      );
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      stocks: results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
