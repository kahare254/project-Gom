"""
Test package for the Gate of Memory backend.
"""
import os
import tempfile
import pytest
from flask import Flask
from app import create_app, db as _db
from config import get_config

# Test configuration
TEST_CONFIG = {
    'TESTING': True,
    'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
    'SQLALCHEMY_TRACK_MODIFICATIONS': False,
    'WTF_CSRF_ENABLED': False,
}

@pytest.fixture(scope='session')
def app():
    """Create and configure a new app instance for each test."""
    # Create a temporary file to isolate the database for each test
    db_fd, db_path = tempfile.mkstemp()
    
    # Create the app with test config
    app = create_app(TEST_CONFIG)
    
    # Create the database and load test data
    with app.app_context():
        _db.create_all()
        
    yield app
    
    # Clean up the database after tests
    with app.app_context():
        _db.session.remove()
        _db.drop_all()
    
    # Clean up the temporary database file
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture(scope='function')
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture(scope='function')
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()

@pytest.fixture(scope='function')
def db(app):
    """A database session for testing."""
    with app.app_context():
        _db.create_all()
        yield _db
        _db.session.remove()
        _db.drop_all()

# Import test modules to ensure they're registered with pytest
from . import test_models, test_api  # noqa
