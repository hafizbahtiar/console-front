import { get, post, patch, del, getData, postData } from '@/lib/api-client'

export type TransactionType = 'expense' | 'income'

export interface Transaction {
    id: string
    userId: string
    amount: number
    date: string
    description: string
    type: TransactionType
    categoryId?: string
    notes?: string
    tags: string[]
    paymentMethod?: string
    reference?: string
    recurringTransactionId?: string // ID of the recurring transaction that generated this transaction
    // Currency fields
    currency?: string // ISO 4217 currency code (default: 'MYR')
    exchangeRate?: number // Exchange rate used for conversion
    baseAmount?: number // Amount in base currency
    baseCurrency?: string // User's base currency
    // Receipt fields
    receiptUrl?: string
    receiptFilename?: string
    receiptMimetype?: string
    receiptSize?: number
    receiptUploadedAt?: string
    // OCR fields
    receiptOcrData?: {
        merchantName?: { value: string; confidence: number }
        merchantAddress?: { value: string; confidence: number }
        date?: { value: Date | string; confidence: number }
        totalAmount?: { value: number; confidence: number }
        taxAmount?: { value: number; confidence: number }
        subtotal?: { value: number; confidence: number }
        items?: Array<{
            description: string
            quantity?: number
            price?: number
            total?: number
            confidence: number
        }>
        paymentMethod?: { value: string; confidence: number }
        receiptNumber?: { value: string; confidence: number }
        overallConfidence: number
    }
    suggestedCategoryId?: string
    suggestedCategoryConfidence?: number
    ocrApplied?: boolean
    ocrAppliedAt?: string
    createdAt: string
    updatedAt: string
}

export interface CreateTransactionInput {
    amount: number
    date: string
    description: string
    type: TransactionType
    categoryId?: string
    notes?: string
    tags?: string[]
    paymentMethod?: string
    reference?: string
    currency?: string // ISO 4217 currency code (default: 'MYR')
    exchangeRate?: number // Optional: manual exchange rate override
    baseAmount?: number // Optional: manual base amount override
    baseCurrency?: string // Optional: manual base currency override
}

export interface UpdateTransactionInput {
    amount?: number
    date?: string
    description?: string
    type?: TransactionType
    categoryId?: string
    notes?: string
    tags?: string[]
    paymentMethod?: string
    reference?: string
    currency?: string // ISO 4217 currency code
    exchangeRate?: number // Optional: manual exchange rate override
    baseAmount?: number // Optional: manual base amount override
    baseCurrency?: string // Optional: manual base currency override
}

export interface TransactionFilters {
    page?: number
    limit?: number
    type?: TransactionType
    categoryId?: string
    startDate?: string
    endDate?: string
    search?: string
    tags?: string[]
    paymentMethod?: string
    currency?: string // Filter by currency code
    sortBy?: 'date' | 'amount' | 'createdAt' | 'updatedAt'
    sortOrder?: 'asc' | 'desc'
}

export interface BulkDeleteResponse {
    deletedCount: number
    failedIds: string[]
}

export interface TransactionStatistics {
    totalIncome: number
    totalExpenses: number
    netAmount: number
    transactionCount: number
}

export async function getTransactions(
    filters?: TransactionFilters
): Promise<{ data: Transaction[]; pagination: any }> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.type) params.append('type', filters.type)
    if (filters?.categoryId) params.append('categoryId', filters.categoryId)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','))
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod)
    if (filters?.currency) params.append('currency', filters.currency)
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

    const query = params.toString() ? `?${params.toString()}` : ''
    return get<{ data: Transaction[]; pagination: any }>(`/finance/transactions${query}`)
}

export async function getTransaction(id: string): Promise<Transaction> {
    return getData<Transaction>(`/finance/transactions/${id}`)
}

export async function createTransaction(data: CreateTransactionInput): Promise<Transaction> {
    return postData<Transaction>('/finance/transactions', data)
}

export async function updateTransaction(
    id: string,
    data: UpdateTransactionInput
): Promise<Transaction> {
    return patch<Transaction>(`/finance/transactions/${id}`, data)
}

export async function deleteTransaction(id: string): Promise<void> {
    return del(`/finance/transactions/${id}`)
}

export async function bulkDeleteTransactions(ids: string[]): Promise<BulkDeleteResponse> {
    return postData<BulkDeleteResponse>('/finance/transactions/bulk-delete', { ids })
}

export async function getTransactionStatistics(
    startDate?: string,
    endDate?: string
): Promise<TransactionStatistics> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const query = params.toString() ? `?${params.toString()}` : ''
    return getData<TransactionStatistics>(`/finance/transactions/statistics${query}`)
}

/**
 * Save a transaction as a template
 */
export async function saveTransactionAsTemplate(id: string, name: string, category?: string): Promise<any> {
    return postData<any>(`/finance/transactions/${id}/save-as-template`, { name, category })
}

/**
 * Create a transaction from a template
 */
export async function createTransactionFromTemplate(templateId: string, date: string): Promise<Transaction> {
    return postData<Transaction>(`/finance/transactions/from-template/${templateId}`, { date })
}

/**
 * Duplicate a transaction
 */
export async function duplicateTransaction(id: string, dateAdjustment?: number): Promise<Transaction> {
    return postData<Transaction>(`/finance/transactions/${id}/duplicate`, { dateAdjustment })
}

/**
 * Bulk duplicate transactions
 */
export async function bulkDuplicateTransactions(ids: string[], dateAdjustment?: number): Promise<{ duplicatedCount: number; failedIds: string[]; transactions: Transaction[] }> {
    return postData<{ duplicatedCount: number; failedIds: string[]; transactions: Transaction[] }>(
        '/finance/transactions/bulk-duplicate',
        { ids, dateAdjustment }
    )
}

