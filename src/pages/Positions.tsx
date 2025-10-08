import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient, Position } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Briefcase, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import AddPosition from "@/components/AddPosition";
import EditPosition from "@/components/EditPosition";
import DeletePositionDialog from "@/components/DeletePositionDialog";

const Positions = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Fetch positions
    const { data: positionsData, isLoading, error, refetch } = useQuery({
        queryKey: ['positions'],
        queryFn: () => apiClient.getPositions(),
        select: (response) => response.data,
    });

    const handlePositionCreated = () => {
        refetch();
    };

    const handleEditPosition = (position: Position) => {
        setSelectedPosition(position);
        setShowEditDialog(true);
    };

    const handleDeletePosition = (position: Position) => {
        setSelectedPosition(position);
        setShowDeleteDialog(true);
    };

    const handleCloseEditDialog = () => {
        setShowEditDialog(false);
        setSelectedPosition(null);
    };

    const handleCloseDeleteDialog = () => {
        setShowDeleteDialog(false);
        setSelectedPosition(null);
    };

    const handlePositionUpdated = () => {
        refetch();
    };

    const handlePositionDeleted = () => {
        refetch();
    };

    // Filter positions based on search term
    const filteredPositions = positionsData?.positions?.filter((position) =>
        position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const getStatusBadge = (isActive: boolean) => {
        return (
            <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "نشط" : "غير نشط"}
            </Badge>
        );
    };

    const formatSalary = (min: string, max: string) => {
        const minNum = parseFloat(min);
        const maxNum = parseFloat(max);
        return `${minNum.toLocaleString()} - ${maxNum.toLocaleString()} ر.س`;
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-destructive mb-4">حدث خطأ في تحميل المناصب</p>
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
                    <h1 className="text-3xl font-bold">إدارة المناصب</h1>
                    <p className="text-muted-foreground">
                        إدارة مناصب العمل والرواتب في الشركة
                    </p>
                </div>
                <AddPosition onSuccess={handlePositionCreated} />
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>البحث والتصفية</CardTitle>
                    <CardDescription>
                        ابحث عن المناصب أو استخدم المرشحات للعثور على ما تبحث عنه
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="البحث في المناصب..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Positions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        المناصب ({filteredPositions.length})
                    </CardTitle>
                    <CardDescription>
                        قائمة بجميع مناصب العمل في الشركة
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p>جاري تحميل المناصب...</p>
                            </div>
                        </div>
                    ) : filteredPositions.length === 0 ? (
                        <div className="text-center py-8">
                            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">لا توجد مناصب</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm ? "لم يتم العثور على مناصب تطابق البحث" : "لم يتم إنشاء أي مناصب بعد"}
                            </p>
                            {!searchTerm && (
                                <AddPosition onSuccess={handlePositionCreated} />
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>اسم المنصب</TableHead>
                                        <TableHead>الكود</TableHead>
                                        <TableHead>الوصف</TableHead>
                                        <TableHead>نطاق الراتب</TableHead>
                                        <TableHead>عدد الموظفين</TableHead>
                                        <TableHead>تاريخ الإنشاء</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead className="text-center">الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPositions.map((position) => (
                                        <TableRow key={position.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Briefcase className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{position.title}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                                    {position.code}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-muted-foreground max-w-xs truncate">
                                                    {position.description || 'لا يوجد وصف'}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-600">
                                                        {formatSalary(position.base_salary_min, position.base_salary_max)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {position.employees_count || 0} موظف
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(position.created_at), 'dd/MM/yyyy', { locale: ar })}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(position.is_active)}
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
                                                        <DropdownMenuItem onClick={() => handleEditPosition(position)}>
                                                            <Edit className="h-4 w-4 ml-2" />
                                                            تعديل
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDeletePosition(position)}
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

            {/* Edit Position Dialog */}
            {showEditDialog && selectedPosition && (
                <EditPosition
                    position={selectedPosition}
                    onSuccess={handlePositionUpdated}
                    onClose={handleCloseEditDialog}
                />
            )}

            {/* Delete Position Dialog */}
            <DeletePositionDialog
                position={showDeleteDialog ? selectedPosition : null}
                onClose={handleCloseDeleteDialog}
                onSuccess={handlePositionDeleted}
            />
        </div>
    );
};

export default Positions;

