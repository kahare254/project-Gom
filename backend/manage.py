#!/usr/bin/env python
"""
Command-line utility for administrative tasks.
"""
import os
import sys
import click
from flask_migrate import Migrate, upgrade, migrate as migrate_db, init, stamp
from flask import current_app

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the app after the path is set
from app import create_app, db
from models import User, Memorial, Memory, Image as ImageModel, MemoryImage

# Create the Flask application
app = create_app()
migrate = Migrate(app, db)

# Set up shell context
@app.shell_context_processor
def make_shell_context():
    return dict(
        app=app,
        db=db,
        User=User,
        Memorial=Memorial,
        Memory=Memory,
        Image=ImageModel,
        MemoryImage=MemoryImage
    )

# Custom CLI commands
@app.cli.command("create-db")
def create_database():
    """Create the database and tables."""
    with app.app_context():
        db.create_all()
        click.echo("Database tables created.")

@app.cli.command("drop-db")
@click.option('--yes-i-really-mean-it', is_flag=True, help='Confirm you want to drop the database')
def drop_database(yes_i_really_mean_it):
    """Drop the database tables."""
    if not yes_i_really_mean_it:
        click.confirm('This will drop all database tables. Are you sure?', abort=True)
    with app.app_context():
        db.drop_all()
        click.echo("Database tables dropped.")

@app.cli.command("reset-db")
@click.option('--yes-i-really-mean-it', is_flag=True, help='Confirm you want to reset the database')
def reset_database(yes_i_really_mean_it):
    """Drop and recreate all database tables."""
    if not yes_i_really_mean_it:
        click.confirm('This will drop and recreate all database tables. Are you sure?', abort=True)
    with app.app_context():
        db.drop_all()
        db.create_all()
        click.echo("Database has been reset.")

@app.cli.command("migrate")
def migrate():
    """Run database migrations."""
    with app.app_context():
        migrate_db()
        click.echo("Database migrations completed.")

@app.cli.command("upgrade-db")
def upgrade_database():
    """Upgrade database to latest migration."""
    with app.app_context():
        upgrade()
        click.echo("Database upgraded to latest migration.")

if __name__ == '__main__':
    app.cli()

if __name__ == '__main__':
    app.run(debug=True)
