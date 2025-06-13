const cron = require('node-cron');
const database = require('../config/database');
const appConfig = require('../config/app-config');

// 引入各交易所适配器
const OKXAdapter = require('../exchanges/OKXAdapter');
const BinanceAdapter = require('../exchanges/BinanceAdapter');
const BybitAdapter = require('../exchanges/BybitAdapter');

class DataCollector {
    constructor(config = {}) {
        // 从应用配置中获取默认设置，然后与传入的config合并
        const defaultConfig = appConfig.getConfig();
        
        this.config = {
            interval: config.interval || defaultConfig.collection.interval,
            enableSpotData: config.enableSpotData !== undefined ? config.enableSpotData : defaultConfig.dataTypes.spot.enabled,
            enablePerpetualData: config.enablePerpetualData !== undefined ? config.enablePerpetualData : defaultConfig.dataTypes.perpetual.enabled,
            enableOrderBookData: config.enableOrderBookData !== undefined ? config.enableOrderBookData : defaultConfig.dataTypes.orderbook.enabled,
            enableFundingRateData: config.enableFundingRateData !== undefined ? config.enableFundingRateData : defaultConfig.dataTypes.fundingRate.enabled,
            maxConcurrentExchanges: config.maxConcurrentExchanges || defaultConfig.collection.maxConcurrentExchanges,
            retryAttempts: config.retryAttempts || defaultConfig.collection.retryAttempts,
            ...config
        };
        
        this.exchanges = [];
        this.cronJobs = [];
        this.isRunning = false;
        this.stats = {
            totalRuns: 0,
            successfulRuns: 0,
            failedRuns: 0,
            lastRunTime: null,
            lastSuccessTime: null,
            errors: []
        };
    }

    // 初始化数据收集器
    async init() {
        try {
            console.log('🚀 初始化数据收集器...');
            
            // 确保数据库连接
            await database.init();
            
            // 获取启用的交易所配置
            const enabledExchanges = appConfig.getEnabledExchanges();
            console.log(`📊 配置的交易所: ${enabledExchanges.map(ex => ex.name).join(', ')}`);
            
            // 创建交易所适配器实例
            this.exchanges = [];
            
            for (const exchangeConfig of enabledExchanges) {
                try {
                    let adapter = null;
                    const proxyConfig = this.config.proxy || {};
                    
                    switch (exchangeConfig.name) {
                        case 'okx':
                            adapter = new OKXAdapter(proxyConfig);
                            break;
                        case 'binance':
                            adapter = new BinanceAdapter(proxyConfig);
                            break;
                        case 'bybit':
                            adapter = new BybitAdapter(proxyConfig);
                            break;
                        default:
                            console.warn(`⚠️ 未知的交易所: ${exchangeConfig.name}`);
                            continue;
                    }
                    
                    if (adapter) {
                        this.exchanges.push({
                            adapter: adapter,
                            name: exchangeConfig.name,
                            enabled: true,
                            priority: exchangeConfig.priority,
                            config: exchangeConfig
                        });
                    }
                } catch (error) {
                    console.error(`❌ 创建 ${exchangeConfig.name} 适配器失败:`, error.message);
                }
            }
            
            // 初始化所有交易所
            console.log(`📡 初始化 ${this.exchanges.length} 个交易所...`);
            for (const exchange of this.exchanges) {
                try {
                    await exchange.adapter.init();
                    console.log(`✅ ${exchange.name.toUpperCase()} 初始化成功`);
                } catch (error) {
                    console.error(`❌ ${exchange.name.toUpperCase()} 初始化失败:`, error.message);
                    exchange.enabled = false; // 禁用失败的交易所
                }
            }
            
            // 过滤掉初始化失败的交易所
            this.exchanges = this.exchanges.filter(exchange => exchange.enabled !== false);
            
            // 显示启用的数据类型
            const enabledDataTypes = Object.entries({
                现货数据: this.config.enableSpotData,
                永续合约: this.config.enablePerpetualData,
                订单簿: this.config.enableOrderBookData,
                资金费率: this.config.enableFundingRateData
            }).filter(([name, enabled]) => enabled).map(([name]) => name);
            
            console.log(`📊 启用的数据类型: ${enabledDataTypes.join(', ')}`);
            console.log(`✅ 数据收集器初始化完成，共 ${this.exchanges.length} 个可用交易所`);
            
            return true;
            
        } catch (error) {
            console.error('❌ 数据收集器初始化失败:', error.message);
            throw error;
        }
    }

    // 开始定时数据收集
    start() {
        if (this.isRunning) {
            console.warn('⚠️ 数据收集器已在运行中');
            return;
        }
        
        console.log(`🕐 启动定时数据收集，间隔: ${this.config.interval}`);
        console.log(`📊 启用的数据类型:`);
        console.log(`   现货数据: ${this.config.enableSpotData ? '✅' : '❌'}`);
        console.log(`   永续合约: ${this.config.enablePerpetualData ? '✅' : '❌'}`);
        console.log(`   订单簿: ${this.config.enableOrderBookData ? '✅' : '❌'}`);
        console.log(`   资金费率: ${this.config.enableFundingRateData ? '✅' : '❌'}`);
        
        // 创建定时任务
        const cronJob = cron.schedule(this.config.interval, async () => {
            await this.collectAllData();
        }, {
            scheduled: false // 先不启动，等手动启动
        });
        
        this.cronJobs.push(cronJob);
        cronJob.start();
        this.isRunning = true;
        
        // 立即执行一次
        this.collectAllData();
        
        console.log('🚀 定时数据收集已启动');
    }

