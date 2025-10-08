import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient, Department } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import AddDepartment from "@/components/AddDepartment";
import EditDepartment from "@/components/EditDepartment";
import DeleteDepartmentDialog from "@/components/DeleteDepartmentDialog";

const Departments = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Fetch departments
    const { data: departmentsData, isLoading, error, refetch } = useQuery({
        queryKey: ['departments'],
        queryFn: () => apiClient.getDepartments(),
        select: (response) => response.data,
    });

    const handleDepartmentCreated = () => {
        refetch();
    };

    const handleEditDepartment = (department: Department) => {
        setSelectedDepartment(department);
        setShowEditDialog(true);
    };

    const handleDeleteDepartment = (department: Department) => {
        setSelectedDepartment(department);
        setShowDeleteDialog(true);
    };

    const handleCloseEditDialog = () => {
        setShowEditDialog(false);
        setSelectedDepartment(null);
    };

    const handleCloseDeleteDialog = () => {
        setShowDeleteDialog(false);
        setSelectedDepartment(null);
    };

    const handleDepartmentUpdated = () => {
        refetch();
    };

    const handleDepartmentDeleted = () => {
        refetch();
    };

    // Filter departments based on search term
    const filteredDepartments = departmentsData?.departments?.filter((department) =>
        department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const getStatusBadge = (isActive: boolean) => {
        return (
            <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "نشط" : "غير نشط"}
            </Badge>
        );
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-destructive mb-4">حدث خطأ في تحميل الأقسام</p>
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
                    <h1 className="text-3xl font-bold">إدارة الأقسام</h1>
                    <p className="text-muted-foreground">
                        إدارة أقسام الشركة وتنظيم الموظفين
                    </p>
                </div>
                <AddDepartment onSuccess={handleDepartmentCreated} />
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>البحث والتصفية</CardTitle>
                    <CardDescription>
                        ابحث عن الأقسام أو استخدم المرشحات للعثور على ما تبحث عنه
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="البحث في الأقسام..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Departments Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        الأقسام ({filteredDepartments.length})
                    </CardTitle>
                    <CardDescription>
                        قائمة بجميع أقسام الشركة
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p>جاري تحميل الأقسام...</p>
                            </div>
                        </div>
                    ) : filteredDepartments.length === 0 ? (
                        <div className="text-center py-8">
                            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">لا توجد أقسام</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm ? "لم يتم العثور على أقسام تطابق البحث" : "لم يتم إنشاء أي أقسام بعد"}
                            </p>
                            {!searchTerm && (
                                <AddDepartment onSuccess={handleDepartmentCreated} />
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>اسم القسم</TableHead>
                                        <TableHead>الكود</TableHead>
                                        <TableHead>الوصف</TableHead>
                                        <TableHead>عدد الموظفين</TableHead>
                                        <TableHead>تاريخ الإنشاء</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead className="text-center">الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDepartments.map((department) => (
                                        <TableRow key={department.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Building2 className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{department.name}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                                    {department.code}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-muted-foreground max-w-xs truncate">
                                                    {department.description || 'لا يوجد وصف'}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {department.employees_count || 0} موظف
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(department.created_at), 'dd/MM/yyyy', { locale: ar })}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(department.is_active)}
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
                                                        <DropdownMenuItem onClick={() => handleEditDepartment(department)}>
                                                            <Edit className="h-4 w-4 ml-2" />
                                                            تعديل
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDeleteDepartment(department)}
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
                </CardContent>
            </Card>

            {/* Edit Department Dialog */}
            {showEditDialog && selectedDepartment && (
                <EditDepartment
                    department={selectedDepartment}
                    onSuccess={handleDepartmentUpdated}
                    onClose={handleCloseEditDialog}
                />
            )}

            {/* Delete Department Dialog */}
            <DeleteDepartmentDialog
                department={showDeleteDialog ? selectedDepartment : null}
                onClose={handleCloseDeleteDialog}
                onSuccess={handleDepartmentDeleted}
            />
        </div>
    );
};

export default Departments;

