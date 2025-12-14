/**
 * Currency Display Preferences Utilities
 * 
 * Utilities for managing currency display preferences stored in localStorage
 */

export interface CurrencyDisplayPreferences {
    symbolPosition: "before" | "after"
    showCode: boolean
}

const STORAGE_KEY = "currencyDisplayPreferences"

const DEFAULT_PREFERENCES: CurrencyDisplayPreferences = {
    symbolPosition: "before",
    showCode: false,
}

/**
 * Get currency display preferences from localStorage
 */
export function getCurrencyDisplayPreferences(): CurrencyDisplayPreferences {
    if (typeof window === "undefined") {
        return DEFAULT_PREFERENCES
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const prefs = JSON.parse(stored)
            return {
                symbolPosition: prefs.symbolPosition || DEFAULT_PREFERENCES.symbolPosition,
                showCode: prefs.showCode ?? DEFAULT_PREFERENCES.showCode,
            }
        }
    } catch (error) {
        console.error("Failed to load currency display preferences:", error)
    }

    return DEFAULT_PREFERENCES
}

/**
 * Save currency display preferences to localStorage
 */
export function saveCurrencyDisplayPreferences(
    preferences: Partial<CurrencyDisplayPreferences>
): void {
    if (typeof window === "undefined") {
        return
    }

    try {
        const current = getCurrencyDisplayPreferences()
        const updated = { ...current, ...preferences }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
        console.error("Failed to save currency display preferences:", error)
    }
}

/**
 * Reset currency display preferences to defaults
 */
export function resetCurrencyDisplayPreferences(): void {
    if (typeof window === "undefined") {
        return
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES))
    } catch (error) {
        console.error("Failed to reset currency display preferences:", error)
    }
}