    // 停止数据收集
    stop() {
        if (!this.isRunning) {
            console.warn('⚠️ 数据收集器未在运行');
            return;
        }
        
        console.log('🛑 停止数据收集...');
        this.cronJobs.forEach(job => {
            try {
                if (typeof job.destroy === 'function') {
                    job.destroy();
                } else if (typeof job.stop === 'function') {
                    job.stop();
                }
            } catch (error) {
                console.warn('停止定时任务时出错:', error.message);
            }
        });
        this.cronJobs = [];
        this.isRunning = false;
        
        console.log('✅ 数据收集已停止');
    }

    // 收集所有数据
    async collectAllData() {
        const startTime = Date.now();
        this.stats.totalRuns++;
        this.stats.lastRunTime = new Date();
        
        console.log(`\n🔄 开始第 ${this.stats.totalRuns} 次数据收集 (${new Date().toLocaleString()})`);
        
        try {
            // 控制并发数量，避免同时请求过多交易所
            const enabledExchanges = this.exchanges.filter(ex => ex.enabled !== false);
            
            // 分批处理交易所
            for (let i = 0; i < enabledExchanges.length; i += this.config.maxConcurrentExchanges) {
                const batch = enabledExchanges.slice(i, i + this.config.maxConcurrentExchanges);
                
                // 并发处理当前批次
                const promises = batch.map(exchange => this.collectExchangeData(exchange));
                await Promise.allSettled(promises);
                
                // 批次间稍作延迟
                if (i + this.config.maxConcurrentExchanges < enabledExchanges.length) {
                    await this.sleep(2000); // 2秒延迟
                }
            }
            
            const duration = Date.now() - startTime;
            this.stats.successfulRuns++;
            this.stats.lastSuccessTime = new Date();
            
            console.log(`✅ 数据收集完成，耗时: ${duration}ms`);
            
        } catch (error) {
            this.stats.failedRuns++;
            this.stats.errors.push({
                time: new Date(),
                error: error.message
            });
            
            // 只保留最近20个错误
            if (this.stats.errors.length > 20) {
                this.stats.errors = this.stats.errors.slice(-20);
            }
            
            console.error('❌ 数据收集失败:', error.message);
        }
    }

    // 收集单个交易所的数据
    async collectExchangeData(exchange) {
        const { adapter, name } = exchange;
        console.log(`📈 收集 ${name} 数据...`);
        
        try {
            const results = {};
            
            // 1. 现货数据
            if (this.config.enableSpotData) {
                try {
                    const spotData = await adapter.fetchSpotData();
                    results.spot = spotData?.length || 0;
                } catch (error) {
                    console.warn(`${name} 现货数据收集失败:`, error.message);
                    results.spot = 0;
                }
            }
            
            // 2. 永续合约数据
            if (this.config.enablePerpetualData) {
                try {
                    const perpetualData = await adapter.fetchPerpetualData();
                    results.perpetual = perpetualData?.length || 0;
                } catch (error) {
                    console.warn(`${name} 永续合约数据收集失败:`, error.message);
                    results.perpetual = 0;
                }
            }
            
            // 3. 订单簿数据 (减少频率)
            if (this.config.enableOrderBookData ) {
                try {
                    const orderBookData = await adapter.fetchOrderBookData();
                    results.orderbook = orderBookData?.length || 0;
                } catch (error) {
                    console.warn(`${name} 订单簿数据收集失败:`, error.message);
                    results.orderbook = 0;
                }
            }
            
            // 4. 资金费率数据 (减少频率)
            if (this.config.enableFundingRateData ) {
                try {
                    const fundingRateData = await adapter.fetchFundingRateData();
                    results.fundingRate = fundingRateData?.length || 0;
                } catch (error) {
                    console.warn(`${name} 资金费率数据收集失败:`, error.message);
                    results.fundingRate = 0;
                }
            }
            
            // 输出收集结果
            const resultStr = Object.entries(results)
                .map(([type, count]) => `${type}:${count}`)
                .join(', ');
            console.log(`   ${name}: ${resultStr}`);
            
        } catch (error) {
            console.error(`❌ ${name} 数据收集失败:`, error.message);
            
            // 如果连续失败多次，临时禁用该交易所
            exchange.failureCount = (exchange.failureCount || 0) + 1;
            if (exchange.failureCount >= 5) {
                console.warn(`⚠️ ${name} 连续失败 ${exchange.failureCount} 次，临时禁用`);
                exchange.enabled = false;
                
                // 5分钟后重新启用
                setTimeout(() => {
                    exchange.enabled = true;
                    exchange.failureCount = 0;
                    console.log(`🔄 ${name} 重新启用`);
                }, 5 * 60 * 1000);
            }
        }
    }

    // 获取收集器状态
    getStatus() {
        return {
            isRunning: this.isRunning,
            config: {
                interval: this.config.interval,
                enabledDataTypes: {
                    spot: this.config.enableSpotData,
                    perpetual: this.config.enablePerpetualData,
                    orderbook: this.config.enableOrderBookData,
                    fundingRate: this.config.enableFundingRateData
                }
            },
            exchanges: this.exchanges.map(ex => ({
                name: ex.name,
                enabled: ex.enabled !== false,
                failureCount: ex.failureCount || 0,
                priority: ex.priority
            })),
            stats: {
                ...this.stats,
                successRate: this.stats.totalRuns > 0 ? 
                    (this.stats.successfulRuns / this.stats.totalRuns * 100).toFixed(2) + '%' : '0%'
            }
        };
    }

    // 手动触发数据收集
    async manualCollect() {
        console.log('🔄 手动触发数据收集...');
        await this.collectAllData();
    }

    // 工具方法：延迟
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = DataCollector; 