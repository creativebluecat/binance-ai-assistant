const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// 缓存配置
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// 币安API配置
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';

// 币安API客户端
const binanceClient = axios.create({
  baseURL: BINANCE_API_BASE,
  timeout: 10000
});

// 市场数据缓存时间（秒）
const MARKET_CACHE_TIME = 300; // 5分钟
const KLINE_CACHE_TIME = 60; // 1分钟
const NEWS_CACHE_TIME = 1800; // 30分钟

// ==================== 市场数据查询 ====================

/**
 * 查询交易对价格
 */
async function getPrice(symbol = 'BTCUSDT') {
  const cacheKey = `price_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await binanceClient.get(`/ticker/price?symbol=${symbol}`);
    const data = response.data;
    cache.set(cacheKey, data, MARKET_CACHE_TIME);
    return data;
  } catch (error) {
    throw new Error(`查询价格失败: ${error.message}`);
  }
}

/**
 * 查询24小时行情
 */
async function get24hrTicker(symbol = 'BTCUSDT') {
  const cacheKey = `ticker_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await binanceClient.get(`/ticker/24hr?symbol=${symbol}`);
    const data = response.data;
    cache.set(cacheKey, data, MARKET_CACHE_TIME);
    return data;
  } catch (error) {
    throw new Error(`查询24小时行情失败: ${error.message}`);
  }
}

/**
 * 查询K线数据
 */
async function getKlines(symbol = 'BTCUSDT', interval = '1h', limit = 100) {
  const cacheKey = `klines_${symbol}_${interval}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await binanceClient.get(`/klines`, {
      params: { symbol, interval, limit }
    });
    const data = response.data;
    cache.set(cacheKey, data, KLINE_CACHE_TIME);
    return data;
  } catch (error) {
    throw new Error(`查询K线数据失败: ${error.message}`);
  }
}

/**
 * 查询深度图数据
 */
async function getDepth(symbol = 'BTCUSDT', limit = 100) {
  const cacheKey = `depth_${symbol}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await binanceClient.get(`/depth`, {
      params: { symbol, limit }
    });
    const data = response.data;
    cache.set(cacheKey, data, MARKET_CACHE_TIME);
    return data;
  } catch (error) {
    throw new Error(`查询深度数据失败: ${error.message}`);
  }
}

/**
 * 查询最新成交
 */
async function getRecentTrades(symbol = 'BTCUSDT', limit = 100) {
  const cacheKey = `trades_${symbol}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await binanceClient.get(`/trades`, {
      params: { symbol, limit }
    });
    const data = response.data;
    cache.set(cacheKey, data, MARKET_CACHE_TIME);
    return data;
  } catch (error) {
    throw new Error(`查询成交记录失败: ${error.message}`);
  }
}

/**
 * 查询资金费率
 */
async function getFundingRate(symbol = 'BTCUSDT') {
  const cacheKey = `funding_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await binanceClient.get(`/fundingRate`, {
      params: { symbol }
    });
    const data = response.data;
    cache.set(cacheKey, data, MARKET_CACHE_TIME);
    return data;
  } catch (error) {
    throw new Error(`查询资金费率失败: ${error.message}`);
  }
}

// ==================== 交易规则查询 ====================

/**
 * 查询交易手续费率
 */
async function getTradeFee(symbol = 'BTCUSDT') {
  try {
    const response = await binanceClient.get(`/tradeFee`, {
      params: { symbol }
    });
    return response.data;
  } catch (error) {
    throw new Error(`查询手续费率失败: ${error.message}`);
  }
}

/**
 * 查询交易对信息
 */
async function getExchangeInfo(symbol = 'BTCUSDT') {
  try {
    const response = await binanceClient.get(`/exchangeInfo`, {
      params: { symbol }
    });
    return response.data;
  } catch (error) {
    throw new Error(`查询交易对信息失败: ${error.message}`);
  }
}

// ==================== 市场分析 ====================

/**
 * 计算RSI指标
 */
