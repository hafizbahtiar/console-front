/**
 * Recent Searches Utilities
 * 
 * Utilities for managing recent searches in localStorage
 */

const STORAGE_KEY = 'finance_recent_searches'
const MAX_RECENT_SEARCHES = 10

export interface RecentSearch {
    query: string
    timestamp: number
    filters?: Record<string, any>
}

/**
 * Get recent searches from localStorage
 */
export function getRecentSearches(): RecentSearch[] {
    if (typeof window === 'undefined') {
        return []
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            return JSON.parse(stored) as RecentSearch[]
        }
    } catch (error) {
        console.error('Failed to load recent searches:', error)
    }

    return []
}

/**
 * Add a search to recent searches
 */
export function addRecentSearch(query: string, filters?: Record<string, any>): void {
    if (typeof window === 'undefined' || !query.trim()) {
        return
    }

    try {
        const recent = getRecentSearches()
        
        // Remove duplicate (if exists)
        const filtered = recent.filter((search) => search.query !== query.trim())
        
        // Add to beginning
        const newSearch: RecentSearch = {
            query: query.trim(),
            timestamp: Date.now(),
            filters,
        }
        
        const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
        console.error('Failed to save recent search:', error)
    }
}

/**
 * Remove a search from recent searches
 */
export function removeRecentSearch(query: string): void {
    if (typeof window === 'undefined') {
        return
    }

    try {
        const recent = getRecentSearches()
        const filtered = recent.filter((search) => search.query !== query)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
        console.error('Failed to remove recent search:', error)
    }
}

/**
 * Clear all recent searches
 */
export function clearRecentSearches(): void {
    if (typeof window === 'undefined') {
        return
    }

    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('Failed to clear recent searches:', error)
    }
}

