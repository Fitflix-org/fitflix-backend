# Fitflix Backend API Documentation

## 🚀 Base URL
```
Development: http://localhost:3000/api
Production: https://api.fitflix.app/api
```

## 🔐 Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📊 Response Format
All API responses follow this standard format:
```json
{
  "success": true|false,
  "message": "Description of the operation",
  "data": {}, // Response data (when applicable)
  "error": "Error message" // Only present on errors
}
```

---

## 🏥 Health Check

### GET /health
Check API health status.

**Authentication**: None required

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2025-07-30T06:47:21.273Z",
  "environment": "development"
}
```

---

## 🔐 Authentication Endpoints

### POST /auth/login
Authenticate user and receive JWT token.

**Authentication**: None required  
**Rate Limit**: 5 requests per 15 minutes

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "message": "Login successful.",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "user",
    "created_at": "2025-07-30T06:11:36.304Z"
  }
}
```

### POST /auth/register
Register a new user account.

**Authentication**: None required  
**Rate Limit**: 5 requests per 15 minutes

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe"
}
```

**Response** (201):
```json
{
  "message": "User registered successfully.",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "user"
  }
}
```

### POST /auth/logout
Logout user and clear authentication cookie.

**Authentication**: Required

**Response** (200):
```json
{
  "message": "Logout successful."
}
```

### POST /auth/change-password
Change user's password.

**Authentication**: Required

**Request Body**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response** (200):
```json
{
  "message": "Password changed successfully."
}
```

### POST /auth/forgot-password
Initiate password reset process.

**Authentication**: None required  
**Rate Limit**: 3 requests per hour

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200):
```json
{
  "message": "Password reset instructions sent to your email."
}
```

### POST /auth/reset-password
Reset password using reset token.

**Authentication**: None required  
**Rate Limit**: 3 requests per hour

**Request Body**:
```json
{
  "token": "reset-token-string",
  "newPassword": "newpassword123"
}
```

**Response** (200):
```json
{
  "message": "Password reset successfully."
}
```

### POST /auth/refresh-token
Refresh JWT access token.

**Authentication**: None required

**Request Body**:
```json
{
  "refreshToken": "refresh-token-string"
}
```

**Response** (200):
```json
{
  "message": "Token refreshed successfully.",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

### GET /auth/me
Get current user information.

**Authentication**: Required

**Response** (200):
```json
{
  "message": "User data retrieved successfully.",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "user",
    "created_at": "2025-07-30T06:11:36.304Z"
  }
}
```

---

## 🏋️ Gym Discovery

### GET /gyms
Get list of all gyms with optional filtering.

**Authentication**: None required

**Query Parameters**:
- `latitude` (float): Latitude for location-based filtering
- `longitude` (float): Longitude for location-based filtering  
- `radius` (int): Search radius in kilometers (default: 10)
- `amenities` (array): Filter by amenities
- `page` (int): Page number (default: 1)
- `limit` (int): Results per page (default: 10, max: 100)

**Example Request**:
```
GET /gyms?latitude=12.9728&longitude=77.7499&radius=50&page=1&limit=10
```

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "gym_id": "uuid",
      "name": "Fitflix Gym - Whitefield, Bengaluru",
      "address": "2nd FLOOR, THULIP SPA, FITFLIX GYMS, ITPL Main Rd...",
      "latitude": "12.9728",
      "longitude": "77.7499",
      "phone_number": "+91 75103 82782",
      "email": "info@fitflix.in",
      "opening_time": "1970-01-01T05:00:00.000Z",
      "closing_time": "1970-01-01T22:30:00.000Z",
      "description": "Fitflix Gym Whitefield offers various fitness options...",
      "distance": 0, // Only included when location filtering is used
      "gym_amenities": [],
      "gym_classes_services": [],
      "gym_media": [],
      "membership_plans": []
    }
  ]
}
```

### GET /gyms/:id
Get detailed information about a specific gym.

**Authentication**: None required

**Response** (200):
```json
{
  "success": true,
  "data": {
    "gym_id": "uuid",
    "name": "Fitflix Gym - Whitefield, Bengaluru",
    "address": "2nd FLOOR, THULIP SPA, FITFLIX GYMS, ITPL Main Rd...",
    "latitude": "12.9728",
    "longitude": "77.7499",
    "phone_number": "+91 75103 82782",
    "email": "info@fitflix.in",
    "opening_time": "1970-01-01T05:00:00.000Z",
    "closing_time": "1970-01-01T22:30:00.000Z",
    "description": "Fitflix Gym Whitefield offers various fitness options...",
    "gym_amenities": [],
    "gym_classes_services": [],
    "gym_media": [],
    "membership_plans": []
  }
}
```

---

## 📋 Membership Management

### GET /memberships
Get available membership plans.

**Authentication**: None required

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "plan_id": "uuid",
      "gym_id": "uuid",
      "plan_name": "Monthly Premium",
      "plan_type": "monthly",
      "price": 2999.00,
      "duration_days": 30,
      "description": "Full access to gym facilities",
      "features": ["Gym Access", "Personal Training", "Locker"],
      "is_active": true
    }
  ]
}
```

