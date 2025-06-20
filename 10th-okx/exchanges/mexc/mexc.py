import okx.Account as Account
import okx.Trade as Trade
from utils.time import format_timestamp
import global_const


class MEXCExchange():
    def __init__(self, api_key, api_secret, passphrase):
        flag = global_const.get_value('flag')  
        self.accountAPI = Account.AccountAPI(api_key, api_secret, passphrase, False, flag, debug=False)
        self.TradeAPI = Trade.TradeAPI(api_key, api_secret, passphrase, False, flag, debug=False)
        
    def get_account_balance(self):
        result = self.accountAPI.get_account_balance()
        return result
    
    def set_leverage(self, parameters):
        result = self.accountAPI.set_leverage(**parameters)
        if result["code"] == '0':
            for item in result['data']:
                print("\n" + '杠杆设置成功,信息如下')
                print('instId: ' + item['instId'])
                print('lever: ' + item['lever'])
                print('mgnMode: ' + item['mgnMode'])
                print('posSide: ' + item['posSide'])
                print('=======================')
        else:
            print(result)
    
    def place_order(self, parameters):
        order_result = self.TradeAPI.place_order(**parameters)
        if order_result['code'] == '0':
            result_data = order_result['data']
            for item in result_data:
                order_id = item['ordId']
                if order_id:
                    self.get_order(parameters['instId'], order_id)
                    self.get_order_list()
        else:
            print(order_result)
        

    def get_order(self, instId, ordId):
        current_order_result = self.TradeAPI.get_order(instId, ordId)  
        if current_order_result['code'] == '0':
            result_data = current_order_result['data']
            for item in result_data:
              print('id:' + item['ordId'])
              print('杠杆:' + item['lever'])
              print('方向:' + item['posSide'])
              print('张数:' + item['sz'])
              print('时间:' + format_timestamp(item['fillTime']))
              print('-----------------------')


    def get_order_list(self):
        order_list_result = self.accountAPI.get_positions()
        if order_list_result['code'] == '0':
            positions_data = order_list_result['data']
            for item in positions_data:
                print('**********************')
                print('创建时间:' + format_timestamp(item['cTime']))
                print('指数价格:' + item['idxPx'])
                print('可用持仓数量( / 1000):' + item['availPos'])
                print('平均成交价:' + item['avgPx'])
                print('保证金率(*100):' + item['mgnRatio'])
                print('强平价格:' + item['liqPx'])
                print('杠杆:' + item['lever'])
                print('未实现盈亏:' + item['uplLastPx'])
                print('未实现盈亏比例:' + item['uplRatioLastPx'])
                print('标记价格:' + item['markPx'])
                print('手续费:' + item['fee'])
                print('最新成交价:' + item['last'])
                print('实现盈亏:' + item['realizedPnl'])
                print('**********************')