"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ExpenseCategory, CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from "@/lib/api/finance"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const expenseCategorySchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    color: z.string().max(7, "Color must be a valid hex color code").optional().or(z.literal("")),
    icon: z.string().max(50, "Icon must be less than 50 characters").optional().or(z.literal("")),
    description: z.string().max(500, "Description must be less than 500 characters").optional().or(z.literal("")),
})

export type ExpenseCategoryFormValues = z.infer<typeof expenseCategorySchema>

interface ExpenseCategoryFormProps {
    initialValues?: ExpenseCategory
    onSubmit: (data: CreateExpenseCategoryDto | UpdateExpenseCategoryDto) => Promise<void>
    onCancel?: () => void
    isSubmitting?: boolean
}

export function ExpenseCategoryForm({ initialValues, onSubmit, onCancel, isSubmitting }: ExpenseCategoryFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ExpenseCategoryFormValues>({
        resolver: zodResolver(expenseCategorySchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            color: initialValues?.color ?? "",
            icon: initialValues?.icon ?? "",
            description: initialValues?.description ?? "",
        },
    })

    useEffect(() => {
        if (initialValues) {
            reset({
                name: initialValues.name,
                color: initialValues.color ?? "",
                icon: initialValues.icon ?? "",
                description: initialValues.description ?? "",
            })
        }
    }, [initialValues, reset])

    const internalSubmit = async (values: ExpenseCategoryFormValues) => {
        const payload: CreateExpenseCategoryDto | UpdateExpenseCategoryDto = {
            name: values.name,
            color: values.color || undefined,
            icon: values.icon || undefined,
            description: values.description || undefined,
        }

        await onSubmit(payload)
    }

    return (
        <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., Groceries, Utilities, Entertainment"
                />
                {errors.name && (
                    <p className="text-xs text-destructive mt-1">{String(errors.name.message)}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="icon">Icon (optional)</Label>
                    <Input
                        id="icon"
                        {...register("icon")}
                        placeholder="e.g., shopping-cart, zap, film"
                    />
                    <p className="text-xs text-muted-foreground">Icon name or emoji</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="color">Color (optional)</Label>
                    <div className="flex gap-2">
                        <Input
                            id="color"
                            type="color"
                            {...register("color")}
                            className="h-10 w-20 flex-shrink-0"
                        />
                        <Input
                            {...register("color")}
                            placeholder="#FF5733"
                            className="flex-1"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">Hex color code (e.g., #FF5733)</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Brief description of this category..."
                    rows={3}
                />
                {errors.description && (
                    <p className="text-xs text-destructive mt-1">{String(errors.description.message)}</p>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : initialValues ? "Save changes" : "Create category"}
                </Button>
            </div>
        </form>
    )
}

