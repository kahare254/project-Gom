import os
import io
import base64
import qrcode
import requests
from datetime import datetime, timedelta
from PIL import Image
from flask import Flask, jsonify, request, send_from_directory, url_for, g
from flask_cors import CORS
from werkzeug.utils import secure_filename
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)

# Import configuration and models
from config import get_config
from models import db, User, Memorial, Memory, Image as ImageModel, MemoryModel
from security import (
    limiter, token_required, admin_required, validate_email,
    validate_password, hash_password, check_password, sanitize_input
)
import logging
from logging.handlers import RotatingFileHandler
from werkzeug.exceptions import HTTPException, InternalServerError

# Template constants
CHRISTIAN_TEMPLATE = {
    'name': 'Christian Memorial',
    'styles': ['classic', 'modern', 'traditional'],
    'colors': ['#ffffff', '#f0f0f0', '#e6f3ff'],
    'fonts': ['Arial', 'Times New Roman', 'Georgia']
}

MUSLIM_TEMPLATE = {
    'name': 'Muslim Memorial',
    'styles': ['islamic', 'minimalist', 'ornate'],
    'colors': ['#f5f5f5', '#fff8e1', '#f0f4f8'],
    'fonts': ['Traditional Arabic', 'Arial', 'Tahoma']
}

def create_app(config_name=None):
    """Application factory function"""
    app = Flask(__name__)
    
    # Load configuration
    config = get_config(config_name)
    app.config.from_object(config)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)  # Enable CORS for all routes
    
    # Initialize JWT
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    jwt = JWTManager(app)
    
    # Initialize rate limiter
    limiter.init_app(app)
    
    # Configure logging
    if not app.debug and not app.testing:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler('logs/memorial_api.log', maxBytes=10240, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Memorial API startup')
    
    # Register blueprints
    from .api import api_bp
    app.register_blueprint(api_bp, url_prefix=config.API_PREFIX)
    
    # Template data
    app.config['CHRISTIAN_TEMPLATE'] = {
        "title": "In Loving Memory",
        "subtitle": "Remembering",
        "name": "John Doe",
        "instruction": "Scan to access memorial",
        "arabic": None,
        "image": "/static/images/christian-memorial.jpg",
        "qr": "/static/qr/christian-qr.png"
    }
    
    app.config['MUSLIM_TEMPLATE'] = {
        "title": "في ذكرى محبة",
        "subtitle": "تذكر",
        "name": "أحمد محمد",
        "instruction": "امسح للوصول للنصب التذاري",
        "arabic": "في ذكرى محبة",
        "image": "/static/images/muslim-memorial.jpg",
        "qr": "/static/qr/muslim-qr.png"
    }
    
    # Shell context
    @app.shell_context_processor
    def make_shell_context():
        return {
            'db': db,
            'User': User,
            'Memorial': Memorial,
            'Memory': Memory,
            'Image': ImageModel,
            'MemoryImage': MemoryImage
        }
    
    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            'status': 'error',
            'message': 'Resource not found',
            'code': 404
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'An internal error occurred',
            'code': 500
        }), 500
    
    @app.errorhandler(400)
    def bad_request_error(error):
        return jsonify({
            'status': 'error',
            'message': error.description if hasattr(error, 'description') else 'Bad request',
            'code': 400
        }), 400
    
    @app.errorhandler(401)
    def unauthorized_error(error):
        return jsonify({
            'status': 'error',
            'message': 'Unauthorized',
            'code': 401
        }), 401
    
    @app.errorhandler(403)
    def forbidden_error(error):
        return jsonify({
            'status': 'error',
            'message': 'Forbidden',
            'code': 403
        }), 403
    
    @app.errorhandler(405)
    def method_not_allowed_error(error):
        return jsonify({
            'status': 'error',
            'message': 'Method not allowed',
            'code': 405
        }), 405
    
    # Handle generic HTTP exceptions
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return jsonify({
            'status': 'error',
            'message': error.description if hasattr(error, 'description') else str(error),
            'code': error.code if hasattr(error, 'code') else 500
        }), error.code if hasattr(error, 'code') else 500
    
    # Handle other uncaught exceptions
    @app.errorhandler(Exception)
    def handle_exception(error):
        app.logger.error(f'Unhandled exception: {str(error)}', exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'code': 500
        }), 500
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'database': 'connected' if db.session.bind is not None else 'disconnected',
            'environment': app.config.get('FLASK_ENV', 'development')
        })
    
    # Initialize database
    @app.before_first_request
    def initialize_database():
        try:
            # Create database tables if they don't exist
            db.create_all()
            app.logger.info('Database initialized')
        except Exception as e:
            app.logger.error(f'Error initializing database: {str(e)}')
            raise
    
    return app

