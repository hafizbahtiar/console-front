import { get, post, patch, del } from '@/lib/api-client'
import type { FinanceFilterState } from '@/lib/utils/finance-filters'

export interface FilterPreset {
    id: string
    userId: string
    name: string
    filters: FinanceFilterState
    description?: string
    isDefault: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateFilterPresetInput {
    name: string
    filters: FinanceFilterState
    description?: string
    isDefault?: boolean
}

export interface UpdateFilterPresetInput {
    name?: string
    filters?: FinanceFilterState
    description?: string
    isDefault?: boolean
}

export interface BulkDeleteFilterPresetInput {
    ids: string[]
}

/**
 * Get all filter presets for the current user
 */
export async function getFilterPresets(): Promise<FilterPreset[]> {
    const response = await get<{ data: FilterPreset[] }>('/api/v1/finance/filter-presets')
    return response.data
}

/**
 * Get a single filter preset by ID
 */
export async function getFilterPreset(id: string): Promise<FilterPreset> {
    const response = await get<{ data: FilterPreset }>(`/api/v1/finance/filter-presets/${id}`)
    return response.data
}

/**
 * Create a new filter preset
 */
export async function createFilterPreset(input: CreateFilterPresetInput): Promise<FilterPreset> {
    const response = await post<{ data: FilterPreset }>('/api/v1/finance/filter-presets', input)
    return response.data
}

/**
 * Update a filter preset
 */
export async function updateFilterPreset(id: string, input: UpdateFilterPresetInput): Promise<FilterPreset> {
    const response = await patch<{ data: FilterPreset }>(`/api/v1/finance/filter-presets/${id}`, input)
    return response.data
}

/**
 * Delete a filter preset
 */
export async function deleteFilterPreset(id: string): Promise<void> {
    await del(`/api/v1/finance/filter-presets/${id}`)
}

/**
 * Bulk delete filter presets
 */
export async function bulkDeleteFilterPresets(input: BulkDeleteFilterPresetInput): Promise<{ deletedCount: number; failedIds: string[] }> {
    const response = await post<{ data: { deletedCount: number; failedIds: string[] } }>(
        '/api/v1/finance/filter-presets/bulk-delete',
        input
    )
    return response.data
}

/**
 * Set a filter preset as default
 */
export async function setDefaultFilterPreset(id: string): Promise<FilterPreset> {
    const response = await patch<{ data: FilterPreset }>(`/api/v1/finance/filter-presets/${id}/set-default`, {})
    return response.data
}

/**
 * Get the default filter preset
 */
export async function getDefaultFilterPreset(): Promise<FilterPreset | null> {
    const response = await get<{ data: FilterPreset | null }>('/api/v1/finance/filter-presets/default')
    return response.data
}

