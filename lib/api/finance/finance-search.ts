import { get } from '@/lib/api-client'

export interface SearchSuggestion {
    text: string
    type: 'description' | 'note' | 'reference' | 'tag' | 'paymentMethod'
    count: number
}

export interface SearchAnalytics {
    popularDescriptions: Array<{ text: string; count: number }>
    popularTags: Array<{ text: string; count: number }>
    popularPaymentMethods: Array<{ text: string; count: number }>
}

/**
 * Get search suggestions based on transaction history
 */
export async function getSearchSuggestions(query?: string, limit: number = 10): Promise<SearchSuggestion[]> {
    const params = new URLSearchParams()
    if (query) params.append('query', query)
    params.append('limit', limit.toString())
    
    const response = await get<{ data: SearchSuggestion[] }>(
        `/api/v1/finance/transactions/search/suggestions?${params.toString()}`
    )
    return response.data
}

/**
 * Get search analytics
 */
export async function getSearchAnalytics(limit: number = 10): Promise<SearchAnalytics> {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    
    const response = await get<{ data: SearchAnalytics }>(
        `/api/v1/finance/transactions/search/analytics?${params.toString()}`
    )
    return response.data
}

