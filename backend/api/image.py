"""
Image API resources.
"""
import os
import uuid
from flask_restful import reqparse
from flask import current_app, request, send_from_directory, url_for
from werkzeug.utils import secure_filename
from PIL import Image as PILImage
from datetime import datetime
from ..models import Image as ImageModel, MemoryImage, db, Memorial, Memory
from .base import BaseResource

class ImageResource(BaseResource):
    """API Resource for single image operations."""
    
    def get(self, image_id):
        """Get image metadata by ID."""
        image = ImageModel.query.get_or_404(image_id)
        return self.success_response(image.to_dict())
    
    def delete(self, image_id):
        """Delete an image and its file."""
        image = ImageModel.query.get_or_404(image_id)
        
        # Delete the file from the filesystem
        try:
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image.filename)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            current_app.logger.error(f"Error deleting image file: {e}")
        
        # Delete the database record
        db.session.delete(image)
        db.session.commit()
        
        return self.success_response(None, 'Image deleted successfully', 204)

class ImageListResource(BaseResource):
    """API Resource for image upload and listing."""
    
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
    def allowed_file(self, filename):
        """Check if the file has an allowed extension."""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.ALLOWED_EXTENSIONS
    
    def get(self):
        """Get all images with optional filtering."""
        parser = reqparse.RequestParser()
        parser.add_argument('memorial_id', type=int, required=False)
        parser.add_argument('memory_id', type=int, required=False)
        
        args = parser.parse_args()
        
        # Build query with filters
        query = ImageModel.query
        
        if args['memorial_id'] is not None:
            query = query.filter_by(memorial_id=args['memorial_id'])
        if args['memory_id'] is not None:
            memory = Memory.query.get_or_404(args['memory_id'])
            image_ids = [img.id for img in memory.images]
            query = query.filter(ImageModel.id.in_(image_ids))
        
        return self.success_response(self.paginate_query(query))
    
    def post(self):
        """Upload a new image."""
        # Check if the post request has the file part
        if 'file' not in request.files:
            return self.error_response('No file part in the request', 400)
        
        file = request.files['file']
        
        # If user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            return self.error_response('No selected file', 400)
        
        if file and self.allowed_file(file.filename):
            # Generate a unique filename
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}_{filename}"
            
            # Ensure upload directory exists
            os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
            
            try:
                # Save the file
                file.save(filepath)
                
                # Create image thumbnail if needed
                self._create_thumbnail(filepath)
                
                # Parse additional form data
                parser = reqparse.RequestParser()
                parser.add_argument('caption', type=str, required=False)
                parser.add_argument('is_profile', type=bool, default=False, required=False)
                parser.add_argument('memorial_id', type=int, required=False)
                parser.add_argument('memory_id', type=int, required=False)
                
                args = parser.parse_args()
                
                # Create image record in database
                if args['memorial_id'] is not None:
                    # This is a memorial image
                    image = ImageModel(
                        filename=unique_filename,
                        caption=args.get('caption', ''),
                        is_profile=args['is_profile'],
                        memorial_id=args['memorial_id']
                    )
                    db.session.add(image)
                    db.session.commit()
                    
                    # If this is a profile image, unset any existing profile image for this memorial
                    if args['is_profile'] and args['memorial_id']:
                        ImageModel.query.filter(
                            ImageModel.memorial_id == args['memorial_id'],
                            ImageModel.id != image.id,
                            ImageModel.is_profile == True
                        ).update({ImageModel.is_profile: False})
                        db.session.commit()
                    
                    return self.success_response(image.to_dict(), 'Image uploaded successfully', 201)
                
                elif args['memory_id'] is not None:
                    # This is a memory image
                    memory = Memory.query.get_or_404(args['memory_id'])
                    
                    memory_image = MemoryImage(
                        filename=unique_filename,
                        caption=args.get('caption', '')
                    )
                    memory.images.append(memory_image)
                    db.session.commit()
                    
                    return self.success_response(memory_image.to_dict(), 'Image uploaded successfully', 201)
                
                else:
                    # No association specified
                    os.remove(filepath)  # Clean up the file
                    return self.error_response('Either memorial_id or memory_id must be provided', 400)
                
            except Exception as e:
                # Clean up the file if there was an error
                if os.path.exists(filepath):
                    os.remove(filepath)
                current_app.logger.error(f"Error processing image upload: {e}")
                return self.error_response('Error processing image', 500)
        
        return self.error_response('File type not allowed', 400)
    
    def _create_thumbnail(self, filepath, size=(300, 300)):
        """Create a thumbnail version of the image."""
        try:
            with PILImage.open(filepath) as img:
                img.thumbnail(size)
                # Save thumbnail with _thumb suffix
                base, ext = os.path.splitext(filepath)
                thumb_path = f"{base}_thumb{ext}"
                img.save(thumb_path)
        except Exception as e:
            current_app.logger.error(f"Error creating thumbnail: {e}")
            # Don't fail the request if thumbnail creation fails
            pass
