"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    FileText,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Eye,
    Sparkles,
    X,
} from "lucide-react"
import { toast } from "sonner"
import {
    extractReceiptOcr,
    getReceiptOcr,
    type ReceiptOcrData,
    type CategorySuggestion,
} from "@/lib/api/finance/finance-receipts"
import { ReceiptOcrReviewModal } from "./receipt-ocr-review-modal"
import type { Transaction } from "@/lib/api/finance/finance-transactions"

export interface ReceiptActionsProps {
    /** Transaction */
    transaction: Transaction
    /** Callback when OCR data changes */
    onOcrChange?: () => Promise<void>
    /** Additional className */
    className?: string
}

type OcrStatus = "not_extracted" | "extracted" | "applied"

export function ReceiptActions({
    transaction,
    onOcrChange,
    className,
}: ReceiptActionsProps) {
    const [isExtracting, setIsExtracting] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [ocrData, setOcrData] = useState<ReceiptOcrData | null>(null)
    const [suggestedCategory, setSuggestedCategory] = useState<CategorySuggestion | undefined>(undefined)
    const [isLoadingOcr, setIsLoadingOcr] = useState(false)

    // Determine OCR status
    const ocrStatus: OcrStatus = transaction.ocrApplied
        ? "applied"
        : transaction.receiptOcrData
            ? "extracted"
            : "not_extracted"

    // Load existing OCR data if available
    React.useEffect(() => {
        if (transaction.receiptOcrData && !ocrData) {
            // Convert schema format to ReceiptOcrData format
            const converted: ReceiptOcrData = {
                merchantName: transaction.receiptOcrData.merchantName
                    ? {
                        value: String(transaction.receiptOcrData.merchantName.value || ""),
                        confidence: transaction.receiptOcrData.merchantName.confidence || 0,
                    }
                    : undefined,
                date: transaction.receiptOcrData.date
                    ? {
                        value: typeof transaction.receiptOcrData.date.value === "string"
                            ? transaction.receiptOcrData.date.value
                            : transaction.receiptOcrData.date.value instanceof Date
                                ? transaction.receiptOcrData.date.value.toISOString()
                                : String(transaction.receiptOcrData.date.value || ""),
                        confidence: transaction.receiptOcrData.date.confidence || 0,
                    }
                    : undefined,
                totalAmount: transaction.receiptOcrData.totalAmount
                    ? {
                        value: typeof transaction.receiptOcrData.totalAmount.value === "number"
                            ? transaction.receiptOcrData.totalAmount.value
                            : parseFloat(String(transaction.receiptOcrData.totalAmount.value || 0)),
                        confidence: transaction.receiptOcrData.totalAmount.confidence || 0,
                    }
                    : undefined,
                taxAmount: transaction.receiptOcrData.taxAmount
                    ? {
                        value: typeof transaction.receiptOcrData.taxAmount.value === "number"
                            ? transaction.receiptOcrData.taxAmount.value
                            : parseFloat(String(transaction.receiptOcrData.taxAmount.value || 0)),
                        confidence: transaction.receiptOcrData.taxAmount.confidence || 0,
                    }
                    : undefined,
                subtotal: transaction.receiptOcrData.subtotal
                    ? {
                        value: typeof transaction.receiptOcrData.subtotal.value === "number"
                            ? transaction.receiptOcrData.subtotal.value
                            : parseFloat(String(transaction.receiptOcrData.subtotal.value || 0)),
                        confidence: transaction.receiptOcrData.subtotal.confidence || 0,
                    }
                    : undefined,
                items: transaction.receiptOcrData.items?.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.total,
                    confidence: item.confidence || 0,
                })),
                paymentMethod: transaction.receiptOcrData.paymentMethod
                    ? {
                        value: String(transaction.receiptOcrData.paymentMethod.value || ""),
                        confidence: transaction.receiptOcrData.paymentMethod.confidence || 0,
                    }
                    : undefined,
                receiptNumber: transaction.receiptOcrData.receiptNumber
                    ? {
                        value: String(transaction.receiptOcrData.receiptNumber.value || ""),
                        confidence: transaction.receiptOcrData.receiptNumber.confidence || 0,
                    }
                    : undefined,
                overallConfidence: transaction.receiptOcrData.overallConfidence || 0,
            }
            setOcrData(converted)
        }
    }, [transaction.receiptOcrData, ocrData])

    const handleExtract = async () => {
        if (!transaction.receiptUrl) {
            toast.error("No receipt available for OCR extraction")
            return
        }

        setIsExtracting(true)
        try {
            const result = await extractReceiptOcr(transaction.id)
            setOcrData(result.receiptOcrData)
            setSuggestedCategory(result.suggestedCategory)
            toast.success("Receipt data extracted successfully")
            // Show review modal automatically
            setShowReviewModal(true)
        } catch (error: any) {
            console.error("OCR extraction error:", error)
            toast.error(error.message || "Failed to extract receipt data")
        } finally {
            setIsExtracting(false)
        }
    }

    const handleReview = async () => {
        if (!ocrData && transaction.receiptOcrData) {
            // Load OCR data if not already loaded
            setIsLoadingOcr(true)
            try {
                const data = await getReceiptOcr(transaction.id)
                if (data) {
                    setOcrData(data)
                }
            } catch (error: any) {
                console.error("Failed to load OCR data:", error)
                toast.error("Failed to load OCR data")
            } finally {
                setIsLoadingOcr(false)
            }
        }
        setShowReviewModal(true)
    }

    const handleApplied = async () => {
        if (onOcrChange) {
            await onOcrChange()
        }
        setShowReviewModal(false)
    }

    const handleDiscarded = async () => {
        if (onOcrChange) {
            await onOcrChange()
        }
        setOcrData(null)
        setSuggestedCategory(undefined)
        setShowReviewModal(false)
    }

    if (!transaction.receiptUrl) {
        return null
    }

    return (
        <>
            <div className={cn("flex items-center gap-2 flex-wrap", className)}>
                {/* OCR Status Badge */}
                {ocrStatus !== "not_extracted" && (
                    <Badge
                        variant={ocrStatus === "applied" ? "default" : "secondary"}
                        className="text-xs"
                    >
                        {ocrStatus === "applied" ? (
                            <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                OCR Applied
                            </>
                        ) : (
                            <>
                                <FileText className="w-3 h-3 mr-1" />
                                OCR Available
                            </>
                        )}
                    </Badge>
                )}

                {/* Confidence Indicator */}
                {ocrData && (
                    <Badge
                        variant={
                            ocrData.overallConfidence >= 0.7
                                ? "default"
                                : ocrData.overallConfidence >= 0.4
                                    ? "secondary"
                                    : "destructive"
                        }
                        className="text-xs"
                    >
                        {ocrData.overallConfidence >= 0.7
                            ? "High Confidence"
                            : ocrData.overallConfidence >= 0.4
                                ? "Medium Confidence"
                                : "Low Confidence"}
                    </Badge>
                )}

                {/* Extract Button */}
                {ocrStatus === "not_extracted" && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleExtract}
                        disabled={isExtracting}
                    >
                        {isExtracting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Extracting...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Extract Receipt Data
                            </>
                        )}
                    </Button>
                )}

                {/* Review Button */}
                {ocrStatus === "extracted" && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleReview}
                        disabled={isLoadingOcr}
                    >
                        {isLoadingOcr ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4 mr-2" />
                                Review OCR Data
                            </>
                        )}
                    </Button>
                )}

                {/* Apply Button (if extracted but not applied) */}
                {ocrStatus === "extracted" && (
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={handleReview}
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Apply OCR Data
                    </Button>
                )}
            </div>

            {/* OCR Review Modal */}
            {showReviewModal && ocrData && (
                <ReceiptOcrReviewModal
                    transactionId={transaction.id}
                    transactionType={transaction.type}
                    ocrData={ocrData}
                    suggestedCategory={suggestedCategory}
                    open={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    onApplied={handleApplied}
                    onDiscarded={handleDiscarded}
                />
            )}
        </>
    )
}

