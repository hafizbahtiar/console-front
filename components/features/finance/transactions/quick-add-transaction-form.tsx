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
import { type CreateTransactionInput, type TransactionType } from "@/lib/api/finance/finance-transactions"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { ApiClientError } from "@/lib/api-client"
import { format } from "date-fns"

const quickAddSchema = z.object({
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    description: z.string().min(1, "Description is required").max(500, "Description must not exceed 500 characters"),
    type: z.enum(["expense", "income"]),
    categoryId: z.string().optional(),
    date: z.string().min(1, "Date is required"),
})

export type QuickAddTransactionFormValues = z.infer<typeof quickAddSchema>

interface QuickAddTransactionFormProps {
    onSubmit: (data: CreateTransactionInput) => Promise<void>
    onCancel?: () => void
    isSubmitting?: boolean
    defaultType?: TransactionType
    defaultCategoryId?: string
}

export function QuickAddTransactionForm({
    onSubmit,
    onCancel,
    isSubmitting = false,
    defaultType = "expense",
    defaultCategoryId,
}: QuickAddTransactionFormProps) {
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
    const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)

    const form = useForm<QuickAddTransactionFormValues>({
        resolver: zodResolver(quickAddSchema),
        defaultValues: {
            amount: 0,
            date: format(new Date(), "yyyy-MM-dd"),
            description: "",
            type: defaultType,
            categoryId: defaultCategoryId || "",
        },
    })

    const transactionType = form.watch("type")

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
                // Silently fail - categories are optional
            } finally {
                setIsLoadingCategories(false)
            }
        }

        void fetchCategories()
    }, [])

    // Auto-focus on amount field when form opens
    useEffect(() => {
        const amountInput = document.getElementById("quick-add-amount") as HTMLInputElement
        if (amountInput) {
            setTimeout(() => amountInput.focus(), 100)
        }
    }, [])

    const currentCategories = transactionType === "expense" ? expenseCategories : incomeCategories

    const handleSubmit = async (values: QuickAddTransactionFormValues) => {
        const payload: CreateTransactionInput = {
            amount: values.amount,
            date: values.date,
            description: values.description,
            type: values.type,
            categoryId: values.categoryId || undefined,
        }

        await onSubmit(payload)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
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
                                        id="quick-add-amount"
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
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
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
                                            <SelectValue placeholder="Optional" />
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
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Transaction"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

