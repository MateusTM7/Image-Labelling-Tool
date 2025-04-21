from flask import Flask, send_from_directory, jsonify, request
from flasgger import Swagger
import os

from api.v1.real_time_routes import real_time_bp
from api.v1.config_routes import config_bp
from api.v1.configuration_routes import configuration_bp

frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend'))

app = Flask(__name__, static_folder=frontend_path, static_url_path='/')

swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec_1',
            "route": '/apispec_1.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "swagger_ui": True,
    "specs_route": "/apidocs/"
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Fiscal Tech - Tools API",
        "description": "API for image tagging, area configuration and data export.",
        "contact": {
            "responsibleOrganization": "Fiscal Tech",
            "responsibleDeveloper": "Matheus Tanaka",
        },
        "termsOfService": "https://fiscaltech.com.br/politica-de-privacidade/",
        "version": "1.0.0"
    },
    "basePath": "/",  # base da API
}

swagger = Swagger(app, config=swagger_config, template=swagger_template)

# Register Blueprints com prefixo da versão
app.register_blueprint(real_time_bp, url_prefix='/api/v1/real-time')
app.register_blueprint(config_bp, url_prefix='/api/v1/config')
app.register_blueprint(configuration_bp, url_prefix='/api/v1/configuration')

# Rotas principais do SPA (sem recarregar a página)
@app.route('/')
@app.route('/home')
@app.route('/configuration')
@app.route('/image-labelling')
def serve_spa():
    return send_from_directory(app.static_folder, 'index.html')

# Captura qualquer 404 e redireciona para index.html se não for rota da API
@app.errorhandler(404)
def not_found(e):
    path = request.path
    if path.startswith('/api/'):
        return jsonify({"error": "API endpoint not found"}), 404
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(debug=True)
