import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, CreateLeaveRequestData, LeaveRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { X, Calendar, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const leaveRequestSchema = z.object({
    employee_id: z.number().min(1, "الموظف مطلوب"),
    leave_type: z.string().min(1, "نوع الإجازة مطلوب"),
    start_date: z.date({
        required_error: "تاريخ البداية مطلوب",
    }),
    end_date: z.date({
        required_error: "تاريخ النهاية مطلوب",
    }),
    start_datetime: z.string().optional(),
    end_datetime: z.string().optional(),
    duration_type: z.string().min(1, "نوع المدة مطلوب"),
    reason: z.string().min(1, "السبب مطلوب"),
    notes: z.string().optional(),
}).refine((data) => {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    return endDate >= startDate;
}, {
    message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
    path: ["end_date"],
});

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

interface EditLeaveRequestProps {
    leaveRequest: LeaveRequest;
    onSuccess?: () => void;
    onClose: () => void;
}

const EditLeaveRequest = ({ leaveRequest, onSuccess, onClose }: EditLeaveRequestProps) => {
    const [selectedLeaveType, setSelectedLeaveType] = useState<string>(leaveRequest.leave_type);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<LeaveRequestFormData>({
        resolver: zodResolver(leaveRequestSchema),
        defaultValues: {
            employee_id: leaveRequest.employee_id,
            leave_type: leaveRequest.leave_type,
            start_date: new Date(leaveRequest.start_date.split('T')[0]), // Convert to Date object
            end_date: new Date(leaveRequest.end_date.split('T')[0]), // Convert to Date object
            start_datetime: leaveRequest.start_datetime ? leaveRequest.start_datetime.replace('Z', '') : "",
            end_datetime: leaveRequest.end_datetime ? leaveRequest.end_datetime.replace('Z', '') : "",
            duration_type: leaveRequest.duration_type,
            reason: leaveRequest.reason,
            notes: leaveRequest.notes || "",
        },
    });

    // Fetch filter options
    const { data: filterOptions, isLoading: isLoadingOptions } = useQuery({
        queryKey: ['leave-request-filter-options'],
        queryFn: () => apiClient.getLeaveRequestFilterOptions(),
        select: (response) => response.data,
    });

    // Update leave request mutation
    const updateLeaveRequestMutation = useMutation({
        mutationFn: (data: CreateLeaveRequestData) => apiClient.updateLeaveRequest(leaveRequest.id, data),
        onSuccess: (response) => {
            toast.success("تم تحديث طلب الإجازة بنجاح");
            onSuccess?.();
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء تحديث طلب الإجازة";
            toast.error(errorMessage);
        },
    });

    const onSubmit = (data: LeaveRequestFormData) => {
        const cleanedData: CreateLeaveRequestData = {
            employee_id: data.employee_id,
            leave_type: data.leave_type,
            start_date: data.start_date.toISOString().split('T')[0],
            end_date: data.end_date.toISOString().split('T')[0],
            start_datetime: data.start_datetime || undefined,
            end_datetime: data.end_datetime || undefined,
            duration_type: data.duration_type,
            reason: data.reason,
            notes: data.notes || undefined,
        };

        updateLeaveRequestMutation.mutate(cleanedData);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleLeaveTypeChange = (value: string) => {
        setSelectedLeaveType(value);
        setValue("leave_type", value);

        // Set duration type based on leave type
        const leaveTypeOption = filterOptions?.leave_types?.find(type => type.value === value);
        if (leaveTypeOption?.is_hourly_based) {
            setValue("duration_type", "hours");
        } else {
            setValue("duration_type", "days");
        }
    };

    const isHourlyBased = filterOptions?.leave_types?.find(type => type.value === selectedLeaveType)?.is_hourly_based;

    return (
        <Dialog open={true} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        تعديل طلب الإجازة
                    </DialogTitle>
                    <DialogDescription>
                        قم بتحديث بيانات طلب الإجازة في النموذج أدناه
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="employee_id" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                الموظف *
                            </Label>
                            <Select
                                value={watch("employee_id")?.toString() || ""}
                                onValueChange={(value) => setValue("employee_id", parseInt(value))}
                            >
                                <SelectTrigger className={errors.employee_id ? "border-destructive" : ""}>
                                    <SelectValue placeholder="اختر الموظف" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filterOptions?.employees?.map((employee) => (
                                        <SelectItem key={employee.id} value={employee.id.toString()}>
                                            {employee.user?.name || "غير محدد"} ({employee.employee_id || "غير محدد"})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.employee_id && (
                                <p className="text-sm text-destructive">{errors.employee_id.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="leave_type" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                نوع الإجازة *
                            </Label>
                            <Select
                                value={watch("leave_type") || ""}
                                onValueChange={handleLeaveTypeChange}
                            >
                                <SelectTrigger className={errors.leave_type ? "border-destructive" : ""}>
                                    <SelectValue placeholder="اختر نوع الإجازة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filterOptions?.leave_types?.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.arabic_label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.leave_type && (
                                <p className="text-sm text-destructive">{errors.leave_type.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">تاريخ البداية *</Label>
                            <DatePicker
                                id="start_date"
                                value={watch("start_date")}
                                onChange={(date) => setValue("start_date", date || new Date())}
                                placeholder="اختر تاريخ البداية"
                            />
                            {errors.start_date && (
                                <p className="text-sm text-destructive">{errors.start_date.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_date">تاريخ النهاية *</Label>
                            <DatePicker
                                id="end_date"
                                value={watch("end_date")}
                                onChange={(date) => setValue("end_date", date || new Date())}
                                placeholder="اختر تاريخ النهاية"
                            />
                            {errors.end_date && (
                                <p className="text-sm text-destructive">{errors.end_date.message}</p>
                            )}
                        </div>
                    </div>

                    {isHourlyBased && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_datetime" className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    وقت البداية
                                </Label>
                                <Input
                                    id="start_datetime"
                                    type="datetime-local"
                                    {...register("start_datetime")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_datetime" className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    وقت النهاية
                                </Label>
                                <Input
                                    id="end_datetime"
                                    type="datetime-local"
                                    {...register("end_datetime")}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="reason">السبب *</Label>
                        <Textarea
                            id="reason"
                            {...register("reason")}
                            className={errors.reason ? "border-destructive" : ""}
                            placeholder="أدخل سبب طلب الإجازة..."
                            rows={3}
                        />
                        {errors.reason && (
                            <p className="text-sm text-destructive">{errors.reason.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">ملاحظات إضافية</Label>
                        <Textarea
                            id="notes"
                            {...register("notes")}
                            placeholder="أي ملاحظات إضافية..."
                            rows={2}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            <X className="h-4 w-4 ml-2" />
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={updateLeaveRequestMutation.isPending || isLoadingOptions}>
                            {updateLeaveRequestMutation.isPending ? "جاري التحديث..." : "تحديث طلب الإجازة"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditLeaveRequest;
