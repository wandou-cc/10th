import { Metadata } from 'next';
import MarketOverview from '../components/MarketOverview';

export const metadata: Metadata = {
  title: '市场信息 | coinHyper',
  description: '实时交易所数据对比，包括现货和合约价格、成交量、资金费率等信息',
  keywords: ['cryptocurrency', 'market data', 'trading pairs', 'exchange comparison', '加密货币', '市场数据', '交易对', '交易所对比'],
};

export default function MarketPage() {
  return <MarketOverview />;
} 