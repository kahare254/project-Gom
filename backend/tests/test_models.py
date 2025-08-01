"""
Tests for database models.
"""
import pytest
from datetime import datetime, timedelta
from models import db, User, Memorial, Memory, Image, MemoryImage

def test_user_model(db):
    """Test the User model."""
    # Create a test user
    user = User(
        username='testuser',
        email='test@example.com',
        is_admin=False
    )
    user.set_password('testpass123')
    
    # Add to database
    db.session.add(user)
    db.session.commit()
    
    # Test user creation
    assert user.id is not None
    assert user.username == 'testuser'
    assert user.email == 'test@example.com'
    assert user.check_password('testpass123')
    assert not user.check_password('wrongpass')
    assert not user.is_admin
    assert user.created_at is not None

def test_memorial_model(db):
    """Test the Memorial model."""
    # Create a test user
    user = User(username='testuser', email='test@example.com')
    user.set_password('testpass123')
    
    # Create a memorial
    memorial = Memorial(
        title='In Memory of John Doe',
        name='John Doe',
        birth_date=datetime(1950, 1, 1),
        death_date=datetime(2022, 12, 31),
        biography='A life well lived',
        religion='christian',
        is_public=True,
        creator=user
    )
    
    # Add to database
    db.session.add(user)
    db.session.add(memorial)
    db.session.commit()
    
    # Test memorial creation
    assert memorial.id is not None
    assert memorial.title == 'In Memory of John Doe'
    assert memorial.creator_id == user.id
    assert memorial.memories == []
    assert memorial.images == []
    assert memorial.is_public is True
    assert memorial.religion == 'christian'

def test_memory_model(db):
    """Test the Memory model."""
    # Create test data
    user = User(username='testuser', email='test@example.com')
    user.set_password('testpass123')
    
    memorial = Memorial(
        title='In Memory of John Doe',
        name='John Doe',
        creator=user
    )
    
    memory = Memory(
        title='My Favorite Memory',
        content='This is a test memory',
        memorial=memorial,
        user=user
    )
    
    # Add to database
    db.session.add_all([user, memorial, memory])
    db.session.commit()
    
    # Test memory creation
    assert memory.id is not None
    assert memory.title == 'My Favorite Memory'
    assert memory.content == 'This is a test memory'
    assert memory.memorial_id == memorial.id
    assert memory.user_id == user.id
    assert memory.images == []
    assert memory.created_at is not None
    assert memory.updated_at is not None

def test_image_models(db):
    """Test the Image and MemoryImage models."""
    # Create test data
    user = User(username='testuser', email='test@example.com')
    memorial = Memorial(title='Test Memorial', name='Test', creator=user)
    memory = Memory(title='Test Memory', content='Test', memorial=memorial, user=user)
    
    # Create images
    memorial_image = Image(
        filename='memorial.jpg',
        caption='Memorial Image',
        is_profile=True,
        memorial=memorial
    )
    
    memory_image = MemoryImage(
        filename='memory.jpg',
        caption='Memory Image',
        memory=memory
    )
    
    # Add to database
    db.session.add_all([user, memorial, memory, memorial_image, memory_image])
    db.session.commit()
    
    # Test image creation
    assert memorial_image.id is not None
    assert memorial_image.filename == 'memorial.jpg'
    assert memorial_image.is_profile is True
    assert memorial_image.memorial_id == memorial.id
    
    assert memory_image.id is not None
    assert memory_image.filename == 'memory.jpg'
    assert memory_image.memory_id == memory.id
