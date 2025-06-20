import json
import sys

def read_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return {
                "code": 200,
                "message": file.read()
            }
    except FileNotFoundError:
        return {
            "code": 404,
            "message": f"The file {file_path} does not exist."
        }
    except Exception as e:
        return {
            "code": 500,
            "message": f"An error occurred while reading {file_path}: {e}"
        }


def write_file(file_path, content, mode='w'):
    try:
        with open(file_path, mode, encoding='utf-8') as file:
            json.dump(content, file, ensure_ascii=False, indent=4)
    except IOError as e:
        print(f"An error occurred while writing to {file_path}: {e}")


def has_file(file_path, create = True):
    red_result = read_file(file_path)
    if(red_result['code'] != 200 ):
        if create:
            write_file(file_path, '')
            return True
        return False
    else:
        return True


def create_file_content(path, string):
    path = path
    keys = string.split(',')
    if has_file(path, False):
        pass
    else:
        write_file(path, { key: '' for key in keys})

    read_content = read_file(path)['message']
    read_content = json.loads(read_content)

    if all(key in read_content and read_content[key] for key in keys):
        pass
    else:
        print('请检查.config文件是否有' + string + '并不能为空')
        return False

    return read_content
