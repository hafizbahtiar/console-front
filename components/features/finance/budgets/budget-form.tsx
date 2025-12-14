"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    getExpenseCategories,
    getIncomeCategories,
    type ExpenseCategory,
    type IncomeCategory,
} from "@/lib/api/finance"
import {
    type CreateBudgetInput,
    type UpdateBudgetInput,
    type BudgetPeriod,
    type BudgetCategoryType,
} from "@/lib/api/finance/finance-budgets"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { ApiClientError } from "@/lib/api-client"

const budgetSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters"),
    categoryId: z.string().optional(),
    categoryType: z.enum(["ExpenseCategory", "IncomeCategory"]).optional(),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    period: z.enum(["monthly", "yearly"]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    alertThresholds: z.object({
        warning: z.number().min(0).max(100).optional(),
        critical: z.number().min(0).max(100).optional(),
        exceeded: z.number().min(0).max(100).optional(),
    }).optional(),
    rolloverEnabled: z.boolean().optional(),
    description: z.string().max(500, "Description must not exceed 500 characters").optional(),
}).refine(
    (data) => {
        if (data.categoryId && !data.categoryType) {
            return false
        }
        return true
    },
    {
        message: "Category type is required when category is selected",
        path: ["categoryType"],
    }
).refine(
    (data) => {
        if (data.endDate && data.startDate) {
            return new Date(data.endDate) >= new Date(data.startDate)
        }
        return true
    },
    {
        message: "End date must be after start date",
        path: ["endDate"],
    }
).refine(
    (data) => {
        if (data.alertThresholds?.warning !== undefined && data.alertThresholds?.critical !== undefined) {
            return data.alertThresholds.warning < data.alertThresholds.critical
        }
        return true
    },
    {
        message: "Warning threshold must be less than critical threshold",
        path: ["alertThresholds", "warning"],
    }
)

export type BudgetFormValues = z.infer<typeof budgetSchema>

interface BudgetFormProps {
    initialValues?: {
        name?: string
        categoryId?: string
        categoryType?: BudgetCategoryType
        amount?: number
        period?: BudgetPeriod
        startDate?: string
        endDate?: string
        alertThresholds?: {
            warning?: number
            critical?: number
            exceeded?: number
        }
        rolloverEnabled?: boolean
        description?: string
    }
    onSubmit: (data: CreateBudgetInput | UpdateBudgetInput) => Promise<void>
    onCancel?: () => void
    isSubmitting?: boolean
}

export function BudgetForm({
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting,
}: BudgetFormProps) {
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
    const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)

    const form = useForm<BudgetFormValues>({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            categoryId: initialValues?.categoryId ?? "",
            categoryType: initialValues?.categoryType,
            amount: initialValues?.amount ?? 0,
            period: initialValues?.period ?? "monthly",
            startDate: initialValues?.startDate ?? new Date().toISOString().split("T")[0],
            endDate: initialValues?.endDate ?? "",
            alertThresholds: initialValues?.alertThresholds ?? {
                warning: 50,
                critical: 80,
                exceeded: 100,
            },
            rolloverEnabled: initialValues?.rolloverEnabled ?? false,
            description: initialValues?.description ?? "",
        },
    })

    const categoryType = form.watch("categoryType")
    const hasCategory = !!form.watch("categoryId")

    useEffect(() => {
        if (initialValues) {
            form.reset({
                name: initialValues.name ?? "",
                categoryId: initialValues.categoryId ?? "",
                categoryType: initialValues.categoryType,
                amount: initialValues.amount ?? 0,
                period: initialValues.period ?? "monthly",
                startDate: initialValues.startDate ?? new Date().toISOString().split("T")[0],
                endDate: initialValues.endDate ?? "",
                alertThresholds: initialValues.alertThresholds ?? {
                    warning: 50,
                    critical: 80,
                    exceeded: 100,
                },
                rolloverEnabled: initialValues.rolloverEnabled ?? false,
                description: initialValues.description ?? "",
            })
        }
    }, [initialValues, form])

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
                const message =
                    error instanceof ApiClientError
                        ? error.message
                        : "Failed to load categories. Please try again."
                toast.error(message)
            } finally {
                setIsLoadingCategories(false)
            }
        }
        loadCategories()
    }, [])

    const categories = categoryType === "ExpenseCategory" ? expenseCategories : incomeCategories

    const handleSubmit = async (values: BudgetFormValues) => {
        const payload: CreateBudgetInput | UpdateBudgetInput = {
            name: values.name,
            categoryId: values.categoryId || undefined,
            categoryType: values.categoryType,
            amount: values.amount,
            period: values.period,
            startDate: values.startDate,
            endDate: values.endDate || undefined,
            alertThresholds: values.alertThresholds,
            rolloverEnabled: values.rolloverEnabled,
            description: values.description || undefined,
        }

        await onSubmit(payload)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Budget Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Groceries Budget" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="categoryType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category Type (Optional)</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value)
                                    // Clear category when type changes
                                    form.setValue("categoryId", "")
                                }}
                                value={field.value || ""}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category type (optional)" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    <SelectItem value="ExpenseCategory">Expense Category</SelectItem>
                                    <SelectItem value="IncomeCategory">Income Category</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Optional: Link this budget to a specific category
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {categoryType && (
                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || ""}
                                    disabled={isLoadingCategories}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Budget Amount</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="period"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Period</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Date (Optional)</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormDescription>
                                    Leave empty for ongoing budget
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4 border rounded-lg p-4">
                    <div className="font-medium text-sm">Alert Thresholds (%)</div>
                    <div className="grid grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="alertThresholds.warning"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Warning</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="50"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="alertThresholds.critical"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Critical</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="80"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="alertThresholds.exceeded"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Exceeded</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="100"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormDescription>
                        Set percentage thresholds for budget alerts (default: 50%, 80%, 100%)
                    </FormDescription>
                </div>

                <FormField
                    control={form.control}
                    name="rolloverEnabled"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable Rollover</FormLabel>
                                <FormDescription>
                                    Automatically carry over unused budget to the next period
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Add any additional notes about this budget..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Budget"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

