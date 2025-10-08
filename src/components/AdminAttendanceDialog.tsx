import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, Employee } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { X, Clock, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const adminAttendanceSchema = z.object({
    employee_id: z.number().min(1, "الموظف مطلوب"),
    date: z.date({
        required_error: "التاريخ مطلوب",
    }),
    time: z.string().min(1, "الوقت مطلوب"),
    notes: z.string().optional(),
});

type AdminAttendanceFormData = z.infer<typeof adminAttendanceSchema>;

interface AdminAttendanceDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const AdminAttendanceDialog = ({ isOpen, onClose, onSuccess }: AdminAttendanceDialogProps) => {
    const [activeTab, setActiveTab] = useState("checkin");
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AdminAttendanceFormData>({
        resolver: zodResolver(adminAttendanceSchema),
        defaultValues: {
            employee_id: 0,
            date: new Date(), // Today's date
            time: new Date().toTimeString().slice(0, 5), // Current time
            notes: "",
        },
    });

    // Fetch employees
    const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
        queryKey: ['employees'],
        queryFn: () => apiClient.getEmployees(),
        select: (response) => response.data,
    });

    // Admin check-in mutation
    const adminCheckInMutation = useMutation({
        mutationFn: (data: AdminAttendanceFormData) =>
            apiClient.adminCheckIn(data.employee_id, data.date.toISOString().split('T')[0], data.time, data.notes),
        onSuccess: () => {
            toast.success("تم تسجيل الدخول بنجاح");
            queryClient.invalidateQueries({ queryKey: ['attendances'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-statistics'] });
            queryClient.invalidateQueries({ queryKey: ['today-stats'] });
            handleClose();
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.msg || "حدث خطأ أثناء تسجيل الدخول");
        },
    });

    // Admin check-out mutation
    const adminCheckOutMutation = useMutation({
        mutationFn: (data: AdminAttendanceFormData) =>
            apiClient.adminCheckOut(data.employee_id, data.date.toISOString().split('T')[0], data.time, data.notes),
        onSuccess: () => {
            toast.success("تم تسجيل الخروج بنجاح");
            queryClient.invalidateQueries({ queryKey: ['attendances'] });
            queryClient.invalidateQueries({ queryKey: ['attendance-statistics'] });
            queryClient.invalidateQueries({ queryKey: ['today-stats'] });
            handleClose();
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.msg || "حدث خطأ أثناء تسجيل الخروج");
        },
    });

    const handleCheckIn = (data: AdminAttendanceFormData) => {
        adminCheckInMutation.mutate(data);
    };

    const handleCheckOut = (data: AdminAttendanceFormData) => {
        adminCheckOutMutation.mutate(data);
    };

    const handleClose = () => {
        reset();
        setActiveTab("checkin");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        إدارة الحضور - صلاحيات الإدارة
                    </DialogTitle>
                    <DialogDescription className="text-right">
                        تسجيل دخول أو خروج الموظفين بواسطة الإدارة مع إمكانية تحديد التاريخ والوقت
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="checkin" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            تسجيل الدخول
                        </TabsTrigger>
                        <TabsTrigger value="checkout" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            تسجيل الخروج
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="checkin" className="space-y-4">
                        <form onSubmit={handleSubmit(handleCheckIn)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="employee_checkin">الموظف *</Label>
                                <Select
                                    value={watch("employee_id")?.toString() || ""}
                                    onValueChange={(value) => setValue("employee_id", parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر الموظف" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingEmployees ? (
                                            <SelectItem value="" disabled>جاري التحميل...</SelectItem>
                                        ) : (
                                            employeesData?.employees?.map((employee) => (
                                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                                    {employee.user?.name || "غير محدد"} ({employee.employee_id || "غير محدد"})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.employee_id && (
                                    <p className="text-sm text-destructive">{errors.employee_id.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date_checkin">التاريخ *</Label>
                                    <DatePicker
                                        id="date_checkin"
                                        value={watch("date")}
                                        onChange={(date) => setValue("date", date || new Date())}
                                        placeholder="اختر التاريخ"
                                    />
                                    {errors.date && (
                                        <p className="text-sm text-destructive">{errors.date.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="time_checkin">الوقت *</Label>
                                    <Input
                                        id="time_checkin"
                                        type="time"
                                        {...register("time")}
                                    />
                                    {errors.time && (
                                        <p className="text-sm text-destructive">{errors.time.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes_checkin">ملاحظات</Label>
                                <Textarea
                                    id="notes_checkin"
                                    {...register("notes")}
                                    placeholder="أي ملاحظات حول تسجيل الدخول..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-2">
                                <Button type="button" variant="outline" onClick={handleClose}>
                                    <X className="h-4 w-4 ml-2" />
                                    إلغاء
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={adminCheckInMutation.isPending}
                                    className="flex items-center gap-2"
                                >
                                    <Clock className="h-4 w-4" />
                                    {adminCheckInMutation.isPending ? "جاري التسجيل..." : "تسجيل الدخول"}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="checkout" className="space-y-4">
                        <form onSubmit={handleSubmit(handleCheckOut)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="employee_checkout">الموظف *</Label>
                                <Select
                                    value={watch("employee_id")?.toString() || ""}
                                    onValueChange={(value) => setValue("employee_id", parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر الموظف" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingEmployees ? (
                                            <SelectItem value="" disabled>جاري التحميل...</SelectItem>
                                        ) : (
                                            employeesData?.employees?.map((employee) => (
                                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                                    {employee.user?.name || "غير محدد"} ({employee.employee_id || "غير محدد"})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.employee_id && (
                                    <p className="text-sm text-destructive">{errors.employee_id.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date_checkout">التاريخ *</Label>
                                    <DatePicker
                                        id="date_checkout"
                                        value={watch("date")}
                                        onChange={(date) => setValue("date", date || new Date())}
                                        placeholder="اختر التاريخ"
                                    />
                                    {errors.date && (
                                        <p className="text-sm text-destructive">{errors.date.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="time_checkout">الوقت *</Label>
                                    <Input
                                        id="time_checkout"
                                        type="time"
                                        {...register("time")}
                                    />
                                    {errors.time && (
                                        <p className="text-sm text-destructive">{errors.time.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes_checkout">ملاحظات</Label>
                                <Textarea
                                    id="notes_checkout"
                                    {...register("notes")}
                                    placeholder="أي ملاحظات حول تسجيل الخروج..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-2">
                                <Button type="button" variant="outline" onClick={handleClose}>
                                    <X className="h-4 w-4 ml-2" />
                                    إلغاء
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={adminCheckOutMutation.isPending}
                                    className="flex items-center gap-2"
                                >
                                    <Clock className="h-4 w-4" />
                                    {adminCheckOutMutation.isPending ? "جاري التسجيل..." : "تسجيل الخروج"}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default AdminAttendanceDialog;
