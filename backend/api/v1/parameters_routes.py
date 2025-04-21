from flask import Blueprint, jsonify, request
from utils.config import read_config, update_config, validate_parameter

parameters_bp = Blueprint('parameters_bp', __name__)

VALID_PARAMETERS = {"MAX_AREAS", "BUTTON_DELAY_CLICK", "UI_THEME"}

@parameters_bp.route('', methods=['GET'])
def get_config():
    """
    Get full parameters.
    ---
    tags:
      - Parameters
    responses:
      200:
        description: Return the complete parameters file.
      500:
        description: Internal Error.
    """
    try:
        config = read_config()
        if "error" in config:
            return jsonify(config), 500
        return jsonify(config)
    except Exception as e:
        return jsonify({"error": f"Failed to read parameters file: {str(e)}."}), 500

@parameters_bp.route('/update/<parameter>', methods=['POST'])
def update_config_param(parameter):
    """
    Update specific parameter.
    ---
    tags:
      - Parameters
    parameters:
      - name: parameter
        in: path
        type: string
        required: true
        description: Name of the parameter to be updated (MAX_AREAS, BUTTON_DELAY_CLICK, UI_THEME).
      - in: body
        name: data
        required: true
        schema:
          type: object
          example:
            MAX_AREAS: 11
    responses:
      200:
        description: Parameter updated successfully.
      400:
        description: Invalid parameter or incorrect data.
      500:
        description: Error updating configuration.
    """
    parameter = parameter.upper()

    if parameter not in VALID_PARAMETERS:
        return jsonify({"error": f"Invalid parameter: {parameter}."}), 400

    data = request.get_json()

    if not data or parameter not in data:
        return jsonify({"error": f"The request body must contain the parameter '{parameter}'."}), 400

    value = data[parameter]

    # Validação customizada (você cria depois)
    valid, error_msg = validate_parameter(parameter, value)
    if not valid:
        return jsonify({"error": error_msg}), 400

    try:
        update_config({parameter: value})
        return jsonify({"message": f"{parameter} updated to {value} successfully."})
    except Exception as e:
        return jsonify({"error": f"Error saving parameters: {str(e)}."}), 500