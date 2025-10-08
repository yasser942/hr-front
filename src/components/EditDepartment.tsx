import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient, CreateDepartmentData, Department } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const departmentSchema = z.object({
    name: z.string().min(1, "اسم القسم مطلوب"),
    code: z.string().min(1, "كود القسم مطلوب").max(10, "كود القسم يجب أن يكون أقل من 10 أحرف"),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface EditDepartmentProps {
    department: Department;
    onSuccess?: () => void;
    onClose: () => void;
}

const EditDepartment = ({ department, onSuccess, onClose }: EditDepartmentProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<DepartmentFormData>({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            name: department.name,
            code: department.code,
            description: department.description || "",
            is_active: department.is_active,
        },
    });

    // Update department mutation
    const updateDepartmentMutation = useMutation({
        mutationFn: (data: CreateDepartmentData) => apiClient.updateDepartment(department.id, data),
        onSuccess: (response) => {
            toast.success("تم تحديث القسم بنجاح");
            onSuccess?.();
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء تحديث القسم";
            toast.error(errorMessage);
        },
    });

    const onSubmit = (data: DepartmentFormData) => {
        const cleanedData: CreateDepartmentData = {
            name: data.name,
            code: data.code.toUpperCase(), // Convert to uppercase
            description: data.description || undefined,
            is_active: data.is_active ?? true,
        };

        updateDepartmentMutation.mutate(cleanedData);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        تعديل بيانات القسم
                    </DialogTitle>
                    <DialogDescription>
                        قم بتحديث بيانات القسم في النموذج أدناه
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">اسم القسم *</Label>
                            <Input
                                id="name"
                                {...register("name")}
                                className={errors.name ? "border-destructive" : ""}
                                placeholder="مثال: الموارد البشرية"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">كود القسم *</Label>
                            <Input
                                id="code"
                                {...register("code")}
                                className={errors.code ? "border-destructive" : ""}
                                placeholder="مثال: HR"
                                maxLength={10}
                                onChange={(e) => {
                                    setValue("code", e.target.value.toUpperCase());
                                }}
                            />
                            {errors.code && (
                                <p className="text-sm text-destructive">{errors.code.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">الوصف</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="وصف مختصر عن القسم ومسؤولياته..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="is_active">الحالة</Label>
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

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            <X className="h-4 w-4 ml-2" />
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={updateDepartmentMutation.isPending}>
                            {updateDepartmentMutation.isPending ? "جاري التحديث..." : "تحديث القسم"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditDepartment;

