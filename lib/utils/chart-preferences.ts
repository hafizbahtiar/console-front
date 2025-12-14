/**
 * Chart Preferences Utilities
 * 
 * Utilities for managing chart preferences in localStorage
 */

export type ChartType = 'line' | 'area' | 'bar' | 'pie' | 'composed'

export interface ChartPreferences {
    chartType?: ChartType
    colors?: string[]
    showLabels?: boolean
    showGrid?: boolean
    showLegend?: boolean
    tooltipFormat?: 'default' | 'detailed' | 'minimal'
}

const STORAGE_PREFIX = 'chart_prefs_'

/**
 * Get chart preferences from localStorage
 */
export function getChartPreferences(chartId: string): ChartPreferences {
    if (typeof window === 'undefined') {
        return {}
    }

    try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${chartId}`)
        if (stored) {
            return JSON.parse(stored) as ChartPreferences
        }
    } catch (error) {
        console.error('Failed to load chart preferences:', error)
    }

    return {}
}

/**
 * Save chart preferences to localStorage
 */
export function saveChartPreferences(chartId: string, preferences: ChartPreferences): void {
    if (typeof window === 'undefined') {
        return
    }

    try {
        localStorage.setItem(`${STORAGE_PREFIX}${chartId}`, JSON.stringify(preferences))
    } catch (error) {
        console.error('Failed to save chart preferences:', error)
    }
}

/**
 * Update specific chart preference
 */
export function updateChartPreference(
    chartId: string,
    key: keyof ChartPreferences,
    value: ChartPreferences[keyof ChartPreferences]
): void {
    const current = getChartPreferences(chartId)
    saveChartPreferences(chartId, { ...current, [key]: value })
}

/**
 * Clear chart preferences
 */
export function clearChartPreferences(chartId: string): void {
    if (typeof window === 'undefined') {
        return
    }

    try {
        localStorage.removeItem(`${STORAGE_PREFIX}${chartId}`)
    } catch (error) {
        console.error('Failed to clear chart preferences:', error)
    }
}

