// 市场数据类型定义

export interface SpotData {
  symbol: string;
  last_price: number;
  volume_24h: number;
  volume_quote_24h: number;
  price_change_percent_24h: number;
  high_24h: number;
  low_24h: number;
  bid_price: number;
  ask_price: number;
  updated_at: string;
}

export interface PerpetualData {
  symbol: string;
  last_price: number;
  mark_price: number;
  funding_rate: number;
  open_interest: number;
  volume_24h: number;
  volume_quote_24h: number;
  price_change_percent_24h: number;
  high_24h: number;
  low_24h: number;
  bid_price: number;
  ask_price: number;
  updated_at: string;
}

export interface FundingRateData {
  funding_rate: number;
  funding_time: number;
  next_funding_time: number;
  mark_price: number;
  index_price: number;
}

export interface ExchangeData {
  spot?: SpotData;
  perpetual?: PerpetualData;
  funding_rate?: FundingRateData;
}

export interface TradingPairData {
  base_asset: string;
  quote_asset: string;
  exchanges: {
    okx?: ExchangeData;
    binance?: ExchangeData;
    bybit?: ExchangeData;
    [key: string]: ExchangeData | undefined;
  };
}

export interface MarketApiResponse {
  data: TradingPairData[];
}

// 交易所配置
export const EXCHANGE_CONFIG = {
  okx: {
    name: 'OKX',
    logo: '/logos/okx.svg',
    color: '#000000',
    website: 'https://www.okx.com'
  },
  binance: {
    name: 'Binance',
    logo: '/logos/binance.svg', 
    color: '#F3BA2F',
    website: 'https://www.binance.com'
  },
  bybit: {
    name: 'Bybit',
    logo: '/logos/bybit.svg',
    color: '#F7931A',
    website: 'https://www.bybit.com'
  }
} as const;

export type ExchangeKey = keyof typeof EXCHANGE_CONFIG;

// 工具函数
export const formatPrice = (price: number, decimals: number = 4): string => {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(2)}B`;
  }
  if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(2)}M`;
  }
  if (volume >= 1e3) {
    return `${(volume / 1e3).toFixed(2)}K`;
  }
  return volume.toFixed(2);
};

export const formatPercentage = (percent: number): string => {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
};

export const getChangeColor = (percent: number): string => {
  return percent >= 0 ? 'text-green-500' : 'text-red-500';
};

export const formatFundingRate = (rate: number): string => {
  return `${(rate * 100).toFixed(4)}%`;
}; 