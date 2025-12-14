"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
    Check,
    X,
    Loader2,
    AlertCircle,
    CheckCircle2,
    FileText,
    Calendar,
    DollarSign,
    CreditCard,
    Store,
    Package,
} from "lucide-react"
import { toast } from "sonner"
import {
    type ReceiptOcrData,
    type CategorySuggestion,
    applyOcrData,
    discardReceiptOcr,
} from "@/lib/api/finance/finance-receipts"
import { getExpenseCategories, getIncomeCategories, type ExpenseCategory, type IncomeCategory } from "@/lib/api/finance"
import { format } from "date-fns"

export interface ReceiptOcrReviewModalProps {
    /** Transaction ID */
    transactionId: string
    /** Transaction type (expense/income) */
    transactionType?: "expense" | "income"
    /** OCR data to review */
    ocrData: ReceiptOcrData
    /** Suggested category */
    suggestedCategory?: CategorySuggestion
    /** Whether modal is open */
    open: boolean
    /** Callback when modal is closed */
    onClose: () => void
    /** Callback when OCR data is applied */
    onApplied?: () => Promise<void>
    /** Callback when OCR data is discarded */
    onDiscarded?: () => Promise<void>
}

const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.7) return "text-green-600"
    if (confidence >= 0.4) return "text-yellow-600"
    return "text-red-600"
}

const getConfidenceBadge = (confidence: number): { label: string; variant: "default" | "secondary" | "destructive" } => {
    if (confidence >= 0.7) return { label: "High", variant: "default" }
    if (confidence >= 0.4) return { label: "Medium", variant: "secondary" }
    return { label: "Low", variant: "destructive" }
}

