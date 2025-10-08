import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient, CreatePositionData, Position } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Briefcase, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const positionSchema = z.object({
    title: z.string().min(1, "اسم المنصب مطلوب"),
    code: z.string().min(1, "كود المنصب مطلوب").max(15, "كود المنصب يجب أن يكون أقل من 15 حرف"),
    description: z.string().optional(),
    base_salary_min: z.number().min(0, "الحد الأدنى للراتب يجب أن يكون أكبر من أو يساوي 0"),
    base_salary_max: z.number().min(0, "الحد الأقصى للراتب يجب أن يكون أكبر من أو يساوي 0"),
    is_active: z.boolean().optional(),
}).refine((data) => data.base_salary_max >= data.base_salary_min, {
    message: "الحد الأقصى للراتب يجب أن يكون أكبر من أو يساوي الحد الأدنى",
    path: ["base_salary_max"],
});

type PositionFormData = z.infer<typeof positionSchema>;

interface EditPositionProps {
    position: Position;
    onSuccess?: () => void;
    onClose: () => void;
}

const EditPosition = ({ position, onSuccess, onClose }: EditPositionProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<PositionFormData>({
        resolver: zodResolver(positionSchema),
        defaultValues: {
            title: position.title,
            code: position.code,
            description: position.description || "",
            base_salary_min: parseFloat(position.base_salary_min),
            base_salary_max: parseFloat(position.base_salary_max),
            is_active: position.is_active,
        },
    });

    // Update position mutation
    const updatePositionMutation = useMutation({
        mutationFn: (data: CreatePositionData) => apiClient.updatePosition(position.id, data),
        onSuccess: (response) => {
            toast.success("تم تحديث المنصب بنجاح");
            onSuccess?.();
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "حدث خطأ أثناء تحديث المنصب";
            toast.error(errorMessage);
        },
    });

    const onSubmit = (data: PositionFormData) => {
        const cleanedData: CreatePositionData = {
            title: data.title,
            code: data.code.toUpperCase(), // Convert to uppercase
            description: data.description || undefined,
            base_salary_min: data.base_salary_min,
            base_salary_max: data.base_salary_max,
            is_active: data.is_active ?? true,
        };

        updatePositionMutation.mutate(cleanedData);
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
                        <Briefcase className="h-5 w-5" />
                        تعديل بيانات المنصب
                    </DialogTitle>
                    <DialogDescription>
                        قم بتحديث بيانات المنصب في النموذج أدناه
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">اسم المنصب *</Label>
                            <Input
                                id="title"
                                {...register("title")}
                                className={errors.title ? "border-destructive" : ""}
                                placeholder="مثال: مطور برمجيات"
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">كود المنصب *</Label>
                            <Input
                                id="code"
                                {...register("code")}
                                className={errors.code ? "border-destructive" : ""}
                                placeholder="مثال: DEV-001"
                                maxLength={15}
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
                            placeholder="وصف مختصر عن المنصب ومسؤولياته..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="base_salary_min" className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                الحد الأدنى للراتب (ر.س) *
                            </Label>
                            <Input
                                id="base_salary_min"
                                type="number"
                                step="0.01"
                                min="0"
                                {...register("base_salary_min", { valueAsNumber: true })}
                                className={errors.base_salary_min ? "border-destructive" : ""}
                                placeholder="3000"
                            />
                            {errors.base_salary_min && (
                                <p className="text-sm text-destructive">{errors.base_salary_min.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="base_salary_max" className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                الحد الأقصى للراتب (ر.س) *
                            </Label>
                            <Input
                                id="base_salary_max"
                                type="number"
                                step="0.01"
                                min="0"
                                {...register("base_salary_max", { valueAsNumber: true })}
                                className={errors.base_salary_max ? "border-destructive" : ""}
                                placeholder="5000"
                            />
                            {errors.base_salary_max && (
                                <p className="text-sm text-destructive">{errors.base_salary_max.message}</p>
                            )}
                        </div>
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
                        <Button type="submit" disabled={updatePositionMutation.isPending}>
                            {updatePositionMutation.isPending ? "جاري التحديث..." : "تحديث المنصب"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditPosition;

