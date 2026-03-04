const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({
    name: 'Binance AI Assistant',
    version: '1.0.0',
    description: 'A smart assistant for Binance users',
    features: [
      'Market query',
      'Trading rules',
      'Market analysis',
      'Binance news'
    ]
  });
});

app.listen(port, () => {
  console.log(`Binance AI Assistant running at http://localhost:${port}`);
});
