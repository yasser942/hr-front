# Employees Management Feature

This document describes the employees management feature implemented in the HR frontend.

## Overview

The employees management feature provides a comprehensive interface for viewing, searching, filtering, and managing employee data in the HR system.

## Features

### ✅ **Completed Features:**

1. **Employee List View**
   - Displays all employees in a responsive table format
   - Shows employee photo, name, email, employee ID, department, position, employment type, hire date, and status
   - Supports pagination for large datasets

2. **Search and Filtering**
   - Real-time search by employee name or employee ID
   - Filter by department, position, and employment type
   - Status filtering (active/inactive employees)
   - Pagination controls

3. **Employee Information Display**
   - Employee avatar placeholder
   - Full name and email
   - Employee ID with monospace font
   - Department and position information
   - Employment type with color-coded badges
   - Hire date with Arabic locale formatting
   - Active/inactive status with color-coded badges

4. **Actions Menu**
   - View employee details
   - Edit employee information
   - Delete employee (with confirmation)
   - Dropdown menu for each employee row

5. **Export Functionality**
   - Export filtered employee data
   - Maintains current filter settings in export

6. **Responsive Design**
   - Mobile-friendly table layout
   - Responsive grid for filters
   - RTL (Right-to-Left) support for Arabic interface

## Technical Implementation

### API Integration

The feature integrates with the Laravel backend HR API:

- **GET /api/hr/employees** - Fetch employees with filtering and pagination
- **GET /api/hr/employees/{id}** - Get specific employee details
- **POST /api/hr/employees** - Create new employee
- **PUT /api/hr/employees/{id}** - Update employee
- **DELETE /api/hr/employees/{id}** - Delete employee
- **GET /api/hr/employees/filter-options** - Get filter options (departments, positions)
- **GET /api/hr/employees/export** - Export employee data

### Data Structure

```typescript
interface Employee {
  id: number;
  user_id: number;
  employee_id: string;
  department_id?: number;
  position_id?: number;
  hire_date: string;
  salary?: number;
  employment_type: string;
  work_schedule?: string;
  supervisor_id?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  bank_account_number?: string;
  tax_id?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: HrUser;
  department?: {
    id: number;
    name: string;
  };
  position?: {
    id: number;
    title: string;
  };
  supervisor?: {
    id: number;
    user: HrUser;
  };
}
```

### State Management

- Uses React Query for server state management
- Local state for filters and UI interactions
- Automatic refetching on filter changes
- Optimistic updates for better UX

### UI Components

- **Table**: Custom table with sorting and responsive design
- **Filters**: Multi-column filter layout with search, dropdowns, and selects
- **Badges**: Color-coded status and employment type indicators
- **Pagination**: Previous/Next navigation with page information
- **Actions**: Dropdown menu with employee actions
- **Loading States**: Skeleton loading and error handling

## Usage

### Accessing the Feature

1. Navigate to the HR frontend application
2. Log in with HR credentials
3. Click on "الموظفين" (Employees) in the sidebar
4. The employees list will load automatically

### Searching and Filtering

1. **Search**: Type in the search box to find employees by name or ID
2. **Department Filter**: Select a department from the dropdown
3. **Position Filter**: Select a position from the dropdown
4. **Employment Type**: Filter by full-time, part-time, contract, or intern
5. **Status**: Filter by active/inactive employees

### Employee Actions

1. **View Details**: Click the actions menu (⋮) and select "عرض التفاصيل"
2. **Edit Employee**: Click the actions menu and select "تعديل"
3. **Delete Employee**: Click the actions menu and select "حذف"

### Exporting Data

1. Apply any desired filters
2. Click the "تصدير" (Export) button
3. The system will export the filtered data

## Styling and Theming

- **RTL Support**: Full right-to-left layout for Arabic interface
- **Color Coding**: 
  - Active employees: Green badge
  - Inactive employees: Red badge
  - Employment types: Different colored badges
- **Responsive**: Mobile-first design with responsive breakpoints
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Future Enhancements

### Planned Features

1. **Employee Details Modal**: Detailed view with all employee information
2. **Bulk Actions**: Select multiple employees for bulk operations
3. **Advanced Filtering**: Date range filters, salary range, etc.
4. **Employee Creation**: Add new employees directly from the interface
5. **Employee Editing**: Inline editing or modal-based editing
6. **Photo Upload**: Employee photo management
7. **Export Formats**: Multiple export formats (PDF, Excel, CSV)
8. **Print Functionality**: Print employee lists
9. **Sorting**: Column-based sorting
10. **Advanced Search**: Search across multiple fields

### Technical Improvements

1. **Virtual Scrolling**: For large employee lists
2. **Caching**: Better caching strategies for performance
3. **Real-time Updates**: WebSocket integration for live updates
4. **Offline Support**: PWA capabilities for offline access
5. **Performance**: Lazy loading and code splitting

## Dependencies

- **React Query**: Server state management
- **date-fns**: Date formatting with Arabic locale
- **Radix UI**: Accessible UI components
- **Lucide React**: Icons
- **Tailwind CSS**: Styling and responsive design

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing

The feature includes:
- Error handling for API failures
- Loading states for better UX
- Responsive design testing
- RTL layout verification
- Accessibility testing

## Security

- All API calls require authentication
- User permissions are checked on the backend
- Sensitive data is properly handled
- CSRF protection through Laravel Sanctum
