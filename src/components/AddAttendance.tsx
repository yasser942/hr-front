import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, CreateAttendanceData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, X, Clock, User, MapPin, CheckCircle, XCircle, Camera, Image } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const attendanceSchema = z.object({
    employee_id: z.number().min(1, "الموظف مطلوب"),
    check_in_time: z.string().optional(),
    check_out_time: z.string().optional(),
    attendance_type: z.string().optional(),
    notes: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    photo: z.string().optional(),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

interface AddAttendanceProps {
    onSuccess?: () => void;
}

const AddAttendance = ({ onSuccess }: AddAttendanceProps) => {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("manual");

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<AttendanceFormData>({
        resolver: zodResolver(attendanceSchema),
        defaultValues: {
            employee_id: 0,
            check_in_time: "",
            check_out_time: "",
            attendance_type: "regular",
            notes: "",
            latitude: undefined,
            longitude: undefined,
            photo: "",
        },
    });

    // Fetch employees
    const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
        queryKey: ['employees'],
        queryFn: () => apiClient.getEmployees(),
        select: (response) => response.data,
    });

    // Create attendance mutation
    const createAttendanceMutation = useMutation({
        mutationFn: (data: CreateAttendanceData) => apiClient.createAttendance(data),
        onSuccess: (response) => {
            toast.success("تم إنشاء سجل الحضور بنجاح");
            onSuccess?.();
            handleClose();
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء إنشاء سجل الحضور";
            toast.error(errorMessage);
        },
    });

    // Check-in mutation
    const checkInMutation = useMutation({
        mutationFn: ({ employeeId, checkInTime, latitude, longitude, notes }: {
            employeeId: number;
            checkInTime?: string;
            latitude?: number;
            longitude?: number;
            notes?: string;
        }) => apiClient.checkIn(employeeId, checkInTime, latitude, longitude, notes),
        onSuccess: (response) => {
            toast.success("تم تسجيل الدخول بنجاح");
            onSuccess?.();
            handleClose();
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول";
            toast.error(errorMessage);
        },
    });

    // Check-out mutation
    const checkOutMutation = useMutation({
        mutationFn: ({ employeeId, checkOutTime, notes }: {
            employeeId: number;
            checkOutTime?: string;
            notes?: string;
        }) => apiClient.checkOut(employeeId, checkOutTime, notes),
        onSuccess: (response) => {
            toast.success("تم تسجيل الخروج بنجاح");
            onSuccess?.();
            handleClose();
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء تسجيل الخروج";
            toast.error(errorMessage);
        },
    });

    const onSubmit = (data: AttendanceFormData) => {
        const cleanedData: CreateAttendanceData = {
            employee_id: data.employee_id,
            check_in_time: data.check_in_time || undefined,
            check_out_time: data.check_out_time || undefined,
            attendance_type: data.attendance_type || "regular",
            notes: data.notes || undefined,
            latitude: data.latitude || undefined,
            longitude: data.longitude || undefined,
        };

        createAttendanceMutation.mutate(cleanedData);
    };

    const handleCheckIn = (data: AttendanceFormData) => {
        checkInMutation.mutate({
            employeeId: data.employee_id,
            checkInTime: data.check_in_time,
            latitude: data.latitude,
            longitude: data.longitude,
            notes: data.notes,
            photo: data.photo,
        });
    };

    const handleCheckOut = (data: AttendanceFormData) => {
        checkOutMutation.mutate({
            employeeId: data.employee_id,
            checkOutTime: data.check_out_time,
            notes: data.notes,
            photo: data.photo,
        });
    };

    const handleClose = () => {
        reset();
        setActiveTab("manual");
        setOpen(false);
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setValue("latitude", position.coords.latitude);
                    setValue("longitude", position.coords.longitude);
                    toast.success("تم الحصول على الموقع الحالي");
                },
                (error) => {
                    toast.error("فشل في الحصول على الموقع");
                }
            );
        } else {
            toast.error("المتصفح لا يدعم تحديد الموقع");
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("يرجى اختيار ملف صورة صالح");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setValue("photo", result);
                toast.success("تم رفع الصورة بنجاح");
            };
            reader.onerror = () => {
                toast.error("فشل في قراءة الصورة");
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setValue("photo", "");
        toast.success("تم حذف الصورة");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة سجل حضور
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        إضافة سجل حضور جديد
                    </DialogTitle>
                    <DialogDescription>
                        أدخل بيانات سجل الحضور الجديد في النموذج أدناه
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="manual">إدخال يدوي</TabsTrigger>
                        <TabsTrigger value="checkin">تسجيل دخول</TabsTrigger>
                        <TabsTrigger value="checkout">تسجيل خروج</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="space-y-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                                        {employeesData?.employees?.map((employee) => (
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="check_in_time">وقت الدخول</Label>
                                    <Input
                                        id="check_in_time"
                                        type="datetime-local"
                                        {...register("check_in_time")}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="check_out_time">وقت الخروج</Label>
                                    <Input
                                        id="check_out_time"
                                        type="datetime-local"
                                        {...register("check_out_time")}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="attendance_type">نوع الحضور</Label>
                                <Select
                                    value={watch("attendance_type") || "regular"}
                                    onValueChange={(value) => setValue("attendance_type", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر نوع الحضور" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="regular">عادي</SelectItem>
                                        <SelectItem value="late">متأخر</SelectItem>
                                        <SelectItem value="overtime">إضافي</SelectItem>
                                        <SelectItem value="remote">عن بُعد</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">ملاحظات</Label>
                                <Textarea
                                    id="notes"
                                    {...register("notes")}
                                    placeholder="أي ملاحظات إضافية..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={handleClose}>
                                    <X className="h-4 w-4 ml-2" />
                                    إلغاء
                                </Button>
                                <Button type="submit" disabled={createAttendanceMutation.isPending || isLoadingEmployees}>
                                    {createAttendanceMutation.isPending ? "جاري الحفظ..." : "حفظ سجل الحضور"}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="checkin" className="space-y-6">
                        <form onSubmit={handleSubmit(handleCheckIn)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="employee_id_checkin" className="flex items-center gap-2">
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
                                        {employeesData?.employees?.map((employee) => (
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
                                <Label htmlFor="check_in_time_checkin">وقت الدخول</Label>
                                <Input
                                    id="check_in_time_checkin"
                                    type="datetime-local"
                                    {...register("check_in_time")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    الموقع
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="خط العرض"
                                        type="number"
                                        step="any"
                                        {...register("latitude", { valueAsNumber: true })}
                                    />
                                    <Input
                                        placeholder="خط الطول"
                                        type="number"
                                        step="any"
                                        {...register("longitude", { valueAsNumber: true })}
                                    />
                                    <Button type="button" variant="outline" onClick={getCurrentLocation}>
                                        <MapPin className="h-4 w-4" />
                                    </Button>
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

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Camera className="h-4 w-4" />
                                    صورة تسجيل الدخول
                                </Label>
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="checkin-photo"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('checkin-photo')?.click()}
                                            className="flex items-center gap-2"
                                        >
                                            <Camera className="h-4 w-4" />
                                            اختيار صورة
                                        </Button>
                                        {watch("photo") && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={removeImage}
                                                className="text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                                حذف الصورة
                                            </Button>
                                        )}
                                    </div>
                                    {watch("photo") && (
                                        <div className="mt-2">
                                            <img
                                                src={watch("photo")}
                                                alt="Check-in photo preview"
                                                className="w-32 h-32 object-cover rounded-lg border"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={handleClose}>
                                    <X className="h-4 w-4 ml-2" />
                                    إلغاء
                                </Button>
                                <Button type="submit" disabled={checkInMutation.isPending || isLoadingEmployees}>
                                    {checkInMutation.isPending ? "جاري التسجيل..." : (
                                        <>
                                            <CheckCircle className="h-4 w-4 ml-2" />
                                            تسجيل الدخول
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="checkout" className="space-y-6">
                        <form onSubmit={handleSubmit(handleCheckOut)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="employee_id_checkout" className="flex items-center gap-2">
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
                                        {employeesData?.employees?.map((employee) => (
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
                                <Label htmlFor="check_out_time_checkout">وقت الخروج</Label>
                                <Input
                                    id="check_out_time_checkout"
                                    type="datetime-local"
                                    {...register("check_out_time")}
                                />
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

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Camera className="h-4 w-4" />
                                    صورة تسجيل الخروج
                                </Label>
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="checkout-photo"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('checkout-photo')?.click()}
                                            className="flex items-center gap-2"
                                        >
                                            <Camera className="h-4 w-4" />
                                            اختيار صورة
                                        </Button>
                                        {watch("photo") && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={removeImage}
                                                className="text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                                حذف الصورة
                                            </Button>
                                        )}
                                    </div>
                                    {watch("photo") && (
                                        <div className="mt-2">
                                            <img
                                                src={watch("photo")}
                                                alt="Check-out photo preview"
                                                className="w-32 h-32 object-cover rounded-lg border"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={handleClose}>
                                    <X className="h-4 w-4 ml-2" />
                                    إلغاء
                                </Button>
                                <Button type="submit" disabled={checkOutMutation.isPending || isLoadingEmployees}>
                                    {checkOutMutation.isPending ? "جاري التسجيل..." : (
                                        <>
                                            <XCircle className="h-4 w-4 ml-2" />
                                            تسجيل الخروج
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default AddAttendance;
