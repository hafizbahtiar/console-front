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
    type CreateTransactionTemplateDto,
    type UpdateTransactionTemplateDto,
} from "@/lib/api/finance/finance-transaction-templates"
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
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { toast } from "sonner"
import { ApiClientError } from "@/lib/api-client"

const templateSchema = z.object({
    name: z.string().min(1, "Template name is required").max(200, "Template name must not exceed 200 characters"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    description: z.string().min(1, "Description is required").max(500, "Description must not exceed 500 characters"),
    type: z.enum(["expense", "income"]),
    categoryId: z.string().optional(),
    notes: z.string().max(100, "Notes must not exceed 100 characters").optional(),
    tags: z.array(z.string()).max(10, "Maximum 10 tags allowed").optional(),
    paymentMethod: z.string().max(50, "Payment method must not exceed 50 characters").optional(),
    reference: z.string().max(200, "Reference must not exceed 200 characters").optional(),
    category: z.string().max(50, "Category must not exceed 50 characters").optional(),
})

export type TransactionTemplateFormValues = z.infer<typeof templateSchema>

interface TransactionTemplateFormProps {
    initialValues?: {
        name?: string
        amount?: number
        description?: string
        type?: TransactionType
        categoryId?: string
        notes?: string
        tags?: string[]
        paymentMethod?: string
        reference?: string
        category?: string
    }
    onSubmit: (data: CreateTransactionTemplateDto | UpdateTransactionTemplateDto) => Promise<void>
    onCancel?: () => void
    isSubmitting?: boolean
}

export function TransactionTemplateForm({
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: TransactionTemplateFormProps) {
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
    const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)
    const [tagInput, setTagInput] = useState("")

    const form = useForm<TransactionTemplateFormValues>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            amount: initialValues?.amount ?? 0,
            description: initialValues?.description ?? "",
            type: initialValues?.type ?? "expense",
            categoryId: initialValues?.categoryId ?? "",
            notes: initialValues?.notes ?? "",
            tags: initialValues?.tags ?? [],
            paymentMethod: initialValues?.paymentMethod ?? "",
            reference: initialValues?.reference ?? "",
            category: initialValues?.category ?? "",
        },
    })

    const transactionType = form.watch("type")

    useEffect(() => {
        if (initialValues) {
            form.reset({
                name: initialValues.name ?? "",
                amount: initialValues.amount ?? 0,
                description: initialValues.description ?? "",
                type: initialValues.type ?? "expense",
                categoryId: initialValues.categoryId ?? "",
                notes: initialValues.notes ?? "",
                tags: initialValues.tags ?? [],
                paymentMethod: initialValues.paymentMethod ?? "",
                reference: initialValues.reference ?? "",
                category: initialValues.category ?? "",
            })
        }
    }, [initialValues, form])

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true)
            try {
                const [expense, income] = await Promise.all([
                    getExpenseCategories(),
                    getIncomeCategories(),
                ])
                setExpenseCategories(expense)
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

        void fetchCategories()
    }, [])

    const currentCategories = transactionType === "expense" ? expenseCategories : incomeCategories
    const currentTags = form.watch("tags") || []

    const handleAddTag = () => {
        const trimmedTag = tagInput.trim()
        if (trimmedTag && !currentTags.includes(trimmedTag) && currentTags.length < 10) {
            form.setValue("tags", [...currentTags, trimmedTag])
            setTagInput("")
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        form.setValue(
            "tags",
            currentTags.filter((tag) => tag !== tagToRemove)
        )
    }

    const handleSubmit = async (values: TransactionTemplateFormValues) => {
        const payload: CreateTransactionTemplateDto | UpdateTransactionTemplateDto = {
            name: values.name,
            amount: values.amount,
            description: values.description,
            type: values.type,
            categoryId: values.categoryId || undefined,
            notes: values.notes || undefined,
            tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
            paymentMethod: values.paymentMethod || undefined,
            reference: values.reference || undefined,
            category: values.category || undefined,
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
                            <FormLabel>Template Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Monthly Rent" {...field} />
                            </FormControl>
                            <FormDescription>
                                A friendly name to identify this template
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="type"
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
                    name="amount"
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
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder="Transaction description" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                                        <SelectValue placeholder="Select a category (optional)" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    {currentCategories.map((category) => (
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

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Template Category</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Bills, Subscriptions (optional)" {...field} />
                            </FormControl>
                            <FormDescription>
                                Optional category for organizing templates
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Additional notes (optional)"
                                    {...field}
                                    rows={3}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tags"
                    render={() => (
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
                                            disabled={currentTags.length >= 10}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    {currentTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {currentTags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="gap-1">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription>
                                Add tags to help organize and find templates (max 10)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Credit Card, Cash (optional)" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reference</FormLabel>
                            <FormControl>
                                <Input placeholder="Transaction reference (optional)" {...field} />
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
                        {isSubmitting ? "Saving..." : initialValues ? "Update Template" : "Create Template"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