const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`
}

export function ReceiptOcrReviewModal({
    transactionId,
    transactionType = "expense",
    ocrData,
    suggestedCategory,
    open,
    onClose,
    onApplied,
    onDiscarded,
}: ReceiptOcrReviewModalProps) {
    const [isApplying, setIsApplying] = useState(false)
    const [isDiscarding, setIsDiscarding] = useState(false)
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
    const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)

    // Editable OCR data state
    const [editedData, setEditedData] = useState({
        merchantName: ocrData.merchantName?.value ? String(ocrData.merchantName.value) : "",
        date: ocrData.date?.value
            ? (typeof ocrData.date.value === "string"
                ? ocrData.date.value.split("T")[0]
                : format(new Date(ocrData.date.value), "yyyy-MM-dd"))
            : "",
        totalAmount: ocrData.totalAmount?.value ? String(ocrData.totalAmount.value) : "",
        taxAmount: ocrData.taxAmount?.value ? String(ocrData.taxAmount.value) : "",
        subtotal: ocrData.subtotal?.value ? String(ocrData.subtotal.value) : "",
        paymentMethod: ocrData.paymentMethod?.value ? String(ocrData.paymentMethod.value) : "",
        receiptNumber: ocrData.receiptNumber?.value ? String(ocrData.receiptNumber.value) : "",
        description: ocrData.merchantName?.value ? String(ocrData.merchantName.value) : "",
    })

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
        suggestedCategory?.categoryId || ""
    )
    const [fieldsToApply, setFieldsToApply] = useState<Set<string>>(new Set([
        "amount",
        "date",
        "description",
        "categoryId",
        "paymentMethod",
    ]))

    // Load categories
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
        if (open) {
            loadCategories()
        }
    }, [open])

    // Reset edited data when OCR data changes
    useEffect(() => {
        setEditedData({
            merchantName: ocrData.merchantName?.value ? String(ocrData.merchantName.value) : "",
            date: ocrData.date?.value
                ? (typeof ocrData.date.value === "string"
                    ? ocrData.date.value.split("T")[0]
                    : format(new Date(ocrData.date.value), "yyyy-MM-dd"))
                : "",
            totalAmount: ocrData.totalAmount?.value ? String(ocrData.totalAmount.value) : "",
            taxAmount: ocrData.taxAmount?.value ? String(ocrData.taxAmount.value) : "",
            subtotal: ocrData.subtotal?.value ? String(ocrData.subtotal.value) : "",
            paymentMethod: ocrData.paymentMethod?.value ? String(ocrData.paymentMethod.value) : "",
            receiptNumber: ocrData.receiptNumber?.value ? String(ocrData.receiptNumber.value) : "",
            description: ocrData.merchantName?.value ? String(ocrData.merchantName.value) : "",
        })
        setSelectedCategoryId(suggestedCategory?.categoryId || "")
    }, [ocrData, suggestedCategory])

    const categories = transactionType === "expense" ? expenseCategories : incomeCategories

    const handleFieldToggle = (field: string) => {
        const newFields = new Set(fieldsToApply)
        if (newFields.has(field)) {
            newFields.delete(field)
        } else {
            newFields.add(field)
        }
        setFieldsToApply(newFields)
    }

    const handleApply = async () => {
        setIsApplying(true)
        try {
            await applyOcrData(transactionId, {
                fieldsToApply: Array.from(fieldsToApply),
                categoryId: selectedCategoryId || undefined,
            })
            toast.success("OCR data applied successfully")
            if (onApplied) {
                await onApplied()
            }
            onClose()
        } catch (error: any) {
            console.error("Apply OCR error:", error)
            toast.error(error.message || "Failed to apply OCR data")
        } finally {
            setIsApplying(false)
        }
    }

    const handleDiscard = async () => {
        setIsDiscarding(true)
        try {
            await discardReceiptOcr(transactionId)
            toast.success("OCR data discarded")
            if (onDiscarded) {
                await onDiscarded()
            }
            onClose()
        } catch (error: any) {
            console.error("Discard OCR error:", error)
            toast.error(error.message || "Failed to discard OCR data")
        } finally {
            setIsDiscarding(false)
        }
    }

    const overallConfidenceBadge = getConfidenceBadge(ocrData.overallConfidence)

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Review Extracted Receipt Data
                    </DialogTitle>
                    <DialogDescription>
                        Review and edit the extracted data from your receipt. Select which fields to apply to the transaction.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Overall Confidence */}
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Overall Confidence:</span>
                            <Badge variant={overallConfidenceBadge.variant}>
                                {overallConfidenceBadge.label} ({formatConfidence(ocrData.overallConfidence)})
                            </Badge>
                        </div>
                        {suggestedCategory && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Suggested Category:</span>
                                <Badge variant="outline">
                                    {suggestedCategory.categoryName} ({formatConfidence(suggestedCategory.confidence)})
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Extracted Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Merchant Name */}
                        {ocrData.merchantName && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2">
                                        <Store className="w-4 h-4" />
                                        Merchant Name
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getConfidenceBadge(ocrData.merchantName.confidence).variant} className="text-xs">
                                            {formatConfidence(ocrData.merchantName.confidence)}
                                        </Badge>
                                        <Checkbox
                                            checked={fieldsToApply.has("description")}
                                            onCheckedChange={() => handleFieldToggle("description")}
                                        />
                                    </div>
                                </div>
                                <Input
                                    value={editedData.merchantName}
                                    onChange={(e) => setEditedData({ ...editedData, merchantName: e.target.value, description: e.target.value })}
                                    placeholder="Merchant name"
                                />
                            </div>
                        )}

                        {/* Date */}
                        {ocrData.date && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Date
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getConfidenceBadge(ocrData.date.confidence).variant} className="text-xs">
                                            {formatConfidence(ocrData.date.confidence)}
                                        </Badge>
                                        <Checkbox
                                            checked={fieldsToApply.has("date")}
                                            onCheckedChange={() => handleFieldToggle("date")}
                                        />
                                    </div>
                                </div>
                                <Input
                                    type="date"
                                    value={editedData.date}
                                    onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
                                />
                            </div>
                        )}

                        {/* Total Amount */}
                        {ocrData.totalAmount && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Total Amount
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getConfidenceBadge(ocrData.totalAmount.confidence).variant} className="text-xs">
                                            {formatConfidence(ocrData.totalAmount.confidence)}
                                        </Badge>
                                        <Checkbox
                                            checked={fieldsToApply.has("amount")}
                                            onCheckedChange={() => handleFieldToggle("amount")}
                                        />
                                    </div>
                                </div>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editedData.totalAmount}
                                    onChange={(e) => setEditedData({ ...editedData, totalAmount: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        )}

                        {/* Tax Amount */}
                        {ocrData.taxAmount && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Tax Amount</Label>
                                    <Badge variant={getConfidenceBadge(ocrData.taxAmount.confidence).variant} className="text-xs">
                                        {formatConfidence(ocrData.taxAmount.confidence)}
                                    </Badge>
                                </div>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editedData.taxAmount}
                                    onChange={(e) => setEditedData({ ...editedData, taxAmount: e.target.value })}
                                    placeholder="0.00"
                                    disabled
                                />
                            </div>
                        )}

                        {/* Subtotal */}
                        {ocrData.subtotal && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Subtotal</Label>
                                    <Badge variant={getConfidenceBadge(ocrData.subtotal.confidence).variant} className="text-xs">
                                        {formatConfidence(ocrData.subtotal.confidence)}
                                    </Badge>
                                </div>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editedData.subtotal}
                                    onChange={(e) => setEditedData({ ...editedData, subtotal: e.target.value })}
                                    placeholder="0.00"
                                    disabled
                                />
                            </div>
                        )}

                        {/* Payment Method */}
                        {ocrData.paymentMethod && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        Payment Method
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getConfidenceBadge(ocrData.paymentMethod.confidence).variant} className="text-xs">
                                            {formatConfidence(ocrData.paymentMethod.confidence)}
                                        </Badge>
                                        <Checkbox
                                            checked={fieldsToApply.has("paymentMethod")}
                                            onCheckedChange={() => handleFieldToggle("paymentMethod")}
                                        />
                                    </div>
                                </div>
                                <Input
                                    value={editedData.paymentMethod}
                                    onChange={(e) => setEditedData({ ...editedData, paymentMethod: e.target.value })}
                                    placeholder="Payment method"
                                />
                            </div>
                        )}

                        {/* Receipt Number */}
                        {ocrData.receiptNumber && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Receipt Number</Label>
                                    <Badge variant={getConfidenceBadge(ocrData.receiptNumber.confidence).variant} className="text-xs">
                                        {formatConfidence(ocrData.receiptNumber.confidence)}
                                    </Badge>
                                </div>
                                <Input
                                    value={editedData.receiptNumber}
                                    onChange={(e) => setEditedData({ ...editedData, receiptNumber: e.target.value })}
                                    placeholder="Receipt number"
                                    disabled
                                />
                            </div>
                        )}
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Category</Label>
                            <Checkbox
                                checked={fieldsToApply.has("categoryId")}
                                onCheckedChange={() => handleFieldToggle("categoryId")}
                            />
                        </div>
                        <Select
                            value={selectedCategoryId}
                            onValueChange={setSelectedCategoryId}
                            disabled={isLoadingCategories}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {suggestedCategory && selectedCategoryId === suggestedCategory.categoryId && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                                Using suggested category ({formatConfidence(suggestedCategory.confidence)} confidence)
                            </p>
                        )}
                    </div>

                    {/* Items List */}
                    {ocrData.items && ocrData.items.length > 0 && (
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Items ({ocrData.items.length})
                            </Label>
                            <div className="border rounded-lg max-h-48 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-2 text-left">Description</th>
                                            <th className="p-2 text-right">Qty</th>
                                            <th className="p-2 text-right">Price</th>
                                            <th className="p-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ocrData.items.map((item, index) => (
                                            <tr key={index} className="border-t">
                                                <td className="p-2">{item.description}</td>
                                                <td className="p-2 text-right">{item.quantity || "-"}</td>
                                                <td className="p-2 text-right">
                                                    {item.price ? `$${item.price.toFixed(2)}` : "-"}
                                                </td>
                                                <td className="p-2 text-right">
                                                    {item.total ? `$${item.total.toFixed(2)}` : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleDiscard}
                        disabled={isApplying || isDiscarding}
                    >
                        {isDiscarding ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Discarding...
                            </>
                        ) : (
                            <>
                                <X className="w-4 h-4 mr-2" />
                                Discard
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleApply}
                        disabled={isApplying || isDiscarding || fieldsToApply.size === 0}
                    >
                        {isApplying ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Applying...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Apply Selected Fields
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

