const BaseExchange = require('../adapters/BaseExchange');
const database = require('../config/database');

class BinanceAdapter extends BaseExchange {
    constructor(config = {}) {
        super('binance', config);
        this.name = 'Binance';
    }

    // 获取现货数据
    async fetchSpotData(symbols = null) {
        this.checkInitialized();
        
        try {
            const spotSymbols = symbols || this.getUSDTSymbols('spot'); // 获取所有现货交易对
            console.log(`📊 Fetching Binance spot data for ${spotSymbols.length} symbols...`);
            
            const spotData = [];
            
            // Binance支持批量获取所有ticker
            const tickers = await this.executeWithRetry(async () => {
                return await this.exchange.fetchTickers(spotSymbols);
            });
            
            for (const symbol of spotSymbols) {
                try {
                    const ticker = tickers[symbol];
                    if (ticker) {
                        const formattedData = this.formatTickerData(ticker, symbol, 'spot');
                        spotData.push(formattedData);
                    }
                } catch (error) {
                    console.warn(`Failed to process spot data for ${symbol}:`, error.message);
                }
            }
            
            // 保存到数据库
            if (spotData.length > 0) {
                const tableName = database.getTableName('binance', 'spot_data');
                const result = await database.upsertBatchData(tableName, spotData);
                console.log(`💾 Binance spot data saved: ${spotData.length} symbols, affected rows: ${result.affectedRows}`);
                
                await this.updateExchangeStatus('spot', spotData.length);
            }
            
            return spotData;
        } catch (error) {
            console.error('Failed to fetch Binance spot data:', error.message);
            await this.updateExchangeStatus('spot', 0, error);
            throw error;
        }
    }

    // 获取永续合约数据
    async fetchPerpetualData(symbols = null) {
        this.checkInitialized();
        
        try {
            const perpetualSymbols = symbols || this.getUSDTSymbols('perpetual'); // 获取所有永续合约
            console.log(`🔄 Fetching Binance perpetual data for ${perpetualSymbols.length} symbols...`);
            
            const perpetualData = [];
            
            // 获取24h统计数据
            const tickers = await this.executeWithRetry(async () => {
                return await this.exchange.fetchTickers(perpetualSymbols);
            });
            
            // 批量获取所有永续合约的资金费率
            let fundingRates = {};
            try {
                const allFundingRates = await this.exchange.fetchFundingRates(perpetualSymbols);
                fundingRates = allFundingRates || {};
            } catch (error) {
                console.warn('Failed to fetch batch funding rates:', error.message);
            }
            
            for (const symbol of perpetualSymbols) {
                try {
                    const ticker = tickers[symbol];
                    if (ticker) {
                        const fundingRateInfo = fundingRates[symbol];
                        
                        const formattedData = {
                            symbol: symbol,
                            base_asset: this.exchange.markets[symbol]?.base || symbol.split('/')[0],
                            quote_asset: this.exchange.markets[symbol]?.quote || symbol.split('/')[1],
                            last_price: ticker.last || null,
                            mark_price: ticker.info?.markPrice || ticker.last || null,
                            index_price: ticker.info?.indexPrice || ticker.last || null,
                            bid_price: ticker.bid || null,
                            ask_price: ticker.ask || null,
                            bid_size: ticker.bidVolume || null,
                            ask_size: ticker.askVolume || null,
                            volume_24h: ticker.baseVolume || null,
                            volume_base_24h: ticker.baseVolume || null,
                            volume_quote_24h: ticker.quoteVolume || null,
                            turnover_24h: ticker.quoteVolume || null,
                            high_24h: ticker.high || null,
                            low_24h: ticker.low || null,
                            open_24h: ticker.open || null,
                            close_24h: ticker.close || ticker.last || null,
                            price_change_24h: ticker.change || null,
                            price_change_percent_24h: ticker.percentage || null,
                            open_interest: ticker.info?.openInterest || null,
                            open_interest_value: null,
                            funding_rate: fundingRateInfo?.fundingRate || null,
                            next_funding_time: fundingRateInfo?.fundingDatetime ? new Date(fundingRateInfo.fundingDatetime).getTime() : null,
                            predicted_funding_rate: fundingRateInfo?.fundingRate || null,
                            count_24h: ticker.count || null,
                            timestamp: Date.now(),
                            raw_data: JSON.stringify({
                                ticker: ticker,
                                fundingRate: fundingRateInfo
                            })
                        };
                        
                        perpetualData.push(formattedData);
                    }
                } catch (error) {
                    console.warn(`Failed to process perpetual data for ${symbol}:`, error.message);
                }
            }
            
            // 保存到数据库
            if (perpetualData.length > 0) {
                const tableName = database.getTableName('binance', 'perpetual_data');
                const result = await database.upsertBatchData(tableName, perpetualData);
                console.log(`💾 Binance perpetual data saved: ${perpetualData.length} symbols, affected rows: ${result.affectedRows}`);
                
                await this.updateExchangeStatus('perpetual', perpetualData.length);
            }
            
            return perpetualData;
        } catch (error) {
            console.error('Failed to fetch Binance perpetual data:', error.message);
            await this.updateExchangeStatus('perpetual', 0, error);
            throw error;
        }
    }

