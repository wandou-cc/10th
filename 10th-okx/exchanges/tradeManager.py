from time import sleep
from exchanges.okx.okx import OKXExchange
# from exchanges.mexc.mexc import MEXCExchange
import global_const
import asyncio

class TradeManager:
    def __init__(self, exchange_name):
        self._exchange_config = None
        self._exchange_name = exchange_name
        self._apikey = None
        self._secretkey = None
        self._passphrase = None
        self._exchanges = None
        self._exchange = None

    def set_exchange_config(self, exchange_config):
        self._exchange_config = exchange_config
        self._apikey = exchange_config['apikey']
        self._secretkey = exchange_config['secretkey']
        self._passphrase = exchange_config['Passphrase'] or ''

    def set_exchanges(self):
        self._exchanges = {
            "okx": OKXExchange(self._apikey, self._secretkey, self._passphrase),
            # "mexc": MEXCExchange(self._apikey, self._secretkey)
        }
        self._exchange = self._exchanges.get(self._exchange_name)

    def get_account_balance(self):
        account_balance = self._exchange.get_account_balance()
        print(account_balance)

    def set_lever(self):
        mgnMode = "cross" # cross 全仓 # isolated 逐仓

        leverage = {
            "instId": 'BTC-USDT-SWAP',
            "mgnMode": mgnMode,
            "lever": "50"
        }

        try:
            self._exchange.set_leverage(leverage)
        except BaseException as error:
            print(error)
            print('杠杆失败')

    def setpositions(self):
        try: 
            self._exchange.accountAPI.set_position_mode(posMode="long_short_mode")
            print('持仓模式设置成功')
        except BaseException as error:
            print(error)
   


    #  开单方法
    async def open_position(self, current_order):
        
        # current_flag = global_const.get_value('flag')
        # 1 = 0.01BTC
        # margin = float(current_order['quantity']) * 2
        # mgnMode = "cross" # cross 全仓 # isolated 逐仓
        parameters = {
            "instId": current_order['market'],
            "tdMode": "cross", 
            "side": current_order['side'],
            "posSide": current_order['posSide'],
            "ordType": "market",
            "sz":  float(current_order['quantity']) * 2
        }

        print(parameters)

        # 开单
        orderInfo = self._exchange.place_order(parameters)

        if not ('code' in orderInfo and orderInfo['code'] == '1') :
            import datetime
            open_amount = float(orderInfo['avgPx'])
            open_time = int(orderInfo['ts'])
            fee = float(orderInfo['fee'])
            leverage = int(orderInfo['lever'])
            direction = orderInfo['side']
            pos_side = orderInfo['posSide']
            ordId = orderInfo['ordId']
            sz = int(orderInfo['sz'])
            # 根据买卖方向设置字符串
            # print(orderInfo)

            switch = {
                '开多': { 'side': 'buy', 'posSide': 'long'},
                '开空': { 'side': 'sell', 'posSide': 'short'},
                '平多': { 'side': 'sell', 'posSide': 'long'},
                '平空': { 'side': 'buy', 'posSide': 'short'},
            }
            action_type = None
            for key, value in switch.items():
                if direction == value['side'] and pos_side == value['posSide']:
                    action_type = key
                    break
            p_time = int(current_order['response_json']['data'][0]['ts'])
            p_formatted_open_time =  datetime.datetime.fromtimestamp( p_time/ 1000).strftime('%Y-%m-%d %H:%M:%S')

            which_time = current_order['which_time'] 
            which_formatted_time =  datetime.datetime.fromtimestamp(which_time / 1000).strftime('%Y-%m-%d %H:%M:%S')
            formatted_open_time = datetime.datetime.fromtimestamp(open_time / 1000).strftime('%Y-%m-%d %H:%M:%S')

            diff_time = (open_time - p_time) / 1000
            # 1 = 0.001BTC
            final_string = f"[{action_type}] \n订单id:    {ordId}\n持仓数:    {sz / 100} \n开单价格:   {open_amount}\n普哥开单时间:   {p_time}({p_formatted_open_time}) \n监听消息时间:    {which_time}({which_formatted_time}) \n开单时间:     {open_time}({formatted_open_time})\n相差时间:   {diff_time}秒\n手续费:   {fee}\n杠杆:     {leverage} \n"
            
            telegram_client = global_const.get_value('telegram_client')  
            await telegram_client.send_message(1002143229912, str(final_string))
            if(action_type == '平空' or action_type == '平多'):
                await telegram_client.send_message(1002143229912, str("15秒后进行该笔订单的信息查询……"))
                sleep(15)
                final_his = self._exchange.get_order_list()
                await telegram_client.send_message(1002143229912, str(final_his))

        else:
            await telegram_client.send_message(1002143229912, str(orderInfo))

    