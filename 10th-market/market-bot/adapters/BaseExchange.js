const ccxt = require('ccxt');
const database = require('../config/database');

class BaseExchange {
    constructor(exchangeId, config = {}) {
        this.exchangeId = exchangeId.toLowerCase();
        this.config = config;
        this.exchange = null;
        this.isInitialized = false;
        this.lastUpdateTime = null;
        this.errorCount = 0;
        this.maxRetries = 3;
    }

    // 初始化交易所连接
    async init() {
        try {
            // 动态创建交易所实例
            const ExchangeClass = ccxt[this.exchangeId];
            if (!ExchangeClass) {
                throw new Error(`Exchange ${this.exchangeId} not supported by CCXT`);
            }

            this.exchange = new ExchangeClass({
                // 公共数据不需要API密钥
                sandbox: this.config.sandbox || false,
                enableRateLimit: true,
                timeout: 30000,
                // 添加代理支持
                httpsProxy: process.env.HTTPS_PROXY || this.config.httpsProxy || null,
                ...this.config.options
            });

            // 加载市场数据
            await this.exchange.loadMarkets();
            this.isInitialized = true;
            
            console.log(`✅ ${this.exchangeId.toUpperCase()} 交易所初始化成功`);
            console.log(`   已加载市场数据: ${Object.keys(this.exchange.markets).length} 个`);
            
            return true;
        } catch (error) {
            console.error(`❌ ${this.exchangeId.toUpperCase()} 初始化失败:`, error.message);
            this.isInitialized = false;
            throw error;
        }
    }

    // 检查交易所是否已初始化
    checkInitialized() {
        if (!this.isInitialized || !this.exchange) {
            throw new Error(`Exchange ${this.exchangeId} not initialized`);
        }
    }

    // 错误处理和重试机制
    async executeWithRetry(operation, retries = this.maxRetries) {
        for (let i = 0; i < retries; i++) {
            try {
                return await operation();
            } catch (error) {
                console.warn(`Attempt ${i + 1}/${retries} failed for ${this.exchangeId}:`, error.message);
                
                if (i === retries - 1) {
                    this.errorCount++;
                    throw error;
                }
                
                // 指数退避重试
                await this.sleep(Math.pow(2, i) * 1000);
            }
        }
    }

    // 工具方法：睡眠
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 获取USDT交易对列表
    getUSDTSymbols(type = 'all') {
        this.checkInitialized();
        
        const symbols = Object.keys(this.exchange.markets).filter(symbol => {
            const market = this.exchange.markets[symbol];
            const isUSDT = market.quote === 'USDT';
            const isActive = market.active;
            
            if (type === 'spot') {
                // 现货：type === 'spot' 或者 spot === true
                return isUSDT && isActive && (market.type === 'spot' || market.spot === true);
            } else if (type === 'perpetual' || type === 'swap') {
                // 永续合约：type === 'swap' 且没有到期时间，或者 swap === true
                return isUSDT && isActive && (
                    (market.type === 'swap' && !market.expiry) || 
                    (market.swap === true && !market.expiry)
                );
            } else if (type === 'future') {
                // 期货：type === 'future' 且有到期时间，或者 future === true
                return isUSDT && isActive && (
                    (market.type === 'future' && market.expiry) || 
                    (market.future === true && market.expiry)
                );
            }
            
            return isUSDT && isActive;
        });
        
        return symbols;
    }

