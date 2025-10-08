import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient, LeaveRequest, LeaveRequestFilters } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Calendar, CheckCircle, XCircle, Clock, Ban, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import AddLeaveRequest from "@/components/AddLeaveRequest";
import EditLeaveRequest from "@/components/EditLeaveRequest";
import ApproveLeaveRequestDialog from "@/components/ApproveLeaveRequestDialog";

const LeaveRequests = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<LeaveRequestFilters>({});
    const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);

    // Fetch leave requests
    const { data: leaveRequestsData, isLoading, error, refetch } = useQuery({
        queryKey: ['leave-requests', filters],
        queryFn: () => apiClient.getLeaveRequests(filters),
        select: (response) => response.data,
    });

    // Fetch filter options
    const { data: filterOptions } = useQuery({
        queryKey: ['leave-request-filter-options'],
        queryFn: () => apiClient.getLeaveRequestFilterOptions(),
        select: (response) => response.data,
    });

    const handleLeaveRequestCreated = () => {
        refetch();
    };

    const handleEditLeaveRequest = (leaveRequest: LeaveRequest) => {
        setSelectedLeaveRequest(leaveRequest);
        setShowEditDialog(true);
    };

    const handleApproveLeaveRequest = (leaveRequest: LeaveRequest) => {
        setSelectedLeaveRequest(leaveRequest);
        setShowApproveDialog(true);
    };

    const handleCloseEditDialog = () => {
        setShowEditDialog(false);
        setSelectedLeaveRequest(null);
    };

    const handleCloseApproveDialog = () => {
        setShowApproveDialog(false);
        setSelectedLeaveRequest(null);
    };

    const handleLeaveRequestUpdated = () => {
        refetch();
    };

    const handleLeaveRequestApproved = () => {
        refetch();
    };

    // Filter leave requests based on search term
    const filteredLeaveRequests = leaveRequestsData?.data?.filter((leaveRequest) =>
        leaveRequest.employee.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leaveRequest.employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leaveRequest.reason.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: "معلق", variant: "secondary" as const, icon: Clock },
            approved: { label: "موافق عليه", variant: "default" as const, icon: CheckCircle },
            rejected: { label: "مرفوض", variant: "destructive" as const, icon: XCircle },
            cancelled: { label: "ملغي", variant: "outline" as const, icon: Ban },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getLeaveTypeLabel = (leaveType: string) => {
        const leaveTypeOption = filterOptions?.leave_types?.find(type => type.value === leaveType);
        return leaveTypeOption?.arabic_label || leaveType;
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
    };

    const formatDateTime = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ar });
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-destructive mb-4">حدث خطأ في تحميل طلبات الإجازة</p>
                    <Button onClick={() => refetch()}>إعادة المحاولة</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">إدارة طلبات الإجازة</h1>
                    <p className="text-muted-foreground">
                        إدارة طلبات الإجازة والموافقة عليها
                    </p>
                </div>
                <AddLeaveRequest onSuccess={handleLeaveRequestCreated} />
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>البحث والتصفية</CardTitle>
                    <CardDescription>
                        ابحث عن طلبات الإجازة أو استخدم المرشحات للعثور على ما تبحث عنه
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="البحث في طلبات الإجازة..."
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
                                {filterOptions?.employees?.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id.toString()}>
                                        {employee.user?.name || "غير محدد"} ({employee.employee_id || "غير محدد"})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.leave_type || "all"}
                            onValueChange={(value) => setFilters(prev => ({
                                ...prev,
                                leave_type: value === "all" ? undefined : value
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="نوع الإجازة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">جميع الأنواع</SelectItem>
                                {filterOptions?.leave_types?.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.arabic_label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.status || "all"}
                            onValueChange={(value) => setFilters(prev => ({
                                ...prev,
                                status: value === "all" ? undefined : value
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="الحالة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">جميع الحالات</SelectItem>
                                {filterOptions?.statuses?.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.arabic_label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Leave Requests Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        طلبات الإجازة ({filteredLeaveRequests.length})
                    </CardTitle>
                    <CardDescription>
                        قائمة بجميع طلبات الإجازة في الشركة
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p>جاري تحميل طلبات الإجازة...</p>
                            </div>
                        </div>
                    ) : filteredLeaveRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">لا توجد طلبات إجازة</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || Object.values(filters).some(f => f !== undefined)
                                    ? "لم يتم العثور على طلبات إجازة تطابق البحث"
                                    : "لم يتم إنشاء أي طلبات إجازة بعد"}
                            </p>
                            {!searchTerm && !Object.values(filters).some(f => f !== undefined) && (
                                <AddLeaveRequest onSuccess={handleLeaveRequestCreated} />
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>الموظف</TableHead>
                                        <TableHead>نوع الإجازة</TableHead>
                                        <TableHead>تاريخ البداية</TableHead>
                                        <TableHead>تاريخ النهاية</TableHead>
                                        <TableHead>المدة</TableHead>
                                        <TableHead>السبب</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead>تاريخ الطلب</TableHead>
                                        <TableHead className="text-center">الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeaveRequests.map((leaveRequest) => (
                                        <TableRow key={leaveRequest.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{leaveRequest.employee.user.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {leaveRequest.employee.employee_id}
                                                        </p>
                                                        {leaveRequest.employee.department && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {leaveRequest.employee.department.name}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getLeaveTypeLabel(leaveRequest.leave_type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(leaveRequest.start_date)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(leaveRequest.end_date)}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    {leaveRequest.total_days} يوم
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-muted-foreground max-w-xs truncate">
                                                    {leaveRequest.reason}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(leaveRequest.status)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDateTime(leaveRequest.created_at)}
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
                                                        {leaveRequest.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleEditLeaveRequest(leaveRequest)}>
                                                                    <Edit className="h-4 w-4 ml-2" />
                                                                    تعديل
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleApproveLeaveRequest(leaveRequest)}>
                                                                    <CheckCircle className="h-4 w-4 ml-2" />
                                                                    موافقة/رفض
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        <DropdownMenuItem className="text-destructive">
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
                </CardContent>
            </Card>

            {/* Edit Leave Request Dialog */}
            {showEditDialog && selectedLeaveRequest && (
                <EditLeaveRequest
                    leaveRequest={selectedLeaveRequest}
                    onSuccess={handleLeaveRequestUpdated}
                    onClose={handleCloseEditDialog}
                />
            )}

            {/* Approve Leave Request Dialog */}
            {showApproveDialog && selectedLeaveRequest && (
                <ApproveLeaveRequestDialog
                    leaveRequest={selectedLeaveRequest}
                    onClose={handleCloseApproveDialog}
                    onSuccess={handleLeaveRequestApproved}
                />
            )}
        </div>
    );
};

export default LeaveRequests;
