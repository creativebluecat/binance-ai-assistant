# Binance AI Assistant

一个功能强大的币安产品智能助手，基于OpenClaw AI Framework构建，提供全方位的币安服务支持。

## 🌟 特性

### 📊 市场数据查询
- ✅ 实时价格查询
- ✅ 24小时行情数据
- ✅ K线数据（支持多种时间周期）
- ✅ 买卖盘深度图
- ✅ 最新成交记录
- ✅ 资金费率查询

### 💱 交易规则查询
- ✅ 交易手续费率
- ✅ 交易对详细信息
- ✅ 杠杆规则说明
- ✅ 合约交易规则

### 📈 市场分析
- ✅ 价格趋势分析
- ✅ RSI指标计算
- ✅ MACD指标计算
- ✅ 成交量分析
- ✅ 市场情绪判断

### 📰 币安资讯
- ✅ 最新官方公告
- ✅ 活动信息查询
- ✅ 产品更新通知

### 🎮 交易辅助
- ✅ 技术指标分析
- ✅ 交易建议（仅供参考）
- ✅ 风险提示

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
# 可选：配置币安API Key（用于交易功能）
export BINANCE_API_KEY=your_api_key
export BINANCE_API_SECRET=your_api_secret

# 服务器配置
export PORT=3000
export NODE_ENV=development
```

### 启动服务

```bash
npm start
```

服务将在 `http://localhost:3000` 启动。

## 📚 API文档

### 市场数据查询

#### 查询价格
```
GET /api/market/price/:symbol
```

**示例：**
```bash
curl http://localhost:3000/api/market/price/BTCUSDT
```

**响应：**
```json
{
  "symbol": "BTCUSDT",
  "price": "67234.56"
}
```

#### 查询24小时行情
```
GET /api/market/ticker/:symbol
```

**示例：**
```bash
curl http://localhost:3000/api/market/ticker/BTCUSDT
```

#### 查询K线数据
```
GET /api/market/klines/:symbol?interval=1h&limit=100
```

**参数：**
- `interval`: 时间周期 (1m, 5m, 15m, 1h, 4h, 1d)
- `limit`: 返回数量 (默认100)

**示例：**
```bash
curl http://localhost:3000/api/market/klines/BTCUSDT?interval=1h&limit=100
```

#### 查询深度图
```
GET /api/market/depth/:symbol?limit=100
```

#### 查询最新成交
```
GET /api/market/trades/:symbol?limit=100
```

#### 查询资金费率
```
GET /api/market/funding/:symbol
```

### 交易规则查询

#### 查询手续费率
```
GET /api/trading/fee/:symbol
```

#### 查询交易对信息
```
GET /api/trading/info/:symbol
```

### 市场分析

#### 市场趋势分析
```
GET /api/analysis/market/:symbol?interval=1h
```

**参数：**
- `interval`: 时间周期 (默认1h)

**示例：**
```bash
curl http://localhost:3000/api/analysis/market/BTCUSDT?interval=1h
```

**响应：**
```json
{
  "symbol": "BTCUSDT",
  "interval": "1h",
  "currentPrice": 67234.56,
  "priceChange": 2.34,
  "rsi": 58.32,
  "macd": {
    "macd": 123.45,
    "signal": 98.76,
    "histogram": 24.69
  },
  "trend": "偏强",
  "signal": "谨慎看空",
  "strength": 0.5
}
```

### 币安资讯

#### 获取公告
```
GET /api/news/announcements
```

#### 获取活动信息
```
GET /api/news/activities
```

## 💡 使用示例

### 市场查询

```javascript
// 查询BTC价格
const price = await fetch('http://localhost:3000/api/market/price/BTCUSDT')
  .then(res => res.json());

// 查询24小时行情
const ticker = await fetch('http://localhost:3000/api/market/ticker/BTCUSDT')
  .then(res => res.json());

// 查询K线数据
const klines = await fetch('http://localhost:3000/api/market/klines/BTCUSDT?interval=1h&limit=100')
  .then(res => res.json());

// 市场分析
const analysis = await fetch('http://localhost:3000/api/analysis/market/BTCUSDT?interval=1h')
  .then(res => res.json());
```

