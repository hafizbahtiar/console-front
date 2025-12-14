import { get, post, patch, del, getData, postData } from '@/lib/api-client'
import { TransactionType } from "./finance-transactions";

/**
 * Saved Transaction Template Interface
 * Standalone templates that users can save and reuse (separate from recurring transaction templates)
 */
export interface SavedTransactionTemplate {
    id: string;
    userId: string;
    name: string;
    amount: number;
    description: string;
    type: TransactionType;
    categoryId?: string;
    notes?: string;
    tags: string[];
    paymentMethod?: string;
    reference?: string;
    category?: string;
    usageCount: number;
    lastUsedAt?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Create Transaction Template DTO
 */
export interface CreateTransactionTemplateDto {
    name: string;
    amount: number;
    description: string;
    type: TransactionType;
    categoryId?: string;
    notes?: string;
    tags?: string[];
    paymentMethod?: string;
    reference?: string;
    category?: string;
}

/**
 * Update Transaction Template DTO
 */
export interface UpdateTransactionTemplateDto {
    name?: string;
    amount?: number;
    description?: string;
    type?: TransactionType;
    categoryId?: string;
    notes?: string;
    tags?: string[];
    paymentMethod?: string;
    reference?: string;
    category?: string;
}

/**
 * Transaction Template Filters
 */
export interface TransactionTemplateFilters {
    type?: TransactionType;
    category?: string;
    search?: string;
    sortBy?: 'usageCount' | 'name' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Get all transaction templates
 */
export async function getTransactionTemplates(filters?: TransactionTemplateFilters): Promise<SavedTransactionTemplate[]> {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

    const query = params.toString() ? `?${params.toString()}` : ''
    return getData<SavedTransactionTemplate[]>(`/finance/transaction-templates${query}`)
}

/**
 * Get a single transaction template
 */
export async function getTransactionTemplate(id: string): Promise<SavedTransactionTemplate> {
    return getData<SavedTransactionTemplate>(`/finance/transaction-templates/${id}`)
}

/**
 * Create a new transaction template
 */
export async function createTransactionTemplate(data: CreateTransactionTemplateDto): Promise<SavedTransactionTemplate> {
    return postData<SavedTransactionTemplate>('/finance/transaction-templates', data)
}

/**
 * Update a transaction template
 */
export async function updateTransactionTemplate(id: string, data: UpdateTransactionTemplateDto): Promise<SavedTransactionTemplate> {
    return patch<SavedTransactionTemplate>(`/finance/transaction-templates/${id}`, data)
}

/**
 * Delete a transaction template
 */
export async function deleteTransactionTemplate(id: string): Promise<void> {
    return del(`/finance/transaction-templates/${id}`)
}

/**
 * Bulk delete transaction templates
 */
export async function bulkDeleteTransactionTemplates(ids: string[]): Promise<{ deletedCount: number; failedIds: string[] }> {
    return postData<{ deletedCount: number; failedIds: string[] }>('/finance/transaction-templates/bulk-delete', { ids })
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsage(id: string): Promise<SavedTransactionTemplate> {
    return postData<SavedTransactionTemplate>(`/finance/transaction-templates/${id}/increment-usage`, {})
}

