# PostgreSQL Database Setup

This guide will help you set up the PostgreSQL database for the Gate of Memory backend.

## Prerequisites

1. Install [PostgreSQL](https://www.postgresql.org/download/) on your system
2. Ensure PostgreSQL service is running

## Setup Instructions

### 1. Create a new PostgreSQL user (if needed)

```bash
# Connect to PostgreSQL as the default postgres user
psql -U postgres

# Create a new user (replace 'your_password' with a secure password)
CREATE USER your_username WITH PASSWORD 'your_password';

# Create the database
CREATE DATABASE memorials;

# Grant privileges to the new user
GRANT ALL PRIVILEGES ON DATABASE memorials TO your_username;

# Connect to the new database
\c memorials

# Grant schema privileges
GRANT ALL ON SCHEMA public TO your_username;

# Exit psql
\q
```

### 2. Update Environment Variables

Edit the `.env` file in the project root with your PostgreSQL credentials:

```ini
# PostgreSQL Database configuration
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=memorials
```

### 3. Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install psycopg2 (PostgreSQL adapter for Python)
pip install psycopg2-binary
```

### 4. Run Database Migrations

```bash
# Initialize the migrations folder (only needed once)
flask db init

# Create a migration
flask db migrate -m "Initial migration"

# Apply the migrations
flask db upgrade
```

## Common Issues

### Connection Issues
- Ensure PostgreSQL is running
- Verify the username, password, and database name in `.env`
- Check if PostgreSQL is configured to accept connections (check `pg_hba.conf`)

### Permission Issues
- Make sure the database user has the correct permissions
- Try granting all privileges to the user:
  ```sql
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;
  ```

## Backup and Restore

### Create a Backup
```bash
pg_dump -U your_username -d memorials > memorials_backup.sql
```

### Restore from Backup
```bash
psql -U your_username -d memorials < memorials_backup.sql
```

## Resetting the Database

To completely reset the database:

```bash
# Drop and recreate the database
psql -U postgres -c "DROP DATABASE IF EXISTS memorials;"
psql -U postgres -c "CREATE DATABASE memorials;"
psql -U postgres -d memorials -c "GRANT ALL PRIVILEGES ON DATABASE memorials TO your_username;"

# Re-run migrations
flask db upgrade
```
