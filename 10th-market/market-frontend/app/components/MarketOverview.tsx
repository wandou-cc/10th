'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import { useMarketData } from '../hooks/useMarketData';
import { 
  TradingPairData, 
  EXCHANGE_CONFIG, 
  formatPrice, 
  formatVolume, 
  formatPercentage, 
  formatFundingRate,
  getChangeColor,
  ExchangeKey,
  SpotData,
  PerpetualData,
  FundingRateData
} from '../types/market';

// 交易对卡片组件
const TradingPairCard = memo(({ pair }: { pair: TradingPairData }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'spot' | 'perpetual'>('spot');
  
  const cardBg = theme === 'dark' 
    ? 'bg-gray-800/50 border-gray-700/50' 
    : 'bg-white border-gray-200';
  
  const exchangeKeys = Object.keys(pair.exchanges) as ExchangeKey[];
  
  // 获取平均价格用于主要显示
  const getAveragePrice = () => {
    const prices = exchangeKeys
      .map(key => pair.exchanges[key]?.spot?.last_price)
      .filter(price => price !== undefined) as number[];
    
    if (prices.length === 0) return 0;
    return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  };

  // 获取平均涨跌幅
  const getAverageChange = () => {
    const changes = exchangeKeys
      .map(key => pair.exchanges[key]?.spot?.price_change_percent_24h)
      .filter(change => change !== undefined) as number[];
    
    if (changes.length === 0) return 0;
    return changes.reduce((sum, change) => sum + change, 0) / changes.length;
  };

  const avgPrice = getAveragePrice();
  const avgChange = getAverageChange();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl ${cardBg} border backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      {/* 主要信息 - 点击展开 */}
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          {/* 左侧：交易对信息 */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {pair.base_asset.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {pair.base_asset}/{pair.quote_asset}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {exchangeKeys.length} 个交易所
              </p>
            </div>
          </div>
          
          {/* 中间：价格信息 */}
          <div className="text-center">
            <div className="text-2xl font-bold">
              ${formatPrice(avgPrice)}
            </div>
            <div className={`text-sm flex items-center justify-center ${getChangeColor(avgChange)}`}>
              {avgChange >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              )}
              {formatPercentage(avgChange)}
            </div>
          </div>
          
          {/* 右侧：展开图标 */}
          <div className="flex items-center">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="w-6 h-6 text-gray-400" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* 展开的详细信息 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
              {/* 标签切换 */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mt-4 mb-4">
                <button
                  onClick={() => setActiveTab('spot')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'spot'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  现货交易
                </button>
                <button
                  onClick={() => setActiveTab('perpetual')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'perpetual'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  合约交易
                </button>
              </div>

              {/* 交易所数据列表 */}
              <div className="space-y-3">
                {exchangeKeys.map((exchangeKey) => {
                  const exchange = pair.exchanges[exchangeKey];
                  if (!exchange) return null;
                  
                  const data = activeTab === 'spot' ? exchange.spot : exchange.perpetual;
                  if (!data) return null;
                  
                  const config = EXCHANGE_CONFIG[exchangeKey];
                  
                  return (
                    <ExchangeDataRow 
                      key={`${exchangeKey}-${activeTab}`}
                      config={config}
                      data={data}
                      activeTab={activeTab}
                      fundingRate={exchange.funding_rate}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

TradingPairCard.displayName = 'TradingPairCard';

// 交易所数据行组件
const ExchangeDataRow = memo(({ 
  config, 
  data, 
  activeTab,
  fundingRate 
}: {
  config: typeof EXCHANGE_CONFIG[ExchangeKey];
  data: SpotData | PerpetualData;
  activeTab: 'spot' | 'perpetual';
  fundingRate?: FundingRateData;
}) => {
  const { theme } = useTheme();
  
  const rowBg = theme === 'dark' 
    ? 'bg-gray-700/30 hover:bg-gray-700/50' 
    : 'bg-gray-50 hover:bg-gray-100';
  
  return (
    <div className={`${rowBg} rounded-lg p-4 transition-colors duration-200`}>
      {/* 交易所头部信息 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: config.color }}
          >
            {config.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold">{config.name}</div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {data.symbol}
            </div>
          </div>
        </div>
        
        {/* 价格和涨跌幅 */}
        <div className="text-right">
          <div className="text-lg font-semibold">
            ${formatPrice(data.last_price)}
          </div>
          <div className={`text-sm flex items-center ${getChangeColor(data.price_change_percent_24h)}`}>
            {data.price_change_percent_24h >= 0 ? (
              <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
            )}
            {formatPercentage(data.price_change_percent_24h)}
          </div>
        </div>
      </div>
      
      {/* 详细数据网格 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
            24h最高
          </div>
          <div className="font-semibold">${formatPrice(data.high_24h)}</div>
        </div>
        <div className="text-center">
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
            24h最低
          </div>
          <div className="font-semibold">${formatPrice(data.low_24h)}</div>
        </div>
        <div className="text-center">
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
            24h成交量
          </div>
          <div className="font-semibold">{formatVolume(data.volume_24h)}</div>
        </div>
        {activeTab === 'perpetual' && fundingRate && (
          <div className="text-center">
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              资金费率
            </div>
            <div className={`font-semibold ${getChangeColor(fundingRate.funding_rate)}`}>
              {formatFundingRate(fundingRate.funding_rate)}
            </div>
          </div>
        )}
        {activeTab === 'perpetual' && 'open_interest' in data && (
          <div className="text-center">
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              持仓量
            </div>
            <div className="font-semibold">{formatVolume(data.open_interest)}</div>
          </div>
        )}
      </div>

      {/* 买卖价差 */}
      <div className="flex justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
            买一价
          </div>
          <div className="text-green-500 font-semibold">${formatPrice(data.bid_price)}</div>
        </div>
        <div className="text-center">
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
            卖一价
          </div>
          <div className="text-red-500 font-semibold">${formatPrice(data.ask_price)}</div>
        </div>
        <div className="text-center">
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
            价差
          </div>
          <div className="font-semibold">
            ${formatPrice(data.ask_price - data.bid_price)}
          </div>
        </div>
      </div>
    </div>
  );
});

ExchangeDataRow.displayName = 'ExchangeDataRow';

// 主组件
export default function MarketOverview() {
  const { theme } = useTheme();
  const { 
    data, 
    loading, 
    error, 
    lastUpdated, 
    refresh 
  } = useMarketData();
  
  const containerBg = theme === 'dark' 
    ? 'bg-gray-900/50' 
    : 'bg-gray-50';
  
  const headerBg = theme === 'dark' 
    ? 'bg-gray-800/50 border-gray-700' 
    : 'bg-white border-gray-200';

  return (
    <div className={`min-h-screen ${containerBg} p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className={`${headerBg} rounded-xl border backdrop-blur-sm p-6 mb-6`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">交易所数据对比</h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                实时价格、成交量和资金费率
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 刷新按钮 */}
              <button
                onClick={refresh}
                disabled={loading}
                className={`p-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                } transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="刷新数据"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* 最后更新时间和状态 */}
          <div className="flex items-center justify-between mt-4">
            {lastUpdated && (
              <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <ClockIcon className="w-4 h-4 mr-1" />
                最后更新: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            
            {!loading && !error && data.length > 0 && (
              <div className="flex items-center text-sm text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                数据正常
              </div>
            )}
          </div>
        </div>

        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            <span className="ml-4 text-lg text-gray-600 dark:text-gray-400">正在获取数据...</span>
          </div>
        )}

        {/* 交易对列表 */}
        {!loading && (
          <div className="space-y-6">
            <AnimatePresence>
              {data.map((pair) => (
                <TradingPairCard 
                  key={`${pair.base_asset}-${pair.quote_asset}`}
                  pair={pair}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* 无数据提示 */}
        {!loading && !error && data.length === 0 && (
          <div className="text-center py-16">
            <div className={`text-xl text-gray-500 dark:text-gray-400 mb-4`}>
              暂无交易数据
            </div>
            <button
              onClick={refresh}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              重新获取
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 