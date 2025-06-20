# coinHyper - 区块链工具平台

一个现代化的区块链工具平台，提供实时市场数据对比和分析功能。

## 功能特性

### 🏠 主页
- 现代化设计界面
- 多语言支持（中文/英文）
- 深色/浅色主题切换
- 响应式设计
- 性能优化

### 📊 市场信息模块
- **实时数据获取**: 从多个交易所获取实时价格数据
- **交易所对比**: OKX, Binance, Bybit 等主流交易所
- **现货/合约切换**: 支持现货和永续合约数据查看
- **详细数据展示**: 
  - 最新价格和24h涨跌幅
  - 24h最高/最低价格
  - 24h成交量
  - 买一价/卖一价及价差
  - 资金费率（合约）
  - 持仓量（合约）
- **交互式界面**: 点击展开/收起详细信息
- **自动刷新**: 30秒自动更新数据
- **错误处理**: 完善的错误提示和重试机制

## 技术栈

- **Framework**: Next.js 15.3.3 + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Heroicons
- **State Management**: React Hooks + Context API

## 项目结构

```
market-frontend/
├── app/
│   ├── components/           # React 组件
│   │   ├── HeroSection.tsx  # 主页英雄区域
│   │   ├── Navbar.tsx       # 导航栏
│   │   ├── MarketOverview.tsx # 市场信息主组件
│   │   └── VideoBackground.tsx # 视频背景组件
│   ├── contexts/            # React Context
│   │   ├── ThemeContext.tsx # 主题管理
│   │   └── LanguageContext.tsx # 语言管理
│   ├── hooks/              # 自定义 Hooks
│   │   └── useMarketData.ts # 市场数据Hook
│   ├── types/              # TypeScript 类型定义
│   │   └── market.ts       # 市场数据类型
│   ├── market/             # 市场信息页面
│   │   └── page.tsx
│   ├── layout.tsx          # 根布局
│   ├── page.tsx           # 主页
│   └── globals.css        # 全局样式
├── public/                 # 静态资源
├── next.config.ts         # Next.js 配置
├── tailwind.config.ts     # Tailwind 配置
└── package.json           # 项目依赖
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

创建 `.env.local` 文件：

```env
# API配置
API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# 市场数据API
NEXT_PUBLIC_MARKET_API_URL=http://localhost:3000/api/coins

# 开发环境
NODE_ENV=development
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3001](http://localhost:3001) 查看网站。

### 4. 后端API要求

市场信息模块需要后端API提供数据，API地址：`http://localhost:3000/api/coins`

**API响应格式**:
```json
{
  "data": [
    {
      "base_asset": "ETH",
      "quote_asset": "USDT",
      "exchanges": {
        "okx": {
          "spot": {
            "symbol": "ETH/USDT",
            "last_price": 2611.37,
            "volume_24h": 167418.718051,
            "volume_quote_24h": 427050883.1292407,
            "price_change_percent_24h": 2.957,
            "high_24h": 2621.38,
            "low_24h": 2491.82,
            "bid_price": 2611.36,
            "ask_price": 2611.37,
            "updated_at": "2025-06-16T06:28:17.000Z"
          },
          "perpetual": {
            "symbol": "ETH/USDT:USDT",
            "last_price": 2610.01,
            "mark_price": 2610.01,
            "funding_rate": 0.00004017,
            "open_interest": 1050252.04,
            "volume_24h": 37829739.03,
            "volume_quote_24h": 0,
            "price_change_percent_24h": 2.9594,
            "high_24h": 2619.98,
            "low_24h": 2490.3,
            "bid_price": 2610,
            "ask_price": 2610.01,
            "updated_at": "2025-06-16T06:28:17.000Z"
          },
          "funding_rate": {
            "funding_rate": 0.00004017,
            "funding_time": 1750060800000,
            "next_funding_time": 1750060800000,
            "mark_price": 2610.01,
            "index_price": 2611.28
          }
        }
      }
    }
  ]
}
```

## 生产环境部署

### 1. 构建项目

```bash
npm run build
```

### 2. 启动生产服务器

```bash
npm start
```

### 3. 跨域配置

项目已在 `next.config.ts` 中配置了跨域处理：

- 开发环境：自动代理到 `localhost:3000`
- 生产环境：使用相对路径 `/api/coins`
- 完整的CORS头部配置
- API路由重写支持

### 4. 环境变量配置

生产环境需要设置：

```env
NODE_ENV=production
API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

## 性能优化

项目已实施多项性能优化措施：

### 前端优化
- React.memo 防止不必要的重渲染
- useMemo 缓存计算结果
- useCallback 优化事件处理
- 动态导入和代码分割
- CSS优化和Purge

### 构建优化
- Webpack代码分割
- 静态资源优化
- 图片格式优化（AVIF, WebP）
- Gzip压缩
- 缓存策略配置

### 数据获取优化
- 自动重试机制
- 请求取消处理
- 页面可见性检测
- 30秒自动刷新
- 错误边界处理

## 开发指南

### 添加新的交易所

1. 在 `app/types/market.ts` 中添加交易所配置：

```typescript
export const EXCHANGE_CONFIG = {
  // 现有交易所...
  newExchange: {
    name: 'New Exchange',
    logo: '/logos/new-exchange.svg',
    color: '#FF6B35',
    website: 'https://newexchange.com'
  }
};
```

2. 后端API需要提供对应交易所的数据

### 自定义主题

在 `tailwind.config.ts` 中修改主题配置：

```typescript
theme: {
  extend: {
    colors: {
      // 自定义颜色
    }
  }
}
```

### 添加新语言

在 `app/contexts/LanguageContext.tsx` 中添加翻译：

```typescript
const translations = {
  zh: { /* 中文翻译 */ },
  en: { /* 英文翻译 */ },
  ja: { /* 日文翻译 */ } // 新语言
};
```

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 这是一个非商业项目，仅用于展示和学习目的。
