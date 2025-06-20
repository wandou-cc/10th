from datetime import datetime

def formatTiem(time = datetime.now(), mode = '%Y-%m-%d %H:%M:%S'):
    return time.strftime(mode)

def format_timestamp(timestamp):
    if isinstance(timestamp, str):
        timestamp = float(timestamp)
    if timestamp > 1e12:
        timestamp /= 1000
    dt_object = datetime.fromtimestamp(timestamp)
    formatted_date = dt_object.strftime('%Y-%m-%d %H:%M:%S')
    return formatted_date