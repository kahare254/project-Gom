"""
API resources module.
"""
from .base import BaseResource
from . import api

# Import all resource classes here
from .user import UserResource, UserListResource
from .memorial import MemorialResource, MemorialListResource
from .memory import MemoryResource, MemoryListResource
from .image import ImageResource, ImageListResource

# Register all resources
def init_resources():
    """Initialize and register all API resources."""
    # User resources
    UserListResource.register(api, '/users')
    UserResource.register(api, '/users/<int:user_id>')
    
    # Memorial resources
    MemorialListResource.register(api, '/memorials')
    MemorialResource.register(api, '/memorials/<int:memorial_id>')
    
    # Memory resources
    MemoryListResource.register(api, '/memories')
    MemoryResource.register(api, '/memories/<int:memory_id>')
    
    # Image resources
    ImageListResource.register(api, '/images')
    ImageResource.register(api, '/images/<int:image_id>')
