import { getData, patch, del } from '@/lib/api-client'

/**
 * Receipt Metadata
 */
export interface ReceiptMetadata {
    receiptUrl?: string
    receiptFilename?: string
    receiptMimetype?: string
    receiptSize?: number
    receiptUploadedAt?: string
}

/**
 * Receipt OCR Field
 */
export interface ReceiptOcrField {
    value: string | number | null
    confidence: number // 0-1
}

/**
 * Receipt OCR Data
 */
export interface ReceiptOcrData {
    merchantName?: ReceiptOcrField
    merchantAddress?: ReceiptOcrField
    date?: ReceiptOcrField
    totalAmount?: ReceiptOcrField
    taxAmount?: ReceiptOcrField
    subtotal?: ReceiptOcrField
    items?: Array<{
        description: string
        quantity?: number
        price?: number
        total?: number
        confidence: number
    }>
    paymentMethod?: ReceiptOcrField
    receiptNumber?: ReceiptOcrField
    overallConfidence: number
}

/**
 * Category Suggestion
 */
export interface CategorySuggestion {
    categoryId: string
    categoryName: string
    confidence: number
    source?: string
}

/**
 * Extract Receipt OCR Response
 */
export interface ExtractReceiptOcrResponse {
    receiptOcrData: ReceiptOcrData
    suggestedCategory?: CategorySuggestion
}

/**
 * Apply OCR Data Request
 */
export interface ApplyOcrDataRequest {
    fieldsToApply?: string[] // ['amount', 'date', 'description', 'categoryId', 'paymentMethod']
    categoryId?: string // Optional: override suggested category
}

/**
 * Upload receipt file for a transaction
 */
export async function uploadReceipt(
    transactionId: string,
    file: File
): Promise<{ receiptUrl: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    const endpoint = `${API_URL}/finance/transactions/${transactionId}/receipt`

    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to upload receipt' }))
        throw new Error(error.message || 'Failed to upload receipt')
    }

    const result = await response.json()
    // Response format: { success: true, data: Transaction } where Transaction has receiptUrl
    if (result.data?.receiptUrl) {
        return { receiptUrl: result.data.receiptUrl }
    }
    if (result.data && typeof result.data === 'object' && 'receiptUrl' in result.data) {
        return { receiptUrl: result.data.receiptUrl }
    }
    if (result.receiptUrl) {
        return { receiptUrl: result.receiptUrl }
    }
    throw new Error('No receipt URL returned from upload')
}

/**
 * Get receipt URL for a transaction
 */
export async function getReceiptUrl(transactionId: string): Promise<string> {
    const result = await getData<{ receiptUrl: string }>(`/finance/transactions/${transactionId}/receipt`)
    return result.receiptUrl
}

/**
 * Delete receipt from a transaction
 */
export async function deleteReceipt(transactionId: string): Promise<void> {
    await del(`/finance/transactions/${transactionId}/receipt`)
}

/**
 * Extract receipt data using OCR
 */
export async function extractReceiptOcr(
    transactionId: string
): Promise<ExtractReceiptOcrResponse> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    const endpoint = `${API_URL}/finance/transactions/${transactionId}/receipt/extract`

    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to extract receipt OCR' }))
        throw new Error(error.message || 'Failed to extract receipt OCR')
    }

    const result = await response.json()
    // Response format: { success: true, data: { receiptOcrData: ..., suggestedCategory: ... } }
    return result.data || result
}

/**
 * Get receipt OCR data for a transaction
 */
export async function getReceiptOcr(transactionId: string): Promise<ReceiptOcrData | null> {
    const result = await getData<{ receiptOcrData: ReceiptOcrData | null }>(
        `/finance/transactions/${transactionId}/receipt/ocr`
    )
    return result.receiptOcrData
}

/**
 * Apply OCR data to transaction
 */
export async function applyOcrData(
    transactionId: string,
    data: ApplyOcrDataRequest
): Promise<void> {
    await patch(`/finance/transactions/${transactionId}/apply-ocr`, data)
}

/**
 * Discard receipt OCR data
 */
export async function discardReceiptOcr(transactionId: string): Promise<void> {
    await del(`/finance/transactions/${transactionId}/receipt/ocr`)
}

