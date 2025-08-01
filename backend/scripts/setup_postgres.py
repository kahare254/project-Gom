#!/usr/bin/env python3
"""
PostgreSQL Database Setup Script

This script helps set up and configure a PostgreSQL database for the Gate of Memory application.
It provides options to create a database, run migrations, and initialize with test data.
"""
import os
import sys
import subprocess
import logging
from pathlib import Path
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('setup_postgres.log')
    ]
)
logger = logging.getLogger(__name__)

def check_postgres_installed():
    """Check if PostgreSQL is installed and running."""
    try:
        result = subprocess.run(
            ['psql', '--version'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        if result.returncode == 0:
            logger.info(f"PostgreSQL version: {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        logger.warning("PostgreSQL is not installed or not in PATH")
        return False

def install_postgres_windows():
    """Provide instructions to install PostgreSQL on Windows."""
    logger.info("""
    To install PostgreSQL on Windows:
    1. Download the installer from: https://www.postgresql.org/download/windows/
    2. Run the installer and follow the wizard
    3. Make sure to remember the password you set for the 'postgres' user
    4. Add PostgreSQL to your system PATH during installation
    5. Restart your terminal after installation
    """)
    return False

def create_postgres_user_and_db():
    """Create a new PostgreSQL user and database."""
    try:
        # Get database connection details
        host = input("Enter PostgreSQL host [localhost]: ") or "localhost"
        port = input("Enter PostgreSQL port [5432]: ") or "5432"
        admin_user = input("Enter PostgreSQL admin username [postgres]: ") or "postgres"
        admin_password = input("Enter PostgreSQL admin password: ", stream=None) or ""
        
        # Connect to PostgreSQL
        import psycopg2
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=admin_user,
            password=admin_password
        )
        conn.autocommit = True
        
        # Get database details
        db_name = input("Enter database name [gate_of_memory]: ") or "gate_of_memory"
        db_user = input("Enter database user [gate_user]: ") or "gate_user"
        db_password = input(f"Enter password for user '{db_user}': ") or ""
        
        # Create user and database
        with conn.cursor() as cur:
            # Create user if not exists
            cur.execute(f"SELECT 1 FROM pg_roles WHERE rolname = '{db_user}'")
            if not cur.fetchone():
                cur.execute(f"CREATE USER {db_user} WITH PASSWORD '{db_password}'")
                logger.info(f"Created user: {db_user}")
            
            # Create database if not exists
            cur.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
            if not cur.fetchone():
                cur.execute(f"CREATE DATABASE {db_name} OWNER {db_user}")
                logger.info(f"Created database: {db_name}")
            
            # Grant privileges
            cur.execute(f"GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user}")
            logger.info(f"Granted all privileges on {db_name} to {db_user}")
        
        # Update .env file
        env_path = Path('.env')
        if not env_path.exists():
            env_path.touch()
        
        with open(env_path, 'a') as f:
            f.write(f"\n# Database configuration\n")
            f.write(f"DATABASE_URL=postgresql://{db_user}:{db_password}@{host}:{port}/{db_name}\n")
        
        logger.info("Database configuration saved to .env file")
        return True
        
    except Exception as e:
        logger.error(f"Error setting up PostgreSQL: {str(e)}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def main():
    """Main function to run the setup script."""
    logger.info("=== Gate of Memory - PostgreSQL Setup ===")
    
    # Check if PostgreSQL is installed
    if not check_postgres_installed():
        logger.warning("PostgreSQL is not installed or not in PATH")
        if sys.platform == 'win32':
            install_postgres_windows()
        else:
            logger.info("Please install PostgreSQL and ensure it's running before continuing.")
            logger.info("Visit https://www.postgresql.org/download/ for installation instructions.")
        return
    
    # Check if .env exists
    if not Path('.env').exists():
        logger.warning(".env file not found. Creating a new one with default values.")
        Path('.env').touch()
    
    # Load environment variables
    load_dotenv()
    
    # Check if database is already configured
    if os.getenv('DATABASE_URL'):
        logger.info("Database is already configured in .env")
        choice = input("Do you want to reconfigure the database? (y/N): ").lower()
        if choice != 'y':
            logger.info("Using existing database configuration.")
            return
    
    # Create database and user
    logger.info("Setting up PostgreSQL database...")
    if create_postgres_user_and_db():
        logger.info("\n=== Database setup completed successfully! ===\n")
        logger.info("Next steps:")
        logger.info("1. Run 'flask db upgrade' to apply database migrations")
        logger.info("2. Run 'flask init-db' to initialize the database with default data")
        logger.info("3. Start the application with 'flask run'")
    else:
        logger.error("Failed to set up the database. Please check the logs for details.")

if __name__ == "__main__":
    main()
