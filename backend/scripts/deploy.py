#!/usr/bin/env python3
"""
Deployment Script for Gate of Memory Backend

This script automates the deployment of the backend to a production environment.
"""
import os
import sys
import subprocess
import argparse
from pathlib import Path
from datetime import datetime

# Configure logging
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(message):
    print(f"\n{Colors.HEADER}{Colors.BOLD}=== {message} ==={Colors.ENDC}")

def print_success(message):
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.WARNING}⚠ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")

def run_command(command, cwd=None, shell=False):
    """Run a shell command and return the output."""
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            shell=shell,
            check=True,
            text=True,
            capture_output=True
        )
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def check_environment():
    """Check if we're in a virtual environment."""
    return hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)

def install_dependencies():
    """Install or update Python dependencies."""
    print_header("Installing Dependencies")
    
    # Upgrade pip
    success, output = run_command([sys.executable, '-m', 'pip', 'install', '--upgrade', 'pip'])
    if not success:
        print_error("Failed to upgrade pip")
        return False
    print_success("Upgraded pip")
    
    # Install requirements
    success, output = run_command([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
    if not success:
        print_error("Failed to install requirements")
        return False
    print_success("Installed Python dependencies")
    return True

def run_migrations():
    """Run database migrations."""
    print_header("Running Database Migrations")
    
    # Initialize migrations if needed
    if not Path('migrations').exists():
        success, output = run_command(['flask', 'db', 'init'])
        if not success:
            print_error("Failed to initialize migrations")
            return False
        print_success("Initialized database migrations")
    
    # Create and apply migrations
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    success, output = run_command(['flask', 'db', 'migrate', '-m', f'auto_{timestamp}'])
    if not success:
        print_error("Failed to create migration")
        return False
    print_success("Created migration")
    
    success, output = run_command(['flask', 'db', 'upgrade'])
    if not success:
        print_error("Failed to apply migrations")
        return False
    print_success("Applied database migrations")
    return True

def initialize_database():
    """Initialize the database with required data."""
    print_header("Initializing Database")
    
    success, output = run_command(['flask', 'init-db'])
    if not success:
        print_error("Failed to initialize database")
        return False
    print_success("Initialized database")
    return True

def create_upload_directories():
    """Create required upload directories."""
    print_header("Creating Upload Directories")
    
    directories = [
        'uploads',
        'static/images',
        'static/qr',
        'logs'
    ]
    
    for directory in directories:
        try:
            Path(directory).mkdir(parents=True, exist_ok=True)
            print_success(f"Created directory: {directory}")
        except Exception as e:
            print_error(f"Failed to create directory {directory}: {str(e)}")
            return False
    
    return True

def start_application(host='0.0.0.0', port=5000, workers=4):
    """Start the application using Gunicorn."""
    print_header("Starting Application")
    
    # Check if Gunicorn is installed
    success, _ = run_command(['gunicorn', '--version'])
    if not success:
        print_warning("Gunicorn not found, installing...")
        success, _ = run_command([sys.executable, '-m', 'pip', 'install', 'gunicorn'])
        if not success:
            print_error("Failed to install Gunicorn")
            return False
    
    # Start Gunicorn
    command = [
        'gunicorn',
        '--bind', f'{host}:{port}',
        '--workers', str(workers),
        '--timeout', '120',
        '--access-logfile', 'logs/access.log',
        '--error-logfile', 'logs/error.log',
        '--log-level', 'info',
        'app:create_app()'
    ]
    
    print(f"Starting Gunicorn on {host}:{port} with {workers} workers...")
    print(f"Logs will be written to logs/access.log and logs/error.log")
    print("Press Ctrl+C to stop the server\n")
    
    try:
        # Run Gunicorn in the foreground
        subprocess.run(command, check=True)
    except KeyboardInterrupt:
        print("\nShutting down server...")
    except Exception as e:
        print_error(f"Error starting server: {str(e)}")
        return False
    
    return True

def main():
    """Main deployment function."""
    parser = argparse.ArgumentParser(description='Deploy Gate of Memory Backend')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to (default: 0.0.0.0)')
    parser.add_argument('--port', type=int, default=5000, help='Port to listen on (default: 5000)')
    parser.add_argument('--workers', type=int, default=4, help='Number of Gunicorn workers (default: 4)')
    parser.add_argument('--skip-deps', action='store_true', help='Skip dependency installation')
    parser.add_argument('--skip-migrations', action='store_true', help='Skip database migrations')
    parser.add_argument('--skip-init', action='store_true', help='Skip database initialization')
    args = parser.parse_args()
    
    print_header(f"Gate of Memory - Deployment")
    print(f"Python: {sys.version.split()[0]}")
    print(f"Working directory: {os.getcwd()}")
    
    # Check if we're in a virtual environment
    if not check_environment():
        print_warning("Not running in a virtual environment. It's recommended to use one.")
        if input("Continue anyway? (y/N): ").lower() != 'y':
            return 1
    
    # Install dependencies
    if not args.skip_deps and not install_dependencies():
        return 1
    
    # Create upload directories
    if not create_upload_directories():
        return 1
    
    # Run migrations
    if not args.skip_migrations and not run_migrations():
        return 1
    
    # Initialize database
    if not args.skip_init and not initialize_database():
        return 1
    
    # Start the application
    if not start_application(host=args.host, port=args.port, workers=args.workers):
        return 1
    
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nDeployment cancelled by user")
        sys.exit(1)
