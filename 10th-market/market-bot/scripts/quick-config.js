#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 配置模板
const configTemplates = {
    minimal: {
        name: '最小配置 (仅OKX现货数据)',
        description: '适合测试和资源有限的环境',
        config: {
            // 交易所
            ENABLE_OKX: 'true',
            ENABLE_BINANCE: 'false',
            ENABLE_BYBIT: 'false',
            
            // 数据类型
            ENABLE_SPOT_DATA: 'true',
            ENABLE_PERPETUAL_DATA: 'false',
            ENABLE_ORDERBOOK_DATA: 'false',
            ENABLE_FUNDING_RATE_DATA: 'false',
            
            // 收集配置
            COLLECTION_INTERVAL: '*/5 * * * *',
            MAX_CONCURRENT_EXCHANGES: '1'
        }
    },
    
    standard: {
        name: '标准配置 (所有交易所的现货和永续数据)',
        description: '推荐的生产环境配置',
        config: {
            // 交易所
            ENABLE_OKX: 'true',
            ENABLE_BINANCE: 'true',
            ENABLE_BYBIT: 'true',
            
            // 数据类型
            ENABLE_SPOT_DATA: 'true',
            ENABLE_PERPETUAL_DATA: 'true',
            ENABLE_ORDERBOOK_DATA: 'false',
            ENABLE_FUNDING_RATE_DATA: 'false',
            
            // 收集配置
            COLLECTION_INTERVAL: '*/3 * * * *',
            MAX_CONCURRENT_EXCHANGES: '2'
        }
    },
    
    comprehensive: {
        name: '完整配置 (包含所有数据类型)',
        description: '适合需要完整市场数据的场景',
        config: {
            // 交易所
            ENABLE_OKX: 'true',
            ENABLE_BINANCE: 'true',
            ENABLE_BYBIT: 'true',
            
            // 数据类型
            ENABLE_SPOT_DATA: 'true',
            ENABLE_PERPETUAL_DATA: 'true',
            ENABLE_ORDERBOOK_DATA: 'true',
            ENABLE_FUNDING_RATE_DATA: 'true',
            
            // 收集配置
            COLLECTION_INTERVAL: '*/1 * * * *',
            MAX_CONCURRENT_EXCHANGES: '1'
        }
    },
    
    custom: {
        name: '自定义配置',
        description: '手动选择每个配置项',
        config: null // 将通过交互式配置生成
    }
};

// 基础环境变量模板
const baseConfig = {
    // 数据库配置
    DB_HOST: 'localhost',
    DB_PORT: '3306',
    DB_USER: 'root',
    DB_PASSWORD: '12345678',
    DB_DATABASE: 'market_bot',
    
    // API配置
    API_PORT: '3000',
    CORS_ORIGIN: '*',
    
    // 重试配置
    RETRY_ATTEMPTS: '3',
    ERROR_THRESHOLD: '5',
    AUTO_RESTART: 'true',
    
    // 代理配置（注释状态）
    '# HTTPS_PROXY': 'http://127.0.0.1:7890',
    '# HTTP_PROXY': 'http://127.0.0.1:7890'
};

class QuickConfig {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async run() {
        console.log('🚀 加密货币市场数据机器人 - 快速配置工具\n');
        
        try {
            // 显示配置选项
            this.showTemplates();
            
            // 获取用户选择
            const choice = await this.getChoice();
            
            let finalConfig;
            if (choice === 'custom') {
                finalConfig = await this.createCustomConfig();
            } else {
                finalConfig = this.createConfigFromTemplate(choice);
            }
            
            // 保存配置
            await this.saveConfig(finalConfig);
            
            console.log('\n✅ 配置已保存到 .env 文件');
            console.log('💡 你现在可以运行 npm start 启动程序');
            
        } catch (error) {
            console.error('❌ 配置失败:', error.message);
        } finally {
            this.rl.close();
        }
    }

    showTemplates() {
        console.log('请选择一个配置模板:\n');
        
        let index = 1;
        for (const [key, template] of Object.entries(configTemplates)) {
            console.log(`${index}. ${template.name}`);
            console.log(`   ${template.description}\n`);
            index++;
        }
    }

    async getChoice() {
        const choices = Object.keys(configTemplates);
        
        while (true) {
            const answer = await this.question('请输入选择 (1-4): ');
            const index = parseInt(answer) - 1;
            
            if (index >= 0 && index < choices.length) {
                return choices[index];
            }
            
            console.log('❌ 无效选择，请重新输入');
        }
    }

    createConfigFromTemplate(templateKey) {
        const template = configTemplates[templateKey];
        return { ...baseConfig, ...template.config };
    }

