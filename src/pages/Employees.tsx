import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient, Employee, EmployeeFilters } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, Download, Plus, MoreHorizontal, Eye, Edit, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import AddEmployee from "@/components/AddEmployee";
import EditEmployee from "@/components/EditEmployee";
import DeleteEmployeeDialog from "@/components/DeleteEmployeeDialog";

const Employees = () => {
    const [filters, setFilters] = useState<EmployeeFilters>({
        search: "",
        department_id: undefined,
        position_id: undefined,
        employment_type: undefined,
        is_active: undefined,
        page: 1,
        per_page: 10,
    });

    const [filterOptions, setFilterOptions] = useState<any>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Fetch filter options
    const { data: filterOptionsData } = useQuery({
        queryKey: ['employee-filter-options'],
        queryFn: () => apiClient.getEmployeeFilterOptions(),
        select: (response) => response.data,
    });

    useEffect(() => {
        if (filterOptionsData) {
            setFilterOptions(filterOptionsData);
        }
    }, [filterOptionsData]);

    // Fetch employees
    const { data: employeesData, isLoading, error, refetch } = useQuery({
        queryKey: ['employees', filters],
        queryFn: () => apiClient.getEmployees(filters),
        select: (response) => response.data,
    });

    const handleEmployeeCreated = () => {
        refetch();
    };

    const handleEditEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowEditDialog(true);
    };

    const handleDeleteEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowDeleteDialog(true);
    };

    const handleCloseEditDialog = () => {
        setShowEditDialog(false);
        setSelectedEmployee(null);
    };

    const handleCloseDeleteDialog = () => {
        setShowDeleteDialog(false);
        setSelectedEmployee(null);
    };

    const handleEmployeeUpdated = () => {
        refetch();
    };

    const handleEmployeeDeleted = () => {
        refetch();
    };

    const handleFilterChange = (key: keyof EmployeeFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1, // Reset to first page when filtering
        }));
    };

    const handleSearch = (value: string) => {
        setFilters(prev => ({
            ...prev,
            search: value,
            page: 1,
        }));
    };

    const handleExport = async () => {
        try {
            const response = await apiClient.exportEmployees(filters);
            if (response.success) {
                toast.success("تم تصدير البيانات بنجاح");
                // Handle file download here
            } else {
                toast.error("فشل في تصدير البيانات");
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء تصدير البيانات");
        }
    };

    const getEmploymentTypeBadge = (type: string) => {
        const types = {
            'full-time': { label: 'دوام كامل', variant: 'default' as const },
            'part-time': { label: 'دوام جزئي', variant: 'secondary' as const },
            'contract': { label: 'عقد', variant: 'outline' as const },
            'intern': { label: 'متدرب', variant: 'destructive' as const },
        };

        const config = types[type as keyof typeof types] || { label: type, variant: 'outline' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-800">نشط</Badge>
        ) : (
            <Badge variant="destructive">غير نشط</Badge>
        );
    };

    if (error) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-destructive mb-4">حدث خطأ في تحميل بيانات الموظفين</p>
                        <Button onClick={() => refetch()}>إعادة المحاولة</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">إدارة الموظفين</h1>
                        <p className="text-muted-foreground">عرض وإدارة جميع الموظفين في النظام</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleExport} variant="outline">
                            <Download className="h-4 w-4 ml-2" />
                            تصدير
                        </Button>
                        <AddEmployee onSuccess={handleEmployeeCreated} />
                    </div>

                    {/* Edit Employee Dialog */}
                    {showEditDialog && selectedEmployee && (
                        <EditEmployee
                            employee={selectedEmployee}
                            onSuccess={handleEmployeeUpdated}
                            onClose={handleCloseEditDialog}
                        />
                    )}

                    {/* Delete Employee Dialog */}
                    <DeleteEmployeeDialog
                        employee={showDeleteDialog ? selectedEmployee : null}
                        onClose={handleCloseDeleteDialog}
                        onSuccess={handleEmployeeDeleted}
                    />
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            فلاتر البحث
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="space-y-2">
                                <Label htmlFor="search">البحث</Label>
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="البحث بالاسم أو رقم الموظف..."
                                        value={filters.search || ""}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pr-10"
                                    />
                                </div>
                            </div>

                            {/* Department */}
                            <div className="space-y-2">
                                <Label>القسم</Label>
                                <Select
                                    value={filters.department_id?.toString() || "all"}
                                    onValueChange={(value) => handleFilterChange('department_id', value === "all" ? undefined : parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر القسم" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">جميع الأقسام</SelectItem>
                                        {filterOptions?.departments?.map((dept: any) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Position */}
                            <div className="space-y-2">
                                <Label>المنصب</Label>
                                <Select
                                    value={filters.position_id?.toString() || "all"}
                                    onValueChange={(value) => handleFilterChange('position_id', value === "all" ? undefined : parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر المنصب" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">جميع المناصب</SelectItem>
                                        {filterOptions?.positions?.map((pos: any) => (
                                            <SelectItem key={pos.id} value={pos.id.toString()}>
                                                {pos.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Employment Type */}
                            <div className="space-y-2">
                                <Label>نوع التوظيف</Label>
                                <Select
                                    value={filters.employment_type || "all"}
                                    onValueChange={(value) => handleFilterChange('employment_type', value === "all" ? undefined : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر نوع التوظيف" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">جميع الأنواع</SelectItem>
                                        <SelectItem value="full-time">دوام كامل</SelectItem>
                                        <SelectItem value="part-time">دوام جزئي</SelectItem>
                                        <SelectItem value="contract">عقد</SelectItem>
                                        <SelectItem value="intern">متدرب</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Employees Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>قائمة الموظفين</CardTitle>
                        <CardDescription>
                            عرض {employeesData?.pagination?.total || 0} موظف
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p>جاري تحميل البيانات...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>الموظف</TableHead>
                                            <TableHead>رقم الموظف</TableHead>
                                            <TableHead>القسم</TableHead>
                                            <TableHead>المنصب</TableHead>
                                            <TableHead>نوع التوظيف</TableHead>
                                            <TableHead>تاريخ التوظيف</TableHead>
                                            <TableHead>الحالة</TableHead>
                                            <TableHead className="text-center">الإجراءات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employeesData?.employees?.map((employee: Employee) => (
                                            <TableRow key={employee.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{employee.user?.name || 'غير محدد'}</p>
                                                            <p className="text-sm text-muted-foreground">{employee.user?.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm">{employee.employee_id}</span>
                                                </TableCell>
                                                <TableCell>
                                                    {employee.department?.name || 'غير محدد'}
                                                </TableCell>
                                                <TableCell>
                                                    {employee.position?.title || 'غير محدد'}
                                                </TableCell>
                                                <TableCell>
                                                    {getEmploymentTypeBadge(employee.employment_type)}
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(employee.hire_date), 'dd/MM/yyyy', { locale: ar })}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(employee.is_active)}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>
                                                                <Eye className="h-4 w-4 ml-2" />
                                                                عرض التفاصيل
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                                                                <Edit className="h-4 w-4 ml-2" />
                                                                تعديل
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => handleDeleteEmployee(employee)}
                                                            >
                                                                <Trash2 className="h-4 w-4 ml-2" />
                                                                حذف
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination */}
                        {employeesData && employeesData.pagination.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    صفحة {employeesData.pagination.current_page} من {employeesData.pagination.last_page}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                                        disabled={!employeesData || employeesData.pagination.current_page <= 1}
                                    >
                                        السابق
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFilterChange('page', Math.min(employeesData.pagination.last_page, (filters.page || 1) + 1))}
                                        disabled={!employeesData || employeesData.pagination.current_page >= employeesData.pagination.last_page}
                                    >
                                        التالي
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Employees;
