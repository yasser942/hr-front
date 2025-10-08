import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, X } from "lucide-react";
import { Attendance } from "@/lib/api";

interface DeleteAttendanceDialogProps {
    attendance: Attendance | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

const DeleteAttendanceDialog = ({
    attendance,
    isOpen,
    onClose,
    onConfirm,
    isLoading = false
}: DeleteAttendanceDialogProps) => {
    if (!attendance) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        تأكيد الحذف
                    </DialogTitle>
                    <DialogDescription className="text-right">
                        هل أنت متأكد من أنك تريد حذف سجل الحضور هذا؟ هذا الإجراء لا يمكن التراجع عنه.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">تفاصيل سجل الحضور:</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                            <p><strong>الموظف:</strong> {attendance.employee?.name || "غير محدد"}</p>
                            <p><strong>التاريخ:</strong> {attendance.date}</p>
                            <p><strong>وقت الدخول:</strong> {attendance.check_in_time || "غير محدد"}</p>
                            <p><strong>وقت الخروج:</strong> {attendance.check_out_time || "غير محدد"}</p>
                            {attendance.notes && (
                                <p><strong>ملاحظات:</strong> {attendance.notes}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4 ml-2" />
                            إلغاء
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? "جاري الحذف..." : "حذف"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteAttendanceDialog;
