Fitflix Backend API Reference: Authentication
This document outlines the API endpoints for user authentication within the Fitflix backend. These endpoints allow users to register, log in, and log out, managing their session via HTTP-only cookies.

Base URL: /api/auth

1. Register User
Registers a new user account.

Endpoint: /register

Method: POST

Description: Creates a new user entry in the database. Upon successful registration, a JWT is issued and set as an HTTP-only cookie.

Access: Public

Request
Headers:

Content-Type: application/json

Body (JSON):

{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "first_name": "John",
  "last_name": "Doe",
}

Body Fields:

email (string, required): Unique email address for the user.

password (string, required): User's chosen password. Will be hashed before storage.

first_name (string, required): User's first name.

last_name (string, required): User's last name.


Response
Status: 201 Created

Body (JSON):

{
  "message": "User registered successfully.",
  "user": {
    "user_id": "uuid-of-new-user",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user" // Default role assigned
  }
}

Status: 400 Bad Request

Body (JSON):

{
  "message": "Required fields are missing."
}

Status: 409 Conflict

Body (JSON):

{
  "message": "User with this email already exists."
}

Status: 500 Internal Server Error

Body (JSON):

{
  "message": "Internal server error."
}

2. Login User
Authenticates an existing user.

Endpoint: /login

Method: POST

Description: Verifies user credentials. On successful authentication, a JWT is issued and set as an HTTP-only cookie.

Access: Public

Request
Headers:

Content-Type: application/json

Body (JSON):

{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}

Body Fields:

email (string, required): User's email address.

password (string, required): User's password.

Response
Status: 200 OK

Body (JSON):

{
  "message": "Login successful.",
  "user": {
    "user_id": "uuid-of-logged-in-user",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "user_profiles": { /* profile data */ } // Includes associated user profile data
  }
}

Status: 400 Bad Request

Body (JSON):

{
  "message": "Email and password are required."
}

Status: 401 Unauthorized

Body (JSON):

{
  "message": "Invalid credentials."
}

Status: 500 Internal Server Error

Body (JSON):

{
  "message": "Internal server error."
}

3. Logout User
Logs out the current user.

Endpoint: /logout

Method: POST

Description: Clears the HTTP-only authentication cookie from the client's browser, effectively ending the session.

Access: Public (no token needed to initiate logout, but it acts on the client's cookie)

Request
Headers: None required (cookie is sent automatically by browser).

Body: None.

Response
Status: 200 OK

Body (JSON):

{
  "message": "Logout successful."
}

Status: 500 Internal Server Error

Body (JSON):

{
  "message": "Internal server error."
}