### POST /users/me/memberships
Subscribe to a membership plan.

**Authentication**: Required

**Request Body**:
```json
{
  "gym_id": "uuid",
  "plan_id": "uuid",
  "plan_type": "monthly"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Membership subscription successful.",
  "data": {
    "membership_id": "uuid",
    "user_id": "uuid",
    "gym_id": "uuid",
    "plan_id": "uuid",
    "start_date": "2025-07-30",
    "end_date": "2025-08-30",
    "status": "active",
    "digital_pass_code": "FIT123456",
    "auto_renew": true
  }
}
```

### GET /users/me/memberships
Get user's active memberships.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "membership_id": "uuid",
      "gym": {
        "gym_id": "uuid",
        "name": "Fitflix Gym - Whitefield",
        "address": "2nd FLOOR, THULIP SPA..."
      },
      "plan": {
        "plan_id": "uuid",
        "plan_name": "Monthly Premium",
        "plan_type": "monthly"
      },
      "start_date": "2025-07-30",
      "end_date": "2025-08-30",
      "status": "active",
      "digital_pass_code": "FIT123456",
      "auto_renew": true
    }
  ]
}
```

### DELETE /users/me/memberships/:id
Cancel a membership.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "message": "Membership cancelled successfully.",
  "data": {
    "membership_id": "uuid",
    "status": "cancelled",
    "cancelled_at": "2025-07-30T12:00:00.000Z"
  }
}
```

---

## 💳 Payment Processing

### POST /payments/initialize
Initialize a payment order with Razorpay.

**Authentication**: Required  
**Rate Limit**: 10 requests per minute

**Request Body**:
```json
{
  "gym_id": "uuid",
  "plan_id": "uuid",
  "plan_type": "monthly"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Payment order created successfully.",
  "data": {
    "order_id": "order_razorpay_id",
    "amount": 299900,
    "currency": "INR",
    "razorpay_key_id": "rzp_test_key",
    "user_details": {
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "+91 9876543210"
    }
  }
}
```

### POST /payments/verify
Verify payment signature after successful payment.

**Authentication**: Required  
**Rate Limit**: 10 requests per minute

**Request Body**:
```json
{
  "razorpay_order_id": "order_razorpay_id",
  "razorpay_payment_id": "pay_razorpay_id",
  "razorpay_signature": "signature_string"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Payment verified and membership activated.",
  "data": {
    "payment_status": "completed",
    "membership_id": "uuid",
    "transaction_id": "txn_uuid"
  }
}
```

### POST /payments/webhook
Handle Razorpay webhook notifications.

**Authentication**: None required (IP whitelisted)

**Request Body**: Razorpay webhook payload

