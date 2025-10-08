import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, CreateEmployeeData, Employee } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, User, Briefcase, Phone, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const employeeSchema = z.object({
    // User Information
    name: z.string().min(1, "اسم الموظف مطلوب"),
    email: z.string().email("البريد الإلكتروني غير صحيح"),
    username: z.string().min(1, "اسم المستخدم مطلوب"),
    password: z.string().optional(),
    phone: z.string().optional(),
    city_id: z.number().min(1, "المدينة مطلوبة"),
    branch_id: z.number().min(1, "الفرع مطلوب"),
    level: z.string().optional(),
    status: z.string().optional(),

    // Employee Information
    department_id: z.number().min(1, "القسم مطلوب"),
    position_id: z.number().min(1, "المنصب مطلوب"),
    hire_date: z.string().min(1, "تاريخ التوظيف مطلوب"),
    employment_type: z.string().min(1, "نوع التوظيف مطلوب"),
    is_active: z.boolean().optional(),

    // Optional Employee Details
    salary: z.number().optional(),
    work_schedule: z.string().optional(),
    supervisor_id: z.number().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    emergency_contact_relationship: z.string().optional(),
    bank_account_number: z.string().optional(),
    tax_id: z.string().optional(),
    notes: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EditEmployeeProps {
    employee: Employee;
    onSuccess?: () => void;
    onClose: () => void;
}

const EditEmployee = ({ employee, onSuccess, onClose }: EditEmployeeProps) => {
    const [activeTab, setActiveTab] = useState("basic");

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<EmployeeFormData>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            name: employee.user?.name || "",
            email: employee.user?.email || "",
            username: employee.user?.username || "",
            password: "",
            phone: employee.user?.phone || "",
            city_id: employee.user?.city?.id || 0,
            branch_id: employee.user?.branch?.id || 0,
            level: employee.user?.level || "staff",
            status: employee.user?.status || "active",
            department_id: employee.department?.id || 0,
            position_id: employee.position?.id || 0,
            hire_date: employee.hire_date ? new Date(employee.hire_date).toISOString().split('T')[0] : "",
            employment_type: employee.employment_type || "full_time",
            is_active: employee.is_active ?? true,
            salary: employee.salary || undefined,
            work_schedule: employee.work_schedule || "",
            supervisor_id: employee.supervisor?.id || undefined,
            emergency_contact_name: employee.emergency_contact_name || "",
            emergency_contact_phone: employee.emergency_contact_phone || "",
            emergency_contact_relationship: employee.emergency_contact_relationship || "",
            bank_account_number: employee.bank_account_number || "",
            tax_id: employee.tax_id || "",
            notes: employee.notes || "",
        },
    });

    // Fetch filter options
    const { data: filterOptions, isLoading: filterOptionsLoading } = useQuery({
        queryKey: ['employee-filter-options'],
        queryFn: () => apiClient.getEmployeeFilterOptions(),
        select: (response) => response.data,
    });

    // Update employee mutation
    const updateEmployeeMutation = useMutation({
        mutationFn: (data: CreateEmployeeData) => apiClient.updateEmployee(employee.id, data),
        onSuccess: (response) => {
            toast.success("تم تحديث الموظف بنجاح");
            onSuccess?.();
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء تحديث الموظف";
            toast.error(errorMessage);
        },
    });

    const onSubmit = (data: EmployeeFormData) => {
        // Clean up undefined values and convert to proper types
        const cleanedData: CreateEmployeeData = {
            name: data.name,
            email: data.email,
            username: data.username,
            password: data.password || undefined,
            phone: data.phone || undefined,
            city_id: data.city_id,
            branch_id: data.branch_id,
            level: data.level || "staff",
            status: data.status || "active",
            department_id: data.department_id,
            position_id: data.position_id,
            hire_date: data.hire_date,
            employment_type: data.employment_type,
            is_active: data.is_active ?? true,
            salary: data.salary || undefined,
            work_schedule: data.work_schedule || undefined,
            supervisor_id: data.supervisor_id || undefined,
            emergency_contact_name: data.emergency_contact_name || undefined,
            emergency_contact_phone: data.emergency_contact_phone || undefined,
            emergency_contact_relationship: data.emergency_contact_relationship || undefined,
            bank_account_number: data.bank_account_number || undefined,
            tax_id: data.tax_id || undefined,
            notes: data.notes || undefined,
        };

        updateEmployeeMutation.mutate(cleanedData);
    };

    const handleClose = () => {
        reset();
        onClose();
        setActiveTab("basic");
    };

    // Employment type options
    const employmentTypes = [
        { value: "full_time", label: "دوام كامل" },
        { value: "part_time", label: "دوام جزئي" },
        { value: "contract", label: "عقد مؤقت" },
        { value: "intern", label: "متدرب" },
    ];

    // User level options
    const levels = [
        { value: "admin", label: "مدير عام" },
        { value: "branch", label: "مدير فرع" },
        { value: "staff", label: "موظف" },
        { value: "driver", label: "سائق" },
        { value: "store", label: "مخزن" },
        { value: "user", label: "مستخدم" },
    ];

    // Status options
    const statusOptions = [
        { value: "active", label: "نشط" },
        { value: "inactive", label: "غير نشط" },
    ];

    return (
        <Dialog open={true} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        تعديل بيانات الموظف
                    </DialogTitle>
                    <DialogDescription>
                        قم بتحديث بيانات الموظف في النموذج أدناه
                    </DialogDescription>
                </DialogHeader>

                {filterOptionsLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p>جاري تحميل البيانات...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
                                <TabsTrigger value="work">بيانات العمل</TabsTrigger>
                                <TabsTrigger value="contact">معلومات الاتصال</TabsTrigger>
                                <TabsTrigger value="additional">بيانات إضافية</TabsTrigger>
                            </TabsList>

                            {/* Basic Information Tab */}
                            <TabsContent value="basic" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            البيانات الشخصية
                                        </CardTitle>
                                        <CardDescription>
                                            المعلومات الأساسية للموظف
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">اسم الموظف *</Label>
                                                <Input
                                                    id="name"
                                                    {...register("name")}
                                                    className={errors.name ? "border-destructive" : ""}
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">البريد الإلكتروني *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    {...register("email")}
                                                    className={errors.email ? "border-destructive" : ""}
                                                />
                                                {errors.email && (
                                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="username">اسم المستخدم *</Label>
                                                <Input
                                                    id="username"
                                                    {...register("username")}
                                                    className={errors.username ? "border-destructive" : ""}
                                                />
                                                {errors.username && (
                                                    <p className="text-sm text-destructive">{errors.username.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password">كلمة المرور الجديدة</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    {...register("password")}
                                                    placeholder="اتركها فارغة للحفاظ على كلمة المرور الحالية"
                                                />
                                                {errors.password && (
                                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone">رقم الهاتف</Label>
                                                <Input
                                                    id="phone"
                                                    {...register("phone")}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="level">مستوى المستخدم</Label>
                                                <Select
                                                    value={watch("level") || ""}
                                                    onValueChange={(value) => setValue("level", value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="اختر مستوى المستخدم" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {levels.map((level) => (
                                                            <SelectItem key={level.value} value={level.value}>
                                                                {level.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Work Information Tab */}
                            <TabsContent value="work" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5" />
                                            بيانات العمل
                                        </CardTitle>
                                        <CardDescription>
                                            معلومات العمل والوظيفة
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="department_id">القسم *</Label>
                                                <Select
                                                    value={watch("department_id")?.toString() || ""}
                                                    onValueChange={(value) => setValue("department_id", parseInt(value))}
                                                >
                                                    <SelectTrigger className={errors.department_id ? "border-destructive" : ""}>
                                                        <SelectValue placeholder="اختر القسم" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filterOptions?.departments?.map((dept: any) => (
                                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                {dept.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.department_id && (
                                                    <p className="text-sm text-destructive">{errors.department_id.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="position_id">المنصب *</Label>
                                                <Select
                                                    value={watch("position_id")?.toString() || ""}
                                                    onValueChange={(value) => setValue("position_id", parseInt(value))}
                                                >
                                                    <SelectTrigger className={errors.position_id ? "border-destructive" : ""}>
                                                        <SelectValue placeholder="اختر المنصب" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filterOptions?.positions?.map((pos: any) => (
                                                            <SelectItem key={pos.id} value={pos.id.toString()}>
                                                                {pos.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.position_id && (
                                                    <p className="text-sm text-destructive">{errors.position_id.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="city_id">المدينة *</Label>
                                                <Select
                                                    value={watch("city_id")?.toString() || ""}
                                                    onValueChange={(value) => setValue("city_id", parseInt(value))}
                                                >
                                                    <SelectTrigger className={errors.city_id ? "border-destructive" : ""}>
                                                        <SelectValue placeholder="اختر المدينة" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filterOptions?.cities?.map((city: any) => (
                                                            <SelectItem key={city.id} value={city.id.toString()}>
                                                                {city.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.city_id && (
                                                    <p className="text-sm text-destructive">{errors.city_id.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="branch_id">الفرع *</Label>
                                                <Select
                                                    value={watch("branch_id")?.toString() || ""}
                                                    onValueChange={(value) => setValue("branch_id", parseInt(value))}
                                                >
                                                    <SelectTrigger className={errors.branch_id ? "border-destructive" : ""}>
                                                        <SelectValue placeholder="اختر الفرع" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filterOptions?.branches?.map((branch: any) => (
                                                            <SelectItem key={branch.id} value={branch.id.toString()}>
                                                                {branch.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.branch_id && (
                                                    <p className="text-sm text-destructive">{errors.branch_id.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="hire_date">تاريخ التوظيف *</Label>
                                                <Input
                                                    id="hire_date"
                                                    type="date"
                                                    {...register("hire_date")}
                                                    className={errors.hire_date ? "border-destructive" : ""}
                                                />
                                                {errors.hire_date && (
                                                    <p className="text-sm text-destructive">{errors.hire_date.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="employment_type">نوع التوظيف *</Label>
                                                <Select
                                                    value={watch("employment_type") || ""}
                                                    onValueChange={(value) => setValue("employment_type", value)}
                                                >
                                                    <SelectTrigger className={errors.employment_type ? "border-destructive" : ""}>
                                                        <SelectValue placeholder="اختر نوع التوظيف" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {employmentTypes.map((type) => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                {type.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.employment_type && (
                                                    <p className="text-sm text-destructive">{errors.employment_type.message}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="salary">الراتب</Label>
                                                <Input
                                                    id="salary"
                                                    type="number"
                                                    {...register("salary", { valueAsNumber: true })}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="work_schedule">جدول العمل</Label>
                                                <Input
                                                    id="work_schedule"
                                                    {...register("work_schedule")}
                                                    placeholder="مثال: 8:00 ص - 5:00 م"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Contact Information Tab */}
                            <TabsContent value="contact" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Phone className="h-5 w-5" />
                                            معلومات الاتصال
                                        </CardTitle>
                                        <CardDescription>
                                            معلومات الاتصال الطارئ والمشرف
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="emergency_contact_name">اسم جهة الاتصال الطارئ</Label>
                                                <Input
                                                    id="emergency_contact_name"
                                                    {...register("emergency_contact_name")}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="emergency_contact_phone">رقم جهة الاتصال الطارئ</Label>
                                                <Input
                                                    id="emergency_contact_phone"
                                                    {...register("emergency_contact_phone")}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="emergency_contact_relationship">صلة القرابة</Label>
                                                <Input
                                                    id="emergency_contact_relationship"
                                                    {...register("emergency_contact_relationship")}
                                                    placeholder="مثال: زوج، أخ، أخت"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="supervisor_id">المشرف</Label>
                                                <Select
                                                    value={watch("supervisor_id")?.toString() || "none"}
                                                    onValueChange={(value) => setValue("supervisor_id", value === "none" ? undefined : parseInt(value))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="اختر المشرف" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">لا يوجد مشرف</SelectItem>
                                                        {/* Add supervisor options here */}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Additional Information Tab */}
                            <TabsContent value="additional" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5" />
                                            بيانات إضافية
                                        </CardTitle>
                                        <CardDescription>
                                            معلومات مالية وإضافية
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="bank_account_number">رقم الحساب البنكي</Label>
                                                <Input
                                                    id="bank_account_number"
                                                    {...register("bank_account_number")}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="tax_id">الرقم الضريبي</Label>
                                                <Input
                                                    id="tax_id"
                                                    {...register("tax_id")}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="status">الحالة</Label>
                                                <Select
                                                    value={watch("status") || ""}
                                                    onValueChange={(value) => setValue("status", value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="اختر الحالة" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map((status) => (
                                                            <SelectItem key={status.value} value={status.value}>
                                                                {status.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="is_active">نشط</Label>
                                                <Select
                                                    value={watch("is_active")?.toString() || "true"}
                                                    onValueChange={(value) => setValue("is_active", value === "true")}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="اختر الحالة" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="true">نشط</SelectItem>
                                                        <SelectItem value="false">غير نشط</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="notes">ملاحظات</Label>
                                            <Textarea
                                                id="notes"
                                                {...register("notes")}
                                                placeholder="أي ملاحظات إضافية..."
                                                rows={4}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                <X className="h-4 w-4 ml-2" />
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={updateEmployeeMutation.isPending}>
                                {updateEmployeeMutation.isPending ? "جاري التحديث..." : "تحديث الموظف"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default EditEmployee;
