# 配置系统使用说明

本项目支持通过环境变量和配置文件灵活配置要收集的交易所数据和功能选项。

## 环境变量配置

### 1. 创建配置文件

复制示例配置文件到项目根目录：
```bash
cp config.env.example .env
```

### 2. 交易所启用配置

控制启用哪些交易所进行数据收集：

```bash
# 启用/禁用交易所 (true/false)
ENABLE_OKX=true          # 启用OKX交易所
ENABLE_BINANCE=true      # 启用币安交易所  
ENABLE_BYBIT=true        # 启用Bybit交易所
```

**示例场景：**
- 只使用OKX: `ENABLE_OKX=true ENABLE_BINANCE=false ENABLE_BYBIT=false`
- 使用OKX和币安: `ENABLE_OKX=true ENABLE_BINANCE=true ENABLE_BYBIT=false`
- 全部启用: `ENABLE_OKX=true ENABLE_BINANCE=true ENABLE_BYBIT=true`

### 3. 数据类型配置

控制收集哪些类型的市场数据：

```bash
# 启用/禁用数据类型 (true/false)
ENABLE_SPOT_DATA=true           # 现货交易数据
ENABLE_PERPETUAL_DATA=true      # 永续合约数据
ENABLE_ORDERBOOK_DATA=false     # 订单簿数据 (数据量大，建议按需启用)
ENABLE_FUNDING_RATE_DATA=false  # 资金费率数据 (更新频率低)
```

### 4. 收集配置

控制数据收集的频率和并发：

```bash
# 数据收集间隔 (cron格式)
COLLECTION_INTERVAL=*/3 * * * *    # 每3分钟执行一次

# 并发控制
MAX_CONCURRENT_EXCHANGES=1         # 最大同时处理的交易所数量
RETRY_ATTEMPTS=3                   # 失败重试次数
ERROR_THRESHOLD=5                  # 连续错误阈值
AUTO_RESTART=true                  # 自动重启失败的交易所
```

### 5. API服务器配置

```bash
# API服务器设置
API_PORT=3000                      # API服务器端口
CORS_ORIGIN=*                      # 跨域设置
```

### 6. 网络代理配置 (可选)

如果需要通过代理访问交易所API：

```bash
# 代理设置
HTTPS_PROXY=http://127.0.0.1:7890  # HTTPS代理
HTTP_PROXY=http://127.0.0.1:7890   # HTTP代理
```

## 配置优先级

配置系统按以下优先级应用设置：

1. **环境变量** (最高优先级)
2. **程序传入的config参数**
3. **默认配置** (最低优先级)

## 常用配置场景

### 场景1: 仅收集OKX现货数据

```bash
# .env 文件
ENABLE_OKX=true
ENABLE_BINANCE=false
ENABLE_BYBIT=false

ENABLE_SPOT_DATA=true
ENABLE_PERPETUAL_DATA=false
ENABLE_ORDERBOOK_DATA=false
ENABLE_FUNDING_RATE_DATA=false

COLLECTION_INTERVAL=*/1 * * * *
```

### 场景2: 收集所有交易所的现货和永续合约数据

```bash
# .env 文件
ENABLE_OKX=true
ENABLE_BINANCE=true
ENABLE_BYBIT=true

ENABLE_SPOT_DATA=true
ENABLE_PERPETUAL_DATA=true
ENABLE_ORDERBOOK_DATA=false
ENABLE_FUNDING_RATE_DATA=false

COLLECTION_INTERVAL=*/5 * * * *
MAX_CONCURRENT_EXCHANGES=2
```

### 场景3: 高频数据收集 (包含订单簿)

```bash
# .env 文件
ENABLE_OKX=true
ENABLE_BINANCE=false
ENABLE_BYBIT=false

ENABLE_SPOT_DATA=true
ENABLE_PERPETUAL_DATA=true
ENABLE_ORDERBOOK_DATA=true
ENABLE_FUNDING_RATE_DATA=true

COLLECTION_INTERVAL=*/1 * * * *
MAX_CONCURRENT_EXCHANGES=1
```

## 程序化配置

除了环境变量，也可以在代码中动态配置：

```javascript
const appConfig = require('./config/app-config');

// 检查交易所是否启用
if (appConfig.isExchangeEnabled('okx')) {
    console.log('OKX交易所已启用');
}

// 获取启用的交易所列表
const enabledExchanges = appConfig.getEnabledExchanges();
console.log('启用的交易所:', enabledExchanges.map(ex => ex.name));

// 动态更新配置
appConfig.updateConfig('exchanges.okx.enabled', false);

// 获取配置摘要
const summary = appConfig.getSummary();
console.log('配置摘要:', summary);
```

## API接口查看配置

启动程序后，可以通过以下API接口查看当前配置：

```bash
# 查看配置摘要
curl http://localhost:3000/api/config

# 查看数据收集器状态
curl http://localhost:3000/api/collector/status

# 查看数据统计
curl http://localhost:3000/api/stats
```

## 配置验证

程序启动时会自动验证配置的有效性：

- 至少启用一个交易所
- 至少启用一种数据类型  
- API端口在有效范围内 (1-65535)
- 其他配置项格式正确

如果配置无效，程序会显示错误信息并拒绝启动。

## 注意事项

1. **资源消耗**: 启用越多交易所和数据类型，对系统资源消耗越大
2. **API限制**: 各交易所都有API调用频率限制，建议合理设置收集间隔
3. **存储空间**: 订单簿数据量很大，建议根据实际需求决定是否启用
4. **网络稳定性**: 如果网络不稳定，建议启用代理并增加重试次数 