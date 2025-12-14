import { get, post, patch, del, getData, postData } from '@/lib/api-client'
import type { TransactionType } from './finance-transactions'

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

export interface TransactionTemplate {
    amount: number
    description: string
    type: TransactionType
    categoryId?: string | null
    notes?: string
    tags?: string[]
    paymentMethod?: string
    reference?: string
}

export interface RecurringTransaction {
    id: string
    userId: string
    template: TransactionTemplate
    frequency: RecurringFrequency
    interval: number
    startDate: string
    endDate?: string
    nextRunDate: string
    isActive: boolean
    lastRunDate?: string
    runCount: number
    createdAt: string
    updatedAt: string
}

export interface CreateRecurringTransactionInput {
    template: TransactionTemplate
    frequency: RecurringFrequency
    interval?: number
    startDate: string
    endDate?: string
    isActive?: boolean
}

export interface UpdateRecurringTransactionInput {
    template?: Partial<TransactionTemplate>
    frequency?: RecurringFrequency
    interval?: number
    startDate?: string
    endDate?: string | null
    isActive?: boolean
}

export interface RecurringTransactionFilters {
    frequency?: RecurringFrequency
    isActive?: boolean
    search?: string
}

export interface BulkDeleteRecurringTransactionResponse {
    deletedCount: number
    failedIds: string[]
}

export interface GenerateRecurringTransactionResponse {
    generatedCount: number
    transactions: Array<{
        id: string
        amount: number
        date: string
        description: string
        type: TransactionType
        categoryId?: string
        notes?: string
        tags: string[]
        paymentMethod?: string
        reference?: string
        createdAt: string
        updatedAt: string
    }>
}

export async function getRecurringTransactions(
    filters?: RecurringTransactionFilters
): Promise<RecurringTransaction[]> {
    const params = new URLSearchParams()
    if (filters?.frequency) params.append('frequency', filters.frequency)
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
    if (filters?.search) params.append('search', filters.search)

    const query = params.toString() ? `?${params.toString()}` : ''
    const response = await get<{ data: RecurringTransaction[] }>(`/finance/recurring-transactions${query}`)
    return response.data
}

export async function getRecurringTransaction(id: string): Promise<RecurringTransaction> {
    return getData<RecurringTransaction>(`/finance/recurring-transactions/${id}`)
}

export async function createRecurringTransaction(
    data: CreateRecurringTransactionInput
): Promise<RecurringTransaction> {
    return postData<RecurringTransaction>('/finance/recurring-transactions', data)
}

export async function updateRecurringTransaction(
    id: string,
    data: UpdateRecurringTransactionInput
): Promise<RecurringTransaction> {
    return patch<RecurringTransaction>(`/finance/recurring-transactions/${id}`, data)
}

export async function deleteRecurringTransaction(id: string): Promise<void> {
    return del(`/finance/recurring-transactions/${id}`)
}

export async function bulkDeleteRecurringTransactions(ids: string[]): Promise<BulkDeleteRecurringTransactionResponse> {
    return postData<BulkDeleteRecurringTransactionResponse>('/finance/recurring-transactions/bulk-delete', { ids })
}

export async function pauseRecurringTransaction(id: string): Promise<RecurringTransaction> {
    return patch<RecurringTransaction>(`/finance/recurring-transactions/${id}/pause`, {})
}

export async function resumeRecurringTransaction(id: string): Promise<RecurringTransaction> {
    return patch<RecurringTransaction>(`/finance/recurring-transactions/${id}/resume`, {})
}

export async function skipNextRecurringTransaction(id: string): Promise<RecurringTransaction> {
    return patch<RecurringTransaction>(`/finance/recurring-transactions/${id}/skip-next`, {})
}

export async function generateRecurringTransaction(
    id: string,
    generateUntilDate?: string
): Promise<GenerateRecurringTransactionResponse> {
    const params = new URLSearchParams()
    if (generateUntilDate) params.append('generateUntilDate', generateUntilDate)

    const query = params.toString() ? `?${params.toString()}` : ''
    const response = await post<{ data: GenerateRecurringTransactionResponse }>(
        `/finance/recurring-transactions/${id}/generate${query}`,
        {}
    )
    return response.data
}

export async function editFutureRecurringTransaction(
    id: string,
    data: UpdateRecurringTransactionInput,
    endCurrent: boolean = true
): Promise<{
    current: RecurringTransaction
    new?: RecurringTransaction
}> {
    const params = new URLSearchParams()
    if (endCurrent) params.append('endCurrent', 'true')

    const query = params.toString() ? `?${params.toString()}` : ''
    const response = await post<{
        data: {
            current: RecurringTransaction
            new?: RecurringTransaction
        }
    }>(`/finance/recurring-transactions/${id}/edit-future${query}`, data)
    return response.data
}

