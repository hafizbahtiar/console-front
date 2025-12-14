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
    type CreateRecurringTransactionInput,
    type UpdateRecurringTransactionInput,
    type RecurringFrequency,
} from "@/lib/api/finance/finance-recurring-transactions"
import { type TransactionType } from "@/lib/api/finance/finance-transactions"
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
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { toast } from "sonner"
import { ApiClientError } from "@/lib/api-client"

const recurringTransactionSchema = z.object({
    template: z.object({
        amount: z.number().min(0.01, "Amount must be greater than 0"),
        description: z.string().min(1, "Description is required").max(500, "Description must not exceed 500 characters"),
        type: z.enum(["expense", "income"]),
        categoryId: z.string().optional().nullable(),
        notes: z.string().max(100, "Notes must not exceed 100 characters").optional(),
        tags: z.array(z.string()).max(10, "Maximum 10 tags allowed").optional(),
        paymentMethod: z.string().max(50, "Payment method must not exceed 50 characters").optional(),
        reference: z.string().max(200, "Reference must not exceed 200 characters").optional(),
    }),
    frequency: z.enum(["daily", "weekly", "monthly", "yearly", "custom"]),
    interval: z.number().min(1, "Interval must be at least 1").optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    isActive: z.boolean().optional(),
}).refine(
    (data) => {
        if (data.frequency === "custom") {
            return data.interval !== undefined && data.interval >= 1
        }
        return true
    },
    {
        message: "Interval is required when frequency is custom",
        path: ["interval"],
    }
)

export type RecurringTransactionFormValues = z.infer<typeof recurringTransactionSchema>

interface RecurringTransactionFormProps {
    initialValues?: {
        template?: {
            amount?: number
            description?: string
            type?: TransactionType
            categoryId?: string | null
            notes?: string
            tags?: string[]
            paymentMethod?: string
            reference?: string
        }
        frequency?: RecurringFrequency
        interval?: number
        startDate?: string
        endDate?: string
        isActive?: boolean
    }
    onSubmit: (data: CreateRecurringTransactionInput | UpdateRecurringTransactionInput) => Promise<void>
    onCancel?: () => void
    isSubmitting?: boolean
}

export function RecurringTransactionForm({
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting,
}: RecurringTransactionFormProps) {
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
    const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)
    const [tagInput, setTagInput] = useState("")

    const form = useForm<RecurringTransactionFormValues>({
        resolver: zodResolver(recurringTransactionSchema),
        defaultValues: {
            template: {
                amount: initialValues?.template?.amount ?? 0,
                description: initialValues?.template?.description ?? "",
                type: initialValues?.template?.type ?? "expense",
                categoryId: initialValues?.template?.categoryId ?? null,
                notes: initialValues?.template?.notes ?? "",
                tags: initialValues?.template?.tags ?? [],
                paymentMethod: initialValues?.template?.paymentMethod ?? "",
                reference: initialValues?.template?.reference ?? "",
            },
            frequency: initialValues?.frequency ?? "monthly",
            interval: initialValues?.interval ?? 1,
            startDate: initialValues?.startDate ?? new Date().toISOString().split("T")[0],
            endDate: initialValues?.endDate ?? "",
            isActive: initialValues?.isActive ?? true,
        },
    })

    const transactionType = form.watch("template.type")
    const frequency = form.watch("frequency")

    useEffect(() => {
        if (initialValues) {
            form.reset({
                template: {
                    amount: initialValues.template?.amount ?? 0,
                    description: initialValues.template?.description ?? "",
                    type: initialValues.template?.type ?? "expense",
                    categoryId: initialValues.template?.categoryId ?? null,
                    notes: initialValues.template?.notes ?? "",
                    tags: initialValues.template?.tags ?? [],
                    paymentMethod: initialValues.template?.paymentMethod ?? "",
                    reference: initialValues.template?.reference ?? "",
                },
                frequency: initialValues.frequency ?? "monthly",
                interval: initialValues.interval ?? 1,
                startDate: initialValues.startDate ?? new Date().toISOString().split("T")[0],
                endDate: initialValues.endDate ?? "",
                isActive: initialValues.isActive ?? true,
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

    const categories = transactionType === "expense" ? expenseCategories : incomeCategories

    const handleAddTag = () => {
        const trimmed = tagInput.trim()
        if (!trimmed) return

        const currentTags = form.getValues("template.tags") || []
        if (currentTags.length >= 10) {
            toast.error("Maximum 10 tags allowed")
            return
        }
        if (currentTags.includes(trimmed)) {
            toast.error("Tag already exists")
            return
        }

        form.setValue("template.tags", [...currentTags, trimmed])
        setTagInput("")
    }

    const handleRemoveTag = (tagToRemove: string) => {
        const currentTags = form.getValues("template.tags") || []
        form.setValue(
            "template.tags",
            currentTags.filter((tag) => tag !== tagToRemove)
        )
    }

    const handleSubmit = async (values: RecurringTransactionFormValues) => {
        const payload: CreateRecurringTransactionInput | UpdateRecurringTransactionInput = {
            template: {
                amount: values.template.amount,
                description: values.template.description,
                type: values.template.type,
                categoryId: values.template.categoryId || null,
                notes: values.template.notes || undefined,
                tags: values.template.tags && values.template.tags.length > 0 ? values.template.tags : undefined,
                paymentMethod: values.template.paymentMethod || undefined,
                reference: values.template.reference || undefined,
            },
            frequency: values.frequency,
            interval: values.frequency === "custom" ? values.interval : undefined,
            startDate: values.startDate,
            endDate: values.endDate || undefined,
            isActive: values.isActive,
        }

        await onSubmit(payload)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Transaction Template</h3>

                    <FormField
                        control={form.control}
                        name="template.type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select transaction type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="expense">Expense</SelectItem>
                                        <SelectItem value="income">Income</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="template.amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormDescription>Amount for each generated transaction</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="template.description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter transaction description"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>Description for each generated transaction</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="template.categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value === "" ? null : value)}
                                    value={field.value || ""}
                                    disabled={isLoadingCategories}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category (optional)" />
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
                                <FormDescription>Optional: Categorize this transaction</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="template.paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Method</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., cash, card, bank transfer"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>How will this transaction be paid?</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="template.reference"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reference</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., invoice number, receipt number"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>Optional reference number</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="template.notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Additional notes (optional)"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="template.tags"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tags</FormLabel>
                                <FormControl>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Add a tag"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault()
                                                        handleAddTag()
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleAddTag}
                                                disabled={!tagInput.trim() || (field.value?.length || 0) >= 10}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        {field.value && field.value.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {field.value.map((tag) => (
                                                    <Badge key={tag} variant="secondary" className="gap-1">
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveTag(tag)}
                                                            className="ml-1 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormDescription>Add up to 10 tags to organize transactions</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recurrence Settings</h3>

                    <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>How often should this transaction be generated?</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {frequency === "custom" && (
                        <FormField
                            control={form.control}
                            name="interval"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Interval (Days)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="e.g., 3"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                        />
                                    </FormControl>
                                    <FormDescription>Number of days between each transaction</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormDescription>When should this recurring transaction start?</FormDescription>
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
                                    <Input
                                        type="date"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormDescription>When should this recurring transaction stop? Leave empty for no end date.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Active</FormLabel>
                                    <FormDescription>
                                        Enable or disable this recurring transaction
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
                </div>

                <div className="flex justify-end gap-2">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : initialValues ? "Update" : "Create"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

