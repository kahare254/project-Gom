"""
API package initialization with Swagger/OpenAPI documentation.
"""
from flask import Blueprint, url_for
from flask_restx import Api, apidoc
from flask import current_app

# Create the API blueprint
api_bp = Blueprint('api', __name__)

authorizations = {
    'Bearer Auth': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization',
        'description': 'Type in the value with "Bearer " prefix.'
    }
}

api = Api(
    api_bp,
    version='1.0',
    title='Gate of Memory API',
    description='A RESTful API for the Gate of Memory application',
    doc='/docs/',  # Disable the default Swagger UI
    prefix='/api/v1',
    authorizations=authorizations,
    security='Bearer Auth'
)

# Custom Swagger UI route to handle the base path
@api_bp.route('/docs/')
def swagger_ui():
    return apidoc.ui_for(api)

# Import resources to register routes
from . import resources  # noqa

# Add namespaces to the API
from .user import api as user_ns
from .memorial import api as memorial_ns
from .memory import api as memory_ns
from .image import api as image_ns

# Register namespaces
api.add_namespace(user_ns)
api.add_namespace(memorial_ns)
api.add_namespace(memory_ns)
api.add_namespace(image_ns)
