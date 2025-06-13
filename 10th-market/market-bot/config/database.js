const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = null;
        this.exchanges = ['okx', 'binance', 'bybit']; // 支持的交易所列表
        this.dataTypes = ['spot', 'perpetual', 'orderbook', 'funding_rate']; // 支持的数据类型
        this.init();
    }

    async init() {
        try {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_DATABASE || 'market_bot',
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });

            console.log('Database pool created successfully');
        } catch (error) {
            console.error('Failed to create database pool:', error.message);
            throw error;
        }
    }

    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            connection.release();
            console.log('Database connection test successful');
            return true;
        } catch (error) {
            console.error('Database connection test failed:', error.message);
            return false;
        }
    }

    async createDatabase() {
        try {
            // 先连接到默认数据库创建目标数据库
            const tempPool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || ''
            });

            const connection = await tempPool.getConnection();
            await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE || 'market_bot'}`);
            connection.release();
            await tempPool.end();
            
            console.log(`Database '${process.env.DB_DATABASE || 'market_bot'}' created or already exists`);
        } catch (error) {
            console.error('Failed to create database:', error.message);
            throw error;
        }
    }

    async createTables() {
        try {
            const connection = await this.pool.getConnection();

            // 为每个交易所创建独立的表
            for (const exchange of this.exchanges) {
                console.log(`Creating tables for ${exchange.toUpperCase()}...`);

                // 1. 现货数据表
                await connection.execute(`
                    CREATE TABLE IF NOT EXISTS ${exchange}_spot_data (
                        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID，自增',
                        symbol VARCHAR(100) NOT NULL COMMENT '交易对符号，如BTC/USDT',
                        base_asset VARCHAR(20) NOT NULL COMMENT '基础资产，如BTC',
                        quote_asset VARCHAR(20) NOT NULL COMMENT '计价资产，如USDT',
                        last_price DECIMAL(20, 8) COMMENT '最新成交价格',
                        bid_price DECIMAL(20, 8) COMMENT '买一价（最高买价）',
                        ask_price DECIMAL(20, 8) COMMENT '卖一价（最低卖价）',
                        bid_size DECIMAL(30, 8) COMMENT '买一数量',
                        ask_size DECIMAL(30, 8) COMMENT '卖一数量',
                        volume_24h DECIMAL(30, 8) COMMENT '24小时交易量（基础货币）',
                        volume_base_24h DECIMAL(30, 8) COMMENT '24小时基础货币交易量',
                        volume_quote_24h DECIMAL(30, 8) COMMENT '24小时计价货币交易量',
                        high_24h DECIMAL(20, 8) COMMENT '24小时最高价',
                        low_24h DECIMAL(20, 8) COMMENT '24小时最低价',
                        open_24h DECIMAL(20, 8) COMMENT '24小时开盘价',
                        close_24h DECIMAL(20, 8) COMMENT '24小时收盘价',
                        price_change_24h DECIMAL(20, 8) COMMENT '24小时价格变化（绝对值）',
                        price_change_percent_24h DECIMAL(10, 4) COMMENT '24小时价格变化百分比',
                        count_24h INT COMMENT '24小时成交次数',
                        timestamp BIGINT COMMENT '数据时间戳（毫秒）',
                        raw_data JSON COMMENT '存储CCXT返回的原始数据',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后更新时间',
                        INDEX idx_symbol (symbol),
                        INDEX idx_created_at (created_at),
                        INDEX idx_updated_at (updated_at),
                        INDEX idx_timestamp (timestamp),
                        INDEX idx_last_price (last_price),
                        UNIQUE KEY unique_symbol (symbol)
                    )
                `);

                // 2. 永续合约数据表
                await connection.execute(`
                    CREATE TABLE IF NOT EXISTS ${exchange}_perpetual_data (
                        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID，自增',
                        symbol VARCHAR(100) NOT NULL COMMENT '交易对符号，如BTC-USDT-SWAP',
                        base_asset VARCHAR(20) NOT NULL COMMENT '基础资产，如BTC',
                        quote_asset VARCHAR(20) NOT NULL COMMENT '计价资产，如USDT',
                        last_price DECIMAL(20, 8) COMMENT '最新成交价格',
                        mark_price DECIMAL(20, 8) COMMENT '标记价格（用于计算PnL）',
                        index_price DECIMAL(20, 8) COMMENT '指数价格（现货指数）',
                        bid_price DECIMAL(20, 8) COMMENT '买一价（最高买价）',
                        ask_price DECIMAL(20, 8) COMMENT '卖一价（最低卖价）',
                        bid_size DECIMAL(30, 8) COMMENT '买一数量',
                        ask_size DECIMAL(30, 8) COMMENT '卖一数量',
                        volume_24h DECIMAL(30, 8) COMMENT '24小时交易量（基础货币）',
                        volume_base_24h DECIMAL(30, 8) COMMENT '24小时基础货币交易量',
                        volume_quote_24h DECIMAL(30, 8) COMMENT '24小时计价货币交易量',
                        turnover_24h DECIMAL(30, 8) COMMENT '24小时成交额',
                        high_24h DECIMAL(20, 8) COMMENT '24小时最高价',
                        low_24h DECIMAL(20, 8) COMMENT '24小时最低价',
                        open_24h DECIMAL(20, 8) COMMENT '24小时开盘价',
                        close_24h DECIMAL(20, 8) COMMENT '24小时收盘价',
                        price_change_24h DECIMAL(20, 8) COMMENT '24小时价格变化（绝对值）',
                        price_change_percent_24h DECIMAL(10, 4) COMMENT '24小时价格变化百分比',
                        open_interest DECIMAL(30, 8) COMMENT '持仓量（未平仓合约数量）',
                        open_interest_value DECIMAL(30, 8) COMMENT '持仓价值（USDT计价）',
                        funding_rate DECIMAL(10, 8) COMMENT '当前资金费率',
                        next_funding_time BIGINT COMMENT '下次资金费率结算时间戳',
                        predicted_funding_rate DECIMAL(10, 8) COMMENT '预测资金费率',
                        count_24h INT COMMENT '24小时成交次数',
                        timestamp BIGINT COMMENT '数据时间戳（毫秒）',
                        raw_data JSON COMMENT '存储CCXT返回的原始数据',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后更新时间',
                        INDEX idx_symbol (symbol),
                        INDEX idx_created_at (created_at),
                        INDEX idx_updated_at (updated_at),
                        INDEX idx_timestamp (timestamp),
                        INDEX idx_last_price (last_price),
                        INDEX idx_mark_price (mark_price),
                        INDEX idx_funding_rate (funding_rate),
                        UNIQUE KEY unique_symbol (symbol)
                    )
                `);

                // 3. 订单簿数据表 - 特殊处理，因为订单簿有多条记录
                await connection.execute(`
                    CREATE TABLE IF NOT EXISTS ${exchange}_orderbook_data (
                        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID，自增',
                        symbol VARCHAR(100) NOT NULL COMMENT '交易对符号，如BTC/USDT',
                        type ENUM('spot', 'perpetual') NOT NULL COMMENT '交易类型：现货或永续合约',
                        side ENUM('bid', 'ask') NOT NULL COMMENT '买卖方向：bid买单，ask卖单',
                        price DECIMAL(20, 8) NOT NULL COMMENT '挂单价格',
                        amount DECIMAL(30, 8) NOT NULL COMMENT '挂单数量',
                        total DECIMAL(30, 8) NOT NULL COMMENT '累计数量（深度图用）',
                        order_index INT NOT NULL COMMENT '订单在orderbook中的位置索引(0-based)',
                        timestamp BIGINT COMMENT '数据时间戳（毫秒）',
                        raw_data JSON COMMENT '存储CCXT返回的原始orderbook数据',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后更新时间',
                        INDEX idx_symbol_type (symbol, type),
                        INDEX idx_symbol_side (symbol, side),
                        INDEX idx_symbol_type_side (symbol, type, side),
                        INDEX idx_created_at (created_at),
                        INDEX idx_updated_at (updated_at),
                        INDEX idx_timestamp (timestamp),
                        INDEX idx_price (price),
                        UNIQUE KEY unique_symbol_type_side_index (symbol, type, side, order_index)
                    )
                `);

                // 4. 资金费率数据表
                await connection.execute(`
                    CREATE TABLE IF NOT EXISTS ${exchange}_funding_rate_data (
                        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID，自增',
                        symbol VARCHAR(100) NOT NULL COMMENT '交易对符号，如BTC-USDT-SWAP',
                        funding_rate DECIMAL(10, 8) NOT NULL COMMENT '当期资金费率（8小时费率）',
                        funding_time BIGINT NOT NULL COMMENT '资金费率生效时间戳',
                        mark_price DECIMAL(20, 8) COMMENT '标记价格',
                        index_price DECIMAL(20, 8) COMMENT '指数价格',
                        next_funding_time BIGINT COMMENT '下次资金费率结算时间戳',
                        timestamp BIGINT COMMENT '数据时间戳（毫秒）',
                        raw_data JSON COMMENT '存储CCXT返回的原始数据',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后更新时间',
                        INDEX idx_symbol (symbol),
                        INDEX idx_funding_time (funding_time),
                        INDEX idx_next_funding_time (next_funding_time),
                        INDEX idx_created_at (created_at),
                        INDEX idx_updated_at (updated_at),
                        INDEX idx_timestamp (timestamp),
                        INDEX idx_funding_rate (funding_rate),
                        UNIQUE KEY unique_symbol_funding_time (symbol, funding_time)
                    )
                `);

                // 5. 交易对配置表（存储交易对的基本信息和配置）
                await connection.execute(`
                    CREATE TABLE IF NOT EXISTS ${exchange}_trading_pairs (
                        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID，自增',
                        symbol VARCHAR(100) NOT NULL COMMENT '交易对符号，如BTC/USDT',
                        base_asset VARCHAR(20) NOT NULL COMMENT '基础资产，如BTC',
                        quote_asset VARCHAR(20) NOT NULL COMMENT '计价资产，如USDT',
                        type ENUM('spot', 'perpetual') NOT NULL COMMENT '交易类型：现货或永续合约',
                        is_active BOOLEAN DEFAULT TRUE COMMENT '是否活跃交易对',
                        precision_base INT DEFAULT 8 COMMENT '基础货币精度（小数位数）',
                        precision_quote INT DEFAULT 8 COMMENT '计价货币精度（小数位数）',
                        precision_price INT DEFAULT 8 COMMENT '价格精度（小数位数）',
                        precision_amount INT DEFAULT 8 COMMENT '数量精度（小数位数）',
                        min_amount DECIMAL(20, 8) COMMENT '最小交易数量',
                        max_amount DECIMAL(20, 8) COMMENT '最大交易数量',
                        min_cost DECIMAL(20, 8) COMMENT '最小交易金额',
                        max_cost DECIMAL(20, 8) COMMENT '最大交易金额',
                        min_price DECIMAL(20, 8) COMMENT '最小交易价格',
                        max_price DECIMAL(20, 8) COMMENT '最大交易价格',
                        tick_size DECIMAL(20, 8) COMMENT '价格最小变动单位',
                        step_size DECIMAL(20, 8) COMMENT '数量最小变动单位',
                        contract_size DECIMAL(20, 8) COMMENT '合约面值（永续合约专用）',
                        settlement_currency VARCHAR(10) COMMENT '结算货币',
                        is_linear BOOLEAN DEFAULT TRUE COMMENT '是否为线性合约',
                        is_inverse BOOLEAN DEFAULT FALSE COMMENT '是否为反向合约',
                        raw_data JSON COMMENT '存储CCXT返回的market原始数据',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后更新时间',
                        UNIQUE KEY unique_symbol_type (symbol, type),
                        INDEX idx_symbol (symbol),
                        INDEX idx_type (type),
                        INDEX idx_is_active (is_active),
                        INDEX idx_base_asset (base_asset),
                        INDEX idx_quote_asset (quote_asset),
                        INDEX idx_updated_at (updated_at)
                    )
                `);

                console.log(`✅ Tables created for ${exchange.toUpperCase()}`);
            }

            // 创建一个交易所状态表，记录各交易所的数据更新状态
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS exchange_status (
                    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID，自增',
                    exchange VARCHAR(50) NOT NULL COMMENT '交易所名称，如okx、binance、bybit',
                    last_update_time TIMESTAMP COMMENT '最后数据更新时间',
                    last_pairs_update TIMESTAMP COMMENT '最后交易对更新时间',
                    last_spot_update TIMESTAMP COMMENT '最后现货数据更新时间',
                    last_perpetual_update TIMESTAMP COMMENT '最后永续合约数据更新时间',
                    last_orderbook_update TIMESTAMP COMMENT '最后订单簿数据更新时间',
                    last_funding_rate_update TIMESTAMP COMMENT '最后资金费率数据更新时间',
                    total_spot_pairs INT DEFAULT 0 COMMENT '总现货交易对数量',
                    total_perpetual_pairs INT DEFAULT 0 COMMENT '总永续合约交易对数量',
                    active_spot_pairs INT DEFAULT 0 COMMENT '活跃现货交易对数量',
                    active_perpetual_pairs INT DEFAULT 0 COMMENT '活跃永续合约交易对数量',
                    status ENUM('active', 'inactive', 'error') DEFAULT 'active' COMMENT '交易所状态：活跃、非活跃、错误',
                    error_message TEXT COMMENT '错误信息描述',
                    api_rate_limit INT DEFAULT 1000 COMMENT 'API请求速率限制（次/分钟）',
                    last_error_time TIMESTAMP COMMENT '最后出错时间',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后更新时间',
                    UNIQUE KEY unique_exchange (exchange)
                )
            `);

            connection.release();
            console.log('✅ All database tables created successfully');
        } catch (error) {
            console.error('Failed to create tables:', error.message);
            throw error;
        }
    }

    async query(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error.message);
            throw error;
        }
    }

    // 获取指定交易所的表名
    getTableName(exchange, dataType) {
        const validTypes = ['spot_data', 'perpetual_data', 'orderbook_data', 'funding_rate_data', 'trading_pairs'];
        if (!validTypes.includes(dataType)) {
            throw new Error(`Invalid data type: ${dataType}. Valid types: ${validTypes.join(', ')}`);
        }
        if (!this.exchanges.includes(exchange.toLowerCase())) {
            throw new Error(`Unsupported exchange: ${exchange}. Supported: ${this.exchanges.join(', ')}`);
        }
        return `${exchange.toLowerCase()}_${dataType}`;
    }

    // 数据更新方法 - 使用 ON DUPLICATE KEY UPDATE 避免重复插入
    async upsertData(tableName, data) {
        try {
            const columns = Object.keys(data);
            const values = Object.values(data);
            const placeholders = new Array(values.length).fill('?').join(', ');
            
            // 构建更新部分，排除主键和created_at
            const updateColumns = columns.filter(col => col !== 'id' && col !== 'created_at');
            const updateClause = updateColumns.map(col => `${col} = VALUES(${col})`).join(', ');
            
            const sql = `
                INSERT INTO ${tableName} (${columns.join(', ')})
                VALUES (${placeholders})
                ON DUPLICATE KEY UPDATE ${updateClause}
            `;
            
            const [result] = await this.pool.execute(sql, values);
            return result;
        } catch (error) {
            console.error(`Failed to upsert data into ${tableName}:`, error.message);
            throw error;
        }
    }

    // 批量数据更新方法
    async upsertBatchData(tableName, dataArray) {
        if (!dataArray || dataArray.length === 0) {
            return { affectedRows: 0 };
        }

        try {
            const columns = Object.keys(dataArray[0]);
            const placeholders = new Array(columns.length).fill('?').join(', ');
            
            // 构建更新部分
            const updateColumns = columns.filter(col => col !== 'id' && col !== 'created_at');
            const updateClause = updateColumns.map(col => `${col} = VALUES(${col})`).join(', ');
            
            const sql = `
                INSERT INTO ${tableName} (${columns.join(', ')})
                VALUES ${dataArray.map(() => `(${placeholders})`).join(', ')}
                ON DUPLICATE KEY UPDATE ${updateClause}
            `;
            
            const values = dataArray.flatMap(data => Object.values(data));
            const [result] = await this.pool.execute(sql, values);
            return result;
        } catch (error) {
            console.error(`Failed to batch upsert data into ${tableName}:`, error.message);
            throw error;
        }
    }

    // 获取所有支持的交易所
    getExchanges() {
        return this.exchanges;
    }

    // 获取所有支持的数据类型
    getDataTypes() {
        return this.dataTypes;
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('Database pool closed');
        }
    }
}

module.exports = new Database(); 