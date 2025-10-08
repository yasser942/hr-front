import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, CreateEmployeeData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, User, Briefcase, Phone, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const employeeSchema = z.object({
    // User Information
    name: z.string().min(1, "اسم الموظف مطلوب"),
    email: z.string().email("البريد الإلكتروني غير صحيح"),
    username: z.string().min(1, "اسم المستخدم مطلوب"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
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

interface AddEmployeeProps {
    onSuccess?: () => void;
}

const AddEmployee = ({ onSuccess }: AddEmployeeProps) => {
    const [open, setOpen] = useState(false);
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
            name: "",
            email: "",
            username: "",
            password: "",
            phone: "",
            city_id: 0,
            branch_id: 0,
            level: "staff",
            status: "active",
            department_id: 0,
            position_id: 0,
            hire_date: "",
            employment_type: "full_time",
            is_active: true,
            salary: undefined,
            work_schedule: "",
            supervisor_id: undefined,
            emergency_contact_name: "",
            emergency_contact_phone: "",
            emergency_contact_relationship: "",
            bank_account_number: "",
            tax_id: "",
            notes: "",
        },
    });

    // Fetch filter options
    const { data: filterOptions, isLoading: filterOptionsLoading } = useQuery({
        queryKey: ['employee-filter-options'],
        queryFn: () => apiClient.getEmployeeFilterOptions(),
        select: (response) => response.data,
    });

    // Create employee mutation
    const createEmployeeMutation = useMutation({
        mutationFn: (data: CreateEmployeeData) => apiClient.createEmployee(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success("تم إنشاء الموظف بنجاح");
                reset();
                setOpen(false);
                onSuccess?.();
            } else {
                toast.error("فشل في إنشاء الموظف");
            }
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء إنشاء الموظف";
            toast.error(errorMessage);
        },
    });

    const onSubmit = (data: EmployeeFormData) => {
        // Clean up undefined values and convert to proper types
        const cleanedData: CreateEmployeeData = {
            name: data.name,
            email: data.email,
            username: data.username,
            password: data.password,
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

        createEmployeeMutation.mutate(cleanedData);
    };

    const handleClose = () => {
        reset();
        setOpen(false);
        setActiveTab("basic");
    };

    const employmentTypes = [
        { value: "full_time", label: "دوام كامل" },
        { value: "part_time", label: "دوام جزئي" },
        { value: "contract", label: "عقد مؤقت" },
        { value: "intern", label: "متدرب" },
    ];

    const levels = [
        { value: "admin", label: "مدير عام" },
        { value: "branch", label: "مدير فرع" },
        { value: "staff", label: "موظف" },
        { value: "driver", label: "سائق" },
        { value: "store", label: "مخزن" },
        { value: "user", label: "مستخدم" },
    ];

    const statusOptions = [
        { value: "active", label: "نشط" },
        { value: "inactive", label: "غير نشط" },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة موظف
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        إضافة موظف جديد
                    </DialogTitle>
                    <DialogDescription>
                        أدخل بيانات الموظف الجديد في النموذج أدناه
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">اسم الموظف *</Label>
                                        <Input
                                            id="name"
                                            {...register("name")}
                                            placeholder="أدخل اسم الموظف"
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
                                            placeholder="أدخل البريد الإلكتروني"
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
                                            placeholder="أدخل اسم المستخدم"
                                            className={errors.username ? "border-destructive" : ""}
                                        />
                                        {errors.username && (
                                            <p className="text-sm text-destructive">{errors.username.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">كلمة المرور *</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            {...register("password")}
                                            placeholder="أدخل كلمة المرور"
                                            className={errors.password ? "border-destructive" : ""}
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
                                            placeholder="أدخل رقم الهاتف"
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
                            </TabsContent>

                            {/* Work Information Tab */}
                            <TabsContent value="work" className="space-y-4">
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
                                            placeholder="أدخل الراتب"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="work_schedule">جدول العمل</Label>
                                        <Input
                                            id="work_schedule"
                                            {...register("work_schedule")}
                                            placeholder="أدخل جدول العمل"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Contact Information Tab */}
                            <TabsContent value="contact" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="emergency_contact_name">اسم جهة الاتصال للطوارئ</Label>
                                        <Input
                                            id="emergency_contact_name"
                                            {...register("emergency_contact_name")}
                                            placeholder="أدخل اسم جهة الاتصال للطوارئ"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="emergency_contact_phone">هاتف جهة الاتصال للطوارئ</Label>
                                        <Input
                                            id="emergency_contact_phone"
                                            {...register("emergency_contact_phone")}
                                            placeholder="أدخل هاتف جهة الاتصال للطوارئ"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="emergency_contact_relationship">صلة جهة الاتصال للطوارئ</Label>
                                        <Input
                                            id="emergency_contact_relationship"
                                            {...register("emergency_contact_relationship")}
                                            placeholder="أدخل صلة جهة الاتصال للطوارئ"
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
                            </TabsContent>

                            {/* Additional Information Tab */}
                            <TabsContent value="additional" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bank_account_number">رقم الحساب البنكي</Label>
                                        <Input
                                            id="bank_account_number"
                                            {...register("bank_account_number")}
                                            placeholder="أدخل رقم الحساب البنكي"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tax_id">الرقم الضريبي</Label>
                                        <Input
                                            id="tax_id"
                                            {...register("tax_id")}
                                            placeholder="أدخل الرقم الضريبي"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="notes">الملاحظات</Label>
                                        <Textarea
                                            id="notes"
                                            {...register("notes")}
                                            placeholder="أدخل أي ملاحظات إضافية"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                <X className="h-4 w-4 ml-2" />
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={createEmployeeMutation.isPending}>
                                {createEmployeeMutation.isPending ? "جاري الحفظ..." : "حفظ الموظف"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AddEmployee;
