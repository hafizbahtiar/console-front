"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type {
    MerchantCategory,
    CreateMerchantCategoryInput,
    UpdateMerchantCategoryInput,
} from "@/lib/api/finance/finance-merchant-categories"
import { getExpenseCategories, getIncomeCategories, type ExpenseCategory, type IncomeCategory } from "@/lib/api/finance"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

const merchantCategorySchema = z.object({
    merchantName: z.string().min(1, "Merchant name is required").max(200, "Merchant name must be less than 200 characters"),
    categoryId: z.string().min(1, "Category is required"),
})

export type MerchantCategoryFormValues = z.infer<typeof merchantCategorySchema>

interface MerchantCategoryFormProps {
    initialValues?: MerchantCategory
    onSubmit: (data: CreateMerchantCategoryInput | UpdateMerchantCategoryInput) => Promise<void>
    onCancel?: () => void
    isSubmitting?: boolean
    transactionType?: "expense" | "income" // Optional: filter categories by type
}

export function MerchantCategoryForm({
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting,
    transactionType,
}: MerchantCategoryFormProps) {
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
    const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<MerchantCategoryFormValues>({
        resolver: zodResolver(merchantCategorySchema),
        defaultValues: {
            merchantName: initialValues?.merchantName ?? "",
            categoryId: initialValues?.categoryId ?? "",
        },
    })

    const selectedCategoryId = watch("categoryId")

    useEffect(() => {
        async function loadCategories() {
            setIsLoadingCategories(true)
            try {
                const [expenses, income] = await Promise.all([
                    getExpenseCategories(),
                    getIncomeCategories(),
                ])
                setExpenseCategories(expenses)
                setIncomeCategories(income)
            } catch (error: any) {
                console.error("Failed to load categories:", error)
            } finally {
                setIsLoadingCategories(false)
            }
        }
        loadCategories()
    }, [])

    useEffect(() => {
        if (initialValues) {
            reset({
                merchantName: initialValues.merchantName,
                categoryId: initialValues.categoryId,
            })
        }
    }, [initialValues, reset])

    const internalSubmit = async (values: MerchantCategoryFormValues) => {
        const payload: CreateMerchantCategoryInput | UpdateMerchantCategoryInput = {
            merchantName: values.merchantName.trim(),
            categoryId: values.categoryId,
        }

        await onSubmit(payload)
    }

    const categories = transactionType === "expense"
        ? expenseCategories
        : transactionType === "income"
            ? incomeCategories
            : [...expenseCategories, ...incomeCategories]

    return (
        <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="merchantName">Merchant Name *</Label>
                <Input
                    id="merchantName"
                    {...register("merchantName")}
                    placeholder="e.g., Walmart, Starbucks, Amazon"
                />
                {errors.merchantName && (
                    <p className="text-xs text-destructive mt-1">{String(errors.merchantName.message)}</p>
                )}
                <p className="text-xs text-muted-foreground">
                    Enter the merchant name as it appears on receipts
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                    value={selectedCategoryId}
                    onValueChange={(value) => setValue("categoryId", value)}
                    disabled={isLoadingCategories || isSubmitting}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {transactionType === undefined && (
                            <>
                                {expenseCategories.length > 0 && (
                                    <>
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                            Expense Categories
                                        </div>
                                        {expenseCategories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.icon && <span className="mr-2">{category.icon}</span>}
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </>
                                )}
                                {incomeCategories.length > 0 && (
                                    <>
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                                            Income Categories
                                        </div>
                                        {incomeCategories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.icon && <span className="mr-2">{category.icon}</span>}
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                        {transactionType !== undefined && categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.icon && <span className="mr-2">{category.icon}</span>}
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.categoryId && (
                    <p className="text-xs text-destructive mt-1">{String(errors.categoryId.message)}</p>
                )}
                {isLoadingCategories && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Loading categories...
                    </p>
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
                <Button type="submit" disabled={isSubmitting || isLoadingCategories}>
                    {isSubmitting ? "Saving..." : initialValues ? "Save changes" : "Create mapping"}
                </Button>
            </div>
        </form>
    )
}

