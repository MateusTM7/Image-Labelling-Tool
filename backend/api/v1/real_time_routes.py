from flask import Blueprint, jsonify, request

real_time_bp = Blueprint('real_time_bp', __name__)

@real_time_bp.route('/send-frame-from-string/<stream_id>', methods=['POST'])
def send_frame_from_string():
    """
    Send Frame From String.
    ---
    tags:
      - Real Time
    parameters:
      - name: parameter
        in: path
        type: string
        required: true
        description: Stream ID.
      - in: body
        name: data
        required: true
    responses:
      200:
        description: Sent Frame From String.
    """
    data = request.get_json()
    return jsonify({"received": data})

@real_time_bp.route('/send-text-from-string/<stream_id>', methods=['POST'])
def send_text_from_string():
    """
    Send Text From String.
    ---
    tags:
      - Real Time
    parameters:
      - name: parameter
        in: path
        type: string
        required: true
        description: Stream ID.
      - in: body
        name: data
        required: true
    responses:
      200:
        description: Sent Text From String.
    """
    data = request.get_json()
    return jsonify({"received": data})

@real_time_bp.route('/read/<resource_id>', methods=['GET'])
def list_config():
    """
    Read resource ID.
    ---
    tags:
      - Real Time
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

@real_time_bp.route('/list', methods=['GET'])
def real_time():
    """
    Get Real Time.
    ---
    tags:
      - Config
    responses:
      200:
        description: Get Real Time..
    """
    return jsonify({"data": "Get Real Time."})
