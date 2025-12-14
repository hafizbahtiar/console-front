import { getData, post, patch, del } from '@/lib/api-client'

/**
 * Merchant Category Mapping
 */
export interface MerchantCategory {
    id: string
    merchantName: string
    categoryId: string
    categoryName: string
    matchCount: number
    confidence: number // 0-1
    lastUsedAt: string
    createdAt: string
    updatedAt: string
}

/**
 * Create Merchant Category Input
 */
export interface CreateMerchantCategoryInput {
    merchantName: string
    categoryId: string
}

/**
 * Update Merchant Category Input
 */
export interface UpdateMerchantCategoryInput {
    merchantName?: string
    categoryId?: string
}

/**
 * Get all merchant category mappings for the current user
 */
export async function getMerchantCategories(): Promise<MerchantCategory[]> {
    const result = await getData<MerchantCategory[]>('/finance/merchant-categories')
    return result
}

/**
 * Get a single merchant category mapping by ID
 */
export async function getMerchantCategory(id: string): Promise<MerchantCategory> {
    const result = await getData<MerchantCategory>(`/finance/merchant-categories/${id}`)
    return result
}

/**
 * Create a new merchant category mapping
 */
export async function createMerchantCategory(
    data: CreateMerchantCategoryInput
): Promise<MerchantCategory> {
    const result = await post<MerchantCategory>('/finance/merchant-categories', data)
    return result
}

/**
 * Update a merchant category mapping
 */
export async function updateMerchantCategory(
    id: string,
    data: UpdateMerchantCategoryInput
): Promise<MerchantCategory> {
    const result = await patch<MerchantCategory>(`/finance/merchant-categories/${id}`, data)
    return result
}

/**
 * Delete a merchant category mapping
 */
export async function deleteMerchantCategory(id: string): Promise<void> {
    await del(`/finance/merchant-categories/${id}`)
}

