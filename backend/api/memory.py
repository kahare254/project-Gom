"""
Memory API resources.
"""
from flask_restful import reqparse
from flask import current_app, request
from datetime import datetime
from ..models import Memory, db, MemoryImage, Memorial
from .base import BaseResource

class MemoryResource(BaseResource):
    """API Resource for single memory operations."""
    
    def get(self, memory_id):
        """Get a single memory by ID with its relationships."""
        memory = Memory.query.get_or_404(memory_id)
        return self.success_response(memory.to_dict())
    
    def put(self, memory_id):
        """Update a memory."""
        memory = Memory.query.get_or_404(memory_id)
        
        # Parse and validate request data
        parser = reqparse.RequestParser()
        parser.add_argument('title', type=str, required=False)
        parser.add_argument('content', type=str, required=False)
        
        args = parser.parse_args()
        
        # Update memory fields if provided
        if args['title'] is not None:
            memory.title = args['title']
        if args['content'] is not None:
            memory.content = args['content']
        
        db.session.commit()
        return self.success_response(memory.to_dict(), 'Memory updated successfully')
    
    def delete(self, memory_id):
        """Delete a memory and its related data."""
        memory = Memory.query.get_or_404(memory_id)
        
        # Delete related data (cascade should handle most of this)
        db.session.delete(memory)
        db.session.commit()
        
        return self.success_response(None, 'Memory deleted successfully', 204)

class MemoryListResource(BaseResource):
    """API Resource for memory collection operations."""
    
    def get(self):
        """Get all memories with optional filtering and pagination."""
        parser = reqparse.RequestParser()
        parser.add_argument('memorial_id', type=int, required=False)
        
        args = parser.parse_args()
        
        # Build query with filters
        query = Memory.query
        
        if args['memorial_id'] is not None:
            # Only return memories associated with the specified memorial
            memorial = Memorial.query.get_or_404(args['memorial_id'])
            query = query.filter(Memory.memorials.any(id=memorial.id))
        
        return self.success_response(self.paginate_query(query))
    
    def post(self):
        """Create a new memory and optionally associate it with memorials."""
        # Parse and validate request data
        parser = reqparse.RequestParser()
        parser.add_argument('title', type=str, required=True, help='Title is required')
        parser.add_argument('content', type=str, required=True, help='Content is required')
        parser.add_argument('memorial_ids', type=int, action='append', required=True, 
                          help='At least one memorial ID is required')
        
        args = parser.parse_args()
        
        # Create new memory
        memory = Memory(
            title=args['title'],
            content=args['content']
        )
        
        # Associate with memorials
        for memorial_id in args['memorial_ids']:
            memorial = Memorial.query.get_or_404(memorial_id)
            memory.memorials.append(memorial)
        
        db.session.add(memory)
        db.session.commit()
        
        return self.success_response(memory.to_dict(), 'Memory created successfully', 201)
