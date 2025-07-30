# Fitflix API Quick Reference

## 🔗 Endpoint Summary

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/register` | User registration | ❌ |
| POST | `/auth/logout` | User logout | ✅ |
| POST | `/auth/change-password` | Change password | ✅ |
| POST | `/auth/forgot-password` | Initiate password reset | ❌ |
| POST | `/auth/reset-password` | Reset password with token | ❌ |
| POST | `/auth/refresh-token` | Refresh JWT token | ❌ |
| GET | `/auth/me` | Get current user info | ✅ |

### Gym Discovery
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/gyms` | List all gyms with filtering | ❌ |
| GET | `/gyms/:id` | Get specific gym details | ❌ |

### Membership Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/memberships` | List available plans | ❌ |
| POST | `/users/me/memberships` | Subscribe to membership | ✅ |
| GET | `/users/me/memberships` | Get user memberships | ✅ |
| DELETE | `/users/me/memberships/:id` | Cancel membership | ✅ |

### Payment Processing
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payments/initialize` | Create payment order | ✅ |
| POST | `/payments/verify` | Verify payment | ✅ |
| POST | `/payments/webhook` | Handle webhooks | ❌ |

### Nutrition Tracking
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/nutrition/log` | Log nutrition entry | ✅ |
| GET | `/nutrition/daily` | Get daily summary | ✅ |
| GET | `/nutrition/history` | Get nutrition history | ✅ |
| PUT | `/nutrition/:id` | Update nutrition entry | ✅ |
| DELETE | `/nutrition/:id` | Delete nutrition entry | ✅ |

### AI Chatbot
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/chatbot/message` | Send message to AI | ✅ |
| GET | `/chatbot/context` | Get conversation history | ✅ |
| DELETE | `/chatbot/history` | Clear chat history | ✅ |

### User Profile
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user-profile/me` | Get user profile | ✅ |
| PUT | `/user-profile/me` | Update user profile | ✅ |

### Admin
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/gyms` | List all gyms (admin) | ✅ (Admin) |
| POST | `/admin/gyms` | Create new gym | ✅ (Admin) |
| PUT | `/admin/gyms/:id` | Update gym | ✅ (Admin) |
| DELETE | `/admin/gyms/:id` | Delete gym | ✅ (Admin) |

### System
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | API health check | ❌ |

---

## 🔧 Rate Limits
- **General API**: 100 requests / 15 minutes
- **Authentication**: 5 requests / 15 minutes
- **Password Reset**: 3 requests / 1 hour
- **Payments**: 10 requests / 1 minute
- **File Uploads**: 20 requests / 15 minutes

## 🛡️ Security Features
- JWT Authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Input validation with Joi
- Security headers (CSP, HSTS, etc.)
- CORS protection
- SQL injection protection

## 📱 Quick Testing Commands

### Test Health Check
```bash
curl http://localhost:3000/health
```

### Test Gym Discovery
```bash
curl "http://localhost:3000/api/gyms?latitude=12.9728&longitude=77.7499&radius=50"
```

### Test User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser"}'
```

### Test User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

---

## 📊 Response Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request (Validation Error)
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **429** - Too Many Requests
- **500** - Internal Server Error

## 🔗 Base URLs
- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.fitflix.app/api`

---

**For detailed documentation, see [api.md](./api.md)**
