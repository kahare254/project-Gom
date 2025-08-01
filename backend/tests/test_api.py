"""
Tests for API endpoints.
"""
import json
import pytest
from datetime import datetime
from flask import url_for
from models import db, User, Memorial, Memory, Image

# Test data
TEST_USER = {
    'username': 'testuser',
    'email': 'test@example.com',
    'password': 'testpass123'
}

TEST_MEMORIAL = {
    'title': 'In Memory of John Doe',
    'name': 'John Doe',
    'birth_date': '1950-01-01',
    'death_date': '2022-12-31',
    'biography': 'A life well lived',
    'religion': 'christian',
    'is_public': True
}

def test_register_user(client, db):
    """Test user registration."""
    # Send POST request to register a new user
    response = client.post(
        '/api/v1/users/register',
        data=json.dumps(TEST_USER),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'id' in data
    assert data['username'] == TEST_USER['username']
    assert data['email'] == TEST_USER['email']
    assert 'password' not in data  # Password should not be in response

def test_login_user(client, db):
    """Test user login and JWT token generation."""
    # First, register a user
    user = User(
        username=TEST_USER['username'],
        email=TEST_USER['email']
    )
    user.set_password(TEST_USER['password'])
    db.session.add(user)
    db.session.commit()
    
    # Test login with correct credentials
    response = client.post(
        '/api/v1/users/login',
        data=json.dumps({
            'username': TEST_USER['username'],
            'password': TEST_USER['password']
        }),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data
    assert 'refresh_token' in data

def test_create_memorial(client, db):
    """Test creating a new memorial."""
    # Create a test user
    user = User(
        username=TEST_USER['username'],
        email=TEST_USER['email']
    )
    user.set_password(TEST_USER['password'])
    db.session.add(user)
    db.session.commit()
    
    # Login to get token
    login_response = client.post(
        '/api/v1/users/login',
        data=json.dumps({
            'username': TEST_USER['username'],
            'password': TEST_USER['password']
        }),
        content_type='application/json'
    )
    token = json.loads(login_response.data)['access_token']
    
    # Create a memorial
    response = client.post(
        '/api/v1/memorials',
        data=json.dumps(TEST_MEMORIAL),
        content_type='application/json',
        headers={'Authorization': f'Bearer {token}'}
    )
    
    # Check response
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'id' in data
    assert data['title'] == TEST_MEMORIAL['title']
    assert data['name'] == TEST_MEMORIAL['name']
    assert data['creator_id'] == user.id

def test_get_memorials(client, db):
    """Test retrieving memorials."""
    # Create a test user and memorial
    user = User(
        username=TEST_USER['username'],
        email=TEST_USER['email']
    )
    memorial = Memorial(
        title=TEST_MEMORIAL['title'],
        name=TEST_MEMORIAL['name'],
        creator=user
    )
    db.session.add_all([user, memorial])
    db.session.commit()
    
    # Test getting all memorials
    response = client.get('/api/v1/memorials')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]['title'] == TEST_MEMORIAL['title']

def test_add_memory_to_memorial(client, db):
    """Test adding a memory to a memorial."""
    # Create test data
    user = User(
        username=TEST_USER['username'],
        email=TEST_USER['email']
    )
    user.set_password(TEST_USER['password'])
    memorial = Memorial(
        title=TEST_MEMORIAL['title'],
        name=TEST_MEMORIAL['name'],
        creator=user
    )
    db.session.add_all([user, memorial])
    db.session.commit()
    
    # Login to get token
    login_response = client.post(
        '/api/v1/users/login',
        data=json.dumps({
            'username': TEST_USER['username'],
            'password': TEST_USER['password']
        }),
        content_type='application/json'
    )
    token = json.loads(login_response.data)['access_token']
    
    # Add a memory
    memory_data = {
        'title': 'My Favorite Memory',
        'content': 'This is a test memory',
        'memorial_id': memorial.id
    }
    
    response = client.post(
        '/api/v1/memories',
        data=json.dumps(memory_data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {token}'}
    )
    
    # Check response
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'id' in data
    assert data['title'] == memory_data['title']
    assert data['content'] == memory_data['content']
    assert data['memorial_id'] == memorial.id
    assert data['user_id'] == user.id