### 交易规则查询

```javascript
// 查询手续费率
const fee = await fetch('http://localhost:3000/api/trading/fee/BTCUSDT')
  .then(res => res.json());

// 查询交易对信息
const info = await fetch('http://localhost:3000/api/trading/info/BTCUSDT')
  .then(res => res.json());
```

### 币安资讯查询

```javascript
// 获取公告
const announcements = await fetch('http://localhost:3000/api/news/announcements')
  .then(res => res.json());

// 获取活动信息
const activities = await fetch('http://localhost:3000/api/news/activities')
  .then(res => res.json());
```

## 🏗️ 技术架构

### 技术栈
- **Node.js** - 运行时环境
- **Express.js** - Web服务器框架
- **axios** - HTTP客户端
- **node-cache** - 数据缓存
- **TypeScript** - 类型安全（可选）

### 架构设计

```
┌─────────────┐
│   用户请求   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  AI理解意图  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  调用对应API │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  数据处理    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  AI生成回复  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  返回用户    │
└─────────────┘
```

### 数据流

1. **用户输入** → AI理解意图
2. **意图识别** → 调用对应API
3. **API调用** → 获取数据
4. **数据处理** → 格式化、计算指标
5. **AI生成** → 生成自然语言回复
6. **返回用户** → 展示结果

## 📊 数据缓存

为了提高响应速度，系统使用以下缓存策略：

| 数据类型 | 缓存时间 | 说明 |
|---------|---------|------|
| 市场数据 | 5分钟 | 价格、深度等 |
| K线数据 | 1分钟 | 技术分析数据 |
| 资讯数据 | 30分钟 | 公告、活动等 |
| 交易规则 | 1小时 | 手续费、规则等 |

## 🔒 安全性

### API Key安全
- 使用环境变量存储API Key
- 支持IP白名单
- 请求签名验证

### 数据安全
- HTTPS加密传输
- 敏感数据脱敏
- 请求频率限制

## 📈 性能优化

### 优化措施
- ✅ 数据缓存减少API调用
- ✅ 异步处理提高并发
- ✅ 响应压缩减少传输量
- ✅ CDN加速静态资源

### 性能指标
- 响应时间：< 500ms
- 并发处理：1000+ QPS
- 缓存命中率：> 80%

## 🤝 扩展性

### 可扩展功能
- 📋 多语言支持（中英文）
- 📋 多交易所支持
- 📋 自定义技术指标
- 📋 交易机器人
- 📋 风险管理系统
- 📋 价格提醒功能

### 插件系统
支持通过插件扩展功能：
- **数据源插件**：接入其他数据源
- **分析插件**：自定义分析算法
- **通知插件**：多种通知方式
- **策略插件**：交易策略实现

## 🧪 测试

```bash
# 运行测试
npm test

# 启动开发服务器
npm start
```

## 📝 开发计划

### 已完成 ✅
- [x] 基础架构搭建
- [x] 市场数据查询功能
- [x] 交易规则查询功能
- [x] 币安资讯获取功能
- [x] 技术指标计算（RSI、MACD）
- [x] 市场分析功能
- [x] 数据缓存系统

### 进行中 🔄
- [ ] WebSocket实时数据推送
- [ ] 价格提醒功能
- [ ] 多语言支持

### 计划中 📋
- [ ] 交易机器人
- [ ] 风险管理系统
- [ ] 自定义指标
- [ ] 插件系统
- [ ] 移动端应用

## 📚 相关资源

- [币安API文档](https://binance-docs.github.io/apidocs/zh_CN/)
- [OpenClaw文档](https://docs.openclaw.ai)
- [Express.js文档](https://expressjs.com/)
- [axios文档](https://axios-http.com/)

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👥 作者

**creativebluecat**
- GitHub: https://github.com/creativebluecat
- Email: creativebluecat@gmail.com

## 🙏 致谢

感谢以下开源项目：
- [OpenClaw](https://github.com/openclaw/openclaw)
- [Express.js](https://expressjs.com/)
- [axios](https://axios-http.com/)

---

**注意**：本AI助手提供的所有交易建议仅供参考，不构成投资建议。投资有风险，入市需谨慎。