"""
Security utilities for the Gate of Memory application.
Includes JWT authentication, rate limiting, and request validation.
"""
import os
import re
import jwt
import datetime
from functools import wraps
from flask import request, jsonify, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

def get_jwt_secret():
    """Get JWT secret key from environment or use a default (not for production)."""
    return os.environ.get('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')

def generate_token(user_id, username, is_admin=False, expires_in=3600):
    """Generate a JWT token for the specified user.
    
    Args:
        user_id: The user's unique identifier
        username: The username of the user
        is_admin: Whether the user has admin privileges
        expires_in: Token expiration time in seconds (default: 1 hour)
        
    Returns:
        str: Encoded JWT token
    """
    payload = {
        'user_id': user_id,
        'username': username,
        'is_admin': is_admin,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_in),
        'iat': datetime.datetime.utcnow(),
        'iss': 'gate-of-memory-api'
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm='HS256')

def decode_token(token):
    """Decode and validate a JWT token.
    
    Args:
        token: The JWT token to decode
        
    Returns:
        dict: The decoded token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token has expired
    except jwt.InvalidTokenError:
        return None  # Invalid token

def token_required(f):
    """Decorator to require a valid JWT token for a route."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({
                'message': 'Authentication token is missing',
                'error': 'authorization_required'
            }), 401
            
        # Decode and validate token
        data = decode_token(token)
        if not data:
            return jsonify({
                'message': 'Invalid or expired token',
                'error': 'invalid_token'
            }), 401
            
        # Add user info to the request context
        request.current_user = {
            'id': data['user_id'],
            'username': data['username'],
            'is_admin': data.get('is_admin', False)
        }
        
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator to require admin privileges for a route."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if not request.current_user.get('is_admin', False):
            return jsonify({
                'message': 'Admin privileges required',
                'error': 'forbidden'
            }), 403
        return f(*args, **kwargs)
    return decorated

def validate_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength."""
    if len(password) < 8:
        return False, 'Password must be at least 8 characters long'
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain at least one uppercase letter'
    if not re.search(r'[a-z]', password):
        return False, 'Password must contain at least one lowercase letter'
    if not re.search(r'\d', password):
        return False, 'Password must contain at least one number'
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, 'Password must contain at least one special character'
    return True, ''

def hash_password(password):
    """Generate a secure password hash."""
    return generate_password_hash(password, method='pbkdf2:sha256')

def check_password(hashed_password, password):
    """Check if the provided password matches the hashed password."""
    return check_password_hash(hashed_password, password)

def sanitize_input(input_string):
    """Sanitize user input to prevent XSS and injection attacks."""
    if not input_string:
        return ''
    # Remove HTML tags
    clean_string = re.sub(r'<[^>]+>', '', input_string)
    # Escape special characters
    clean_string = clean_string.replace('&', '&amp;')\
        .replace('<', '&lt;')\
        .replace('>', '&gt;')\
        .replace('"', '&quot;')\
        .replace("'", '&#39;')
    return clean_string

# Rate limiting configuration
api_limiter = limiter.shared_limit(
    "100 per minute",
    scope="api",
    error_message={"error": "rate_limit_exceeded", "message": "Too many requests"}
)

auth_limiter = limiter.limit(
    "5 per minute",
    error_message={"error": "too_many_attempts", "message": "Too many login attempts. Please try again later."}
)
