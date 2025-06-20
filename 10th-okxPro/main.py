import os
import socks  # pysocks
import asyncio
from telethon_client import telethon_client
from utils.utils import red_init
from ok.okxPro import OkxPro

proxy = (socks.SOCKS5, '127.0.0.1', 7890)

# 初始化配置
config_detail = red_init()
flag = config_detail["Config"]['flag']

# 设置 OKX 实例
simulation = {
    "apikey": "fbacf785-107f-4f40-92c5-a534c17e5ce5",
    "secretkey": "903DADC33A361545B627B48737818990",
    "passphrase": "Okxpassword123@"
}  # 模拟盘
normal = {"apikey": "896ec4aa-87de-435e-9f84-e8aeadbbb7d5", "secretkey": "612D379B798E1EA21E10E9604A096FF8", "passphrase": "Okxpassword123@"}  # 实盘
result_dict = simulation if flag == "1" else normal

okx_instance = OkxPro(
    result_dict["apikey"],
    result_dict["secretkey"],
    result_dict["passphrase"],
    flag
)


# 监听到消息后进行开单

'''
    策略：
        1. 监听到消息之后进行开始获取当前价格 记录当前开单价格以及数量
        2. 通过设置一个百分比，计算开单价格 比如监听到的价格是90000 设置 千分之1 那么开单价格就是 90000 * 1.001 = 90090
        3. 进行挂单操作 挂单之后进行消息通知
            如果 开单成功 则进行消息通知
            如果没有开进去再次收到消息 获取价格 并进行计算均价是多少 然后在均价的基础上 千分之1 进行挂单
        4. 如果收到平仓信号设置止损 
'''
def process_order(order):
    
    pass

# 创建 Telegram 实例
def create_telegram_client(telegram_API_config):
    try:
        api_id = telegram_API_config['api_id']
        api_hash = telegram_API_config['api_hash']
        group_id = telegram_API_config['group_id']

        telethon_client_instance = telethon_client(api_id, api_hash, group_id, proxy, process_order)
        print('Telegram 实例创建成功')
        return telethon_client_instance
    except Exception as e:
        print(f'Telegram 实例创建失败: {e}')
        return None


async def main():
    telegram_client = create_telegram_client({
        "api_id": config_detail["Config"]['api_id'],
        "api_hash": config_detail["Config"]['api_hash'],
        "group_id": int(config_detail["Config"]['group_id'])
    })
    if telegram_client:
        await telegram_client.run()
    else:
        print("Telegram 客户端未成功创建，程序终止")


if __name__ == '__main__':
    asyncio.run(main())
