# KCISLK ESID Info Hub API - API Documentation

> **Version**: 1.0.0  
> **Base URL**: http://localhost:3000  
> **Generated**: 2025-09-03T16:23:48.037Z

## Overview

Comprehensive API for KCISLK Elementary School International Department Information Hub

This documentation covers all 24 API endpoints across 8 categories, providing comprehensive information for developers integrating with the KCISLK ESID Info Hub system.

## Authentication

**Bearer Token (JWT)**

Authentication using Google OAuth 2.0 with JWT tokens. Include the token in the Authorization header: `Bearer <token>`

### Example Authentication Header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoints

### Quick Reference

| Category | Endpoints | Authentication |
|----------|-----------|----------------|
| System | 1 | ❌ Optional/None |
| Authentication | 2 | ❌ Optional/None |
| User Management | 5 | ✅ Required |
| Permission Management | 2 | ✅ Required |
| Announcements | 3 | ✅ Required |
| Events | 4 | ✅ Required |
| Resources | 4 | ✅ Required |
| Notifications | 3 | ✅ Required |


## System

### GET /api/health

System health check endpoint

**🌐 Public Endpoint**

**Responses:**

- `200`: System is healthy
  ```json
  {
  "status": "healthy",
  "timestamp": "2025-09-03T16:00:00Z"
}
  ```

---


## Authentication

### GET /api/auth/google

Initialize Google OAuth authentication

**🌐 Public Endpoint**

**Responses:**

- `302`: Redirect to Google OAuth

---

### GET /api/auth/callback

Handle OAuth callback from Google

**🌐 Public Endpoint**

**Query Parameters:**

- `code` (string)
- `state` (string)

**Responses:**

- `302`: Redirect after successful authentication
- `400`: Authentication failed
  ```json
  {
  "error": "Invalid authorization code"
}
  ```

---


## User Management

### GET /api/admin/users

Get all users with pagination and filtering

**🔒 Authentication Required** - Roles: admin, office_member

**Query Parameters:**

- `page` (number)
- `limit` (number)
- `search` (string)
- `role` (string)

**Responses:**

- `200`: List of users
  ```json
  {
  "users": [
    {
      "id": "user_123",
      "email": "user@example.com",
      "displayName": "John Doe",
      "roles": [
        "viewer"
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
  ```

---

### POST /api/admin/users

Create a new user

**🔒 Authentication Required** - Roles: admin

**Request Body:**

```json
{
  "email": "string (required)",
  "displayName": "string (required)",
  "role": "string (optional)"
}
```

**Responses:**

- `201`: User created successfully
  ```json
  {
  "success": true,
  "user": {
    "id": "user_124",
    "email": "newuser@example.com",
    "displayName": "Jane Doe"
  }
}
  ```

---

### GET /api/admin/users/[id]

Get user by ID

**🔒 Authentication Required** - Roles: admin, office_member

**Path Parameters:**

- `id` (string)

**Responses:**

- `200`: User details
- `404`: User not found

---

### PUT /api/admin/users/[id]

Update user information

**🔒 Authentication Required** - Roles: admin

**Path Parameters:**

- `id` (string)

**Request Body:**

```json
{
  "displayName": "string (optional)",
  "email": "string (optional)"
}
```

**Responses:**

- `200`: User updated successfully
- `404`: User not found

---

### DELETE /api/admin/users/[id]

Delete user

**🔒 Authentication Required** - Roles: admin

**Path Parameters:**

- `id` (string)

**Responses:**

- `200`: User deleted successfully
- `404`: User not found

---


## Permission Management

### POST /api/admin/users/[id]/upgrade-request

Request permission upgrade for user

**🔒 Authentication Required** - Roles: viewer

**Path Parameters:**

- `id` (string)

**Request Body:**

```json
{
  "requestedRole": "string",
  "justification": "string"
}
```

**Responses:**

- `201`: Upgrade request created

---

### GET /api/admin/upgrade-requests

Get all permission upgrade requests

**🔒 Authentication Required** - Roles: admin, office_member

**Responses:**

- `200`: List of upgrade requests

---


## Announcements

### GET /api/announcements

Get published announcements

**🔓 Authentication Optional**

**Query Parameters:**

- `page` (number)
- `limit` (number)

**Responses:**

- `200`: List of announcements

---

### GET /api/admin/announcements

Get all announcements (including drafts)

**🔒 Authentication Required** - Roles: admin, office_member

**Responses:**

- `200`: List of all announcements

---

### POST /api/admin/announcements

Create new announcement

**🔒 Authentication Required** - Roles: admin, office_member

**Request Body:**

```json
{
  "title": "string (required)",
  "content": "string (required)",
  "isPublished": "boolean (optional)"
}
```

**Responses:**

- `201`: Announcement created

---


## Events

