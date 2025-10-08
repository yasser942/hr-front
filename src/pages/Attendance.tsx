import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, Attendance, AttendanceFilters, AttendanceStatistics, TodayStats } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Clock, Users, CheckCircle, XCircle, MapPin, Download, Calendar, Building2, User, Camera, Shield } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import AddAttendance from "@/components/AddAttendance";
import EditAttendance from "@/components/EditAttendance";
import DeleteAttendanceDialog from "@/components/DeleteAttendanceDialog";
import AdminAttendanceDialog from "@/components/AdminAttendanceDialog";

const Attendance = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<AttendanceFilters>({});
    const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAdminDialog, setShowAdminDialog] = useState(false);

    const queryClient = useQueryClient();

    // Fetch attendances
    const { data: attendancesData, isLoading, error, refetch } = useQuery({
        queryKey: ['attendances', filters],
        queryFn: () => apiClient.getAttendances(filters),
        select: (response) => response.data,
    });

    // Fetch statistics
    const { data: statisticsData } = useQuery({
        queryKey: ['attendance-statistics'],
        queryFn: () => apiClient.getAttendanceStatistics(),
        select: (response) => response.data,
    });

    // Fetch today's stats
    const { data: todayStatsData } = useQuery({
        queryKey: ['today-stats'],
        queryFn: () => apiClient.getTodayStats(),
        select: (response) => response.data,
    });

    // Fetch employees for filter
    const { data: employeesData } = useQuery({
        queryKey: ['employees'],
        queryFn: () => apiClient.getEmployees(),
        select: (response) => response.data,
    });

    // Delete attendance mutation
    const deleteAttendanceMutation = useMutation({
        mutationFn: (id: number) => apiClient.deleteAttendance(id),
        onSuccess: () => {
            toast.success("تم حذف سجل الحضور بنجاح");
            queryClient.invalidateQueries({ queryKey: ['attendances'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-statistics'] });
            queryClient.invalidateQueries({ queryKey: ['today-stats'] });
            setShowDeleteDialog(false);
            setSelectedAttendance(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.msg || "حدث خطأ أثناء حذف سجل الحضور");
        },
    });

    const handleAttendanceCreated = () => {
        refetch();
    };

    const handleEditAttendance = (attendance: Attendance) => {
        setSelectedAttendance(attendance);
        setShowEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setShowEditDialog(false);
        setSelectedAttendance(null);
    };

    const handleDeleteAttendance = (attendance: Attendance) => {
        setSelectedAttendance(attendance);
        setShowDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setShowDeleteDialog(false);
        setSelectedAttendance(null);
    };

    const handleConfirmDelete = () => {
        if (selectedAttendance) {
            deleteAttendanceMutation.mutate(selectedAttendance.id);
        }
    };

    const handleAdminAttendance = () => {
        setShowAdminDialog(true);
    };

    const handleCloseAdminDialog = () => {
        setShowAdminDialog(false);
    };

    const handleAttendanceUpdated = () => {
        refetch();
    };

    const handleExportAttendances = async () => {
        try {
            const response = await apiClient.exportAttendances(filters);
            // Handle file download
            toast.success("تم تصدير بيانات الحضور بنجاح");
        } catch (error) {
            toast.error("حدث خطأ أثناء تصدير البيانات");
        }
    };

    // Filter attendances based on search term
    const filteredAttendances = attendancesData?.attendances?.filter((attendance) =>
        attendance.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendance.employee?.id?.toString().includes(searchTerm.toLowerCase()) ||
        attendance.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const getAttendanceTypeBadge = (attendance: Attendance) => {
        const colorMap: Record<string, string> = {
            success: "default",
            warning: "secondary",
            danger: "destructive",
            info: "outline",
        };

        return (
            <Badge variant={colorMap[attendance.attendance_type_color] as any || "outline"}>
                {attendance.attendance_type_label}
            </Badge>
        );
    };

    const getStatusBadge = (attendance: Attendance) => {
        if (attendance.is_checked_in && attendance.is_checked_out) {
            return (
                <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    مكتمل
                </Badge>
            );
        } else if (attendance.is_checked_in) {
            return (
                <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    مسجل دخول
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    غير مسجل
                </Badge>
            );
        }
    };

    const getCheckoutLocationBadge = (attendance: Attendance) => {
        if (!attendance.check_out_time) {
            return (
                <Badge variant="outline" className="text-muted-foreground">
                    لم يتم الخروج
                </Badge>
            );
        }

        if (attendance.location?.checkout_is_at_assigned_branch) {
            return (
                <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="h-3 w-3" />
                    في الفرع المخصص
                </Badge>
            );
        } else {
            return (
                <Badge variant="destructive" className="flex items-center gap-1 bg-orange-100 text-orange-800 hover:bg-orange-100">
                    <XCircle className="h-3 w-3" />
                    خارج الفرع
                </Badge>
            );
        }
    };

    const formatTime = (timeString?: string) => {
        if (!timeString) return "غير محدد";
        return timeString;
    };

    const formatTotalHours = (totalHours: number | string | undefined) => {
        if (!totalHours) return "غير محدد";
        const hours = Number(totalHours);
        if (isNaN(hours)) return "غير محدد";
        return `${hours.toFixed(1)} ساعة`;
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-destructive mb-4">حدث خطأ في تحميل بيانات الحضور</p>
                    <Button onClick={() => refetch()}>إعادة المحاولة</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">إدارة الحضور والانصراف</h1>
                    <p className="text-muted-foreground text-sm lg:text-base">
                        تتبع حضور وانصراف الموظفين وإدارة ساعات العمل
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={handleExportAttendances} className="flex items-center justify-center gap-2">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">تصدير</span>
                    </Button>
                    <AddAttendance onSuccess={handleAttendanceCreated} />
                    <Button onClick={handleAdminAttendance} variant="outline" className="flex items-center justify-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">إدارة الحضور</span>
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayStatsData?.total_employees || 0}</div>
                        <p className="text-xs text-muted-foreground">موظف نشط</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">مسجلين دخول اليوم</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{todayStatsData?.checked_in || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            من أصل {todayStatsData?.total_employees || 0} موظف
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">مسجلين خروج اليوم</CardTitle>
                        <XCircle className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{todayStatsData?.checked_out || 0}</div>
                        <p className="text-xs text-muted-foreground">موظف مكتمل يوم العمل</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">متوسط ساعات العمل</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{statisticsData?.average_hours?.toFixed(1) || 0}</div>
                        <p className="text-xs text-muted-foreground">ساعة في اليوم</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>البحث والتصفية</CardTitle>
                    <CardDescription>
                        ابحث عن سجلات الحضور أو استخدم المرشحات للعثور على ما تبحث عنه
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="البحث في سجلات الحضور..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select
                            value={filters.employee_id?.toString() || "all"}
                            onValueChange={(value) => setFilters(prev => ({
                                ...prev,
                                employee_id: value === "all" ? undefined : parseInt(value)
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="الموظف" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">جميع الموظفين</SelectItem>
                                {employeesData?.employees?.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id.toString()}>
                                        {employee.user?.name || "غير محدد"} ({employee.employee_id || "غير محدد"})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <DatePicker
                            value={filters.date ? new Date(filters.date) : undefined}
                            onChange={(date) => setFilters(prev => ({
                                ...prev,
                                date: date ? date.toISOString().split('T')[0] : undefined
                            }))}
                            placeholder="اختر التاريخ"
                        />

                        <Select
                            value={filters.attendance_type || "all"}
                            onValueChange={(value) => setFilters(prev => ({
                                ...prev,
                                attendance_type: value === "all" ? undefined : value
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="نوع الحضور" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">جميع الأنواع</SelectItem>
                                <SelectItem value="regular">عادي</SelectItem>
                                <SelectItem value="late">متأخر</SelectItem>
                                <SelectItem value="overtime">إضافي</SelectItem>
                                <SelectItem value="remote">عن بُعد</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        سجلات الحضور ({filteredAttendances.length})
                    </CardTitle>
                    <CardDescription>
                        قائمة بجميع سجلات الحضور والانصراف
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p>جاري تحميل سجلات الحضور...</p>
                            </div>
                        </div>
                    ) : filteredAttendances.length === 0 ? (
                        <div className="text-center py-8">
                            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">لا توجد سجلات حضور</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || Object.values(filters).some(f => f !== undefined)
                                    ? "لم يتم العثور على سجلات حضور تطابق البحث"
                                    : "لم يتم تسجيل أي حضور بعد"}
                            </p>
                            {!searchTerm && !Object.values(filters).some(f => f !== undefined) && (
                                <AddAttendance onSuccess={handleAttendanceCreated} />
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>الموظف</TableHead>
                                            <TableHead>التاريخ</TableHead>
                                            <TableHead>وقت الدخول</TableHead>
                                            <TableHead>وقت الخروج</TableHead>
                                            <TableHead>إجمالي الساعات</TableHead>
                                            <TableHead>نوع الحضور</TableHead>
                                            <TableHead>الحالة</TableHead>
                                            <TableHead>الموقع</TableHead>
                                            <TableHead>موقع الخروج</TableHead>
                                            <TableHead>الصور</TableHead>
                                            <TableHead className="text-center">الإجراءات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAttendances.map((attendance) => (
                                            <TableRow key={attendance.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{attendance.employee?.name || "غير محدد"}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {attendance.employee?.id || "غير محدد"}
                                                            </p>
                                                            {attendance.employee?.department && (
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <Building2 className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {attendance.employee.department.name}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(attendance.date)}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">
                                                        {formatTime(attendance.check_in_time)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">
                                                        {formatTime(attendance.check_out_time)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">
                                                        {formatTotalHours(attendance.total_hours)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {getAttendanceTypeBadge(attendance)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(attendance)}
                                                </TableCell>
                                                <TableCell>
                                                    {attendance.location?.address ? (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground truncate max-w-20">
                                                                {attendance.location.address}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">غير محدد</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getCheckoutLocationBadge(attendance)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        {attendance.images?.check_in && (
                                                            <div className="relative group">
                                                                <img
                                                                    src={attendance.images.check_in.thumbnail_url}
                                                                    alt="Check-in image"
                                                                    className="w-8 h-8 rounded object-cover cursor-pointer"
                                                                    onClick={() => window.open(attendance.images?.check_in?.url, '_blank')}
                                                                />
                                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                                    صورة الدخول
                                                                </div>
                                                            </div>
                                                        )}
                                                        {attendance.images?.check_out && (
                                                            <div className="relative group">
                                                                <img
                                                                    src={attendance.images.check_out.thumbnail_url}
                                                                    alt="Check-out image"
                                                                    className="w-8 h-8 rounded object-cover cursor-pointer"
                                                                    onClick={() => window.open(attendance.images?.check_out?.url, '_blank')}
                                                                />
                                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                                    صورة الخروج
                                                                </div>
                                                            </div>
                                                        )}
                                                        {!attendance.images?.check_in && !attendance.images?.check_out && (
                                                            <span className="text-xs text-muted-foreground">لا توجد صور</span>
                                                        )}
                                                    </div>
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
                                                            <DropdownMenuItem onClick={() => handleEditAttendance(attendance)}>
                                                                <Edit className="h-4 w-4 ml-2" />
                                                                تعديل
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => handleDeleteAttendance(attendance)}
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

                            {/* Mobile Card View */}
                            <div className="lg:hidden space-y-4">
                                {filteredAttendances.map((attendance) => (
                                    <Card key={attendance.id} className="p-4">
                                        <div className="space-y-3">
                                            {/* Employee Info */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{attendance.employee?.name || "غير محدد"}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {attendance.employee?.id || "غير محدد"}
                                                        </p>
                                                        {attendance.employee?.department && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {attendance.employee.department.name}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleViewAttendance(attendance)}>
                                                            <Eye className="h-4 w-4 ml-2" />
                                                            عرض التفاصيل
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditAttendance(attendance)}>
                                                            <Edit className="h-4 w-4 ml-2" />
                                                            تعديل
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDeleteAttendance(attendance)}
                                                        >
                                                            <Trash2 className="h-4 w-4 ml-2" />
                                                            حذف
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Date and Times */}
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">التاريخ</p>
                                                    <p className="font-medium">{formatDate(attendance.date)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">إجمالي الساعات</p>
                                                    <p className="font-medium">{formatTotalHours(attendance.total_hours)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">وقت الدخول</p>
                                                    <p className="font-medium">{formatTime(attendance.check_in_time)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">وقت الخروج</p>
                                                    <p className="font-medium">{formatTime(attendance.check_out_time)}</p>
                                                </div>
                                            </div>

                                            {/* Status and Type */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {getAttendanceTypeBadge(attendance)}
                                                    {getStatusBadge(attendance)}
                                                </div>
                                            </div>

                                            {/* Location */}
                                            {attendance.location?.address && (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-muted-foreground truncate">
                                                        {attendance.location.address}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Checkout Location Status */}
                                            <div className="flex items-center gap-1 text-sm">
                                                {getCheckoutLocationBadge(attendance)}
                                            </div>

                                            {/* Images */}
                                            {(attendance.images?.check_in || attendance.images?.check_out) && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">الصور:</span>
                                                    <div className="flex items-center gap-1">
                                                        {attendance.images?.check_in && (
                                                            <div className="relative group">
                                                                <img
                                                                    src={attendance.images.check_in.thumbnail_url}
                                                                    alt="Check-in image"
                                                                    className="w-8 h-8 rounded object-cover cursor-pointer"
                                                                    onClick={() => window.open(attendance.images?.check_in?.url, '_blank')}
                                                                />
                                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                                    صورة الدخول
                                                                </div>
                                                            </div>
                                                        )}
                                                        {attendance.images?.check_out && (
                                                            <div className="relative group">
                                                                <img
                                                                    src={attendance.images.check_out.thumbnail_url}
                                                                    alt="Check-out image"
                                                                    className="w-8 h-8 rounded object-cover cursor-pointer"
                                                                    onClick={() => window.open(attendance.images?.check_out?.url, '_blank')}
                                                                />
                                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                                    صورة الخروج
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Edit Attendance Dialog */}
            {showEditDialog && selectedAttendance && (
                <EditAttendance
                    attendance={selectedAttendance}
                    onSuccess={handleAttendanceUpdated}
                    onClose={handleCloseEditDialog}
                />
            )}

            {/* Delete Attendance Dialog */}
            <DeleteAttendanceDialog
                attendance={selectedAttendance}
                isOpen={showDeleteDialog}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                isLoading={deleteAttendanceMutation.isPending}
            />

            {/* Admin Attendance Dialog */}
            <AdminAttendanceDialog
                isOpen={showAdminDialog}
                onClose={handleCloseAdminDialog}
                onSuccess={handleAttendanceCreated}
            />
        </div>
    );
};

export default Attendance;
