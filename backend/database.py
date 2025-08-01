"""
Database initialization and management utilities.
"""
import os
import sys
import logging
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from flask import current_app
from flask_migrate import Migrate, upgrade, migrate as db_migrate, init, stamp

def init_db(app):
    """Initialize the database with required tables and initial data."""
    from models import db, User
    
    with app.app_context():
        try:
            # Create all database tables
            db.create_all()
            
            # Create default admin user if it doesn't exist
            admin_email = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
            admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
            
            if not User.query.filter_by(email=admin_email).first():
                admin = User(
                    username='admin',
                    email=admin_email,
                    is_admin=True
                )
                admin.set_password(admin_password)
                db.session.add(admin)
                db.session.commit()
                current_app.logger.info('Created default admin user')
            
            current_app.logger.info('Database initialized successfully')
            return True
            
        except SQLAlchemyError as e:
            current_app.logger.error(f'Error initializing database: {str(e)}')
            db.session.rollback()
            return False

def run_migrations(app):
    """Run database migrations."""
    with app.app_context():
        try:
            # Initialize migrations if needed
            migrations_dir = os.path.join(os.path.dirname(__file__), 'migrations')
            if not os.path.exists(migrations_dir):
                init()
                current_app.logger.info('Initialized migrations directory')
            
            # Create or update the database schema
            db_migrate(message='Database migration')
            upgrade()
            
            current_app.logger.info('Database migrations completed successfully')
            return True
            
        except Exception as e:
            current_app.logger.error(f'Error running migrations: {str(e)}')
            return False

def check_database_connection():
    """Check if the database connection is working."""
    from app import db
    
    try:
        db.session.execute(text('SELECT 1'))
        return True, 'Database connection successful'
    except Exception as e:
        return False, f'Database connection failed: {str(e)}'

def create_database():
    """Create the database if it doesn't exist (PostgreSQL only)."""
    import psycopg2
    from urllib.parse import urlparse
    
    # Get database URL from environment
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return False, 'DATABASE_URL not set in environment variables'
    
    # Parse the database URL
    result = urlparse(db_url)
    db_name = result.path.lstrip('/')
    
    # Connect to the default 'postgres' database to create our target database
    conn = psycopg2.connect(
        host=result.hostname,
        user=result.username or os.environ.get('DB_USER', 'postgres'),
        password=result.password or os.environ.get('DB_PASSWORD', ''),
        port=result.port or 5432
    )
    conn.autocommit = True
    
    try:
        with conn.cursor() as cursor:
            # Check if database exists
            cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
            exists = cursor.fetchone()
            
            if not exists:
                # Create the database
                cursor.execute(f'CREATE DATABASE "{db_name}"')
                return True, f'Created database: {db_name}'
            else:
                return True, f'Database {db_name} already exists'
                
    except Exception as e:
        return False, f'Error creating database: {str(e)}'
    finally:
        conn.close()

def reset_database(app):
    """Reset the database (drop all tables and reinitialize)."""
    from models import db
    
    with app.app_context():
        try:
            # Drop all tables
            db.drop_all()
            
            # Recreate all tables
            db.create_all()
            
            # Reinitialize with default data
            init_db(app)
            
            current_app.logger.info('Database reset completed successfully')
            return True, 'Database reset successful'
            
        except Exception as e:
            current_app.logger.error(f'Error resetting database: {str(e)}')
            return False, f'Error resetting database: {str(e)}'
