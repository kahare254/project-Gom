#!/usr/bin/env python3
"""
Database Verification Script

This script verifies the PostgreSQL database connection and runs migrations.
"""
import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('verify_db.log')
    ]
)
logger = logging.getLogger(__name__)

def check_database_connection(app):
    """Check if the database connection is working."""
    from app import db
    
    try:
        with app.app_context():
            # Check if we can connect to the database
            db.session.execute('SELECT 1')
            logger.info("✓ Successfully connected to the database")
            return True
    except Exception as e:
        logger.error(f"✗ Failed to connect to the database: {str(e)}")
        return False

def run_migrations(app):
    """Run database migrations."""
    from flask_migrate import upgrade, migrate, init, stamp
    
    try:
        with app.app_context():
            # Initialize migrations if needed
            migrations_dir = Path('migrations')
            if not migrations_dir.exists():
                logger.info("Initializing database migrations...")
                init()
                logger.info("✓ Database migrations initialized")
            
            # Run migrations
            logger.info("Running database migrations...")
            migrate(message='Database migration')
            upgrade()
            logger.info("✓ Database migrations completed successfully")
            return True
    except Exception as e:
        logger.error(f"✗ Error running migrations: {str(e)}")
        return False

def initialize_database(app):
    """Initialize the database with required data."""
    from database import init_db
    
    try:
        logger.info("Initializing database with required data...")
        if init_db(app):
            logger.info("✓ Database initialized successfully")
            return True
        else:
            logger.error("✗ Failed to initialize database")
            return False
    except Exception as e:
        logger.error(f"✗ Error initializing database: {str(e)}")
        return False

def main():
    """Main function to verify database and run migrations."""
    # Load environment variables
    if not load_dotenv():
        logger.warning(".env file not found or couldn't be loaded")
    
    # Create the Flask application
    from app import create_app
    
    # Create app with test config if DATABASE_URL is not set
    if not os.getenv('DATABASE_URL'):
        logger.warning("DATABASE_URL not set in environment variables")
        logger.info("Using SQLite for testing (not recommended for production)")
        os.environ['DATABASE_URL'] = 'sqlite:///test.db'
    
    app = create_app()
    
    # Check database connection
    logger.info("=== Verifying Database Connection ===")
    if not check_database_connection(app):
        logger.error("Failed to connect to the database. Please check your configuration.")
        sys.exit(1)
    
    # Run migrations
    logger.info("\n=== Running Database Migrations ===")
    if not run_migrations(app):
        logger.error("Failed to run database migrations.")
        sys.exit(1)
    
    # Initialize database
    logger.info("\n=== Initializing Database ===")
    if not initialize_database(app):
        logger.warning("Failed to initialize database. Some functionality may not work correctly.")
    
    logger.info("\n✓ Database setup completed successfully!")

if __name__ == "__main__":
    main()