**Response** (200):
```json
{
  "success": true,
  "message": "Webhook processed successfully."
}
```

---

## 🥗 Nutrition Tracking

### POST /nutrition/log
Log a nutrition entry.

**Authentication**: Required

**Request Body**:
```json
{
  "meal_type": "breakfast",
  "food_item": "Oatmeal with fruits",
  "calories_per_serving": 350,
  "protein_g": 12,
  "carbs_g": 65,
  "fat_g": 8,
  "servings": 1
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Nutrition entry logged successfully.",
  "data": {
    "log_id": "uuid",
    "user_id": "uuid",
    "date": "2025-07-30",
    "meal_type": "breakfast",
    "food_item": "Oatmeal with fruits",
    "total_calories": 350,
    "total_protein_g": 12,
    "total_carbs_g": 65,
    "total_fat_g": 8,
    "servings": 1
  }
}
```

### GET /nutrition/daily
Get daily nutrition summary.

**Authentication**: Required

**Query Parameters**:
- `date` (string): Date in YYYY-MM-DD format (default: today)

**Example Request**:
```
GET /nutrition/daily?date=2025-07-30
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "date": "2025-07-30",
    "total_calories": 1850,
    "total_protein_g": 98,
    "total_carbs_g": 220,
    "total_fat_g": 65,
    "meal_breakdown": {
      "breakfast": {
        "calories": 350,
        "protein_g": 12,
        "carbs_g": 65,
        "fat_g": 8
      },
      "lunch": {
        "calories": 600,
        "protein_g": 35,
        "carbs_g": 80,
        "fat_g": 22
      },
      "dinner": {
        "calories": 750,
        "protein_g": 42,
        "carbs_g": 65,
        "fat_g": 28
      },
      "snack": {
        "calories": 150,
        "protein_g": 9,
        "carbs_g": 10,
        "fat_g": 7
      }
    },
    "entries": [
      {
        "log_id": "uuid",
        "meal_type": "breakfast",
        "food_item": "Oatmeal with fruits",
        "total_calories": 350,
        "logged_at": "2025-07-30T08:30:00.000Z"
      }
    ]
  }
}
```

### GET /nutrition/history
Get nutrition history over multiple days.

**Authentication**: Required

**Query Parameters**:
- `days` (int): Number of days to retrieve (default: 7, max: 30)
- `start_date` (string): Start date in YYYY-MM-DD format
- `end_date` (string): End date in YYYY-MM-DD format

**Response** (200):
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_days": 7,
      "avg_daily_calories": 1950,
      "avg_daily_protein": 105,
      "avg_daily_carbs": 235,
      "avg_daily_fat": 70
    },
    "daily_data": [
      {
        "date": "2025-07-30",
        "total_calories": 1850,
        "total_protein_g": 98,
        "total_carbs_g": 220,
        "total_fat_g": 65
      }
    ]
  }
}
```

### PUT /nutrition/:id
Update a nutrition entry.

**Authentication**: Required

**Request Body**: Same as POST /nutrition/log

**Response** (200):
```json
{
  "success": true,
  "message": "Nutrition entry updated successfully.",
  "data": {
    "log_id": "uuid",
    "updated_fields": ["calories_per_serving", "protein_g"]
  }
}
```

### DELETE /nutrition/:id
Delete a nutrition entry.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "message": "Nutrition entry deleted successfully."
}
```

---

## 🤖 AI Chatbot

### POST /chatbot/message
Send a message to the AI chatbot.

**Authentication**: Required

**Request Body**:
```json
{
  "message": "What workout should I do today?",
  "includeContext": true
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Chatbot response generated successfully.",
  "data": {
    "message_id": "uuid",
    "response": "Based on your fitness goals and previous workouts, I recommend a full-body strength training session today. Focus on compound movements like squats, deadlifts, and bench press..."
  }
}
```

### GET /chatbot/context
Get conversation history and context.

