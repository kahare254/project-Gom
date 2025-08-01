import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent

class Config:
    # Flask configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-production')
    DEBUG = os.getenv('FLASK_ENV', 'development') == 'development'
    
    # Database configuration
    # For PostgreSQL, we'll construct the URL from individual components if DATABASE_URL is not set
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', '')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'memorials')
    
    # Use DATABASE_URL if set, otherwise construct it from components
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 
        f'postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_size': 5,
        'max_overflow': 10
    }
    
    # File upload configuration
    UPLOAD_FOLDER = os.path.join(BASE_DIR, os.getenv('UPLOAD_FOLDER', 'static/uploads'))
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB default
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
    # API configuration
    API_PREFIX = os.getenv('API_PREFIX', '/api')
    
    # Ensure upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True

class ProductionConfig(Config):
    DEBUG = False
    
    @property
    def SQLALCHEMY_DATABASE_URI(self):
        # In production, require DATABASE_URL to be set
        db_url = os.getenv('DATABASE_URL')
        if not db_url:
            raise ValueError("DATABASE_URL environment variable must be set in production")
        return db_url

# Select configuration based on environment
config = {
    'development': DevelopmentConfig(),
    'production': ProductionConfig(),
    'default': DevelopmentConfig()
}

def get_config(env=None):
    """Get configuration for the specified environment"""
    if env is None:
        env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
