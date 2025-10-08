import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, HrUser, HrEmployee, LoginRequest, LoginResponse, MeResponse } from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
    user: HrUser | null;
    hrEmployee: HrEmployee | null;
    permissions: Record<string, boolean>;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<HrUser | null>(null);
    const [hrEmployee, setHrEmployee] = useState<HrEmployee | null>(null);
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user && !!hrEmployee;

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const response = await apiClient.me();
                if (response.success && response.data) {
                    setUser(response.data.user);
                    setHrEmployee(response.data.hr_employee);
                    setPermissions(response.data.permissions);
                } else {
                    // Token might be invalid, clear it
                    apiClient.setToken(null);
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                apiClient.setToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials: LoginRequest): Promise<boolean> => {
        try {
            setIsLoading(true);
            const response = await apiClient.login(credentials);

            if (response.success && response.data) {
                setUser(response.data.user);
                setHrEmployee(response.data.hr_employee);
                setPermissions(response.data.permissions);
                toast.success('تم تسجيل الدخول بنجاح!');
                return true;
            } else {
                const errorMessage = response.message || 'فشل في تسجيل الدخول';
                toast.error(errorMessage);
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('حدث خطأ أثناء تسجيل الدخول');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await apiClient.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setHrEmployee(null);
            setPermissions({});
            apiClient.setToken(null);
            toast.success('تم تسجيل الخروج بنجاح');
        }
    };

    const refreshUser = async (): Promise<void> => {
        try {
            const response = await apiClient.me();
            if (response.success && response.data) {
                setUser(response.data.user);
                setHrEmployee(response.data.hr_employee);
                setPermissions(response.data.permissions);
            } else {
                // Token might be invalid, logout
                await logout();
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
            await logout();
        }
    };

    const value: AuthContextType = {
        user,
        hrEmployee,
        permissions,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
