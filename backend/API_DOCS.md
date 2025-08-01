# Gate of Memory API Documentation

This document provides an overview of the API endpoints available in the Gate of Memory backend.

## Base URL
All API endpoints are prefixed with `/api/v1`.

## Authentication
Most endpoints require authentication. Include a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Error message",
  "code": 400,
  "errors": {
    "field1": ["Error message 1", "Error message 2"],
    "field2": ["Error message 3"]
  }
}
```

## API Endpoints

### Authentication

#### POST /api/v1/auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "securepassword",
  "is_admin": false
}
```

**Response:**
- 201 Created: User registered successfully
- 400 Bad Request: Invalid input data
- 409 Conflict: Username or email already exists

#### POST /api/v1/auth/login
Authenticate a user and get a JWT token.

**Request Body:**
```json
{
  "username": "user123",
  "password": "securepassword"
}
```

**Response:**
- 200 OK: Authentication successful
  ```json
  {
    "access_token": "jwt.token.here",
    "user": {
      "id": 1,
      "username": "user123",
      "email": "user@example.com",
      "is_admin": false
    }
  }
  ```
- 401 Unauthorized: Invalid credentials

### Memorials

#### GET /api/v1/memorials
Get a list of memorials with pagination.

**Query Parameters:**
- `page` (int, optional): Page number (default: 1)
- `per_page` (int, optional): Items per page (default: 10)
- `user_id` (int, optional): Filter by user ID
- `is_public` (bool, optional): Filter by public/private status
- `religion` (str, optional): Filter by religion

**Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "In Loving Memory",
        "name": "John Doe",
        "birth_date": "1950-01-01",
        "death_date": "2020-01-01",
        "religion": "christian",
        "is_public": true,
        "created_at": "2023-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "pages": 1,
    "current_page": 1,
    "per_page": 10
  }
}
```

#### POST /api/v1/memorials
Create a new memorial.

**Request Body:**
```json
{
  "title": "In Loving Memory",
  "subtitle": "Remembering",
  "name": "John Doe",
  "birth_date": "1950-01-01",
  "death_date": "2020-01-01",
  "biography": "A loving father and husband...",
  "religion": "christian",
  "is_public": true,
  "user_id": 1
}
```

**Response:**
- 201 Created: Memorial created successfully
- 400 Bad Request: Invalid input data
- 401 Unauthorized: Authentication required
- 403 Forbidden: Insufficient permissions

#### GET /api/v1/memorials/{id}
Get a single memorial by ID.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "In Loving Memory",
    "subtitle": "Remembering",
    "name": "John Doe",
    "birth_date": "1950-01-01",
    "death_date": "2020-01-01",
    "biography": "A loving father and husband...",
    "religion": "christian",
    "is_public": true,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z",
    "memories": [
      {
        "id": 1,
        "title": "Childhood Memories",
        "content": "I remember when...",
        "created_at": "2023-01-01T00:00:00Z"
      }
    ],
    "images": [
      {
        "id": 1,
        "filename": "abc123.jpg",
        "url": "/static/uploads/abc123.jpg",
        "caption": "Family photo",
        "is_profile": true,
        "created_at": "2023-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Images

#### POST /api/v1/images
Upload an image.

**Form Data:**
- `file`: The image file to upload
- `caption` (optional): Image caption
- `is_profile` (boolean, optional): Whether this is a profile image
- `memorial_id` (int, required if memory_id not provided): ID of the memorial this image belongs to
- `memory_id` (int, required if memorial_id not provided): ID of the memory this image belongs to

**Response:**
- 201 Created: Image uploaded successfully
- 400 Bad Request: Invalid file or missing required fields
- 401 Unauthorized: Authentication required
- 403 Forbidden: Insufficient permissions

## Running the Application

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables in `.env` file.

3. Run the development server:
   ```bash
   python -m flask run
   ```

4. The API will be available at `http://localhost:5000/api/v1`

## Testing

Run the test suite with:

```bash
pytest
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
