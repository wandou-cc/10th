import sys
import asyncio
from utils.ioFile import create_file_content

exchange_name = 'okx' # 开单平台 

# 检查telegram 配置
def checkout_telegram_config():
    telegram_config_path = './config/.config.json'
    telegram_config_center = create_file_content(telegram_config_path, 'api_id,api_hash,group_id')
    if not telegram_config_center:
        sys.exit()
    else:
        print('telegram配置正常')

    api_id, api_hash, group_id = telegram_config_center['api_id'], telegram_config_center['api_hash'], telegram_config_center['group_id']
    return {
        "api_id": api_id,
        "api_hash": api_hash,
        "group_id": group_id
    }

# 检查交易所配置
def checkout_exchange_config():
    if exchange_name == 'okx':
        exchange_path = './exchanges/okx/key.json'
    elif exchange_name == 'mexc':
        exchange_path = './exchanges/mexc/key.json'
    else:
        print('请检查开单平台配置')
        sys.exit()

    exchange_config_center = create_file_content(exchange_path, 'apikey,secretkey,Passphrase')

    if not exchange_config_center:
        sys.exit()
    else:
        print('交易所配置正常')

# 创建telegram 实例
def create_telegram_client(telegram_API_config):
    import socks  # pysocks
    from telethon_client import telethon_client
    api_id = telegram_API_config['api_id']
    api_hash = telegram_API_config['api_hash']
    group_id = telegram_API_config['group_id']
    
    proxy = (socks.SOCKS5, '127.0.0.1', 7890)
    # proxy = ""
    telethonchen = telethon_client(api_id, api_hash, group_id, proxy)
    if telethonchen:
        print('telegram 创建实例正常')
        return telethonchen
    else:
        print('telegram 创建实例失败')

# 检查环境
def checkout_env():
    telegram_API_config = checkout_telegram_config()
    checkout_exchange_config()
    return telegram_API_config


if __name__ == '__main__':
    telegram_API_config = checkout_env()
    telegram_client = create_telegram_client(telegram_API_config)
    loop = asyncio.get_event_loop()
    loop.run_until_complete(telegram_client.run(exchange_name))
    # 考虑：
    #     1 是否要做成多个交易所同时开单
    #     2 是否要监听多个群聊

