#!/usr/bin/env python3
"""
Maintenance Script for Gate of Memory Backend

This script handles routine maintenance tasks such as:
- Database backups
- Log rotation
- Orphaned file cleanup
- Data integrity checks
"""
import os
import sys
import time
import shutil
import logging
import argparse
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('maintenance.log')
    ]
)
logger = logging.getLogger(__name__)

class MaintenanceManager:
    """Handles maintenance tasks for the Gate of Memory backend."""
    
    def __init__(self, config=None):
        """Initialize with optional configuration."""
        self.config = config or {}
        self.backup_dir = Path(self.config.get('backup_dir', 'backups'))
        self.logs_dir = Path(self.config.get('logs_dir', 'logs'))
        self.uploads_dir = Path(self.config.get('uploads_dir', 'uploads'))
        
        # Ensure directories exist
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.logs_dir.mkdir(parents=True, exist_ok=True)
    
    def backup_database(self, backup_name=None):
        """Create a database backup."""
        try:
            from app import create_app
            from database import db
            
            app = create_app()
            db_url = app.config.get('SQLALCHEMY_DATABASE_URI')
            
            if not db_url or not db_url.startswith('postgresql'):
                logger.warning("Database backup is only supported for PostgreSQL")
                return False
            
            # Parse database URL
            from urllib.parse import urlparse
            result = urlparse(db_url)
            db_name = result.path.lstrip('/')
            
            # Generate backup filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_name = backup_name or f"{db_name}_backup_{timestamp}.sql"
            backup_path = self.backup_dir / backup_name
            
            # Build pg_dump command
            cmd = [
                'pg_dump',
                '-h', result.hostname or 'localhost',
                '-U', result.username or 'postgres',
                '-d', db_name,
                '-f', str(backup_path)
            ]
            
            # Set PGPASSWORD if password is provided
            env = os.environ.copy()
            if result.password:
                env['PGPASSWORD'] = result.password
            
            # Run pg_dump
            logger.info(f"Creating database backup: {backup_path}")
            result = subprocess.run(
                cmd,
                env=env,
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                logger.error(f"Backup failed: {result.stderr}")
                return False
            
            logger.info(f"Backup created successfully: {backup_path}")
            return str(backup_path)
            
        except Exception as e:
            logger.error(f"Error creating database backup: {str(e)}")
            return False
    
    def rotate_logs(self, days_to_keep=30):
        """Rotate and compress old log files."""
        try:
            cutoff_date = datetime.now() - timedelta(days=days_to_keep)
            rotated_count = 0
            
            for log_file in self.logs_dir.glob('*.log'):
                # Skip already rotated files
                if log_file.name.endswith('.gz'):
                    continue
                
                # Check file modification time
                mtime = datetime.fromtimestamp(log_file.stat().st_mtime)
                if mtime < cutoff_date:
                    # Compress the log file
                    compressed_file = log_file.with_suffix('.log.gz')
                    logger.info(f"Compressing log file: {log_file}")
                    
                    # Use gzip to compress the file
                    subprocess.run(
                        ['gzip', '-c', str(log_file)],
                        stdout=open(compressed_file, 'wb')
                    )
                    
                    # Remove the original log file
                    log_file.unlink()
                    rotated_count += 1
            
            logger.info(f"Rotated {rotated_count} log files")
            return rotated_count
            
        except Exception as e:
            logger.error(f"Error rotating logs: {str(e)}")
            return 0
    
    def cleanup_orphaned_files(self):
        """Clean up orphaned files in the uploads directory."""
        try:
            from app import create_app
            from models import Image, db
            
            app = create_app()
            orphaned_count = 0
            
            with app.app_context():
                # Get all referenced image filenames from the database
                referenced_files = {img.filename for img in Image.query.all()}
                
                # Check all files in uploads directory
                for file_path in self.uploads_dir.rglob('*'):
                    if file_path.is_file() and file_path.name not in referenced_files:
                        # Check if file is old enough to be considered orphaned (older than 1 day)
                        file_mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                        if datetime.now() - file_mtime > timedelta(days=1):
                            logger.info(f"Removing orphaned file: {file_path}")
                            file_path.unlink()
                            orphaned_count += 1
            
            logger.info(f"Cleaned up {orphaned_count} orphaned files")
            return orphaned_count
            
        except Exception as e:
            logger.error(f"Error cleaning up orphaned files: {str(e)}")
            return 0
    
    def check_database_integrity(self):
        """Check database integrity and fix common issues."""
        try:
            from app import create_app
            from models import db, User, Memorial, Memory, Image
            
            app = create_app()
            issues_found = 0
            
            with app.app_context():
                # Check for users without memorials
                users_without_memorials = User.query.filter(
                    ~User.memorials.any()
                ).count()
                
                if users_without_memorials > 0:
                    logger.warning(f"Found {users_without_memorials} users without memorials")
                    issues_found += users_without_memorials
                
                # Check for memorials without images
                memorials_without_images = Memorial.query.filter(
                    ~Memorial.images.any()
                ).count()
                
                if memorials_without_images > 0:
                    logger.warning(f"Found {memorials_without_images} memorials without images")
                    issues_found += memorials_without_images
                
                # Check for memories without content
                empty_memories = Memory.query.filter(
                    (Memory.content == '') | (Memory.content.is_(None))
                ).count()
                
                if empty_memories > 0:
                    logger.warning(f"Found {empty_memories} empty memories")
                    issues_found += empty_memories
                
                # Check for orphaned images in the database
                image_files = {str(p) for p in self.uploads_dir.rglob('*') if p.is_file()}
                db_images = {img.filename for img in Image.query.all()}
                
                orphaned_db_entries = db_images - image_files
                if orphaned_db_entries:
                    logger.warning(f"Found {len(orphaned_db_entries)} image entries in database without corresponding files")
                    issues_found += len(orphaned_db_entries)
                    
                    # Optionally clean up orphaned database entries
                    if self.config.get('fix_issues', False):
                        logger.info("Cleaning up orphaned database entries...")
                        Image.query.filter(Image.filename.in_(orphaned_db_entries)).delete(
                            synchronize_session=False
                        )
                        db.session.commit()
                        logger.info("Cleaned up orphaned database entries")
            
            if issues_found == 0:
                logger.info("No database integrity issues found")
            else:
                logger.warning(f"Found {issues_found} potential issues")
            
            return issues_found
            
        except Exception as e:
            logger.error(f"Error checking database integrity: {str(e)}")
            return -1
    
    def run_all_tasks(self):
        """Run all maintenance tasks."""
        logger.info("=== Starting Maintenance Tasks ===")
        
        # Run each task and collect results
        results = {
            'backup': self.backup_database(),
            'log_rotation': self.rotate_logs(),
            'cleanup': self.cleanup_orphaned_files(),
            'integrity_check': self.check_database_integrity()
        }
        
        logger.info("=== Maintenance Tasks Completed ===")
        return results

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Gate of Memory Maintenance Script')
    
    # Task selection
    parser.add_argument('--backup', action='store_true', help='Create a database backup')
    parser.add_argument('--rotate-logs', action='store_true', help='Rotate log files')
    parser.add_argument('--cleanup', action='store_true', help='Clean up orphaned files')
    parser.add_argument('--check-db', action='store_true', help='Check database integrity')
    parser.add_argument('--all', action='store_true', help='Run all maintenance tasks')
    
    # Options
    parser.add_argument('--fix-issues', action='store_true', help='Fix found issues')
    parser.add_argument('--backup-dir', default='backups', help='Backup directory')
    parser.add_argument('--logs-dir', default='logs', help='Logs directory')
    parser.add_argument('--uploads-dir', default='uploads', help='Uploads directory')
    parser.add_argument('--days', type=int, default=30, help='Days of logs to keep')
    
    return parser.parse_args()

def main():
    """Main entry point for the maintenance script."""
    args = parse_arguments()
    
    # Set up configuration
    config = {
        'backup_dir': args.backup_dir,
        'logs_dir': args.logs_dir,
        'uploads_dir': args.uploads_dir,
        'fix_issues': args.fix_issues
    }
    
    manager = MaintenanceManager(config)
    
    # Run selected tasks
    if args.all or not any([args.backup, args.rotate_logs, args.cleanup, args.check_db]):
        # Run all tasks if no specific task is selected
        manager.run_all_tasks()
    else:
        if args.backup:
            manager.backup_database()
        if args.rotate_logs:
            manager.rotate_logs(days_to_keep=args.days)
        if args.cleanup:
            manager.cleanup_orphaned_files()
        if args.check_db:
            manager.check_database_integrity()
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
