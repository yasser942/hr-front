# HR Login Integration Guide

This document describes the integration of the HR frontend with the Laravel backend authentication system.

## Overview

The HR frontend has been updated to integrate with the Laravel backend HR API instead of Supabase. The integration includes:

- Custom API client for HR backend communication
- Authentication context with React hooks
- Updated login page with HR-specific styling
- Protected routes using HR authentication
- User profile display in the dashboard header

## Architecture

### API Client (`src/lib/api.ts`)

The API client handles all communication with the Laravel backend:

- **Base URL**: `http://localhost:8000/api` (configurable via `VITE_API_BASE_URL`)
- **Authentication**: Bearer token stored in localStorage
- **Endpoints**:
  - `POST /hr/login` - User login
  - `POST /hr/logout` - User logout
  - `GET /hr/me` - Get current user info
  - `POST /hr/refresh` - Refresh token
  - `GET /hr/health` - Health check
  - `GET /hr/debug` - Debug information

### Authentication Context (`src/contexts/AuthContext.tsx`)

Provides authentication state management:

- **State**: User info, HR employee data, permissions, loading state
- **Methods**: Login, logout, refresh user data
- **Auto-initialization**: Checks for existing token on app start

### Updated Components

1. **Auth Page** (`src/pages/Auth.tsx`)
   - Removed Supabase integration
   - Added HR-specific styling and branding
   - Includes "Remember Me" functionality
   - Arabic RTL support

2. **Protected Route** (`src/components/ProtectedRoute.tsx`)
   - Uses HR authentication context
   - Simplified loading and redirect logic

3. **Dashboard Header** (`src/components/DashboardHeader.tsx`)
   - Displays user and HR employee information
   - Integrated logout functionality

## Configuration

### Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend Requirements

The Laravel backend must be running with:

1. **Database**: MySQL with HR tables populated
2. **Users**: At least one user with HR access (level: admin or staff)
3. **HR Employees**: Corresponding HR employee records
4. **Roles**: Users must have 'مدير عام' or 'موارد بشرية' roles

## Testing

### Test Users

The system includes several test users:

1. **HR Administrator**
   - Email: `hr@cargo.com`
   - Level: admin
   - Department: الموارد البشرية
   - Position: مدير الموارد البشرية

2. **YASSER EL HASAN**
   - Email: `yasseralhassan942@gmail.com`
   - Level: staff
   - Department: تقنية المعلومات
   - Position: مطور برمجيات

### Test Page

A test page is available at `test-login.html` for testing the login functionality without the React app.

## API Response Format

### Login Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 68,
      "name": "HR Administrator",
      "email": "hr@cargo.com",
      "level": "admin",
      "status": "active"
    },
    "hr_employee": {
      "id": 30,
      "employee_id": "EMP001",
      "department": "الموارد البشرية",
      "position": "مدير الموارد البشرية",
      "hire_date": "2024-01-01",
      "employment_type": "full-time"
    },
    "token": "1|abc123...",
    "permissions": {
      "can_manage_employees": true,
      "can_manage_departments": true,
      "can_approve_leave": true,
      // ... other permissions
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Invalid credentials",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

## Security Features

1. **Token Management**: Automatic token storage and cleanup
2. **Role-based Access**: Only users with HR roles can access
3. **Account Status**: Blocked users cannot login
4. **Employee Status**: Inactive HR employees cannot access
5. **Remember Me**: Extended token expiration for convenience

## Development

### Running the Frontend

```bash
cd hr-front
npm install
npm run dev
```

### Running the Backend

```bash
cd cargo
php artisan serve
```

### Testing the Integration

1. Open `http://localhost:5173` (frontend)
2. Use test credentials from the database
3. Verify login/logout functionality
4. Check user information display

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Laravel CORS is configured for the frontend URL
2. **Token Expired**: Check token expiration and refresh logic
3. **User Not Found**: Verify user has HR employee record
4. **Permission Denied**: Check user roles and HR employee status

### Debug Endpoints

- `GET /api/hr/health` - Check backend health
- `GET /api/hr/debug` - Get debug information

## Future Enhancements

1. **Token Refresh**: Automatic token refresh before expiration
2. **Offline Support**: Cache user data for offline access
3. **Multi-language**: Support for multiple languages
4. **Advanced Permissions**: Granular permission system
5. **Audit Logging**: Track user actions and changes
