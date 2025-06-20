const express = require('express');
const cors = require('cors');
const database = require('../config/database');

class ApiServer {
    constructor(config = {}) {
        this.config = {
            port: config.port || process.env.API_PORT || 3000,
            enableCors: config.enableCors !== false,
            rateLimit: config.rateLimit || 100, // 每分钟请求数限制
            ...config
        };
        
        this.app = express();
        this.server = null;
        this.dataCollector = null;
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    // 设置中间件
    setupMiddleware() {
        // CORS支持
        if (this.config.enableCors) {
            this.app.use(cors());
        }
        
        // JSON解析
        this.app.use(express.json());
        
        // 请求日志
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
            next();
        });
        
        // 错误处理
        this.app.use((error, req, res, next) => {
            console.error('API错误:', error);
            res.status(500).json({
                success: false,
                error: '服务器内部错误',
                message: error.message
            });
        });
    }

    // 设置路由
    setupRoutes() {
        // 健康检查
        this.app.get('/health', (req, res) => {
            res.json({
                success: true,
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });

        // API信息
        this.app.get('/api/info', (req, res) => {
            res.json({
                success: true,
                data: {
                    name: 'Crypto Market Data API',
                    version: '1.0.0',
                    description: '加密货币市场数据收集和查询API',
                    exchanges: ['OKX', 'Binance', 'Bybit'],
                    dataTypes: ['spot', 'perpetual', 'orderbook', 'fundingRate'],
                    endpoints: [
                        'GET /api/exchanges - 交易所列表',
                        'GET /api/markets/:exchange - 交易对列表',
                        'GET /api/spot/:exchange - 现货数据',
                        'GET /api/perpetual/:exchange - 永续合约数据',
                        'GET /api/orderbook/:exchange - 订单簿数据',
                        'GET /api/funding-rates/:exchange - 资金费率数据',
                        'GET /api/collector/status - 数据收集器状态'
                    ]
                }
            });
        });

        // 交易所列表
        this.app.get('/api/exchanges', async (req, res) => {
            try {
                const exchanges = await database.query(`
                    SELECT exchange, status, last_update_time, 
                           active_spot_pairs, active_perpetual_pairs,
                           last_spot_update, last_perpetual_update,
                           error_message
                    FROM exchange_status 
                    ORDER BY exchange
                `);
                
                res.json({
                    success: true,
                    data: exchanges,
                    count: exchanges.length
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: '获取交易所列表失败',
                    message: error.message
                });
            }
        });

        // 交易对列表
        this.app.get('/api/markets/:exchange', async (req, res) => {
            try {
                const { exchange } = req.params;
                const { type, active } = req.query;
                
                let query = `SELECT * FROM ${database.getTableName(exchange, 'trading_pairs')}`;
                const conditions = [];
                
                if (type) {
                    conditions.push(`type = '${type}'`);
                }
                if (active !== undefined) {
                    conditions.push(`is_active = ${active === 'true' ? 1 : 0}`);
                }
                
                if (conditions.length > 0) {
                    query += ` WHERE ${conditions.join(' AND ')}`;
                }
                
                query += ' ORDER BY symbol';
                
                const markets = await database.query(query);
                
                res.json({
                    success: true,
                    data: markets,
                    count: markets.length,
                    exchange: exchange.toUpperCase()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: '获取交易对列表失败',
                    message: error.message
                });
            }
        });

        // 现货数据
        this.app.get('/api/spot/:exchange', async (req, res) => {
            try {
                const { exchange } = req.params;
                const { symbol, limit = 100 } = req.query;
                
                let query = `SELECT * FROM ${database.getTableName(exchange, 'spot_data')}`;
                
                if (symbol) {
                    query += ` WHERE symbol = '${symbol}'`;
                }
                
                query += ` ORDER BY volume_24h DESC LIMIT ${Math.min(parseInt(limit), 1000)}`;
                
                const data = await database.query(query);
                
                res.json({
                    success: true,
                    data: data,
                    count: data.length,
                    exchange: exchange.toUpperCase()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: '获取现货数据失败',
                    message: error.message
                });
            }
        });

        // 永续合约数据
        this.app.get('/api/perpetual/:exchange', async (req, res) => {
            try {
                const { exchange } = req.params;
                const { symbol, limit = 100, sort = 'volume_24h' } = req.query;
                
                let query = `SELECT * FROM ${database.getTableName(exchange, 'perpetual_data')}`;
                
                if (symbol) {
                    query += ` WHERE symbol = '${symbol}'`;
                }
                
                const validSorts = ['symbol', 'last_price', 'volume_24h', 'funding_rate', 'open_interest', 'timestamp'];
                const sortField = validSorts.includes(sort) ? sort : 'volume_24h';
                query += ` ORDER BY ${sortField} DESC`;
                
                query += ` LIMIT ${Math.min(parseInt(limit), 1000)}`;
                
                const data = await database.query(query);
                
                res.json({
                    success: true,
                    data: data,
                    count: data.length,
                    exchange: exchange.toUpperCase(),
                    type: 'perpetual'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: '获取永续合约数据失败',
                    message: error.message
                });
            }
        });

        // 订单簿数据
        this.app.get('/api/orderbook/:exchange', async (req, res) => {
            try {
                const { exchange } = req.params;
                const { symbol, side, limit = 20 } = req.query;
                
                let query = `SELECT * FROM ${database.getTableName(exchange, 'orderbook_data')}`;
                const conditions = [];
                
                if (symbol) {
                    conditions.push(`symbol = '${symbol}'`);
                }
                if (side) {
                    conditions.push(`side = '${side}'`);
                }
                
                if (conditions.length > 0) {
                    query += ` WHERE ${conditions.join(' AND ')}`;
                }
                
                query += ` ORDER BY symbol, side, order_index LIMIT ${Math.min(parseInt(limit), 1000)}`;
                
                const data = await database.query(query);
                
                res.json({
                    success: true,
                    data: data,
                    count: data.length,
                    exchange: exchange.toUpperCase(),
                    type: 'orderbook'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: '获取订单簿数据失败',
                    message: error.message
                });
            }
        });

        // 资金费率数据
        this.app.get('/api/funding-rates/:exchange', async (req, res) => {
            try {
                const { exchange } = req.params;
                const { symbol, limit = 100 } = req.query;
                
                let query = `SELECT * FROM ${database.getTableName(exchange, 'funding_rate_data')}`;
                
                if (symbol) {
                    query += ` WHERE symbol = '${symbol}'`;
                }
                
                query += ` ORDER BY funding_rate DESC LIMIT ${Math.min(parseInt(limit), 1000)}`;
                
                const data = await database.query(query);
                
                res.json({
                    success: true,
                    data: data,
                    count: data.length,
                    exchange: exchange.toUpperCase(),
                    type: 'funding_rate'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: '获取资金费率数据失败',
                    message: error.message
                });
            }
        });

        // 数据收集器状态
        this.app.get('/api/collector/status', (req, res) => {
            if (!this.dataCollector) {
                return res.json({
                    success: true,
                    data: {
                        status: 'not_initialized',
                        message: '数据收集器未初始化'
                    }
                });
            }
            
            res.json({
                success: true,
                data: this.dataCollector.getStatus()
            });
        });

        // 配置信息
        this.app.get('/api/config', (req, res) => {
            const appConfig = require('../config/app-config');
            res.json({
                success: true,
                data: {
                    summary: appConfig.getSummary(),
                    validation: appConfig.validate(),
                    enabledExchanges: appConfig.getEnabledExchanges(),
                    enabledDataTypes: appConfig.getEnabledDataTypes()
                }
            });
        });

        // 手动触发数据收集
        this.app.post('/api/collector/collect', async (req, res) => {
            if (!this.dataCollector) {
                return res.status(400).json({
                    success: false,
                    error: '数据收集器未初始化'
                });
            }
            
            try {
                await this.dataCollector.manualCollect();
                res.json({
                    success: true,
                    message: '数据收集已触发'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: '触发数据收集失败',
                    message: error.message
                });
            }
        });

        // 统计数据
        this.app.get('/api/stats', async (req, res) => {
            try {
                const stats = {};
                
                // 获取各交易所数据统计
                for (const exchange of ['okx', 'binance', 'bybit']) {
                    try {
                        const spotCount = await database.query(`SELECT COUNT(*) as count FROM ${database.getTableName(exchange, 'spot_data')}`);
                        const perpetualCount = await database.query(`SELECT COUNT(*) as count FROM ${database.getTableName(exchange, 'perpetual_data')}`);
                        const orderbookCount = await database.query(`SELECT COUNT(*) as count FROM ${database.getTableName(exchange, 'orderbook_data')}`);
                        const fundingRateCount = await database.query(`SELECT COUNT(*) as count FROM ${database.getTableName(exchange, 'funding_rate_data')}`);
                        
                        stats[exchange] = {
                            spot: spotCount[0]?.count || 0,
                            perpetual: perpetualCount[0]?.count || 0,
                            orderbook: orderbookCount[0]?.count || 0,
                            fundingRate: fundingRateCount[0]?.count || 0
                        };
                    } catch (error) {
                        stats[exchange] = { error: error.message };
                    }
                }
                
                res.json({
                    success: true,
                    data: stats
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: '获取统计数据失败',
                    message: error.message
                });
            }
        });

        // 获取所有币种在不同交易所的信息（按热度排序）
        this.app.get('/api/coins', async (req, res) => {
            try {
                const { limit = 1000 } = req.query;
                
                console.log(`🪙 获取所有币种综合信息，限制: ${limit}`);
                
                const exchanges = ['okx', 'binance', 'bybit'];
                const coinMap = new Map(); // 使用Map来聚合相同币种的数据
                
                // 遍历所有交易所获取数据
                for (const exchange of exchanges) {
                    try {
                        // 1. 获取现货数据
                        try {
                            const spotData = await database.query(`
                                SELECT symbol, base_asset, quote_asset, last_price, 
                                       volume_24h, volume_quote_24h, price_change_percent_24h,
                                       high_24h, low_24h, bid_price, ask_price, updated_at
                                FROM ${exchange}_spot_data 
                                WHERE quote_asset = 'USDT' AND last_price > 0
                                ORDER BY volume_24h DESC
                            `);
                            
                            spotData.forEach(record => {
                                const coinKey = record.base_asset;
                                
                                if (!coinMap.has(coinKey)) {
                                    coinMap.set(coinKey, {
                                        base_asset: record.base_asset,
                                        quote_asset: 'USDT',
                                        exchanges: {},
                                        total_volume: 0,
                                        max_price_change: 0
                                    });
                                }
                                
                                const coin = coinMap.get(coinKey);
                                
                                if (!coin.exchanges[exchange]) {
                                    coin.exchanges[exchange] = {};
                                }
                                
                                // 添加现货数据
                                coin.exchanges[exchange].spot = {
                                    symbol: record.symbol,
                                    last_price: parseFloat(record.last_price || 0),
                                    volume_24h: parseFloat(record.volume_24h || 0),
                                    volume_quote_24h: parseFloat(record.volume_quote_24h || 0),
                                    price_change_percent_24h: parseFloat(record.price_change_percent_24h || 0),
                                    high_24h: parseFloat(record.high_24h || 0),
                                    low_24h: parseFloat(record.low_24h || 0),
                                    bid_price: parseFloat(record.bid_price || 0),
                                    ask_price: parseFloat(record.ask_price || 0),
                                    updated_at: record.updated_at
                                };
                                
                                // 累计总交易量（用于排序）
                                coin.total_volume += parseFloat(record.volume_quote_24h || 0);
                                
                                // 记录最大涨跌幅（用于热度参考）
                                const priceChange = Math.abs(parseFloat(record.price_change_percent_24h || 0));
                                if (priceChange > Math.abs(coin.max_price_change)) {
                                    coin.max_price_change = parseFloat(record.price_change_percent_24h || 0);
                                }
                            });
                            
                        } catch (error) {
                            console.warn(`查询 ${exchange} 现货数据失败:`, error.message);
                        }
                        
                        // 2. 获取永续合约数据
                        try {
                            const perpetualData = await database.query(`
                                SELECT symbol, base_asset, quote_asset, last_price, mark_price, 
                                       funding_rate, open_interest, volume_24h, volume_quote_24h, 
                                       price_change_percent_24h, high_24h, low_24h, bid_price, ask_price, updated_at
                                FROM ${exchange}_perpetual_data 
                                WHERE quote_asset = 'USDT' AND last_price > 0
                                ORDER BY volume_24h DESC
                            `);
                            
                            perpetualData.forEach(record => {
                                const coinKey = record.base_asset;
                                
                                if (!coinMap.has(coinKey)) {
                                    coinMap.set(coinKey, {
                                        base_asset: record.base_asset,
                                        quote_asset: 'USDT',
                                        exchanges: {},
                                        total_volume: 0,
                                        max_price_change: 0
                                    });
                                }
                                
                                const coin = coinMap.get(coinKey);
                                
                                if (!coin.exchanges[exchange]) {
                                    coin.exchanges[exchange] = {};
                                }
                                
                                // 添加永续合约数据
                                coin.exchanges[exchange].perpetual = {
                                    symbol: record.symbol,
                                    last_price: parseFloat(record.last_price || 0),
                                    mark_price: parseFloat(record.mark_price || 0),
                                    funding_rate: parseFloat(record.funding_rate || 0),
                                    open_interest: parseFloat(record.open_interest || 0),
                                    volume_24h: parseFloat(record.volume_24h || 0),
                                    volume_quote_24h: parseFloat(record.volume_quote_24h || 0),
                                    price_change_percent_24h: parseFloat(record.price_change_percent_24h || 0),
                                    high_24h: parseFloat(record.high_24h || 0),
                                    low_24h: parseFloat(record.low_24h || 0),
                                    bid_price: parseFloat(record.bid_price || 0),
                                    ask_price: parseFloat(record.ask_price || 0),
                                    updated_at: record.updated_at
                                };
                                
                                // 累计总交易量（用于排序）
                                coin.total_volume += parseFloat(record.volume_quote_24h || 0);
                                
                                // 记录最大涨跌幅（用于热度参考）
                                const priceChange = Math.abs(parseFloat(record.price_change_percent_24h || 0));
                                if (priceChange > Math.abs(coin.max_price_change)) {
                                    coin.max_price_change = parseFloat(record.price_change_percent_24h || 0);
                                }
                            });
                            
                        } catch (error) {
                            console.warn(`查询 ${exchange} 永续合约数据失败:`, error.message);
                        }
                        
                        // 3. 获取资金费率数据
                        try {
                            const fundingData = await database.query(`
                                SELECT symbol, funding_rate, funding_time, next_funding_time, 
                                       mark_price, index_price, timestamp
                                FROM ${exchange}_funding_rate_data 
                                WHERE symbol LIKE '%USDT%'
                                ORDER BY funding_time DESC
                            `);
                            
                            // 按币种分组资金费率数据
                            const fundingBySymbol = {};
                            fundingData.forEach(record => {
                                // 从symbol中提取base_asset，处理不同交易所的符号格式
                                let base_asset = '';
                                if (record.symbol.includes('/')) {
                                    base_asset = record.symbol.split('/')[0];
                                } else if (record.symbol.includes('-')) {
                                    base_asset = record.symbol.split('-')[0];
                                } else {
                                    base_asset = record.symbol.replace(/USDT.*/, '');
                                }
                                
                                if (!fundingBySymbol[base_asset] || record.funding_time > fundingBySymbol[base_asset].funding_time) {
                                    fundingBySymbol[base_asset] = record;
                                }
                            });
                            
                            // 将资金费率数据添加到对应币种
                            Object.entries(fundingBySymbol).forEach(([base_asset, fundingRecord]) => {
                                if (coinMap.has(base_asset)) {
                                    const coin = coinMap.get(base_asset);
                                    
                                    if (!coin.exchanges[exchange]) {
                                        coin.exchanges[exchange] = {};
                                    }
                                    
                                    coin.exchanges[exchange].funding_rate = {
                                        funding_rate: parseFloat(fundingRecord.funding_rate || 0),
                                        funding_time: fundingRecord.funding_time,
                                        next_funding_time: fundingRecord.next_funding_time,
                                        mark_price: parseFloat(fundingRecord.mark_price || 0),
                                        index_price: parseFloat(fundingRecord.index_price || 0)
                                    };
                                }
                            });
                            
                        } catch (error) {
                            console.warn(`查询 ${exchange} 资金费率数据失败:`, error.message);
                        }
                        
                    } catch (error) {
                        console.warn(`处理交易所 ${exchange} 数据失败:`, error.message);
                    }
                }
                
                // 转换Map为数组并按热度排序
                let coins = Array.from(coinMap.values());
                
                // 只保留至少有一个交易所数据的币种
                coins = coins.filter(coin => Object.keys(coin.exchanges).length > 0);
                
                // 按热度排序：优先按总交易量，然后按价格变化幅度
                coins.sort((a, b) => {
                    // 首先按总交易量降序
                    if (b.total_volume !== a.total_volume) {
                        return b.total_volume - a.total_volume;
                    }
                    // 如果交易量相同，按价格变化幅度降序
                    return Math.abs(b.max_price_change) - Math.abs(a.max_price_change);
                });
                
                // 限制返回数量
                const limitedCoins = coins.slice(0, Math.min(parseInt(limit), 500));
                
                // 清理临时字段
                limitedCoins.forEach(coin => {
                    delete coin.total_volume;
                    delete coin.max_price_change;
                });
                
                res.json({
                    success: true,
                    data: limitedCoins,
                    count: limitedCoins.length,
                    total_available: coins.length,
                    message: `按交易量和价格变化热度排序的币种综合信息（现货+合约+资金费率）`
                });
                
            } catch (error) {
                console.error('获取币种信息失败:', error);
                res.status(500).json({
                    success: false,
                    error: '获取币种信息失败',
                    message: error.message
                });
            }
        });

        // 获取特定币种在所有交易所的详细信息
        this.app.get('/api/coin/:baseAsset', async (req, res) => {
            try {
                const { baseAsset } = req.params;
                const { type = 'all' } = req.query; // spot, perpetual, all
                
                console.log(`🔍 获取币种 ${baseAsset} 的详细信息，类型: ${type}`);
                
                if (!baseAsset || baseAsset.length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: '请提供有效的币种符号'
                    });
                }
                
                const exchanges = ['okx', 'binance', 'bybit'];
                const result = {
                    base_asset: baseAsset.toUpperCase(),
                    quote_asset: 'USDT',
                    exchanges: {}
                };
                
                // 遍历所有交易所
                for (const exchange of exchanges) {
                    try {
                        let exchangeData = {};
                        
                        // 查询现货数据
                        if (type === 'spot' || type === 'all') {
                            try {
                                const spotData = await database.query(`
                                    SELECT * FROM ${database.getTableName(exchange, 'spot_data')}
                                    WHERE base_asset = ? AND quote_asset = 'USDT'
                                    ORDER BY updated_at DESC LIMIT 1
                                `, [baseAsset.toUpperCase()]);
                                
                                if (spotData.length > 0) {
                                    exchangeData.spot = {
                                        ...spotData[0],
                                        last_price: parseFloat(spotData[0].last_price || 0),
                                        volume_24h: parseFloat(spotData[0].volume_24h || 0),
                                        volume_quote_24h: parseFloat(spotData[0].volume_quote_24h || 0),
                                        price_change_percent_24h: parseFloat(spotData[0].price_change_percent_24h || 0)
                                    };
                                }
                            } catch (error) {
                                console.warn(`查询 ${exchange} 现货数据失败:`, error.message);
                            }
                        }
                        
                        // 查询永续合约数据
                        if (type === 'perpetual' || type === 'all') {
                            try {
                                const perpetualData = await database.query(`
                                    SELECT * FROM ${database.getTableName(exchange, 'perpetual_data')}
                                    WHERE base_asset = ? AND quote_asset = 'USDT'
                                    ORDER BY updated_at DESC LIMIT 1
                                `, [baseAsset.toUpperCase()]);
                                
                                if (perpetualData.length > 0) {
                                    exchangeData.perpetual = {
                                        ...perpetualData[0],
                                        last_price: parseFloat(perpetualData[0].last_price || 0),
                                        mark_price: parseFloat(perpetualData[0].mark_price || 0),
                                        funding_rate: parseFloat(perpetualData[0].funding_rate || 0),
                                        open_interest: parseFloat(perpetualData[0].open_interest || 0),
                                        volume_24h: parseFloat(perpetualData[0].volume_24h || 0)
                                    };
                                }
                            } catch (error) {
                                console.warn(`查询 ${exchange} 永续合约数据失败:`, error.message);
                            }
                        }
                        
                        // 查询最新资金费率
                        if (type === 'perpetual' || type === 'all') {
                            try {
                                const fundingData = await database.query(`
                                    SELECT * FROM ${database.getTableName(exchange, 'funding_rate_data')}
                                    WHERE symbol LIKE ?
                                    ORDER BY funding_time DESC LIMIT 1
                                `, [`%${baseAsset.toUpperCase()}%USDT%`]);
                                
                                if (fundingData.length > 0) {
                                    exchangeData.funding_rate = {
                                        funding_rate: parseFloat(fundingData[0].funding_rate || 0),
                                        funding_time: fundingData[0].funding_time,
                                        next_funding_time: fundingData[0].next_funding_time,
                                        mark_price: parseFloat(fundingData[0].mark_price || 0),
                                        index_price: parseFloat(fundingData[0].index_price || 0)
                                    };
                                }
                            } catch (error) {
                                console.warn(`查询 ${exchange} 资金费率失败:`, error.message);
                            }
                        }
                        
                        // 只有当交易所有数据时才添加到结果中
                        if (Object.keys(exchangeData).length > 0) {
                            result.exchanges[exchange] = exchangeData;
                        }
                        
                    } catch (error) {
                        console.warn(`处理交易所 ${exchange} 失败:`, error.message);
                    }
                }
                
                // 检查是否找到任何数据
                if (Object.keys(result.exchanges).length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: `未找到币种 ${baseAsset} 的数据`,
                        message: '该币种可能不存在或暂无数据'
                    });
                }
                
                res.json({
                    success: true,
                    data: result,
                    available_exchanges: Object.keys(result.exchanges),
                    count: Object.keys(result.exchanges).length
                });
                
            } catch (error) {
                console.error('获取币种详细信息失败:', error);
                res.status(500).json({
                    success: false,
                    error: '获取币种详细信息失败',
                    message: error.message
                });
            }
        });
    }

    // 设置数据收集器引用
    setDataCollector(dataCollector) {
        this.dataCollector = dataCollector;
    }

    // 启动服务器
    async start() {
        try {
            // 确保数据库连接
            await database.init();
            
            this.server = this.app.listen(this.config.port, () => {
                console.log(`🌐 API服务器启动成功:`);
                console.log(`   地址: http://localhost:${this.config.port}`);
                console.log(`   健康检查: http://localhost:${this.config.port}/health`);
                console.log(`   API信息: http://localhost:${this.config.port}/api/info`);
                console.log(`   数据统计: http://localhost:${this.config.port}/api/stats`);
                console.log(`   所有币种: http://localhost:${this.config.port}/api/coins`);
                console.log(`   币种详情: http://localhost:${this.config.port}/api/coin/{symbol}`);
            });
            
            return this.server;
        } catch (error) {
            console.error('❌ API服务器启动失败:', error.message);
            throw error;
        }
    }

    // 停止服务器
    async stop() {
        if (this.server) {
            this.server.close();
            console.log('✅ API服务器已停止');
        }
    }
}

module.exports = ApiServer; 