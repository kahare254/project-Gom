"""
WSGI config for the Gate of Memory application.

It exposes the WSGI callable as a module-level variable named ``application``.
"""
import os
from app import create_app

# Create the Flask application
application = create_app('production')

if __name__ == "__main__":
    application.run()
