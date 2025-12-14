import { get, patch, del, getData, postData, patchData } from '@/lib/api-client'
import { BulkDeleteResponse } from '../portfolio/types'

export interface IncomeCategory {
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

export interface CreateIncomeCategoryDto {
    name: string
    color?: string
    icon?: string
    order?: number
    description?: string
}

export interface UpdateIncomeCategoryDto extends Partial<CreateIncomeCategoryDto> { }

export async function getIncomeCategories(): Promise<IncomeCategory[]> {
    return getData<IncomeCategory[]>('/finance/income-categories')
}

export async function getIncomeCategory(id: string): Promise<IncomeCategory> {
    return getData<IncomeCategory>(`/finance/income-categories/${id}`)
}

export async function createIncomeCategory(data: CreateIncomeCategoryDto): Promise<IncomeCategory> {
    return postData<IncomeCategory>('/finance/income-categories', data)
}

export async function updateIncomeCategory(id: string, data: UpdateIncomeCategoryDto): Promise<IncomeCategory> {
    return patchData<IncomeCategory>(`/finance/income-categories/${id}`, data)
}

export async function deleteIncomeCategory(id: string): Promise<void> {
    return del<void>(`/finance/income-categories/${id}`)
}

export async function reorderIncomeCategories(categoryIds: string[]): Promise<void> {
    return patch<void>('/finance/income-categories/reorder', { categoryIds })
}

export async function bulkDeleteIncomeCategories(ids: string[]): Promise<BulkDeleteResponse> {
    return postData<BulkDeleteResponse>('/finance/income-categories/bulk-delete', { ids })
}