# Create the Flask application
app = create_app()

# Initialize API resources
from .api.resources import init_resources
init_resources()

@app.route('/api/christian-template', methods=['GET'])
def christian_template():
    """Get Christian memorial template"""
    return jsonify(CHRISTIAN_TEMPLATE)

@app.route('/api/muslim-template', methods=['GET'])
def muslim_template():
    """Get Muslim memorial template"""
    return jsonify(MUSLIM_TEMPLATE)

@app.route('/api/generate-qr', methods=['POST'])
def generate_qr():
    """Generate QR code for memorial"""
    data = request.get_json()
    memorial_id = data.get('memorial_id', 'default')
    
    # Create QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(f"https://gateofmemory.com/memorial/{memorial_id}")
    qr.make(fit=True)
    
    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return jsonify({
        "qr_code": f"data:image/png;base64,{img_str}",
        "memorial_id": memorial_id
    })

@app.route('/api/upload-photo', methods=['POST'])
def upload_photo():
    """Upload memorial photo"""
    if 'photo' not in request.files:
        return jsonify({"error": "No photo provided"}), 400
    
    file = request.files['photo']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # Save file (in production, you'd want to use cloud storage)
    filename = f"memorial_photo_{file.filename}"
    file.save(os.path.join('static/uploads', filename))
    
    return jsonify({
        "success": True,
        "filename": filename,
        "url": f"/static/uploads/{filename}"
    })

@app.route('/api/save-memorial', methods=['POST'])
def save_memorial():
    """Save memorial details"""
    data = request.get_json()
    
    # In production, you'd save to a database
    memorial_data = {
        "name": data.get('name'),
        "date": data.get('date'),
        "message": data.get('message'),
        "template_type": data.get('template_type', 'christian'),
        "id": f"memorial_{len(data)}"  # Simple ID generation
    }
    
    return jsonify({
        "success": True,
        "memorial": memorial_data
    })

@app.route('/api/health')
@limiter.limit("10 per minute")
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    """Refresh access token"""
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    return jsonify({
        'access_token': access_token,
        'message': 'Token refreshed successfully'
    }), 200

@app.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit exceeded errors"""
    return jsonify({
        'error': 'rate_limit_exceeded',
        'message': 'Too many requests. Please try again later.'
    }), 429

@app.errorhandler(400)
def bad_request_handler(e):
    """Handle bad request errors"""
    return jsonify({
        'error': 'bad_request',
        'message': str(e) if str(e) else 'Invalid request data'
    }), 400

@app.errorhandler(401)
def unauthorized_handler(e):
    """Handle unauthorized errors"""
    return jsonify({
        'error': 'unauthorized',
        'message': 'Authentication required'
    }), 401

@app.errorhandler(403)
def forbidden_handler(e):
    """Handle forbidden errors"""
    return jsonify({
        'error': 'forbidden',
        'message': 'You do not have permission to access this resource'
    }), 403

@app.errorhandler(404)
def not_found_handler(e):
    """Handle not found errors"""
    return jsonify({
        'error': 'not_found',
        'message': 'The requested resource was not found'
    }), 404

@app.errorhandler(500)
def internal_error_handler(e):
    """Handle internal server errors"""
    app.logger.error(f'Internal Server Error: {str(e)}')
    return jsonify({
        'error': 'internal_server_error',
        'message': 'An unexpected error occurred'
    }), 500

if __name__ == '__main__':
    # Create static directories if they don't exist
    os.makedirs('static/images', exist_ok=True)
    os.makedirs('static/qr', exist_ok=True)
    os.makedirs('static/uploads', exist_ok=True)
    
    # Add default placeholder images if they don't exist
    default_images = {
        'static/images/christian-memorial.jpg': 'https://source.unsplash.com/random/800x600/?memorial,christian',
        'static/images/muslim-memorial.jpg': 'https://source.unsplash.com/random/800x600/?memorial,islamic'
    }
    
    for img_path, img_url in default_images.items():
        if not os.path.exists(img_path):
            try:
                response = requests.get(img_url, stream=True)
                response.raise_for_status()
                with open(img_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                print(f"Downloaded placeholder image: {img_path}")
            except Exception as e:
                print(f"Error downloading {img_path}: {e}")
    
    print("\n🚀 Starting Flask server...")
    print("🌐 Server URL: http://localhost:5000")
    print("📋 Available endpoints:")
    print("   - GET  /api/christian-template - Get Christian memorial template")
    print("   - GET  /api/muslim-template    - Get Muslim memorial template")
    print("   - POST /api/generate-qr       - Generate QR code")
    print("   - POST /api/upload-photo      - Upload memorial photo")
    print("   - POST /api/save-memorial     - Save memorial details")
    print("\nPress Ctrl+C to stop the server\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)