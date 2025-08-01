"""
Memorial API resources.
"""
from flask_restful import reqparse
from flask import current_app
from datetime import datetime
from ..models import Memorial, db, Image as ImageModel
from .base import BaseResource

class MemorialResource(BaseResource):
    """API Resource for single memorial operations."""
    
    def get(self, memorial_id):
        """Get a single memorial by ID with its relationships."""
        memorial = Memorial.query.get_or_404(memorial_id)
        return self.success_response(memorial.to_dict())
    
    def put(self, memorial_id):
        """Update a memorial."""
        memorial = Memorial.query.get_or_404(memorial_id)
        
        # Parse and validate request data
        parser = reqparse.RequestParser()
        parser.add_argument('title', type=str, required=False)
        parser.add_argument('subtitle', type=str, required=False)
        parser.add_argument('name', type=str, required=False)
        parser.add_argument('birth_date', type=str, required=False)
        parser.add_argument('death_date', type=str, required=False)
        parser.add_argument('biography', type=str, required=False)
        parser.add_argument('religion', type=str, required=False)
        parser.add_argument('is_public', type=bool, required=False)
        
        args = parser.parse_args()
        
        # Update memorial fields if provided
        if args['title'] is not None:
            memorial.title = args['title']
        if args['subtitle'] is not None:
            memorial.subtitle = args['subtitle']
        if args['name'] is not None:
            memorial.name = args['name']
        if args['birth_date'] is not None:
            memorial.birth_date = datetime.fromisoformat(args['birth_date'])
        if args['death_date'] is not None:
            memorial.death_date = datetime.fromisoformat(args['death_date'])
        if args['biography'] is not None:
            memorial.biography = args['biography']
        if args['religion'] is not None:
            memorial.religion = args['religion']
        if args['is_public'] is not None:
            memorial.is_public = args['is_public']
        
        db.session.commit()
        return self.success_response(memorial.to_dict(), 'Memorial updated successfully')
    
    def delete(self, memorial_id):
        """Delete a memorial and its related data."""
        memorial = Memorial.query.get_or_404(memorial_id)
        
        # Delete related data (cascade should handle most of this)
        db.session.delete(memorial)
        db.session.commit()
        
        return self.success_response(None, 'Memorial deleted successfully', 204)

class MemorialListResource(BaseResource):
    """API Resource for memorial collection operations."""
    
    def get(self):
        """Get all memorials with optional filtering and pagination."""
        parser = reqparse.RequestParser()
        parser.add_argument('user_id', type=int, required=False)
        parser.add_argument('is_public', type=bool, required=False)
        parser.add_argument('religion', type=str, required=False)
        
        args = parser.parse_args()
        
        # Build query with filters
        query = Memorial.query
        
        if args['user_id'] is not None:
            query = query.filter_by(user_id=args['user_id'])
        if args['is_public'] is not None:
            query = query.filter_by(is_public=args['is_public'])
        if args['religion'] is not None:
            query = query.filter_by(religion=args['religion'])
        
        return self.success_response(self.paginate_query(query))
    
    def post(self):
        """Create a new memorial."""
        # Parse and validate request data
        parser = reqparse.RequestParser()
        parser.add_argument('title', type=str, required=True, help='Title is required')
        parser.add_argument('subtitle', type=str, required=False)
        parser.add_argument('name', type=str, required=True, help='Name is required')
        parser.add_argument('birth_date', type=str, required=False)
        parser.add_argument('death_date', type=str, required=False)
        parser.add_argument('biography', type=str, required=False)
        parser.add_argument('religion', type=str, default='christian', required=False)
        parser.add_argument('is_public', type=bool, default=True, required=False)
        parser.add_argument('user_id', type=int, required=True, help='User ID is required')
        
        args = parser.parse_args()
        
        # Create new memorial
        memorial = Memorial(
            title=args['title'],
            subtitle=args.get('subtitle'),
            name=args['name'],
            birth_date=datetime.fromisoformat(args['birth_date']) if args['birth_date'] else None,
            death_date=datetime.fromisoformat(args['death_date']) if args['death_date'] else None,
            biography=args.get('biography'),
            religion=args['religion'],
            is_public=args['is_public'],
            user_id=args['user_id']
        )
        
        db.session.add(memorial)
        db.session.commit()
        
        return self.success_response(memorial.to_dict(), 'Memorial created successfully', 201)
