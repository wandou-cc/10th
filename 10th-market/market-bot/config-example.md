# 配置说明

## 环境配置文件 (.env)

请在项目根目录创建 `.env` 文件，内容如下：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=12345678
DB_NAME=crypto_market_data

# 代理配置 (可选)
# 如果需要使用代理访问交易所API，请取消注释并设置正确的代理地址
# HTTPS_PROXY=http://127.0.0.1:7890

# API服务配置
API_PORT=3000

# 日志级别
LOG_LEVEL=info

# 数据收集配置
COLLECTION_INTERVAL=*/1 * * * *  # Cron表达式，默认每分钟执行一次
```

## 代理设置说明

### 1. 环境变量方式
```bash
export HTTPS_PROXY=http://127.0.0.1:7890
```

### 2. .env 文件方式
在 .env 文件中设置：
```bash
HTTPS_PROXY=http://127.0.0.1:7890
```

### 3. 代码中直接配置
```javascript
const okxAdapter = new OKXAdapter({
    httpsProxy: 'http://127.0.0.1:7890'
});
```

## 常用代理地址

- Clash: `http://127.0.0.1:7890`
- V2Ray: `http://127.0.0.1:1087`
- Shadowsocks: `http://127.0.0.1:1086`

请根据你的代理软件设置相应的地址和端口。 