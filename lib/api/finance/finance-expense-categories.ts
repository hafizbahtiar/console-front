import { get, patch, del, getData, postData, patchData } from '@/lib/api-client'
import { BulkDeleteResponse } from '../portfolio/types'

export interface ExpenseCategory {
    id: string
    userId: string
    name: string
    color?: string
    icon?: string
    order: number
    description?: string
    createdAt: string
    updatedAt: string
}

export interface CreateExpenseCategoryDto {
    name: string
    color?: string
    icon?: string
    order?: number
    description?: string
}

export interface UpdateExpenseCategoryDto extends Partial<CreateExpenseCategoryDto> { }

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
    return getData<ExpenseCategory[]>('/finance/expense-categories')
}

export async function getExpenseCategory(id: string): Promise<ExpenseCategory> {
    return getData<ExpenseCategory>(`/finance/expense-categories/${id}`)
}

export async function createExpenseCategory(data: CreateExpenseCategoryDto): Promise<ExpenseCategory> {
    return postData<ExpenseCategory>('/finance/expense-categories', data)
}

export async function updateExpenseCategory(id: string, data: UpdateExpenseCategoryDto): Promise<ExpenseCategory> {
    return patchData<ExpenseCategory>(`/finance/expense-categories/${id}`, data)
}

export async function deleteExpenseCategory(id: string): Promise<void> {
    return del<void>(`/finance/expense-categories/${id}`)
}

export async function reorderExpenseCategories(categoryIds: string[]): Promise<void> {
    return patch<void>('/finance/expense-categories/reorder', { categoryIds })
}

export async function bulkDeleteExpenseCategories(ids: string[]): Promise<BulkDeleteResponse> {
    return postData<BulkDeleteResponse>('/finance/expense-categories/bulk-delete', { ids })
}

