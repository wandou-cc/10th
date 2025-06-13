// 主应用启动文件
require('dotenv').config();
const DataCollector = require('./services/DataCollector');
const ApiServer = require('./services/ApiServer');
const database = require('./config/database');
const appConfig = require('./config/app-config');

class MarketDataBot {
    constructor() {
        this.dataCollector = null;
        this.apiServer = null;
        this.isRunning = false;
    }

    async init() {
        try {
            console.log('🚀 启动加密货币市场数据收集机器人...\n');
            
            // 0. 显示配置摘要
            console.log('📋 配置摘要:');
            const configSummary = appConfig.getSummary();
            console.log(`   启用的交易所: ${configSummary.exchanges.enabled.join(', ')} (${configSummary.exchanges.enabled.length}/${configSummary.exchanges.total})`);
            console.log(`   启用的数据类型: ${configSummary.dataTypes.enabled.join(', ')} (${configSummary.dataTypes.enabled.length}/${configSummary.dataTypes.total})`);
            console.log(`   收集间隔: ${configSummary.collection.interval}`);
            console.log(`   最大并发: ${configSummary.collection.maxConcurrent}`);
            console.log(`   API端口: ${configSummary.api.port}`);
            console.log(`   代理: ${configSummary.proxy.enabled ? '启用' : '禁用'}\n`);
            
            // 验证配置
            const validation = appConfig.validate();
            if (!validation.isValid) {
                throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
            }
            
            // 1. 初始化数据库
            console.log('📊 初始化数据库...');
            await database.createDatabase();
            await database.close();
            await database.init();
            await database.createTables();
            console.log('✅ 数据库初始化完成\n');
            
            // 2. 创建并初始化数据收集器
            console.log('🔧 初始化数据收集器...');
            this.dataCollector = new DataCollector({
                // 传入代理配置
                proxy: appConfig.getConfig().proxy
            });
            
            await this.dataCollector.init();
            console.log('✅ 数据收集器初始化完成\n');
            
            // 3. 创建并启动API服务器
            if (appConfig.getConfig().api.enabled) {
                console.log('🌐 启动API服务器...');
                this.apiServer = new ApiServer({
                    port: appConfig.getConfig().api.port
                });
                
                // 将数据收集器引用传递给API服务器
                this.apiServer.setDataCollector(this.dataCollector);
                
                await this.apiServer.start();
                console.log('✅ API服务器启动完成\n');
            }
            
            // 4. 启动数据收集
            if (appConfig.getConfig().collection.enabled) {
                console.log('⏰ 启动定时数据收集...');
                this.dataCollector.start();
                console.log('✅ 定时数据收集已启动\n');
            }
            
            this.isRunning = true;
            
            console.log('🎉 市场数据机器人启动成功！');
            if (this.apiServer) {
                console.log('\n📍 可用的接口:');
                console.log(`   健康检查: http://localhost:${this.apiServer.config.port}/health`);
                console.log(`   API信息: http://localhost:${this.apiServer.config.port}/api/info`);
                console.log(`   数据统计: http://localhost:${this.apiServer.config.port}/api/stats`);
                console.log(`   收集器状态: http://localhost:${this.apiServer.config.port}/api/collector/status`);
                console.log(`   配置信息: http://localhost:${this.apiServer.config.port}/api/config`);
                console.log(`   现货数据示例: http://localhost:${this.apiServer.config.port}/api/spot/okx?limit=10`);
            }
            
            // 设置优雅退出
            this.setupGracefulShutdown();
            
        } catch (error) {
            console.error('❌ 启动失败:', error.message);
            await this.shutdown();
            process.exit(1);
        }
    }

    // 设置优雅退出
    setupGracefulShutdown() {
        const signals = ['SIGINT', 'SIGTERM'];
        
        signals.forEach(signal => {
            process.on(signal, async () => {
                console.log(`\n📥 收到 ${signal} 信号，开始优雅退出...`);
                await this.shutdown();
                process.exit(0);
            });
        });
        
        process.on('uncaughtException', async (error) => {
            console.error('❌ 未捕获的异常:', error);
            await this.shutdown();
            process.exit(1);
        });
        
        process.on('unhandledRejection', async (reason, promise) => {
            console.error('❌ 未处理的Promise拒绝:', reason);
            await this.shutdown();
            process.exit(1);
        });
    }

    // 优雅关闭
    async shutdown() {
        if (!this.isRunning) return;
        
        console.log('🛑 开始关闭服务...');
        
        try {
            // 停止数据收集
            if (this.dataCollector) {
                this.dataCollector.stop();
                console.log('✅ 数据收集器已停止');
            }
            
            // 停止API服务器
            if (this.apiServer) {
                await this.apiServer.stop();
                console.log('✅ API服务器已停止');
            }
            
            // 关闭数据库连接
            await database.close();
            console.log('✅ 数据库连接已关闭');
            
            this.isRunning = false;
            console.log('✅ 优雅关闭完成');
            
        } catch (error) {
            console.error('❌ 关闭过程中出错:', error.message);
        }
    }

    // 获取运行状态
    getStatus() {
        return {
            isRunning: this.isRunning,
            dataCollector: this.dataCollector ? this.dataCollector.getStatus() : null,
            apiServer: this.apiServer ? { port: this.apiServer.config.port } : null,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version
        };
    }
}

// 如果直接运行此文件，则启动应用
if (require.main === module) {
    const bot = new MarketDataBot();
    bot.init().catch(error => {
        console.error('启动失败:', error);
        process.exit(1);
    });
}

module.exports = MarketDataBot; 