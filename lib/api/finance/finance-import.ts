import { getData, postData, postFormData } from "../../api-client"

export interface ColumnMapping {
    date?: string
    type?: string
    amount?: string
    description?: string
    category?: string
    notes?: string
    tags?: string
    paymentMethod?: string
    reference?: string
    currency?: string
}

export interface ImportPreview {
    totalRows: number
    validRows: number
    invalidRows: number
    errors: Array<{ row: number; errors: string[] }>
    sample: any[]
}

export interface ImportResult {
    importedCount: number
    failedCount: number
    errors: string[]
}

export interface ImportHistory {
    id: string
    filename: string
    fileType: string
    totalRows: number
    importedCount: number
    failedCount: number
    errors: string[]
    status: 'pending' | 'processing' | 'completed' | 'failed'
    columnMapping?: Record<string, string>
    createdAt: string
    completedAt?: string
}

/**
 * Preview import (validate file and return preview)
 */
export async function previewImport(
    file: File,
    columnMapping: ColumnMapping
): Promise<ImportPreview> {
    const formData = new FormData()
    formData.append('file', file)
    Object.entries(columnMapping).forEach(([key, value]) => {
        if (value) {
            formData.append(key, value)
        }
    })

    return postFormData<ImportPreview>('/finance/import/preview', formData)
}

/**
 * Import transactions from file
 */
export async function importTransactions(
    file: File,
    columnMapping: ColumnMapping
): Promise<ImportResult> {
    const formData = new FormData()
    formData.append('file', file)
    Object.entries(columnMapping).forEach(([key, value]) => {
        if (value) {
            formData.append(key, value)
        }
    })

    return postFormData<ImportResult>('/finance/import', formData)
}

/**
 * Get import history
 */
export async function getImportHistory(limit: number = 50): Promise<ImportHistory[]> {
    return getData<ImportHistory[]>(`/finance/import/history?limit=${limit}`)
}

/**
 * Get import history by ID
 */
export async function getImportHistoryById(id: string): Promise<ImportHistory> {
    return getData<ImportHistory>(`/finance/import/history/${id}`)
}

