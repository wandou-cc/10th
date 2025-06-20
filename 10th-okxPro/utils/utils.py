import configparser

def red_init():
    config = configparser.ConfigParser()
    config.read('config.ini', encoding="utf-8")
    return config
