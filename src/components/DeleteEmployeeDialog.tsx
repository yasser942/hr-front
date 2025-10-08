import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient, Employee } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface DeleteEmployeeDialogProps {
    employee: Employee | null;
    onClose: () => void;
    onSuccess?: () => void;
}

const DeleteEmployeeDialog = ({ employee, onClose, onSuccess }: DeleteEmployeeDialogProps) => {
    const deleteEmployeeMutation = useMutation({
        mutationFn: (id: number) => apiClient.deleteEmployee(id),
        onSuccess: () => {
            toast.success("تم حذف الموظف بنجاح");
            onSuccess?.();
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء حذف الموظف";
            toast.error(errorMessage);
        },
    });

    const handleDelete = () => {
        if (employee) {
            deleteEmployeeMutation.mutate(employee.id);
        }
    };

    if (!employee) return null;

    return (
        <Dialog open={!!employee} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        تأكيد الحذف
                    </DialogTitle>
                    <DialogDescription className="text-right">
                        هل أنت متأكد من أنك تريد حذف الموظف{" "}
                        <span className="font-semibold">{employee.user?.name}</span>؟
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
                                <li>سيتم حذف جميع بيانات الموظف نهائياً</li>
                                <li>سيتم حذف حساب المستخدم المرتبط</li>
                                <li>لا يمكن استرداد هذه البيانات بعد الحذف</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={deleteEmployeeMutation.isPending}
                    >
                        <X className="h-4 w-4 ml-2" />
                        إلغاء
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteEmployeeMutation.isPending}
                    >
                        {deleteEmployeeMutation.isPending ? (
                            "جاري الحذف..."
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 ml-2" />
                                حذف الموظف
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteEmployeeDialog;
