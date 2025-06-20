from telethon import TelegramClient, events
import time
from utils.matchStr import matchStr


class telethon_client:
    def __init__(self, api_id, api_hash, group_id, proxy, on_order_callback = None):
        self._api_id = api_id
        self._api_hash = api_hash
        self._group_id = group_id
        self._proxy = proxy
        self._on_order_callback = on_order_callback
        try:
             self._telegram_client = TelegramClient('session_name', self._api_id, self._api_hash, proxy=self._proxy)
        except BaseException as Error:
            print(Error)


    # 启动服务
    async def start_client(self):
        print('telegram服务启动')
        await self._telegram_client.start()


    # 监听消息
    def storage_messages(self, handleMessage): 
        print('监听到! 正在处理')
        which_time = int(time.time()*1000)
        matchJSON = matchStr(handleMessage.message)
        message_id = handleMessage.id

        currentInfo = {
            "message_id": message_id,
            # "message_text": message_text,
            **matchJSON,
            "which_time": which_time
        }
        return currentInfo

    # 获取群聊消息
    async def watch_chats(self,group_entity):
        print('正在监听……')
        @self._telegram_client.on(events.NewMessage(chats=group_entity))
        async def handle_new_message(event):
            try:
                current_order = self.storage_messages(event.message)
            except BaseException as error:
                current_order = False
                print('解析文本错误')

            if current_order:
                current_order =  await self.exchange_interface(current_order)
                if self._on_order_callback:
                    self._on_order_callback(current_order)
                else:
                    print("未定义回调函数，订单内容：", current_order)
    
    async def exchange_interface(self, current_order):
        operation = current_order['operation']
        switch = {
            '开多': { 'side': 'buy', 'posSide': 'long'},
            '开空': { 'side': 'sell', 'posSide': 'short'},
            '平多': { 'side': 'sell', 'posSide': 'long'},
            '平空': { 'side': 'buy', 'posSide': 'short'},
        }
        outerParam = switch.get(operation)
        return {
            **current_order,
            **outerParam
        }


    async def run(self):
        await self.start_client()
        group_entity = await self._telegram_client.get_entity(self._group_id)
        await self.watch_chats(group_entity)
        await self._telegram_client.run_until_disconnected()