    async createCustomConfig() {
        console.log('\n📋 自定义配置 - 请回答以下问题:\n');
        
        const config = { ...baseConfig };
        
        // 交易所选择
        console.log('1. 选择要启用的交易所:');
        config.ENABLE_OKX = await this.askBoolean('启用 OKX 交易所?', true);
        config.ENABLE_BINANCE = await this.askBoolean('启用 Binance 交易所?', true);
        config.ENABLE_BYBIT = await this.askBoolean('启用 Bybit 交易所?', true);
        
        // 数据类型选择
        console.log('\n2. 选择要收集的数据类型:');
        config.ENABLE_SPOT_DATA = await this.askBoolean('收集现货数据?', true);
        config.ENABLE_PERPETUAL_DATA = await this.askBoolean('收集永续合约数据?', true);
        config.ENABLE_ORDERBOOK_DATA = await this.askBoolean('收集订单簿数据? (数据量大)', false);
        config.ENABLE_FUNDING_RATE_DATA = await this.askBoolean('收集资金费率数据?', false);
        
        // 收集间隔
        console.log('\n3. 数据收集频率:');
        const intervals = [
            { name: '每分钟', value: '*/1 * * * *' },
            { name: '每3分钟', value: '*/3 * * * *' },
            { name: '每5分钟', value: '*/5 * * * *' },
            { name: '每10分钟', value: '*/10 * * * *' }
        ];
        
        for (let i = 0; i < intervals.length; i++) {
            console.log(`${i + 1}. ${intervals[i].name}`);
        }
        
        const intervalChoice = await this.question('选择收集频率 (1-4): ');
        const intervalIndex = parseInt(intervalChoice) - 1;
        if (intervalIndex >= 0 && intervalIndex < intervals.length) {
            config.COLLECTION_INTERVAL = intervals[intervalIndex].value;
        } else {
            config.COLLECTION_INTERVAL = '*/3 * * * *'; // 默认值
        }
        
        // 并发数
        console.log('\n4. 并发设置:');
        const concurrent = await this.question('最大并发交易所数量 (1-3, 推荐1): ') || '1';
        config.MAX_CONCURRENT_EXCHANGES = concurrent;
        
        // 代理设置
        console.log('\n5. 网络代理 (可选):');
        const useProxy = await this.askBoolean('使用代理访问交易所API?', false);
        if (useProxy === 'true') {
            const proxyUrl = await this.question('代理地址 (例: http://127.0.0.1:7890): ');
            if (proxyUrl) {
                config.HTTPS_PROXY = proxyUrl;
                config.HTTP_PROXY = proxyUrl;
                delete config['# HTTPS_PROXY'];
                delete config['# HTTP_PROXY'];
            }
        }
        
        return config;
    }

    async askBoolean(question, defaultValue) {
        const defaultText = defaultValue ? 'Y/n' : 'y/N';
        const answer = await this.question(`${question} [${defaultText}]: `);
        
        if (!answer) return defaultValue ? 'true' : 'false';
        
        const normalized = answer.toLowerCase();
        return normalized === 'y' || normalized === 'yes' ? 'true' : 'false';
    }

    async saveConfig(config) {
        const envPath = path.join(process.cwd(), '.env');
        
        // 检查是否已存在.env文件
        if (fs.existsSync(envPath)) {
            const overwrite = await this.askBoolean('已存在 .env 文件，是否覆盖?', false);
            if (overwrite !== 'true') {
                throw new Error('用户取消操作');
            }
            
            // 备份原文件
            fs.copyFileSync(envPath, `${envPath}.backup.${Date.now()}`);
            console.log('📄 原配置文件已备份');
        }
        
        // 生成配置文件内容
        let content = '# 加密货币市场数据机器人配置文件\n';
        content += `# 生成时间: ${new Date().toLocaleString()}\n\n`;
        
        // 按分类输出配置
        content += '# 数据库配置\n';
        content += `DB_HOST=${config.DB_HOST}\n`;
        content += `DB_PORT=${config.DB_PORT}\n`;
        content += `DB_USER=${config.DB_USER}\n`;
        content += `DB_PASSWORD=${config.DB_PASSWORD}\n`;
        content += `DB_DATABASE=${config.DB_DATABASE}\n\n`;
        
        content += '# API配置\n';
        content += `API_PORT=${config.API_PORT}\n`;
        content += `CORS_ORIGIN=${config.CORS_ORIGIN}\n\n`;
        
        content += '# 交易所启用配置\n';
        content += `ENABLE_OKX=${config.ENABLE_OKX}\n`;
        content += `ENABLE_BINANCE=${config.ENABLE_BINANCE}\n`;
        content += `ENABLE_BYBIT=${config.ENABLE_BYBIT}\n\n`;
        
        content += '# 数据类型启用配置\n';
        content += `ENABLE_SPOT_DATA=${config.ENABLE_SPOT_DATA}\n`;
        content += `ENABLE_PERPETUAL_DATA=${config.ENABLE_PERPETUAL_DATA}\n`;
        content += `ENABLE_ORDERBOOK_DATA=${config.ENABLE_ORDERBOOK_DATA}\n`;
        content += `ENABLE_FUNDING_RATE_DATA=${config.ENABLE_FUNDING_RATE_DATA}\n\n`;
        
        content += '# 数据收集配置\n';
        content += `COLLECTION_INTERVAL=${config.COLLECTION_INTERVAL}\n`;
        content += `MAX_CONCURRENT_EXCHANGES=${config.MAX_CONCURRENT_EXCHANGES}\n`;
        content += `RETRY_ATTEMPTS=${config.RETRY_ATTEMPTS}\n`;
        content += `ERROR_THRESHOLD=${config.ERROR_THRESHOLD}\n`;
        content += `AUTO_RESTART=${config.AUTO_RESTART}\n\n`;
        
        content += '# 代理配置 (可选)\n';
        if (config.HTTPS_PROXY) {
            content += `HTTPS_PROXY=${config.HTTPS_PROXY}\n`;
            content += `HTTP_PROXY=${config.HTTP_PROXY}\n`;
        } else {
            content += `# HTTPS_PROXY=http://127.0.0.1:7890\n`;
            content += `# HTTP_PROXY=http://127.0.0.1:7890\n`;
        }
        
        fs.writeFileSync(envPath, content);
    }

    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const config = new QuickConfig();
    config.run().catch(error => {
        console.error('配置失败:', error.message);
        process.exit(1);
    });
}

module.exports = QuickConfig; 