**Authentication**: Required

**Query Parameters**:
- `limit` (int): Number of messages to retrieve (default: 50, max: 100)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "total_messages": 25,
    "messages": [
      {
        "message_id": "uuid",
        "message": "What workout should I do today?",
        "response": "Based on your fitness goals...",
        "created_at": "2025-07-30T10:30:00.000Z",
        "response_time_ms": 500
      }
    ]
  }
}
```

### DELETE /chatbot/history
Clear conversation history.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "message": "Conversation history cleared successfully.",
  "data": {
    "deleted_messages": 25
  }
}
```

---

## 👤 User Profile

### GET /user-profile/me
Get current user's profile.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "data": {
    "profile_id": "uuid",
    "user_id": "uuid",
    "date_of_birth": "1990-01-15",
    "height_cm": 175,
    "weight_kg": 70,
    "gender": "male",
    "primary_fitness_goal": "muscle_gain",
    "dietary_preferences": ["vegetarian"],
    "allergies": ["peanuts"],
    "profile_picture_url": null,
    "created_at": "2025-07-30T06:11:36.304Z"
  }
}
```

### PUT /user-profile/me
Update user's profile.

**Authentication**: Required

**Request Body**:
```json
{
  "date_of_birth": "1990-01-15",
  "height_cm": 175,
  "weight_kg": 72,
  "gender": "male",
  "primary_fitness_goal": "muscle_gain",
  "dietary_preferences": ["vegetarian", "gluten_free"],
  "allergies": ["peanuts"]
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "profile_id": "uuid",
    "updated_fields": ["weight_kg", "dietary_preferences"]
  }
}
```

---

## 📊 Admin Endpoints

### GET /admin/gyms
Get all gyms (admin view with additional details).

**Authentication**: Required (Admin role)

### POST /admin/gyms
Create a new gym.

**Authentication**: Required (Admin role)

### PUT /admin/gyms/:id
Update gym information.

**Authentication**: Required (Admin role)

### DELETE /admin/gyms/:id
Delete a gym.

**Authentication**: Required (Admin role)

---

## ❌ Error Responses

### Validation Error (400)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "error": "Authentication failed",
  "message": "Invalid or expired token"
}
```

### Authorization Error (403)
```json
{
  "error": "Access denied",
  "message": "Insufficient permissions"
}
```

### Not Found Error (404)
```json
{
  "error": "Not Found",
  "message": "The requested resource was not found"
}
```

### Rate Limit Error (429)
```json
{
  "error": "Too many requests from this IP, please try again later.",
  "retry_after": 900
}
```

### Server Error (500)
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## 🔧 Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|---------|
| General API | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |
| Password Reset | 3 requests | 1 hour |
| Payments | 10 requests | 1 minute |
| File Uploads | 20 requests | 15 minutes |

## 🛡️ Security Headers

All responses include the following security headers:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- Rate limiting headers (`RateLimit-*`)

## 📝 Notes

1. **Timestamps**: All timestamps are in ISO 8601 format (UTC)
2. **UUIDs**: All IDs are UUID v4 format
3. **Pagination**: Use `page` and `limit` query parameters
4. **Filtering**: Most list endpoints support filtering via query parameters
5. **CORS**: Enabled for specified origins with credentials support
6. **Content-Type**: All requests should use `application/json`
7. **Environment**: Replace localhost URLs with production domains when deploying

## 🚀 SDK Examples

### JavaScript/Node.js
```javascript
// Authentication
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  }),
  credentials: 'include'
});

// Authenticated request
const gymsResponse = await fetch('http://localhost:3000/api/gyms', {
  headers: {
    'Authorization': `Bearer ${token}`
  },
  credentials: 'include'
});
```

### cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt

# Get gyms
curl -X GET http://localhost:3000/api/gyms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

**Last Updated**: July 30, 2025  
**API Version**: 1.0.0  
**Documentation Version**: 1.0.0
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
