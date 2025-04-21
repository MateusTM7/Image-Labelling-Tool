import os
import json

CONFIG_FILE_PATH = os.path.join(os.path.dirname(__file__), '../config/parameters.json')

def read_config():
    if not os.path.exists(CONFIG_FILE_PATH):
        raise FileNotFoundError(f"Configuration file not found: {CONFIG_FILE_PATH}")
    
    with open(CONFIG_FILE_PATH, 'r') as file:
        try:
            return json.load(file)
        except json.JSONDecodeError:
            raise ValueError("Error decoding JSON file.")
        
def update_config(updates):
    if not os.path.exists(CONFIG_FILE_PATH):
        raise FileNotFoundError(f"Arquivo de configuração não encontrado: {CONFIG_FILE_PATH}")
    
    try:
        config = read_config()
    except Exception as e:
        raise Exception(f"Erro ao ler configuração: {e}")
    
    # Atualiza os parâmetros com base no objeto de atualizações passado
    for key, value in updates.items():
        if key in config:
            config[key] = value
        else:
            raise KeyError(f"A chave '{key}' não existe no arquivo de configuração.")

    # Grava as alterações de volta ao arquivo
    with open(CONFIG_FILE_PATH, 'w') as file:
        json.dump(config, file, indent=4)

def validate_parameter(param, value):
    if param == "MAX_AREAS":
        if isinstance(value, int) and value >= 0:
            return True, None
        return False, "MAX_AREAS deve ser um inteiro não-negativo."

    if param == "BUTTON_DELAY_CLICK":
        if isinstance(value, int) and value >= 0:
            return True, None
        return False, "BUTTON_DELAY_CLICK deve ser um inteiro em milissegundos."

    if param == "UI_THEME":
        if isinstance(value, str) and value.lower() in {"light", "dark"}:
            return True, None
        return False, "UI_THEME deve ser 'light' ou 'dark'."

    return False, f"Parâmetro '{param}' não suportado para validação."