### GET /api/events

Get published events

**🔓 Authentication Optional**

**Responses:**

- `200`: List of events

---

### GET /api/admin/events

Get all events (admin view)

**🔒 Authentication Required** - Roles: admin, office_member

**Responses:**

- `200`: List of all events

---

### POST /api/admin/events

Create new event

**🔒 Authentication Required** - Roles: admin, office_member

**Request Body:**

```json
{
  "title": "string (required)",
  "description": "string (required)",
  "startDate": "string (ISO date)",
  "endDate": "string (ISO date)",
  "location": "string (optional)"
}
```

**Responses:**

- `201`: Event created

---

### POST /api/events/[id]/register

Register for an event

**🔒 Authentication Required** - Roles: admin, office_member, viewer

**Path Parameters:**

- `id` (string)

**Responses:**

- `201`: Registration successful
- `409`: Already registered

---


## Resources

### GET /api/resources

Get published resources

**🔓 Authentication Optional**

**Query Parameters:**

- `category` (string)
- `gradeLevel` (string)
- `search` (string)

**Responses:**

- `200`: List of resources

---

### GET /api/admin/resources

Get all resources (admin view)

**🔒 Authentication Required** - Roles: admin, office_member

**Responses:**

- `200`: List of all resources

---

### POST /api/admin/resources

Create new resource

**🔒 Authentication Required** - Roles: admin, office_member

**Request Body:**

```json
{
  "title": "string (required)",
  "description": "string (required)",
  "categoryId": "string (required)",
  "gradeLevelId": "string (optional)",
  "fileUrl": "string (optional)"
}
```

**Responses:**

- `201`: Resource created

---

### GET /api/admin/resources/analytics

Get resource analytics and statistics

**🔒 Authentication Required** - Roles: admin, office_member

**Responses:**

- `200`: Resource analytics data

---


## Notifications

### GET /api/notifications

Get user notifications

**🔒 Authentication Required** - Roles: admin, office_member, viewer

**Responses:**

- `200`: List of notifications

---

### GET /api/notifications/stream

Real-time notification stream (SSE)

**🔒 Authentication Required** - Roles: admin, office_member, viewer

**Responses:**

- `200`: Server-sent events stream

---

### GET /api/notifications/stats

Get notification statistics

**🔒 Authentication Required** - Roles: admin, office_member

**Responses:**

- `200`: Notification statistics

---


## Data Schemas

### User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique user identifier |
| `email` | string | ✅ | User email address |
| `displayName` | string | ✅ | User display name |
| `createdAt` | string | ❌ | Creation timestamp |
| `updatedAt` | string | ❌ | Last update timestamp |

### Announcement

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique announcement identifier |
| `title` | string | ✅ | Announcement title |
| `content` | string | ✅ | Announcement content |
| `isPublished` | boolean | ❌ | Publication status |
| `createdBy` | string | ✅ | Creator user ID |
| `createdAt` | string | ❌ |  |
| `updatedAt` | string | ❌ |  |

### Event

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique event identifier |
| `title` | string | ✅ | Event title |
| `description` | string | ❌ | Event description |
| `startDate` | string | ✅ | Event start time |
| `endDate` | string | ❌ | Event end time |
| `location` | string | ❌ | Event location |
| `createdBy` | string | ✅ | Creator user ID |
| `createdAt` | string | ❌ |  |

### Resource

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique resource identifier |
| `title` | string | ✅ | Resource title |
| `description` | string | ❌ | Resource description |
| `fileUrl` | string | ❌ | Resource file URL |
| `categoryId` | string | ✅ | Resource category ID |
| `gradeLevelId` | string | ❌ | Grade level ID |
| `isPublished` | boolean | ❌ | Publication status |
| `createdBy` | string | ✅ | Creator user ID |
| `createdAt` | string | ❌ |  |

### Notification

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique notification identifier |
| `recipientId` | string | ✅ | Recipient user ID |
| `title` | string | ✅ | Notification title |
| `message` | string | ✅ | Notification message |
| `type` | string | ✅ |  |
| `isRead` | boolean | ❌ | Read status |
| `createdAt` | string | ❌ |  |

### ErrorResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `success` | boolean | ✅ |  |
| `error` | string | ✅ | Error message |
| `code` | string | ❌ | Error code |
| `timestamp` | string | ❌ |  |

### SuccessResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `success` | boolean | ✅ |  |
| `data` | object | ❌ | Response data |
| `timestamp` | string | ❌ |  |

### PaginatedResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data` | array | ❌ |  |
| `pagination` | object | ❌ |  |


## Support and Development

- **Health Check**: `GET /api/health`
- **Version**: 1.0.0
- **Last Updated**: 2025-09-03T16:23:48.038Z

For technical support or questions about this API, please contact the development team.
