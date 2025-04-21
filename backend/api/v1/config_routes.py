from flask import Blueprint, jsonify, request

config_bp = Blueprint('config_bp', __name__)

@config_bp.route('/list', methods=['GET'])
def list_config():
    """
    List config.
    ---
    tags:
      - Config
    responses:
      200:
        description: List config correctly.
    """
    return jsonify({"data": "List config"})

@config_bp.route('/read/<resource_id>', methods=['GET'])
def read_config():
    """
    Read resource ID.
    ---
    tags:
      - Config
    parameters:
      - name: parameter
        in: path
        type: string
        required: true
        description: Read resource ID.
      - in: body
        name: data
        required: true
    responses:
      200:
        description: Read resource ID correctly.
    """
    return jsonify({"data": "Read resource ID."})

@config_bp.route('/update', methods=['POST'])
def update_config():
    """
    Update Config.
    ---
    tags:
      - Config
    responses:
      200:
        description: Updated Config.
    """
    data = request.get_json()
    return jsonify({"received": data})

@config_bp.route('/reload', methods=['POST'])
def reload_config():
    """
    Reload Config.
    ---
    tags:
      - Config
    responses:
      200:
        description: Reloaded Config.
    """
    data = request.get_json()
    return jsonify({"received": data})

@config_bp.route('/close', methods=['POST'])
def close_config():
    """
    Close Config.
    ---
    tags:
      - Config
    responses:
      200:
        description: Closed Config.
    """
    data = request.get_json()
    return jsonify({"received": data})