    // 获取订单簿数据
    async fetchOrderBookData(symbols = null, limit = 20) {
        this.checkInitialized();
        
        try {
            const targetSymbols = symbols || [...this.getUSDTSymbols('spot').slice(0, 30), ...this.getUSDTSymbols('perpetual').slice(0, 30)];
            console.log(`📚 Fetching Binance orderbook data for ${targetSymbols.length} symbols...`);
            
            const orderBookData = [];
            
            // 批量获取订单簿数据
            const orderBooks = await this.executeWithRetry(async () => {
                return await this.exchange.fetchOrderBooks(targetSymbols, limit);
            });
            
            for (const symbol of targetSymbols) {
                try {
                    const orderBook = orderBooks[symbol];
                    
                    if (orderBook && orderBook.bids && orderBook.asks) {
                        const market = this.exchange.markets[symbol];
                        const type = (market?.type === 'spot' || market?.spot === true) ? 'spot' : 'perpetual';
                        const timestamp = Date.now();
                        
                        // 处理买单数据
                        orderBook.bids.forEach((bid, index) => {
                            const [price, amount] = bid;
                            orderBookData.push({
                                symbol: symbol,
                                type: type,
                                side: 'bid',
                                price: price,
                                amount: amount,
                                total: price * amount,
                                order_index: index,
                                timestamp: timestamp,
                                raw_data: JSON.stringify({ level: index, price: price, amount: amount, side: 'bid' })
                            });
                        });
                        
                        // 处理卖单数据
                        orderBook.asks.forEach((ask, index) => {
                            const [price, amount] = ask;
                            orderBookData.push({
                                symbol: symbol,
                                type: type,
                                side: 'ask',
                                price: price,
                                amount: amount,
                                total: price * amount,
                                order_index: index,
                                timestamp: timestamp,
                                raw_data: JSON.stringify({ level: index, price: price, amount: amount, side: 'ask' })
                            });
                        });
                    }
                } catch (error) {
                    console.warn(`Failed to process orderbook for ${symbol}:`, error.message);
                }
            }
            
            // 保存到数据库
            if (orderBookData.length > 0) {
                const tableName = database.getTableName('binance', 'orderbook_data');
                const result = await database.upsertBatchData(tableName, orderBookData);
                console.log(`💾 Binance orderbook data saved: ${orderBookData.length} records, affected rows: ${result.affectedRows}`);
                
                await this.updateExchangeStatus('orderbook', orderBookData.length);
            }

            console.log(`✅ Binance fetched ${targetSymbols.length} orderbooks in one batch call`);
            return orderBookData;
        } catch (error) {
            console.error('Failed to fetch Binance orderbook data:', error.message);
            await this.updateExchangeStatus('orderbook', 0, error);
            throw error;
        }
    }

    // 获取资金费率数据
    async fetchFundingRateData(symbols = null) {
        this.checkInitialized();
        
        try {
            const perpetualSymbols = symbols || this.getUSDTSymbols('perpetual');
            console.log(`💰 Fetching Binance funding rate data for ${perpetualSymbols.length} symbols...`);
            
            // Binance 一次性批量获取所有资金费率
            const fundingRates = await this.executeWithRetry(async () => {
                return await this.exchange.fetchFundingRates(perpetualSymbols);
            });

            // 转换为数据库格式
            const timestamp = Date.now();
            const fundingRateData = Object.entries(fundingRates || {})
                .filter(([symbol, fundingRateInfo]) => fundingRateInfo)
                .map(([symbol, fundingRateInfo]) => {
                    const fundingTime = fundingRateInfo.fundingDatetime ? 
                        new Date(fundingRateInfo.fundingDatetime).getTime() : timestamp;
                    
                    return {
                        symbol: symbol,
                        funding_rate: fundingRateInfo.fundingRate || 0,
                        funding_time: fundingTime, // 必需字段
                        mark_price: fundingRateInfo.markPrice || null,
                        index_price: fundingRateInfo.indexPrice || null,
                        next_funding_time: fundingTime,
                        timestamp: timestamp,
                        raw_data: JSON.stringify(fundingRateInfo)
                    };
                });

            // 保存到数据库
            if (fundingRateData.length > 0) {
                const tableName = database.getTableName('binance', 'funding_rate_data');
                const result = await database.upsertBatchData(tableName, fundingRateData);
                console.log(`💾 Binance funding rate data saved: ${fundingRateData.length} symbols, affected rows: ${result.affectedRows}`);
                
                await this.updateExchangeStatus('funding_rate', fundingRateData.length);
            }

            console.log(`💰 Binance fetched ${fundingRateData.length} funding rates in one batch call`);
            return fundingRateData;

        } catch (error) {
            console.error('❌ Binance funding rate data fetch failed:', error.message);
            await this.updateExchangeStatus('funding_rate', 0, error);
            throw error;
        }
    }

    // Binance特定的数据处理方法
    async fetchAllData() {
        console.log(`🚀 Starting Binance data collection...`);
        
        try {
            // 1. 更新交易对配置
            await this.saveTradingPairs();
            
            // 2. 获取现货数据
            await this.fetchSpotData();
            
            // 3. 获取永续合约数据
            await this.fetchPerpetualData();
            
            // 4. 获取订单簿数据
            await this.fetchOrderBookData();
            
            // 5. 获取资金费率数据
            await this.fetchFundingRateData();
            
            console.log(`✅ Binance data collection completed successfully`);
            this.lastUpdateTime = new Date();
            
        } catch (error) {
            console.error(`❌ Binance data collection failed:`, error.message);
            throw error;
        }
    }

    // Binance特有的市场数据处理
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
            raw_data: JSON.stringify({
                ...ticker,
                exchange: 'binance',
                type: type,
                // 包含Binance特有的字段
                markPrice: ticker.info?.markPrice,
                indexPrice: ticker.info?.indexPrice,
                openInterest: ticker.info?.openInterest
            })
        };
    }
}

module.exports = BinanceAdapter; 