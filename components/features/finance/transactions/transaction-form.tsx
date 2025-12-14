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
    getTransactionTemplates,
    type SavedTransactionTemplate,
} from "@/lib/api/finance"
import {
    type CreateTransactionInput,
    type UpdateTransactionInput,
    type TransactionType,
    type Transaction,
} from "@/lib/api/finance/finance-transactions"
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
import { ReceiptUpload } from "../receipts/receipt-upload"
import { ReceiptActions } from "../receipts/receipt-actions"
import { uploadReceipt, deleteReceipt } from "@/lib/api/finance/finance-receipts"
import { CurrencySelector } from "../currency/currency-selector"

const transactionSchema = z.object({
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    date: z.string().min(1, "Date is required"),
    description: z.string().min(1, "Description is required").max(500, "Description must not exceed 500 characters"),
    type: z.enum(["expense", "income"]),
    categoryId: z.string().optional(),
    notes: z.string().max(100, "Notes must not exceed 100 characters").optional(),
    tags: z.array(z.string()).max(10, "Maximum 10 tags allowed").optional(),
    paymentMethod: z.string().max(50, "Payment method must not exceed 50 characters").optional(),
    reference: z.string().max(200, "Reference must not exceed 200 characters").optional(),
    currency: z.string().regex(/^[A-Z]{3}$/, "Currency must be a valid ISO 4217 code").optional(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormProps {
    initialValues?: {
        amount?: number
        date?: string
        description?: string
        type?: TransactionType
        categoryId?: string
        notes?: string
        tags?: string[]
        paymentMethod?: string
        reference?: string
        currency?: string
        receiptUrl?: string
        receiptFilename?: string
        receiptMimetype?: string
        receiptSize?: number
    }
    onSubmit: (data: CreateTransactionInput | UpdateTransactionInput) => Promise<void>
    onCancel?: () => void
    isSubmitting?: boolean
    onSaveAsRecurring?: (data: CreateTransactionInput) => void
    onSaveAsTemplate?: (data: CreateTransactionInput) => void
    transactionId?: string // For saving existing transaction as template or editing
    onReceiptChange?: () => void // Callback when receipt is uploaded/deleted
    transaction?: Transaction // Full transaction object for OCR actions
}

export function TransactionForm({
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting,
    onSaveAsRecurring,
    onSaveAsTemplate,
    transactionId,
    onReceiptChange,
}: TransactionFormProps) {
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
    const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)
    const [tagInput, setTagInput] = useState("")
    const [templates, setTemplates] = useState<SavedTransactionTemplate[]>([])
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
    const [receiptUrl, setReceiptUrl] = useState<string | undefined>(initialValues?.receiptUrl)

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            amount: initialValues?.amount ?? 0,
            date: initialValues?.date ?? new Date().toISOString().split("T")[0],
            description: initialValues?.description ?? "",
            type: initialValues?.type ?? "expense",
            categoryId: initialValues?.categoryId ?? "",
            notes: initialValues?.notes ?? "",
            tags: initialValues?.tags ?? [],
            paymentMethod: initialValues?.paymentMethod ?? "",
            reference: initialValues?.reference ?? "",
            currency: initialValues?.currency ?? "MYR",
        },
    })

    const transactionType = form.watch("type")

    useEffect(() => {
        if (initialValues) {
            form.reset({
                amount: initialValues.amount ?? 0,
                date: initialValues.date ?? new Date().toISOString().split("T")[0],
                description: initialValues.description ?? "",
                type: initialValues.type ?? "expense",
                categoryId: initialValues.categoryId ?? "",
                notes: initialValues.notes ?? "",
                tags: initialValues.tags ?? [],
                paymentMethod: initialValues.paymentMethod ?? "",
                reference: initialValues.reference ?? "",
                currency: initialValues.currency ?? "MYR",
            })
            setReceiptUrl(initialValues.receiptUrl)
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

    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoadingTemplates(true)
            try {
                const data = await getTransactionTemplates({ sortBy: "usageCount", sortOrder: "desc" })
                setTemplates(data)
            } catch (error: any) {
                // Silently fail - templates are optional
            } finally {
                setIsLoadingTemplates(false)
            }
        }

        void fetchTemplates()
    }, [])

    const categories = transactionType === "expense" ? expenseCategories : incomeCategories

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplateId(templateId)
        const template = templates.find((t) => t.id === templateId)
        if (template) {
            form.reset({
                amount: template.amount,
                description: template.description,
                type: template.type,
                categoryId: template.categoryId || "",
                notes: template.notes || "",
                tags: template.tags || [],
                paymentMethod: template.paymentMethod || "",
                reference: template.reference || "",
                date: form.getValues("date") || new Date().toISOString().split("T")[0],
                currency: form.getValues("currency") || "MYR",
            })
        }
    }

    const handleAddTag = () => {
        const trimmed = tagInput.trim()
        if (!trimmed) return

        const currentTags = form.getValues("tags") || []
        if (currentTags.length >= 10) {
            toast.error("Maximum 10 tags allowed")
            return
        }
        if (currentTags.includes(trimmed)) {
            toast.error("Tag already exists")
            return
        }

        form.setValue("tags", [...currentTags, trimmed])
        setTagInput("")
    }

    const handleRemoveTag = (tagToRemove: string) => {
        const currentTags = form.getValues("tags") || []
        form.setValue(
            "tags",
            currentTags.filter((tag) => tag !== tagToRemove)
        )
    }

    const handleReceiptUpload = async (url: string) => {
        // Receipt is already uploaded via ReceiptUpload component
        // This callback just updates the local state
        setReceiptUrl(url)
        if (onReceiptChange) {
            onReceiptChange()
        }
    }

    const handleReceiptRemove = async () => {
        // Receipt deletion is handled by ReceiptUpload component
        // This callback just updates the local state
        setReceiptUrl(undefined)
        if (onReceiptChange) {
            onReceiptChange()
        }
    }

    const handleSubmit = async (values: TransactionFormValues) => {
        const payload: CreateTransactionInput | UpdateTransactionInput = {
            amount: values.amount,
            date: values.date,
            description: values.description,
            type: values.type,
            categoryId: values.categoryId || undefined,
            notes: values.notes || undefined,
            tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
            paymentMethod: values.paymentMethod || undefined,
            reference: values.reference || undefined,
            currency: values.currency && values.currency !== "MYR" ? values.currency : undefined,
        }

        await onSubmit(payload)
    }

    const availableTemplates = templates.filter((t) => !transactionType || t.type === transactionType)

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {availableTemplates.length > 0 && (
                    <FormField
                        control={form.control}
                        name="type"
                        render={() => (
                            <FormItem>
                                <FormLabel>Load from Template</FormLabel>
                                <Select
                                    value={selectedTemplateId}
                                    onValueChange={handleTemplateSelect}
                                    disabled={isLoadingTemplates}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a template (optional)" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {availableTemplates.map((template) => (
                                            <SelectItem key={template.id} value={template.id}>
                                                {template.name} - ${template.amount.toFixed(2)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Quickly fill the form with a saved template
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                )}

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

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
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
                                <FormDescription>Enter the transaction amount</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <FormControl>
                                    <CurrencySelector
                                        value={field.value || "MYR"}
                                        onValueChange={(value) => field.onChange(value)}
                                        showExchangeRate={true}
                                        showConvertedAmount={true}
                                        amount={form.watch("amount")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter transaction description"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Brief description of the transaction</FormDescription>
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
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., cash, card, bank transfer"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>How was this transaction paid?</FormDescription>
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
                    name="notes"
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
                    name="tags"
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

                {/* Receipt Upload Section */}
                {transactionId ? (
                    <div className="space-y-2">
                        <ReceiptUpload
                            transactionId={transactionId}
                            value={receiptUrl}
                            onUpload={handleReceiptUpload}
                            onRemove={handleReceiptRemove}
                            disabled={isSubmitting}
                            showLabel={true}
                            label="Receipt"
                        />
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                        <p>Receipt can be uploaded after the transaction is created.</p>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        {onSaveAsRecurring && !initialValues && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    const values = form.getValues()
                                    const payload: CreateTransactionInput = {
                                        amount: values.amount,
                                        date: values.date,
                                        description: values.description,
                                        type: values.type,
                                        categoryId: values.categoryId || undefined,
                                        notes: values.notes || undefined,
                                        tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
                                        paymentMethod: values.paymentMethod || undefined,
                                        reference: values.reference || undefined,
                                    }
                                    onSaveAsRecurring(payload)
                                }}
                                disabled={isSubmitting}
                            >
                                Save as Recurring
                            </Button>
                        )}
                        {onSaveAsTemplate && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    const values = form.getValues()
                                    const payload: CreateTransactionInput = {
                                        amount: values.amount,
                                        date: values.date,
                                        description: values.description,
                                        type: values.type,
                                        categoryId: values.categoryId || undefined,
                                        notes: values.notes || undefined,
                                        tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
                                        paymentMethod: values.paymentMethod || undefined,
                                        reference: values.reference || undefined,
                                    }
                                    onSaveAsTemplate(payload)
                                }}
                                disabled={isSubmitting}
                            >
                                Save as Template
                            </Button>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 ml-auto">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : initialValues ? "Update" : "Create"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}

