from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config

# Initialize SQLAlchemy
db = SQLAlchemy()

# Association table for many-to-many relationship between Memorial and Memory
memorial_memories = db.Table('memorial_memories',
    db.Column('memorial_id', db.Integer, db.ForeignKey('memorial.id'), primary_key=True),
    db.Column('memory_id', db.Integer, db.ForeignKey('memory.id'), primary_key=True)
)

class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    memorials = db.relationship('Memorial', backref='creator', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Memorial(db.Model):
    """Memorial model to store memorial information"""
    __tablename__ = 'memorial'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    subtitle = db.Column(db.String(200))
    name = db.Column(db.String(200), nullable=False)
    birth_date = db.Column(db.Date)
    death_date = db.Column(db.Date)
    biography = db.Column(db.Text)
    religion = db.Column(db.String(50), default='christian')
    is_public = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    images = db.relationship('Image', backref='memorial', lazy=True, cascade='all, delete-orphan')
    memories = db.relationship('Memory', secondary=memorial_memories, lazy='subquery',
                             backref=db.backref('memorials', lazy=True))
    
    @property
    def profile_image(self):
        """Get the profile image for this memorial"""
        return next((img for img in self.images if img.is_profile), None)
    
    def to_dict(self):
        """Convert memorial to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'title': self.title,
            'subtitle': self.subtitle,
            'name': self.name,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'death_date': self.death_date.isoformat() if self.death_date else None,
            'biography': self.biography,
            'religion': self.religion,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'profile_image': self.profile_image.to_dict() if self.profile_image else None
        }

class Image(db.Model):
    """Image model for memorial images"""
    __tablename__ = 'image'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    caption = db.Column(db.String(255))
    is_profile = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    memorial_id = db.Column(db.Integer, db.ForeignKey('memorial.id'), nullable=False)
    
    @property
    def url(self):
        """Get the full URL for the image"""
        return f"/static/uploads/{self.filename}"
    
    def to_dict(self):
        """Convert image to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'filename': self.filename,
            'url': self.url,
            'caption': self.caption,
            'is_profile': self.is_profile,
            'created_at': self.created_at.isoformat()
        }

class Memory(db.Model):
    """Memory model for memorial memories"""
    __tablename__ = 'memory'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    images = db.relationship('MemoryImage', backref='memory', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert memory to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'images': [img.to_dict() for img in self.images]
        }

class MemoryImage(db.Model):
    """Image model for memory images"""
    __tablename__ = 'memory_image'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    caption = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    memory_id = db.Column(db.Integer, db.ForeignKey('memory.id'), nullable=False)
    
    @property
    def url(self):
        """Get the full URL for the image"""
        return f"/static/uploads/{self.filename}"
    
    def to_dict(self):
        """Convert memory image to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'filename': self.filename,
            'url': self.url,
            'caption': self.caption,
            'created_at': self.created_at.isoformat()
        }
