import { useMutation } from "@tanstack/react-query";
import { apiClient, Department } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, X, Building2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteDepartmentDialogProps {
    department: Department | null;
    onClose: () => void;
    onSuccess?: () => void;
}

const DeleteDepartmentDialog = ({ department, onClose, onSuccess }: DeleteDepartmentDialogProps) => {
    const deleteDepartmentMutation = useMutation({
        mutationFn: (id: number) => apiClient.deleteDepartment(id),
        onSuccess: () => {
            toast.success("تم حذف القسم بنجاح");
            onSuccess?.();
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء حذف القسم";
            toast.error(errorMessage);
        },
    });

    const handleDelete = () => {
        if (department) {
            deleteDepartmentMutation.mutate(department.id);
        }
    };

    if (!department) return null;

    return (
        <Dialog open={!!department} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        تأكيد الحذف
                    </DialogTitle>
                    <DialogDescription className="text-right">
                        هل أنت متأكد من أنك تريد حذف القسم{" "}
                        <span className="font-semibold">{department.name}</span>؟
                        <br />
                        <span className="text-sm text-muted-foreground">
                            هذا الإجراء لا يمكن التراجع عنه.
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-destructive mb-1">تحذير:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>سيتم حذف جميع بيانات القسم نهائياً</li>
                                <li>قد يؤثر هذا على الموظفين المرتبطين بهذا القسم</li>
                                <li>لا يمكن استرداد هذه البيانات بعد الحذف</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Department Info */}
                <div className="bg-muted/50 border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">{department.name}</p>
                            <p className="text-sm text-muted-foreground">
                                كود: {department.code} • {department.employees_count || 0} موظف
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={deleteDepartmentMutation.isPending}
                    >
                        <X className="h-4 w-4 ml-2" />
                        إلغاء
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteDepartmentMutation.isPending}
                    >
                        {deleteDepartmentMutation.isPending ? (
                            "جاري الحذف..."
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 ml-2" />
                                حذف القسم
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteDepartmentDialog;