    // 获取交易对配置信息
    async fetchTradingPairs() {
        this.checkInitialized();
        
        const symbols = this.getUSDTSymbols();
        const tradingPairs = [];
        
        for (const symbol of symbols) {
            try {
                const market = this.exchange.markets[symbol];
                // 更准确地判断交易对类型
                let pairType = 'unknown';
                if (market.type === 'spot' || market.spot === true) {
                    pairType = 'spot';
                } else if (market.type === 'swap' && !market.expiry) {
                    pairType = 'perpetual';
                } else if (market.type === 'future' && market.expiry) {
                    pairType = 'future';
                } else if (market.swap === true && !market.expiry) {
                    pairType = 'perpetual';
                } else if (market.future === true && market.expiry) {
                    pairType = 'future';
                }
                
                const pairData = {
                    symbol: symbol,
                    base_asset: market.base,
                    quote_asset: market.quote,
                    type: pairType,
                    is_active: market.active,
                    precision_base: market.precision?.amount || 8,
                    precision_quote: market.precision?.price || 8,
                    precision_price: market.precision?.price || 8,
                    precision_amount: market.precision?.amount || 8,
                    min_amount: market.limits?.amount?.min || null,
                    max_amount: market.limits?.amount?.max || null,
                    min_cost: market.limits?.cost?.min || null,
                    max_cost: market.limits?.cost?.max || null,
                    min_price: market.limits?.price?.min || null,
                    max_price: market.limits?.price?.max || null,
                    tick_size: market.precision?.price ? Math.pow(10, -market.precision.price) : null,
                    step_size: market.precision?.amount ? Math.pow(10, -market.precision.amount) : null,
                    contract_size: market.contractSize || null,
                    settlement_currency: market.settle || null,
                    is_linear: market.linear !== false,
                    is_inverse: market.inverse === true,
                    raw_data: JSON.stringify(market)
                };
                
                tradingPairs.push(pairData);
            } catch (error) {
                console.warn(`Failed to process market ${symbol}:`, error.message);
            }
        }
        
        return tradingPairs;
    }

    // 获取现货数据 - 子类需要实现
    async fetchSpotData(symbols = null) {
        throw new Error('fetchSpotData must be implemented by subclass');
    }

    // 获取永续合约数据 - 子类需要实现
    async fetchPerpetualData(symbols = null) {
        throw new Error('fetchPerpetualData must be implemented by subclass');
    }

    // 获取订单簿数据 - 子类需要实现
    async fetchOrderBookData(symbols = null, limit = 20) {
        throw new Error('fetchOrderBookData must be implemented by subclass');
    }

    // 获取资金费率数据 - 子类需要实现
    async fetchFundingRateData(symbols = null) {
        throw new Error('fetchFundingRateData must be implemented by subclass');
    }

    // 保存交易对配置到数据库
    async saveTradingPairs() {
        try {
            const tradingPairs = await this.fetchTradingPairs();
            const tableName = database.getTableName(this.exchangeId, 'trading_pairs');
            
            if (tradingPairs.length > 0) {
                const result = await database.upsertBatchData(tableName, tradingPairs);
                console.log(`💾 ${this.exchangeId.toUpperCase()} 交易对配置已保存: ${tradingPairs.length} 个交易对, 影响行数: ${result.affectedRows}`);
                
                // 更新交易所状态
                await this.updateExchangeStatus('pairs', tradingPairs.length);
                return tradingPairs.length;
            }
            
            return 0;
        } catch (error) {
            console.error(`Failed to save trading pairs for ${this.exchangeId}:`, error.message);
            throw error;
        }
    }

    // 更新交易所状态
    async updateExchangeStatus(dataType, count = 0, error = null) {
        try {
            const now = new Date();
            const statusData = {
                exchange: this.exchangeId,
                last_update_time: now,
                status: error ? 'error' : 'active',
                error_message: error ? error.message : null,
                last_error_time: error ? now : null
            };

            // 根据数据类型更新相应字段
            switch (dataType) {
                case 'pairs':
                    statusData.last_pairs_update = now;
                    statusData.total_spot_pairs = count;
                    break;
                case 'spot':
                    statusData.last_spot_update = now;
                    statusData.active_spot_pairs = count;
                    break;
                case 'perpetual':
                    statusData.last_perpetual_update = now;
                    statusData.active_perpetual_pairs = count;
                    break;
                case 'orderbook':
                    statusData.last_orderbook_update = now;
                    break;
                case 'funding_rate':
                    statusData.last_funding_rate_update = now;
                    break;
            }

            await database.upsertData('exchange_status', statusData);
        } catch (error) {
            console.warn(`Failed to update exchange status for ${this.exchangeId}:`, error.message);
        }
    }

