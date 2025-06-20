import re 
import json

def matchStr(string):
    match = re.search(r"\[([^\]]+)\] 数量:(\d+) 市场:(\S+) 返回({.*})", string)
    if match:
        operation = match.group(1)  # 操作类型，匹配中括号内的任意文本
        quantity = match.group(2)   # "6"
        market = match.group(3)     # "BTC-USDT-SWAP"
  
        response_str = match.group(4).replace("'", "\"") 
        try:
            # 解析JSON字符串
            response_json = json.loads(response_str)
        except json.JSONDecodeError as e:
            print(f"JSON解析出错: {e}")
            response_json = {}

        # 输出结果
        return {
            "operation": operation,
            "quantity": quantity,
            "market": market,
            "response_json": response_json
        }
    else:
        print("没有找到匹配项。")
        return None