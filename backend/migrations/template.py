"""
Template for database migrations.

This file serves as a template for creating new database migrations.
Copy this file to a new file with a descriptive name and implement the required changes.
"""

# Import the migration manager
from flask_migrate import Migrate
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# Revision identifiers, used by Alembic.
revision = 'revision_id_here'  # Replace with a unique identifier
# down_revision = 'previous_revision_id'  # The revision this migration depends on
# branch_labels = None
# depends_on = None

def upgrade():
    """Run the upgrade migration.
    
    This function is called when upgrading the database schema.
    Add your schema changes here.
    """
    # Example operations:
    
    # Create a new table
    # op.create_table(
    #     'new_table',
    #     sa.Column('id', sa.Integer(), nullable=False),
    #     sa.Column('name', sa.String(length=255), nullable=False),
    #     sa.Column('created_at', sa.DateTime(), nullable=True),
    #     sa.PrimaryKeyConstraint('id')
    # )
    
    # Add a new column
    # op.add_column('existing_table', sa.Column('new_column', sa.String(length=50), nullable=True))
    
    # Rename a column
    # op.alter_column('table_name', 'old_name', new_column_name='new_name')
    
    # Create an index
    # op.create_index('idx_table_column', 'table_name', ['column_name'])
    
    # Execute raw SQL
    # op.execute('UPDATE table_name SET column_name = value WHERE condition')
    
    pass

def downgrade():
    """Run the downgrade migration.
    
    This function should reverse the changes made in the upgrade function.
    It's used to rollback the migration if needed.
    """
    # Example operations (reverse of the upgrade operations):
    
    # Drop the table created in upgrade
    # op.drop_table('new_table')
    
    # Drop the column added in upgrade
    # op.drop_column('existing_table', 'new_column')
    
    # Rename the column back to its original name
    # op.alter_column('table_name', 'new_name', new_column_name='old_name')
    
    # Drop the index created in upgrade
    # op.drop_index('idx_table_column', table_name='table_name')
    
    pass

# Example migration for reference
#
# Example migration that adds a 'status' column to the 'memorials' table:
#
# def upgrade():
#     op.add_column('memorials', sa.Column('status', sa.String(length=20), 
#                  nullable=True, server_default='active'))
#     op.create_index('idx_memorials_status', 'memorials', ['status'])
#     
#     # Set default status for existing records
#     op.execute("UPDATE memorials SET status = 'active' WHERE status IS NULL")
#     
#     # Make the column not nullable after setting defaults
#     op.alter_column('memorials', 'status', nullable=False)
#
# def downgrade():
#     op.drop_index('idx_memorials_status', table_name='memorials')
#     op.drop_column('memorials', 'status')

# Best practices for writing migrations:
# 1. Always provide both upgrade() and downgrade() functions
# 2. Make migrations idempotent (safe to run multiple times)
# 3. Test migrations in a development environment before applying to production
# 4. Include comments explaining the purpose of the migration
# 5. Keep migrations small and focused on a single change
# 6. Never modify a migration after it has been committed to version control
# 7. Use batch operations for large data migrations to avoid timeouts
# 8. Consider performance implications of adding indexes to large tables
# 9. Be careful with NOT NULL constraints on existing tables
# 10. Always test the downgrade path
