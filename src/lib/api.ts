const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface HrUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    level: string;
    status: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface HrEmployee {
    id: number;
    employee_id: string;
    department?: string;
    position?: string;
    hire_date: string;
    employment_type: string;
    supervisor?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
    remember_me?: boolean;
}

export interface LoginResponse {
    user: HrUser;
    hr_employee: HrEmployee;
    token: string;
    permissions: Record<string, boolean>;
}

export interface MeResponse {
    user: HrUser;
    hr_employee: HrEmployee;
    permissions: Record<string, boolean>;
}

export interface Employee {
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

export interface EmployeeFilters {
    search?: string;
    department_id?: number;
    position_id?: number;
    employment_type?: string;
    is_active?: boolean;
    page?: number;
    per_page?: number;
}

export interface CreateEmployeeData {
    // User Information
    name: string;
    email: string;
    username: string;
    password: string;
    phone?: string;
    city_id: number;
    branch_id: number;
    level?: string;
    status?: string;

    // Employee Information
    department_id: number;
    position_id: number;
    hire_date: string;
    employment_type: string;
    is_active?: boolean;

    // Optional Employee Details
    salary?: number;
    work_schedule?: string;
    supervisor_id?: number;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    bank_account_number?: string;
    tax_id?: string;
    notes?: string;
}

export interface Department {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    employees_count?: number;
}

export interface CreateDepartmentData {
    name: string;
    code: string;
    description?: string;
    is_active?: boolean;
}

export interface DepartmentsResponse {
    departments: Department[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface Position {
    id: number;
    title: string;
    code: string;
    description?: string;
    base_salary_min: string;
    base_salary_max: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    employees_count?: number;
}

export interface CreatePositionData {
    title: string;
    code: string;
    description?: string;
    base_salary_min: number;
    base_salary_max: number;
    is_active?: boolean;
}

export interface PositionsResponse {
    positions: Position[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface LeaveRequest {
    id: number;
    employee_id: number;
    leave_type: string;
    start_date: string;
    start_datetime?: string;
    end_date: string;
    end_datetime?: string;
    total_days: string;
    total_hours: string;
    duration_type: string;
    reason: string;
    status: string;
    approved_by?: number;
    approved_at?: string;
    rejection_reason?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    employee: {
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
        user: {
            id: number;
            name: string;
            username: string;
            email: string;
            phone?: string;
            status: string;
            level: string;
            branch_id: number;
            city_id?: number;
            created_at: string;
            updated_at: string;
        };
        department?: {
            id: number;
            name: string;
            code: string;
            description?: string;
            manager_id?: number;
            is_active: boolean;
            color: string;
            created_at: string;
            updated_at: string;
        };
    };
    approver?: {
        id: number;
        name: string;
        username: string;
        email: string;
        phone?: string;
        status: string;
        level: string;
        branch_id: number;
        city_id?: number;
        created_at: string;
        updated_at: string;
    };
}

export interface CreateLeaveRequestData {
    employee_id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    start_datetime?: string;
    end_datetime?: string;
    duration_type: string;
    reason: string;
    notes?: string;
}

export interface LeaveRequestsResponse {
    current_page: number;
    data: LeaveRequest[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface LeaveRequestFilterOptions {
    leave_types: Array<{
        value: string;
        label: string;
        arabic_label: string;
        color: string;
        icon: string;
        is_hourly_based: boolean;
    }>;
    statuses: Array<{
        value: string;
        label: string;
        arabic_label: string;
        color: string;
        icon: string;
    }>;
    employees: Array<{
        id: number;
        name: string;
        employee_id: string;
        department: string;
    }>;
}

export interface LeaveRequestFilters {
    employee_id?: number;
    leave_type?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
}

export interface Attendance {
    id: number;
    employee_id: number;
    date: string;
    check_in_time?: string;
    check_out_time?: string;
    total_hours?: number | string;
    attendance_type: string;
    attendance_type_label: string;
    attendance_type_description: string;
    attendance_type_color: string;
    attendance_type_icon: string;
    notes?: string;
    latitude?: number;
    longitude?: number;
    location?: {
        name?: string;
        address?: string;
        device_info?: string;
        check_in_time?: string;
        checkout_name?: string;
        checkout_time?: string;
        checkout_address?: string;
        checkout_latitude?: string;
        checkout_longitude?: string;
        checkout_branch_name?: string;
        checkout_device_info?: string;
        checkout_location_status?: string;
        checkout_distance_from_branch?: number;
        checkout_is_at_assigned_branch?: boolean;
    };
    images?: {
        check_in?: {
            id: number;
            url: string;
            thumbnail_url: string;
            medium_url: string;
            large_url: string;
            uploaded_at: string;
            file_name: string;
            size: number;
            mime_type: string;
        };
        check_out?: {
            id: number;
            url: string;
            thumbnail_url: string;
            medium_url: string;
            large_url: string;
            uploaded_at: string;
            file_name: string;
            size: number;
            mime_type: string;
        };
    };
    created_at: string;
    updated_at: string;
    is_checked_in: boolean;
    is_checked_out: boolean;
    employee?: {
        id: number;
        name: string;
        email: string;
        branch?: {
            id: number;
            name: string;
        };
        department?: {
            id: number;
            name: string;
        };
        position?: {
            id: number;
            title: string;
        };
    };
}

export interface CreateAttendanceData {
    employee_id: number;
    check_in_time?: string;
    check_out_time?: string;
    attendance_type?: string;
    notes?: string;
    latitude?: number;
    longitude?: number;
    photo?: string; // Base64 encoded image
}

export interface AttendanceStatistics {
    total_days: number;
    total_employees: number;
    total_checkins: number;
    total_checkouts: number;
    average_hours: number;
    total_hours: number;
}

export interface TodayStats {
    total_employees: number;
    checked_in: number;
    checked_out: number;
    with_location: number;
    late_arrivals: number;
    absent: number;
}

export interface AttendancesResponse {
    attendances: Attendance[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface AttendanceFilters {
    employee_id?: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    attendance_type?: string;
    page?: number;
    per_page?: number;
}

export interface EmployeesResponse {
    employees: Employee[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

class ApiClient {
    private baseURL: string;
    private token: string | null = null;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('hr_token');
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('hr_token', token);
        } else {
            localStorage.removeItem('hr_token');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        // Merge with any additional headers from options
        if (options.headers) {
            Object.assign(headers, options.headers);
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'An error occurred',
                    errors: data.errors,
                };
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message,
            };
        } catch (error) {
            console.error('API request failed:', error);
            return {
                success: false,
                message: 'Network error occurred',
            };
        }
    }

    // Authentication methods
    async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        const response = await this.request<LoginResponse>('/hr/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        if (response.success && response.data?.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    async logout(): Promise<ApiResponse> {
        const response = await this.request('/hr/logout', {
            method: 'POST',
        });

        if (response.success) {
            this.setToken(null);
        }

        return response;
    }

    async me(): Promise<ApiResponse<MeResponse>> {
        return this.request<MeResponse>('/hr/me');
    }

    async refresh(): Promise<ApiResponse<{ token: string }>> {
        const response = await this.request<{ token: string }>('/hr/refresh', {
            method: 'POST',
        });

        if (response.success && response.data?.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    // Health check
    async health(): Promise<ApiResponse> {
        return this.request('/hr/health');
    }

    // Debug endpoint
    async debug(): Promise<ApiResponse> {
        return this.request('/hr/debug');
    }

    // Employee Management
    async getEmployees(filters: EmployeeFilters = {}): Promise<ApiResponse<EmployeesResponse>> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/hr/employees?${queryString}` : '/hr/employees';

        return this.request<EmployeesResponse>(endpoint);
    }

    async getEmployee(id: number): Promise<ApiResponse<Employee>> {
        return this.request<Employee>(`/hr/employees/${id}`);
    }

    async createEmployee(employeeData: CreateEmployeeData): Promise<ApiResponse<Employee>> {
        return this.request<Employee>('/hr/employees', {
            method: 'POST',
            body: JSON.stringify(employeeData),
        });
    }

    async updateEmployee(id: number, employeeData: Partial<Employee>): Promise<ApiResponse<Employee>> {
        return this.request<Employee>(`/hr/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(employeeData),
        });
    }

    async deleteEmployee(id: number): Promise<ApiResponse> {
        return this.request(`/hr/employees/${id}`, {
            method: 'DELETE',
        });
    }

    async getEmployeeFilterOptions(): Promise<ApiResponse> {
        return this.request('/hr/employees/filter-options');
    }

    async exportEmployees(filters: EmployeeFilters = {}): Promise<ApiResponse> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/hr/employees/export?${queryString}` : '/hr/employees/export';

        return this.request(endpoint);
    }

    // Department Management
    async getDepartments(): Promise<ApiResponse<DepartmentsResponse>> {
        return this.request<DepartmentsResponse>('/hr/departments');
    }

    async getDepartment(id: number): Promise<ApiResponse<Department>> {
        return this.request<Department>(`/hr/departments/${id}`);
    }

    async createDepartment(departmentData: CreateDepartmentData): Promise<ApiResponse<Department>> {
        return this.request<Department>('/hr/departments', {
            method: 'POST',
            body: JSON.stringify(departmentData),
        });
    }

    async updateDepartment(id: number, departmentData: Partial<CreateDepartmentData>): Promise<ApiResponse<Department>> {
        return this.request<Department>(`/hr/departments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(departmentData),
        });
    }

    async deleteDepartment(id: number): Promise<ApiResponse> {
        return this.request(`/hr/departments/${id}`, {
            method: 'DELETE',
        });
    }

    // Position Management
    async getPositions(): Promise<ApiResponse<PositionsResponse>> {
        return this.request<PositionsResponse>('/hr/positions');
    }

    async getPosition(id: number): Promise<ApiResponse<Position>> {
        return this.request<Position>(`/hr/positions/${id}`);
    }

    async createPosition(positionData: CreatePositionData): Promise<ApiResponse<Position>> {
        return this.request<Position>('/hr/positions', {
            method: 'POST',
            body: JSON.stringify(positionData),
        });
    }

    async updatePosition(id: number, positionData: Partial<CreatePositionData>): Promise<ApiResponse<Position>> {
        return this.request<Position>(`/hr/positions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(positionData),
        });
    }

    async deletePosition(id: number): Promise<ApiResponse> {
        return this.request(`/hr/positions/${id}`, {
            method: 'DELETE',
        });
    }

    // Leave Request Management
    async getLeaveRequests(filters: LeaveRequestFilters = {}): Promise<ApiResponse<LeaveRequestsResponse>> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/hr/leave-requests?${queryString}` : '/hr/leave-requests';

        return this.request<LeaveRequestsResponse>(endpoint);
    }

    async getLeaveRequest(id: number): Promise<ApiResponse<LeaveRequest>> {
        return this.request<LeaveRequest>(`/hr/leave-requests/${id}`);
    }

    async createLeaveRequest(leaveRequestData: CreateLeaveRequestData): Promise<ApiResponse<LeaveRequest>> {
        return this.request<LeaveRequest>('/hr/leave-requests', {
            method: 'POST',
            body: JSON.stringify(leaveRequestData),
        });
    }

    async updateLeaveRequest(id: number, leaveRequestData: Partial<CreateLeaveRequestData>): Promise<ApiResponse<LeaveRequest>> {
        return this.request<LeaveRequest>(`/hr/leave-requests/${id}`, {
            method: 'PUT',
            body: JSON.stringify(leaveRequestData),
        });
    }

    async deleteLeaveRequest(id: number): Promise<ApiResponse> {
        return this.request(`/hr/leave-requests/${id}`, {
            method: 'DELETE',
        });
    }

    async approveLeaveRequest(id: number, notes?: string): Promise<ApiResponse<LeaveRequest>> {
        return this.request<LeaveRequest>(`/hr/leave-requests/${id}/approve`, {
            method: 'POST',
            body: JSON.stringify({ notes }),
        });
    }

    async rejectLeaveRequest(id: number, rejection_reason: string): Promise<ApiResponse<LeaveRequest>> {
        return this.request<LeaveRequest>(`/hr/leave-requests/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ rejection_reason }),
        });
    }

    async cancelLeaveRequest(id: number): Promise<ApiResponse<LeaveRequest>> {
        return this.request<LeaveRequest>(`/hr/leave-requests/${id}/cancel`, {
            method: 'POST',
        });
    }

    async getLeaveRequestFilterOptions(): Promise<ApiResponse<LeaveRequestFilterOptions>> {
        return this.request<LeaveRequestFilterOptions>('/hr/leave-requests/filter-options');
    }

    async checkLeaveRequestOverlap(leaveRequestData: Partial<CreateLeaveRequestData>): Promise<ApiResponse> {
        return this.request('/hr/leave-requests/check-overlap', {
            method: 'POST',
            body: JSON.stringify(leaveRequestData),
        });
    }

    // Attendance Management
    async getAttendances(filters: AttendanceFilters = {}): Promise<ApiResponse<AttendancesResponse>> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/hr/attendances?${queryString}` : '/hr/attendances';

        return this.request<AttendancesResponse>(endpoint);
    }

    async getAttendance(id: number): Promise<ApiResponse<Attendance>> {
        return this.request<Attendance>(`/hr/attendances/${id}`);
    }

    async createAttendance(attendanceData: CreateAttendanceData): Promise<ApiResponse<Attendance>> {
        return this.request<Attendance>('/hr/attendances', {
            method: 'POST',
            body: JSON.stringify(attendanceData),
        });
    }

    async updateAttendance(id: number, attendanceData: Partial<CreateAttendanceData>): Promise<ApiResponse<Attendance>> {
        return this.request<Attendance>(`/hr/attendances/${id}`, {
            method: 'PUT',
            body: JSON.stringify(attendanceData),
        });
    }

    async deleteAttendance(id: number): Promise<ApiResponse> {
        return this.request(`/hr/attendances/${id}`, {
            method: 'DELETE',
        });
    }

    async getAttendanceStatistics(): Promise<ApiResponse<AttendanceStatistics>> {
        return this.request<AttendanceStatistics>('/hr/attendances/statistics');
    }

    async getTodayStats(): Promise<ApiResponse<TodayStats>> {
        return this.request<TodayStats>('/hr/attendances/today-stats');
    }

    async exportAttendances(filters: AttendanceFilters = {}): Promise<ApiResponse> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/hr/attendances/export?${queryString}` : '/hr/attendances/export';

        return this.request(endpoint);
    }

    // Mobile/Check-in/Check-out APIs
    async checkIn(employeeId: number, checkInTime?: string, latitude?: number, longitude?: number, notes?: string, photo?: string): Promise<ApiResponse<Attendance>> {
        return this.request<Attendance>('/hr/attendance/checkin', {
            method: 'POST',
            body: JSON.stringify({
                employee_id: employeeId,
                check_in_time: checkInTime,
                latitude,
                longitude,
                notes,
                photo,
            }),
        });
    }

    async checkOut(employeeId: number, checkOutTime?: string, notes?: string, photo?: string): Promise<ApiResponse<Attendance>> {
        return this.request<Attendance>('/hr/attendance/checkout', {
            method: 'POST',
            body: JSON.stringify({
                employee_id: employeeId,
                check_out_time: checkOutTime,
                notes,
                photo,
            }),
        });
    }

    async getCurrentStatus(employeeId: number): Promise<ApiResponse> {
        return this.request(`/hr/attendance/status?employee_id=${employeeId}`);
    }

    async getEmployeeHistory(employeeId: number, startDate?: string, endDate?: string): Promise<ApiResponse<Attendance[]>> {
        const params = new URLSearchParams();
        params.append('employee_id', employeeId.toString());
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        return this.request<Attendance[]>(`/hr/attendance/history?${params.toString()}`);
    }

    async getEmployeeBranchInfo(employeeId: number): Promise<ApiResponse> {
        return this.request(`/hr/attendance/branch-info?employee_id=${employeeId}`);
    }

    // Admin override actions
    async adminCheckIn(employeeId: number, date?: string, time?: string, notes?: string): Promise<ApiResponse<Attendance>> {
        return this.request<Attendance>('/hr/attendance/admin/checkin', {
            method: 'POST',
            body: JSON.stringify({
                employee_id: employeeId,
                date,
                time,
                notes,
            }),
        });
    }

    async adminCheckOut(employeeId: number, date?: string, time?: string, notes?: string): Promise<ApiResponse<Attendance>> {
        return this.request<Attendance>('/hr/attendance/admin/checkout', {
            method: 'POST',
            body: JSON.stringify({
                employee_id: employeeId,
                date,
                time,
                notes,
            }),
        });
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
