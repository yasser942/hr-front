import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient, LeaveRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, X, Calendar, User, Building2, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ApproveLeaveRequestDialogProps {
    leaveRequest: LeaveRequest | null;
    onClose: () => void;
    onSuccess?: () => void;
}

const ApproveLeaveRequestDialog = ({ leaveRequest, onClose, onSuccess }: ApproveLeaveRequestDialogProps) => {
    const [approveNotes, setApproveNotes] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");

    const approveLeaveRequestMutation = useMutation({
        mutationFn: (notes: string) => apiClient.approveLeaveRequest(leaveRequest!.id, notes),
        onSuccess: () => {
            toast.success("تم الموافقة على طلب الإجازة بنجاح");
            onSuccess?.();
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء الموافقة على طلب الإجازة";
            toast.error(errorMessage);
        },
    });

    const rejectLeaveRequestMutation = useMutation({
        mutationFn: (reason: string) => apiClient.rejectLeaveRequest(leaveRequest!.id, reason),
        onSuccess: () => {
            toast.success("تم رفض طلب الإجازة بنجاح");
            onSuccess?.();
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء رفض طلب الإجازة";
            toast.error(errorMessage);
        },
    });

    const handleApprove = () => {
        if (leaveRequest) {
            approveLeaveRequestMutation.mutate(approveNotes);
        }
    };

    const handleReject = () => {
        if (leaveRequest && rejectionReason.trim()) {
            rejectLeaveRequestMutation.mutate(rejectionReason);
        } else {
            toast.error("يرجى إدخال سبب الرفض");
        }
    };

    if (!leaveRequest) return null;

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
    };

    const getLeaveTypeLabel = (leaveType: string) => {
        const leaveTypes: Record<string, string> = {
            annual: "إجازة سنوية",
            sick: "إجازة مرضية",
            personal: "إجازة شخصية",
            maternity: "إجازة أمومة",
            paternity: "إجازة أبوة",
            bereavement: "إجازة حداد",
            unpaid: "إجازة غير مدفوعة",
            medical_appointment: "موعد طبي",
            emergency: "إجازة طوارئ",
            training: "إجازة تدريب",
            other: "أخرى",
        };
        return leaveTypes[leaveType] || leaveType;
    };

    return (
        <Dialog open={!!leaveRequest} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        مراجعة طلب الإجازة
                    </DialogTitle>
                    <DialogDescription>
                        مراجعة طلب الإجازة واتخاذ قرار بالموافقة أو الرفض
                    </DialogDescription>
                </DialogHeader>

                {/* Leave Request Info */}
                <div className="bg-muted/50 border rounded-lg p-4 space-y-4">
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

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium">نوع الإجازة:</span>
                            <p className="text-muted-foreground">{getLeaveTypeLabel(leaveRequest.leave_type)}</p>
                        </div>
                        <div>
                            <span className="font-medium">المدة:</span>
                            <p className="text-muted-foreground">{leaveRequest.total_days} يوم</p>
                        </div>
                        <div>
                            <span className="font-medium">تاريخ البداية:</span>
                            <p className="text-muted-foreground">{formatDate(leaveRequest.start_date)}</p>
                        </div>
                        <div>
                            <span className="font-medium">تاريخ النهاية:</span>
                            <p className="text-muted-foreground">{formatDate(leaveRequest.end_date)}</p>
                        </div>
                    </div>

                    <div>
                        <span className="font-medium">السبب:</span>
                        <p className="text-muted-foreground mt-1">{leaveRequest.reason}</p>
                    </div>

                    {leaveRequest.notes && (
                        <div>
                            <span className="font-medium">ملاحظات:</span>
                            <p className="text-muted-foreground mt-1">{leaveRequest.notes}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>تاريخ الطلب: {format(new Date(leaveRequest.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}</span>
                    </div>
                </div>

                {/* Action Tabs */}
                <Tabs defaultValue="approve" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="approve" className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            موافقة
                        </TabsTrigger>
                        <TabsTrigger value="reject" className="flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            رفض
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="approve" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="approve-notes">ملاحظات الموافقة (اختياري)</Label>
                            <Textarea
                                id="approve-notes"
                                value={approveNotes}
                                onChange={(e) => setApproveNotes(e.target.value)}
                                placeholder="أي ملاحظات إضافية حول الموافقة..."
                                rows={3}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="reject" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejection-reason">سبب الرفض *</Label>
                            <Textarea
                                id="rejection-reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="أدخل سبب رفض طلب الإجازة..."
                                rows={3}
                                className={!rejectionReason.trim() ? "border-destructive" : ""}
                            />
                            {!rejectionReason.trim() && (
                                <p className="text-sm text-destructive">سبب الرفض مطلوب</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={approveLeaveRequestMutation.isPending || rejectLeaveRequestMutation.isPending}
                    >
                        <X className="h-4 w-4 ml-2" />
                        إلغاء
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleReject}
                        disabled={approveLeaveRequestMutation.isPending || rejectLeaveRequestMutation.isPending || !rejectionReason.trim()}
                    >
                        {rejectLeaveRequestMutation.isPending ? (
                            "جاري الرفض..."
                        ) : (
                            <>
                                <XCircle className="h-4 w-4 ml-2" />
                                رفض الطلب
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleApprove}
                        disabled={approveLeaveRequestMutation.isPending || rejectLeaveRequestMutation.isPending}
                    >
                        {approveLeaveRequestMutation.isPending ? (
                            "جاري الموافقة..."
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 ml-2" />
                                الموافقة على الطلب
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ApproveLeaveRequestDialog;

