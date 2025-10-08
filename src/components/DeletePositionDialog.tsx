import { useMutation } from "@tanstack/react-query";
import { apiClient, Position } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, X, Briefcase, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface DeletePositionDialogProps {
    position: Position | null;
    onClose: () => void;
    onSuccess?: () => void;
}

const DeletePositionDialog = ({ position, onClose, onSuccess }: DeletePositionDialogProps) => {
    const deletePositionMutation = useMutation({
        mutationFn: (id: number) => apiClient.deletePosition(id),
        onSuccess: () => {
            toast.success("تم حذف المنصب بنجاح");
            onSuccess?.();
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء حذف المنصب";
            toast.error(errorMessage);
        },
    });

    const handleDelete = () => {
        if (position) {
            deletePositionMutation.mutate(position.id);
        }
    };

    if (!position) return null;

    const formatSalary = (min: string, max: string) => {
        const minNum = parseFloat(min);
        const maxNum = parseFloat(max);
        return `${minNum.toLocaleString()} - ${maxNum.toLocaleString()} ر.س`;
    };

    return (
        <Dialog open={!!position} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        تأكيد الحذف
                    </DialogTitle>
                    <DialogDescription className="text-right">
                        هل أنت متأكد من أنك تريد حذف المنصب{" "}
                        <span className="font-semibold">{position.title}</span>؟
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
                                <li>سيتم حذف جميع بيانات المنصب نهائياً</li>
                                <li>قد يؤثر هذا على الموظفين المرتبطين بهذا المنصب</li>
                                <li>لا يمكن استرداد هذه البيانات بعد الحذف</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Position Info */}
                <div className="bg-muted/50 border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">{position.title}</p>
                            <p className="text-sm text-muted-foreground">
                                كود: {position.code} • {position.employees_count || 0} موظف
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <DollarSign className="h-3 w-3 text-green-600" />
                                <span className="text-xs text-green-600">
                                    {formatSalary(position.base_salary_min, position.base_salary_max)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={deletePositionMutation.isPending}
                    >
                        <X className="h-4 w-4 ml-2" />
                        إلغاء
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deletePositionMutation.isPending}
                    >
                        {deletePositionMutation.isPending ? (
                            "جاري الحذف..."
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 ml-2" />
                                حذف المنصب
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeletePositionDialog;

