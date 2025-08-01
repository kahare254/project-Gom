"""
Monitoring and logging configuration for the Gate of Memory backend.
"""
import os
import logging
import logging.handlers
from logging.config import dictConfig
from datetime import datetime

def setup_logging(app):
    """Configure logging for the application."""
    # Create logs directory if it doesn't exist
    logs_dir = os.path.join(app.root_path, 'logs')
    os.makedirs(logs_dir, exist_ok=True)
    
    # Configure logging
    log_config = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'standard': {
                'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s',
                'datefmt': '%Y-%m-%d %H:%M:%S'
            },
            'json': {
                'class': 'pythonjsonlogger.jsonlogger.JsonFormatter',
                'format': '%(asctime)s %(levelname)s %(name)s %(message)s',
                'datefmt': '%Y-%m-%d %H:%M:%S'
            }
        },
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                'formatter': 'standard',
                'level': 'INFO',
                'stream': 'ext://sys.stdout'
            },
            'file': {
                'class': 'logging.handlers.RotatingFileHandler',
                'formatter': 'standard',
                'filename': os.path.join(logs_dir, 'app.log'),
                'maxBytes': 10 * 1024 * 1024,  # 10MB
                'backupCount': 5,
                'encoding': 'utf8'
            },
            'error_file': {
                'class': 'logging.handlers.RotatingFileHandler',
                'formatter': 'standard',
                'filename': os.path.join(logs_dir, 'error.log'),
                'level': 'ERROR',
                'maxBytes': 10 * 1024 * 1024,  # 10MB
                'backupCount': 5,
                'encoding': 'utf8'
            },
            'json_file': {
                'class': 'logging.handlers.RotatingFileHandler',
                'formatter': 'json',
                'filename': os.path.join(logs_dir, 'app.json'),
                'maxBytes': 10 * 1024 * 1024,  # 10MB
                'backupCount': 5,
                'encoding': 'utf8'
            }
        },
        'loggers': {
            '': {  # root logger
                'handlers': ['console', 'file', 'error_file', 'json_file'],
                'level': 'DEBUG' if app.debug else 'INFO',
                'propagate': True
            },
            'app': {
                'handlers': ['console', 'file', 'error_file', 'json_file'],
                'level': 'DEBUG' if app.debug else 'INFO',
                'propagate': False
            },
            'sqlalchemy': {
                'handlers': ['file'],
                'level': 'WARNING',
                'propagate': False
            },
            'werkzeug': {
                'handlers': ['file'],
                'level': 'INFO',
                'propagate': False
            }
        }
    }
    
    # Apply the logging configuration
    dictConfig(log_config)
    
    # Log application startup
    logger = logging.getLogger(__name__)
    logger.info("""
    ===================================================
      Gate of Memory Backend - Application Starting
      Environment: %s
      Debug: %s
      Time: %s
    ===================================================
    """, app.env, app.debug, datetime.utcnow().isoformat())
    
    return logger

class RequestIdFilter(logging.Filter):
    """Add request ID to log records."""
    def filter(self, record):
        from flask import request
        record.request_id = request.headers.get('X-Request-ID', 'no-request-id')
        return True

class HealthCheckFilter(logging.Filter):
    """Filter out health check requests from access logs."""
    def filter(self, record):
        return not (hasattr(record, 'path') and '/health' in record.path)
