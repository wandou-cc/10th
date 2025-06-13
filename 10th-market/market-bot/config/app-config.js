// 应用配置管理
require('dotenv').config();

const defaultConfig = {
    // 交易所配置
    exchanges: {
        okx: {
            enabled: true,
            priority: 1,
            maxSymbols: 1000, // 最大处理的交易对数量
            rateLimit: 100,   // 每秒请求限制
            timeout: 30000,   // 请求超时时间(ms)
            proxy: null       // 代理设置，null表示使用全局代理
        },
        binance: {
            enabled: true,
            priority: 2,
            maxSymbols: 1000,
            rateLimit: 100,
            timeout: 30000,
            proxy: null
        },
        bybit: {
            enabled: true,
            priority: 3,
            maxSymbols: 1000,
            rateLimit: 100,
            timeout: 30000,
            proxy: null
        }
    },

    // 数据类型配置
    dataTypes: {
        spot: {
            enabled: true,
            // updateInterval: '*/1 * * * *', // 每分钟
            // batchSize: 100 // 批量处理大小
        },
        perpetual: {
            enabled: true,
            // updateInterval: '*/1 * * * *', // 每分钟
            // batchSize: 100
        },
        orderbook: {
            enabled: false, // 默认禁用，数据量大
            // updateInterval: '*/5 * * * *', // 5分钟
            // batchSize: 50,
            // depth: 20 // 订单簿深度
        },
        fundingRate: {
            enabled: true, // 默认禁用，更新频率低
            // updateInterval: '0 */8 * * *', // 8小时
            // batchSize: 100
        }
    },

    // 数据收集配置
    collection: {
        enabled: true,
        interval: process.env.COLLECTION_INTERVAL || '*/1 * * * *',
        maxConcurrentExchanges: parseInt(process.env.MAX_CONCURRENT_EXCHANGES) || 1,
        retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
        errorThreshold: parseInt(process.env.ERROR_THRESHOLD) || 5, // 连续错误次数阈值
        autoRestart: process.env.AUTO_RESTART !== 'false' // 自动重启失败的交易所
    },

    // API服务器配置
    api: {
        enabled: true,
        port: parseInt(process.env.API_PORT) || 3000,
        cors: {
            enabled: true,
            origin: process.env.CORS_ORIGIN || '*'
        },
        rateLimit: {
            enabled: true,
            windowMs: 15 * 60 * 1000, // 15分钟
            max: 1000 // 每个IP每15分钟最多1000次请求
        }
    },

    // 代理配置
    proxy: {
        enabled: !!(process.env.HTTPS_PROXY || process.env.HTTP_PROXY),
        httpsProxy: process.env.HTTPS_PROXY,
        httpProxy: process.env.HTTP_PROXY
    },

    // 日志配置
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || null,
        console: process.env.LOG_CONSOLE !== 'false'
    }
};

class AppConfig {
    constructor(customConfig = {}) {
        this.config = this.mergeConfig(defaultConfig, customConfig);
        this.loadEnvironmentOverrides();
    }

    // 合并配置
    mergeConfig(defaultConfig, customConfig) {
        const merged = JSON.parse(JSON.stringify(defaultConfig));
        
        for (const key in customConfig) {
            if (typeof customConfig[key] === 'object' && !Array.isArray(customConfig[key])) {
                merged[key] = this.mergeConfig(merged[key] || {}, customConfig[key]);
            } else {
                merged[key] = customConfig[key];
            }
        }
        
        return merged;
    }

