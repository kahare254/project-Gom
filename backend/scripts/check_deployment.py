#!/usr/bin/env python3
"""
Deployment Readiness Check

This script verifies that the backend is properly configured and ready for deployment.
"""
import os
import sys
import subprocess
import platform
from pathlib import Path
from dotenv import load_dotenv

# Configure logging
print("=== Gate of Memory - Deployment Readiness Check ===\n")

def check_python_version():
    """Check if Python version is compatible."""
    required = (3, 8)
    current = sys.version_info
    
    print(f"Python Version: {platform.python_version()}")
    if current >= required:
        print("✓ Python version is compatible")
        return True
    else:
        print(f"✗ Python {required[0]}.{required[1]}+ is required")
        return False

def check_dependencies():
    """Check if all required dependencies are installed."""
    required = {
        'flask', 'flask-sqlalchemy', 'flask-migrate', 'flask-cors',
        'psycopg2-binary', 'python-dotenv', 'flask-jwt-extended',
        'flask-restx', 'pytest', 'pytest-cov', 'gunicorn'
    }
    
    try:
        result = subprocess.run(
            [sys.executable, '-m', 'pip', 'freeze'],
            capture_output=True, text=True, check=True
        )
        installed = {line.split('==')[0].lower() for line in result.stdout.splitlines()}
        
        missing = required - installed
        
        print("\nChecking dependencies:")
        for dep in required:
            status = "✓" if dep in installed else "✗"
            print(f"{status} {dep}")
        
        if missing:
            print(f"\nMissing dependencies: {', '.join(missing)}")
            return False
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error checking dependencies: {e}")
        return False

def check_environment():
    """Check if required environment variables are set."""
    required = [
        'FLASK_APP', 'SECRET_KEY', 'DATABASE_URL',
        'JWT_SECRET_KEY', 'UPLOAD_FOLDER'
    ]
    
    # Load .env file if it exists
    load_dotenv()
    
    print("\nChecking environment variables:")
    all_set = True
    
    for var in required:
        value = os.getenv(var)
        status = "✓" if value else "✗"
        print(f"{status} {var}" + ("" if value else " (not set)"))
        
        if not value:
            all_set = False
    
    return all_set

def check_database_connection():
    """Check if the database connection is working."""
    try:
        # Import app after environment is loaded
        from app import create_app
        from database import check_database_connection as db_check
        
        app = create_app()
        with app.app_context():
            success, message = db_check()
            print(f"\nDatabase Connection: {message}")
            return success
    except Exception as e:
        print(f"\nError checking database connection: {str(e)}")
        return False

def check_migrations():
    """Check if database migrations are up to date."""
    try:
        from app import create_app
        from flask_migrate import current
        
        app = create_app()
        with app.app_context():
            current_rev = current()
            if current_rev is None:
                print("\nNo migrations have been applied")
                return False
            
            print(f"\nCurrent database revision: {current_rev}")
            return True
    except Exception as e:
        print(f"\nError checking migrations: {str(e)}")
        return False

def check_storage():
    """Check if storage directories exist and are writable."""
    required_dirs = [
        'uploads',
        'static/images',
        'static/qr',
        'logs'
    ]
    
    print("\nChecking storage directories:")
    all_ok = True
    
    for dir_path in required_dirs:
        path = Path(dir_path)
        exists = path.exists() and path.is_dir()
        writable = os.access(str(path), os.W_OK) if exists else False
        
        status = "✓" if exists and writable else "✗"
        print(f"{status} {dir_path}" + 
              (" (not writable)" if exists and not writable else ""))
        
        if not exists or not writable:
            all_ok = False
    
    return all_ok

def main():
    """Run all deployment checks."""
    checks = {
        'Python Version': check_python_version(),
        'Dependencies': check_dependencies(),
        'Environment': check_environment(),
        'Database Connection': check_database_connection(),
        'Migrations': check_migrations(),
        'Storage': check_storage()
    }
    
    # Print summary
    print("\n=== Deployment Readiness Summary ===")
    all_passed = True
    
    for check, passed in checks.items():
        status = "PASSED" if passed else "FAILED"
        print(f"{check}: {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\n✓ All checks passed! The backend is ready for deployment.")
        return 0
    else:
        print("\n✗ Some checks failed. Please address the issues above before deploying.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
