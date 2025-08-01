# Gate of Memory - Backend

This is the backend service for the Gate of Memory application, built with Flask and PostgreSQL.

## Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd no-ham-site-builder/backend
```

### 2. Create and Activate Virtual Environment

```bash
# On Windows
python -m venv venv
.\venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/gate_of_memory

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600  # 1 hour
JWT_REFRESH_TOKEN_EXPIRES=2592000  # 30 days

# Admin User (will be created on first run)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!

# File Uploads
UPLOAD_FOLDER=./uploads
MAX_CONTENT_LENGTH=16 * 1024 * 1024  # 16MB
ALLOWED_EXTENSIONS={'png', 'jpg', 'jpeg', 'gif'}

# CORS Configuration
CORS_ORIGINS=*
```

### 5. Set Up PostgreSQL Database

#### Option 1: Automated Setup (Recommended)

Run the PostgreSQL setup script:

```bash
python scripts/setup_postgres.py
```

Follow the prompts to create a new database and user.

#### Option 2: Manual Setup

1. Install PostgreSQL if not already installed
2. Create a new database and user:
   ```sql
   CREATE DATABASE gate_of_memory;
   CREATE USER gate_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE gate_of_memory TO gate_user;
   ```

### 6. Run Database Migrations

```bash
# Initialize migrations (first time only)
flask db init

# Create a new migration
flask db migrate -m "Initial migration"

# Apply migrations
flask db upgrade
```

### 7. Initialize the Database

```bash
flask init-db
```

## Running the Application

### Development Mode

```bash
flask run
```

The API will be available at `http://localhost:5000`

### Production Mode

For production, use a WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

## API Documentation

Once the application is running, you can access the interactive API documentation at:

- Swagger UI: `http://localhost:5000/api/docs/`
- ReDoc: `http://localhost:5000/api/redoc/`

## Testing

To run the test suite:

```bash
pytest
```

To generate a coverage report:

```bash
pytest --cov=app --cov-report=term-missing
```

## Database Management

### Backup Database

```bash
pg_dump -U username -d gate_of_memory > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
psql -U username -d gate_of_memory < backup_file.sql
```

## Project Structure

```
backend/
├── app/                    # Application package
│   ├── api/               # API resources and routes
│   ├── models/            # Database models
│   ├── static/            # Static files
│   ├── templates/         # Email templates
│   └── __init__.py        # Application factory
├── migrations/            # Database migrations (auto-generated)
├── tests/                 # Unit and integration tests
├── .env                  # Environment variables
├── .flaskenv             # Flask environment variables
├── config.py             # Configuration settings
├── database.py           # Database utilities
├── manage.py             # Management commands
├── requirements.txt      # Dependencies
└── scripts/              # Utility scripts
    ├── setup_postgres.py # Database setup
    └── verify_db.py      # Database verification
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
