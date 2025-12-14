import { get, post, getData, postData } from '@/lib/api-client'

/**
 * Currency Conversion Request
 */
export interface ConvertCurrencyDto {
    amount: number
    fromCurrency: string
    toCurrency: string
    date?: string // Optional date for historical rates (ISO 8601 format)
}

/**
 * Currency Conversion Response
 */
export interface ConvertCurrencyResponse {
    amount: number
    fromCurrency: string
    toCurrency: string
    convertedAmount: number
    exchangeRate: number
    date?: string
}

/**
 * Exchange Rate Response
 */
export interface ExchangeRateResponse {
    fromCurrency: string
    toCurrency: string
    rate: number
    date?: string
}

/**
 * Historical Exchange Rates Response
 */
export interface HistoricalExchangeRatesResponse {
    fromCurrency: string
    toCurrency: string
    rates: Array<{
        date: string
        rate: number
    }>
}

/**
 * Currency Preferences Response
 */
export interface CurrencyPreferences {
    baseCurrency: string
    supportedCurrencies: string[]
}

/**
 * Supported Currency
 */
export interface SupportedCurrency {
    code: string
    name: string
    symbol: string
}

/**
 * Convert currency amount
 */
export async function convertCurrency(data: ConvertCurrencyDto): Promise<ConvertCurrencyResponse> {
    return postData<ConvertCurrencyResponse>('/finance/currency/convert', data)
}

/**
 * Get current exchange rates
 * @param fromCurrency - Source currency code (optional, defaults to user's base currency)
 * @param toCurrency - Target currency code (optional, returns rates to common currencies if not provided)
 * @param date - Optional date for historical rate (ISO 8601 format)
 */
export async function getExchangeRates(
    fromCurrency?: string,
    toCurrency?: string,
    date?: string
): Promise<ExchangeRateResponse | ExchangeRateResponse[]> {
    const params = new URLSearchParams()
    if (fromCurrency) params.append('from', fromCurrency)
    if (toCurrency) params.append('to', toCurrency)
    if (date) params.append('date', date)

    const query = params.toString() ? `?${params.toString()}` : ''
    return getData<ExchangeRateResponse | ExchangeRateResponse[]>(`/finance/currency/rates${query}`)
}

/**
 * Get historical exchange rates
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @param startDate - Start date (ISO 8601 format)
 * @param endDate - End date (ISO 8601 format, optional, defaults to today)
 */
export async function getHistoricalExchangeRates(
    fromCurrency: string,
    toCurrency: string,
    startDate: string,
    endDate?: string
): Promise<HistoricalExchangeRatesResponse> {
    const params = new URLSearchParams()
    params.append('from', fromCurrency)
    params.append('to', toCurrency)
    params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const query = params.toString() ? `?${params.toString()}` : ''
    return getData<HistoricalExchangeRatesResponse>(`/finance/currency/rates/history${query}`)
}

/**
 * Get user currency preferences
 */
export async function getCurrencyPreferences(): Promise<CurrencyPreferences> {
    return getData<CurrencyPreferences>('/settings/currency')
}

/**
 * Update user currency preferences
 */
export interface UpdateCurrencyPreferencesDto {
    baseCurrency?: string
    supportedCurrencies?: string[]
}

export async function updateCurrencyPreferences(
    data: UpdateCurrencyPreferencesDto
): Promise<CurrencyPreferences> {
    return postData<CurrencyPreferences>('/settings/currency', data)
}

/**
 * Get supported currencies list
 */
export async function getSupportedCurrencies(): Promise<SupportedCurrency[]> {
    return getData<SupportedCurrency[]>('/settings/currencies')
}

