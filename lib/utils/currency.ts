/**
 * Currency utilities for formatting and display
 */

/**
 * Currency symbols mapping
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
    MYR: 'RM', // Malaysian Ringgit
    USD: '$', // US Dollar
    EUR: '€', // Euro
    GBP: '£', // British Pound
    SGD: 'S$', // Singapore Dollar
    AUD: 'A$', // Australian Dollar
    JPY: '¥', // Japanese Yen
    CNY: '¥', // Chinese Yuan
    HKD: 'HK$', // Hong Kong Dollar
    THB: '฿', // Thai Baht
    IDR: 'Rp', // Indonesian Rupiah
    PHP: '₱', // Philippine Peso
    VND: '₫', // Vietnamese Dong
    INR: '₹', // Indian Rupee
    KRW: '₩', // South Korean Won
    CAD: 'C$', // Canadian Dollar
    NZD: 'NZ$', // New Zealand Dollar
    CHF: 'CHF', // Swiss Franc
}

/**
 * Currency names mapping
 */
export const CURRENCY_NAMES: Record<string, string> = {
    MYR: 'Malaysian Ringgit',
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    SGD: 'Singapore Dollar',
    AUD: 'Australian Dollar',
    JPY: 'Japanese Yen',
    CNY: 'Chinese Yuan',
    HKD: 'Hong Kong Dollar',
    THB: 'Thai Baht',
    IDR: 'Indonesian Rupiah',
    PHP: 'Philippine Peso',
    VND: 'Vietnamese Dong',
    INR: 'Indian Rupee',
    KRW: 'South Korean Won',
    CAD: 'Canadian Dollar',
    NZD: 'New Zealand Dollar',
    CHF: 'Swiss Franc',
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
    return CURRENCY_SYMBOLS[currency.toUpperCase()] || currency.toUpperCase()
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: string): string {
    return CURRENCY_NAMES[currency.toUpperCase()] || currency.toUpperCase()
}

/**
 * Format currency amount
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'MYR')
 * @param options - Formatting options
 */
export function formatCurrency(
    amount: number,
    currency: string = 'MYR',
    options?: {
        showSymbol?: boolean
        showCode?: boolean
        decimals?: number
        locale?: string
    }
): string {
    const {
        showSymbol = true,
        showCode = false,
        decimals = 2,
        locale = 'en-MY',
    } = options || {}

    const symbol = getCurrencySymbol(currency)
    const formattedAmount = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(amount)

    if (showSymbol && showCode) {
        return `${symbol} ${formattedAmount} (${currency})`
    } else if (showSymbol) {
        return `${symbol} ${formattedAmount}`
    } else if (showCode) {
        return `${formattedAmount} ${currency}`
    } else {
        return formattedAmount
    }
}

/**
 * Get default currency (MYR)
 */
export function getDefaultCurrency(): string {
    return 'MYR'
}

/**
 * Supported currencies list
 */
export const SUPPORTED_CURRENCIES = [
    'MYR',
    'USD',
    'EUR',
    'GBP',
    'SGD',
    'AUD',
    'JPY',
    'CNY',
    'HKD',
    'THB',
    'IDR',
    'PHP',
    'VND',
    'INR',
    'KRW',
    'CAD',
    'NZD',
    'CHF',
] as const

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]

