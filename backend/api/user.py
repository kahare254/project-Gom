"""
User API resources.
"""
from flask_restful import reqparse
from flask import current_app
from ..models import User, db
from .base import BaseResource

class UserResource(BaseResource):
    """API Resource for single user operations."""
    
    def get(self, user_id):
        """Get a single user by ID."""
        user = User.query.get_or_404(user_id)
        return self.success_response(user.to_dict())
    
    def put(self, user_id):
        """Update a user."""
        user = User.query.get_or_404(user_id)
        
        # Parse and validate request data
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str, required=False)
        parser.add_argument('email', type=str, required=False)
        parser.add_argument('password', type=str, required=False)
        parser.add_argument('is_admin', type=bool, required=False)
        
        args = parser.parse_args()
        
        # Update user fields if provided
        if args['username'] is not None:
            user.username = args['username']
        if args['email'] is not None:
            user.email = args['email']
        if args['password'] is not None:
            user.set_password(args['password'])
        if args['is_admin'] is not None:
            user.is_admin = args['is_admin']
        
        db.session.commit()
        return self.success_response(user.to_dict(), 'User updated successfully')
    
    def delete(self, user_id):
        """Delete a user."""
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return self.success_response(None, 'User deleted successfully', 204)

class UserListResource(BaseResource):
    """API Resource for user collection operations."""
    
    def get(self):
        """Get all users with pagination."""
        query = User.query
        return self.success_response(self.paginate_query(query))
    
    def post(self):
        """Create a new user."""
        # Parse and validate request data
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str, required=True, help='Username is required')
        parser.add_argument('email', type=str, required=True, help='Email is required')
        parser.add_argument('password', type=str, required=True, help='Password is required')
        parser.add_argument('is_admin', type=bool, default=False, required=False)
        
        args = parser.parse_args()
        
        # Check if username or email already exists
        if User.query.filter_by(username=args['username']).first():
            return self.error_response('Username already exists', 409)
        if User.query.filter_by(email=args['email']).first():
            return self.error_response('Email already exists', 409)
        
        # Create new user
        user = User(
            username=args['username'],
            email=args['email'],
            is_admin=args['is_admin']
        )
        user.set_password(args['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return self.success_response(user.to_dict(), 'User created successfully', 201)