    // 通用数据格式化方法
    formatTickerData(ticker, symbol, type = 'spot') {
        const timestamp = Date.now();
        return {
            symbol: symbol,
            base_asset: this.exchange.markets[symbol]?.base || symbol.split('/')[0],
            quote_asset: this.exchange.markets[symbol]?.quote || symbol.split('/')[1],
            last_price: ticker.last || null,
            bid_price: ticker.bid || null,
            ask_price: ticker.ask || null,
            bid_size: ticker.bidVolume || null,
            ask_size: ticker.askVolume || null,
            volume_24h: ticker.baseVolume || null,
            volume_base_24h: ticker.baseVolume || null,
            volume_quote_24h: ticker.quoteVolume || null,
            high_24h: ticker.high || null,
            low_24h: ticker.low || null,
            open_24h: ticker.open || null,
            close_24h: ticker.close || ticker.last || null,
            price_change_24h: ticker.change || null,
            price_change_percent_24h: ticker.percentage || null,
            count_24h: ticker.count || null,
            timestamp: timestamp,
            raw_data: JSON.stringify(ticker)
        };
    }

    // 获取交易所信息
    getInfo() {
        return {
            id: this.exchangeId,
            name: this.exchange?.name || this.exchangeId,
            isInitialized: this.isInitialized,
            lastUpdateTime: this.lastUpdateTime,
            errorCount: this.errorCount,
            marketsCount: this.exchange ? Object.keys(this.exchange.markets).length : 0,
            usdtSpotsCount: this.isInitialized ? this.getUSDTSymbols('spot').length : 0,
            usdtPerpetualsCount: this.isInitialized ? this.getUSDTSymbols('perpetual').length : 0
        };
    }

    // 获取分类后的市场数据
    getClassifiedMarkets() {
        this.checkInitialized();
        
        const classified = {
            spot: [],
            perpetual: [],
            future: [],
            all: []
        };
        
        Object.keys(this.exchange.markets).forEach(symbol => {
            const market = this.exchange.markets[symbol];
            
            // 只处理USDT交易对且活跃的市场
            if (market.quote !== 'USDT' || !market.active) {
                return;
            }
            
            classified.all.push(symbol);
            
            // 现货市场
            if (market.type === 'spot' || market.spot === true) {
                classified.spot.push(symbol);
            }
            // 永续合约
            else if ((market.type === 'swap' && !market.expiry) || (market.swap === true && !market.expiry)) {
                classified.perpetual.push(symbol);
            }
            // 期货合约
            else if ((market.type === 'future' && market.expiry) || (market.future === true && market.expiry)) {
                classified.future.push(symbol);
            }
        });
        
        return classified;
    }

    // 获取市场类型
    getMarketType(symbol) {
        this.checkInitialized();
        
        const market = this.exchange.markets[symbol];
        if (!market) return 'unknown';
        
        if (market.type === 'spot' || market.spot === true) {
            return 'spot';
        } else if ((market.type === 'swap' && !market.expiry) || (market.swap === true && !market.expiry)) {
            return 'perpetual';
        } else if ((market.type === 'future' && market.expiry) || (market.future === true && market.expiry)) {
            return 'future';
        }
        
        return 'unknown';
    }

    // 通用批量资金费率查询方法
    async fetchFundingRatesBatch(symbols = null) {
        this.checkInitialized();
        
        try {
            const perpetualSymbols = symbols || this.getUSDTSymbols('perpetual');
            console.log(`💰 Fetching funding rates for ${perpetualSymbols.length} symbols...`);
            
            // 一次性批量获取所有交易所资金费率
            const fundingRates = await this.executeWithRetry(async () => {
                return await this.exchange.fetchFundingRates(perpetualSymbols);
            });
            
            // 直接转换批量数据，无需额外循环
            const timestamp = Date.now();
            const formattedData = Object.entries(fundingRates || {})
                .filter(([symbol, fundingRateInfo]) => fundingRateInfo)
                .map(([symbol, fundingRateInfo]) => ({
                    exchange: this.exchangeId,
                    symbol: symbol,
                    timestamp: timestamp,
                    funding_rate: fundingRateInfo.fundingRate || 0,
                    next_funding_time: fundingRateInfo.fundingDatetime ? 
                        new Date(fundingRateInfo.fundingDatetime).getTime() : timestamp,
                    predicted_rate: fundingRateInfo.fundingRate || 0,
                    mark_price: fundingRateInfo.markPrice || null,
                    index_price: fundingRateInfo.indexPrice || null,
                    raw_data: fundingRateInfo
                }));

            console.log(`✅ ${this.exchangeId} fetched ${formattedData.length} funding rates in one batch call`);
            return formattedData;

        } catch (error) {
            console.error(`❌ ${this.exchangeId} funding rates batch fetch failed:`, error.message);
            throw error;
        }
    }
}

module.exports = BaseExchange; 