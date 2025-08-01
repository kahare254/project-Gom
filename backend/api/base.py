"""
Base resource class for API endpoints.
"""
from flask_restful import Resource, reqparse
from flask import current_app, jsonify, request
from functools import wraps
import json

class BaseResource(Resource):    
    # Common parser for pagination
    pagination_parser = reqparse.RequestParser()
    pagination_parser.add_argument('page', type=int, default=1, help='Page number')
    pagination_parser.add_argument('per_page', type=int, default=10, help='Items per page')
    
    def __init__(self):
        super().__init__()
        self.logger = current_app.logger
    
    @classmethod
    def register(cls, api, *urls, **kwargs):
        """Register this resource with the API."""
        endpoint = kwargs.pop('endpoint', None) or cls.__name__.lower()
        api.add_resource(cls, *urls, endpoint=endpoint, **kwargs)
    
    @staticmethod
    def success_response(data=None, message=None, status_code=200):
        """Return a successful API response."""
        response = {
            'status': 'success',
            'data': data,
            'message': message
        }
        return jsonify({k: v for k, v in response.items() if v is not None}), status_code
    
    @staticmethod
    def error_response(message, status_code=400, errors=None):
        """Return an error API response."""
        response = {
            'status': 'error',
            'message': message,
            'errors': errors
        }
        return jsonify({k: v for k, v in response.items() if v is not None}), status_code
    
    def paginate_query(self, query):
        """Paginate a SQLAlchemy query."""
        args = self.pagination_parser.parse_args()
        page = args['page']
        per_page = args['per_page']
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'items': [item.to_dict() for item in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page
        }
