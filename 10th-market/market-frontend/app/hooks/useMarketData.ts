'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TradingPairData } from '../types/market';

interface UseMarketDataOptions {
  refreshInterval?: number; // 刷新间隔（毫秒）
  autoRefresh?: boolean; // 是否自动刷新
  apiUrl?: string; // API地址
}

interface UseMarketDataReturn {
  data: TradingPairData[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

const DEFAULT_OPTIONS: UseMarketDataOptions = {
  refreshInterval: 30000, // 30秒
  autoRefresh: true,
  apiUrl: process.env.NODE_ENV === 'production' 
    ? '/api/coins' 
    : 'http://localhost:3000/api/coins'
};

export function useMarketData(options: UseMarketDataOptions = {}): UseMarketDataReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [data, setData] = useState<TradingPairData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 获取市场数据
  const fetchMarketData = useCallback(async () => {
    try {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      setError(null);
      
      const response = await fetch(opts.apiUrl!, {
        signal: abortControllerRef.current.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // 处理跨域
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // 处理不同的响应格式
      let marketData: TradingPairData[];
      
      if (result.data && Array.isArray(result.data)) {
        marketData = result.data;
      } else if (Array.isArray(result)) {
        marketData = result;
      } else {
        throw new Error('Invalid data format received from API');
      }

      setData(marketData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          // 请求被取消，不设置错误
          return;
        }
        setError(`获取数据失败: ${err.message}`);
      } else {
        setError('获取数据时发生未知错误');
      }
      console.error('Failed to fetch market data:', err);
    } finally {
      setLoading(false);
    }
  }, [opts.apiUrl]);

  // 手动刷新
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchMarketData();
  }, [fetchMarketData]);

  // 初始化和自动刷新
  useEffect(() => {
    // 初始加载
    fetchMarketData();

    // 设置自动刷新
    if (opts.autoRefresh && opts.refreshInterval) {
      intervalRef.current = setInterval(() => {
        fetchMarketData();
      }, opts.refreshInterval);
    }

    // 清理函数
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchMarketData, opts.autoRefresh, opts.refreshInterval]);

  // 页面可见性变化时处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && opts.autoRefresh) {
        // 页面变为可见时，立即刷新数据
        fetchMarketData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchMarketData, opts.autoRefresh]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

// 模拟数据（用于开发测试）
export const useMockMarketData = (): UseMarketDataReturn => {
  const mockData: TradingPairData[] = [
    {
      base_asset: "ETH",
      quote_asset: "USDT", 
      exchanges: {
        okx: {
          spot: {
            symbol: "ETH/USDT",
            last_price: 2611.37,
            volume_24h: 167418.718051,
            volume_quote_24h: 427050883.1292407,
            price_change_percent_24h: 2.957,
            high_24h: 2621.38,
            low_24h: 2491.82,
            bid_price: 2611.36,
            ask_price: 2611.37,
            updated_at: "2025-06-16T06:28:17.000Z"
          },
          perpetual: {
            symbol: "ETH/USDT:USDT",
            last_price: 2610.01,
            mark_price: 2610.01,
            funding_rate: 0.00004017,
            open_interest: 0,
            volume_24h: 37829739.03,
            volume_quote_24h: 0,
            price_change_percent_24h: 2.9594,
            high_24h: 2619.98,
            low_24h: 2490.3,
            bid_price: 2610,
            ask_price: 2610.01,
            updated_at: "2025-06-16T06:28:17.000Z"
          },
          funding_rate: {
            funding_rate: 0.00004017,
            funding_time: 1750060800000,
            next_funding_time: 1750060800000,
            mark_price: 0,
            index_price: 0
          }
        },
        binance: {
          spot: {
            symbol: "ETH/USDT",
            last_price: 2611.3,
            volume_24h: 404795.062,
            volume_quote_24h: 1031208331.505835,
            price_change_percent_24h: 2.953,
            high_24h: 2620.7,
            low_24h: 2492,
            bid_price: 2611.29,
            ask_price: 2611.3,
            updated_at: "2025-06-16T06:28:20.000Z"
          },
          perpetual: {
            symbol: "ETH/USDT:USDT",
            last_price: 2610,
            mark_price: 2610,
            funding_rate: 0.0000902,
            open_interest: 0,
            volume_24h: 4472142.312,
            volume_quote_24h: 11383789262.25,
            price_change_percent_24h: 2.945,
            high_24h: 2620.74,
            low_24h: 2490.38,
            bid_price: 0,
            ask_price: 0,
            updated_at: "2025-06-16T06:28:23.000Z"
          },
          funding_rate: {
            funding_rate: 0.0000902,
            funding_time: 1750060800000,
            next_funding_time: 1750060800000,
            mark_price: 2609.99,
            index_price: 2611.13906977
          }
        },
        bybit: {
          spot: {
            symbol: "ETH/USDT",
            last_price: 2611.29,
            volume_24h: 98000.21042,
            volume_quote_24h: 249518399.4153981,
            price_change_percent_24h: 2.95,
            high_24h: 2620.41,
            low_24h: 2492.01,
            bid_price: 2611.29,
            ask_price: 2611.3,
            updated_at: "2025-06-16T06:28:26.000Z"
          },
          perpetual: {
            symbol: "ETH/USDT:USDT",
            last_price: 2610.02,
            mark_price: 2610.03,
            funding_rate: 0.00007479,
            open_interest: 1050252.04,
            volume_24h: 1824407.97,
            volume_quote_24h: 4645753822.3812,
            price_change_percent_24h: 2.9268,
            high_24h: 2619.99,
            low_24h: 2490.14,
            bid_price: 2610.01,
            ask_price: 2610.02,
            updated_at: "2025-06-16T06:28:26.000Z"
          },
          funding_rate: {
            funding_rate: 0.00007479,
            funding_time: 1750060800000,
            next_funding_time: 1750060800000,
            mark_price: 2610.03,
            index_price: 2611.28
          }
        }
      }
    }
  ];

  return {
    data: mockData,
    loading: false,
    error: null,
    lastUpdated: new Date(),
    refresh: async () => {}
  };
}; 