    // 从环境变量加载覆盖配置
    loadEnvironmentOverrides() {
        // 交易所启用状态
        if (process.env.ENABLE_OKX !== undefined) {
            this.config.exchanges.okx.enabled = process.env.ENABLE_OKX === 'true';
        }
        if (process.env.ENABLE_BINANCE !== undefined) {
            this.config.exchanges.binance.enabled = process.env.ENABLE_BINANCE === 'true';
        }
        if (process.env.ENABLE_BYBIT !== undefined) {
            this.config.exchanges.bybit.enabled = process.env.ENABLE_BYBIT === 'true';
        }

        // 数据类型启用状态
        if (process.env.ENABLE_SPOT_DATA !== undefined) {
            this.config.dataTypes.spot.enabled = process.env.ENABLE_SPOT_DATA === 'true';
        }
        if (process.env.ENABLE_PERPETUAL_DATA !== undefined) {
            this.config.dataTypes.perpetual.enabled = process.env.ENABLE_PERPETUAL_DATA === 'true';
        }
        if (process.env.ENABLE_ORDERBOOK_DATA !== undefined) {
            this.config.dataTypes.orderbook.enabled = process.env.ENABLE_ORDERBOOK_DATA === 'true';
        }
        if (process.env.ENABLE_FUNDING_RATE_DATA !== undefined) {
            this.config.dataTypes.fundingRate.enabled = process.env.ENABLE_FUNDING_RATE_DATA === 'true';
        }
    }

    // 获取启用的交易所列表
    getEnabledExchanges() {
        return Object.entries(this.config.exchanges)
            .filter(([name, config]) => config.enabled)
            .sort((a, b) => a[1].priority - b[1].priority)
            .map(([name, config]) => ({ name, ...config }));
    }

    // 获取启用的数据类型
    getEnabledDataTypes() {
        return Object.entries(this.config.dataTypes)
            .filter(([type, config]) => config.enabled)
            .reduce((acc, [type, config]) => {
                acc[type] = config;
                return acc;
            }, {});
    }

    // 检查交易所是否启用
    isExchangeEnabled(exchangeName) {
        return this.config.exchanges[exchangeName]?.enabled || false;
    }

    // 检查数据类型是否启用
    isDataTypeEnabled(dataType) {
        return this.config.dataTypes[dataType]?.enabled || false;
    }

    // 获取交易所配置
    getExchangeConfig(exchangeName) {
        return this.config.exchanges[exchangeName] || null;
    }

    // 获取数据类型配置
    getDataTypeConfig(dataType) {
        return this.config.dataTypes[dataType] || null;
    }

    // 获取完整配置
    getConfig() {
        return this.config;
    }

    // 动态更新配置
    updateConfig(path, value) {
        const keys = path.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }

    // 获取配置摘要
    getSummary() {
        const enabledExchanges = this.getEnabledExchanges().map(ex => ex.name);
        const enabledDataTypes = Object.keys(this.getEnabledDataTypes());
        
        return {
            exchanges: {
                enabled: enabledExchanges,
                total: Object.keys(this.config.exchanges).length
            },
            dataTypes: {
                enabled: enabledDataTypes,
                total: Object.keys(this.config.dataTypes).length
            },
            collection: {
                enabled: this.config.collection.enabled,
                interval: this.config.collection.interval,
                maxConcurrent: this.config.collection.maxConcurrentExchanges
            },
            api: {
                enabled: this.config.api.enabled,
                port: this.config.api.port
            },
            proxy: {
                enabled: this.config.proxy.enabled
            }
        };
    }

    // 验证配置
    validate() {
        const errors = [];
        
        // 检查是否至少启用了一个交易所
        const enabledExchanges = this.getEnabledExchanges();
        if (enabledExchanges.length === 0) {
            errors.push('至少需要启用一个交易所');
        }
        
        // 检查是否至少启用了一种数据类型
        const enabledDataTypes = Object.keys(this.getEnabledDataTypes());
        if (enabledDataTypes.length === 0) {
            errors.push('至少需要启用一种数据类型');
        }
        
        // 检查端口配置
        if (this.config.api.enabled && (this.config.api.port < 1 || this.config.api.port > 65535)) {
            errors.push('API端口必须在1-65535范围内');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// 创建全局配置实例
const appConfig = new AppConfig();

module.exports = appConfig; 