function calculateRSI(klines, period = 14) {
  if (klines.length < period + 1) {
    return null;
  }

  let gains = 0;
  let losses = 0;

  // 计算初始平均涨跌
  for (let i = klines.length - period; i < klines.length; i++) {
    const change = klines[i][1] - klines[i][0]; // 收盘价 - 开盘价
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // 计算后续平均涨跌
  for (let i = klines.length - period; i < klines.length; i++) {
    const change = klines[i][1] - klines[i][0];
    const gain = change > 0 ? change : 0;
    const loss = change > 0 ? 0 : Math.abs(change);

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * 计算MACD
 */
function calculateMACD(klines) {
  const ema12 = calculateEMA(klines, 12);
  const ema26 = calculateEMA(klines, 26);
  const macdLine = ema12 - ema26;
  const signalLine = calculateEMA(klines.slice(-26), 9);
  const histogram = macdLine - signalLine;

  return {
    macd: macdLine,
    signal: signalLine,
    histogram: histogram
  };
}

/**
 * 计算EMA
 */
function calculateEMA(klines, period) {
  const multiplier = 2 / (period + 1);
  let ema = klines[0][1]; // 使用第一个收盘价作为初始EMA

  for (let i = 1; i < klines.length; i++) {
    ema = (klines[i][1] - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * 市场趋势分析
 */
async function analyzeMarket(symbol = 'BTCUSDT', interval = '1h') {
  try {
    const klines = await getKlines(symbol, interval, 100);

    // 计算技术指标
    const rsi = calculateRSI(klines);
    const macd = calculateMACD(klines);
    const currentPrice = klines[klines.length - 1][1];
    const prevPrice = klines[klines.length - 2][1];
    const priceChange = ((currentPrice - prevPrice) / prevPrice) * 100;

    // 趋势判断
    let trend = '中性';
    let signal = '观望';
    let strength = 0;

    // RSI分析
    if (rsi < 30) {
      trend = '超卖';
      signal = '看涨';
      strength = 1;
    } else if (rsi > 70) {
      trend = '超买';
      signal = '看跌';
      strength = 1;
    } else if (rsi < 50) {
      trend = '偏弱';
      signal = '谨慎看多';
      strength = 0.5;
    } else {
      trend = '偏强';
      signal = '谨慎看空';
      strength = 0.5;
    }

    // MACD分析
    if (macd.histogram > 0 && macd.macd > macd.signal) {
      signal = '看涨';
      strength += 0.5;
    } else if (macd.histogram < 0 && macd.macd < macd.signal) {
      signal = '看跌';
      strength += 0.5;
    }

    // 价格变化分析
    if (priceChange > 2) {
      signal = '看涨';
      strength += 0.5;
    } else if (priceChange < -2) {
      signal = '看跌';
      strength += 0.5;
    }

    // 归一化强度
    strength = Math.min(strength, 1);

    return {
      symbol,
      interval,
      currentPrice,
      priceChange,
      rsi,
      macd,
      trend,
      signal,
      strength,
      klines: klines.slice(-10) // 返回最近10根K线
    };
  } catch (error) {
    throw new Error(`市场分析失败: ${error.message}`);
  }
}

// ==================== 币安资讯 ====================

/**
 * 获取币安公告
 */
async function getBinanceAnnouncements() {
  const cacheKey = 'announcements';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // 使用币安公告API
    const response = await axios.get('https://www.binance.com/bapi/composite/v1/public/cms/article/list/query', {
      params: {
        page: 1,
        pageSize: 10,
        category: 'ANNOUNCEMENT'
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = response.data;
    cache.set(cacheKey, data, NEWS_CACHE_TIME);
    return data;
  } catch (error) {
    throw new Error(`获取币安公告失败: ${error.message}`);
  }
}

/**
 * 获取币安活动信息
 */
async function getBinanceActivities() {
  const cacheKey = 'activities';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get('https://www.binance.com/bapi/composite/v1/public/cms/article/list/query', {
      params: {
        page: 1,
        pageSize: 10,
        category: 'ACTIVITY'
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = response.data;
    cache.set(cacheKey, data, NEWS_CACHE_TIME);
    return data;
  } catch (error) {
    throw new Error(`获取币安活动失败: ${error.message}`);
  }
}

// ==================== API路由 ====================

/**
 * 市场数据查询API
 */
app.get('/api/market/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await getPrice(symbol);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/market/ticker/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await get24hrTicker(symbol);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/market/klines/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 100 } = req.query;
    const data = await getKlines(symbol, interval, limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/market/depth/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 100 } = req.query;
    const data = await getDepth(symbol, limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/market/trades/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 100 } = req.query;
    const data = await getRecentTrades(symbol, limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/market/funding/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await getFundingRate(symbol);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 交易规则查询API
 */
app.get('/api/trading/fee/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await getTradeFee(symbol);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trading/info/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await getExchangeInfo(symbol);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 市场分析API
 */
app.get('/api/analysis/market/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h' } = req.query;
    const data = await analyzeMarket(symbol, interval);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 币安资讯API
 */
app.get('/api/news/announcements', async (req, res) => {
  try {
    const data = await getBinanceAnnouncements();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/news/activities', async (req, res) => {
  try {
    const data = await getBinanceActivities();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 健康检查
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * 根路径
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Binance AI Assistant',
    version: '2.0.0',
    description: 'A powerful AI assistant for Binance users',
    features: [
      'Market data query',
      'Trading rules query',
      'Market analysis',
      'Binance news',
      'Technical indicators',
      'Price trend analysis'
    ],
    endpoints: {
      market: '/api/market/*',
      trading: '/api/trading/*',
      analysis: '/api/analysis/*',
      news: '/api/news/*'
    }
  });
});

// ==================== 启动服务器 ====================

app.listen(port, () => {
  console.log(`Binance AI Assistant v2.0.0 running at http://localhost:${port}`);
  console.log(`API Base: ${BINANCE_API_BASE}`);
  console.log(`WebSocket Base: ${BINANCE_WS_BASE}`);
});

module.exports = { app, binanceClient };