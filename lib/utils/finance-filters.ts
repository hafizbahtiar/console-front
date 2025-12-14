/**
 * Finance Filter Utilities
 * 
 * Utilities for managing finance filter state, URL query params, and navigation
 */

import { TransactionFilters, TransactionType } from "@/lib/api/finance/finance-transactions"
import { format, parseISO, isValid } from "date-fns"

export interface FinanceFilterState {
    type?: TransactionType
    categoryId?: string
    startDate?: string
    endDate?: string
    search?: string
    paymentMethod?: string
    currency?: string // ISO 4217 currency code
}

export interface FilterChip {
    id: string
    label: string
    value: string
    type: 'type' | 'category' | 'date' | 'search' | 'paymentMethod' | 'currency'
}

/**
 * Convert filter state to URL query params
 */
export function filtersToQueryParams(filters: FinanceFilterState): Record<string, string> {
    const params: Record<string, string> = {}

    if (filters.type) params.type = filters.type
    if (filters.categoryId) params.categoryId = filters.categoryId
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    if (filters.search) params.search = filters.search
    if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod
    if (filters.currency) params.currency = filters.currency

    return params
}

/**
 * Parse URL query params to filter state
 */
export function queryParamsToFilters(params: URLSearchParams): FinanceFilterState {
    const filters: FinanceFilterState = {}

    const type = params.get('type')
    if (type && (type === 'expense' || type === 'income')) {
        filters.type = type
    }

    const categoryId = params.get('categoryId')
    if (categoryId) {
        filters.categoryId = categoryId
    }

    const startDate = params.get('startDate')
    if (startDate && isValid(parseISO(startDate))) {
        filters.startDate = startDate
    }

    const endDate = params.get('endDate')
    if (endDate && isValid(parseISO(endDate))) {
        filters.endDate = endDate
    }

    const search = params.get('search')
    if (search) {
        filters.search = search
    }

    const paymentMethod = params.get('paymentMethod')
    if (paymentMethod) {
        filters.paymentMethod = paymentMethod
    }

    const currency = params.get('currency')
    if (currency && /^[A-Z]{3}$/.test(currency.toUpperCase())) {
        filters.currency = currency.toUpperCase()
    }

    return filters
}

/**
 * Convert filter state to TransactionFilters for API
 */
export function filtersToTransactionFilters(
    filters: FinanceFilterState,
    page: number = 1,
    limit: number = 10,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
): TransactionFilters {
    return {
        page,
        limit,
        type: filters.type,
        categoryId: filters.categoryId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search,
        paymentMethod: filters.paymentMethod,
        currency: filters.currency,
        sortBy: sortBy as any,
        sortOrder,
    }
}

/**
 * Generate filter chips from filter state
 */
export function generateFilterChips(
    filters: FinanceFilterState,
    categoryNames?: Map<string, string>
): FilterChip[] {
    const chips: FilterChip[] = []

    if (filters.type) {
        chips.push({
            id: 'type',
            label: 'Type',
            value: filters.type === 'expense' ? 'Expense' : 'Income',
            type: 'type',
        })
    }

    if (filters.categoryId) {
        const categoryName = categoryNames?.get(filters.categoryId) || 'Category'
        chips.push({
            id: 'category',
            label: 'Category',
            value: categoryName,
            type: 'category',
        })
    }

    if (filters.startDate || filters.endDate) {
        let dateLabel = ''
        if (filters.startDate && filters.endDate) {
            dateLabel = `${format(parseISO(filters.startDate), 'MMM dd')} - ${format(parseISO(filters.endDate), 'MMM dd, yyyy')}`
        } else if (filters.startDate) {
            dateLabel = `From ${format(parseISO(filters.startDate), 'MMM dd, yyyy')}`
        } else if (filters.endDate) {
            dateLabel = `Until ${format(parseISO(filters.endDate), 'MMM dd, yyyy')}`
        }
        chips.push({
            id: 'date',
            label: 'Date Range',
            value: dateLabel,
            type: 'date',
        })
    }

    if (filters.search) {
        chips.push({
            id: 'search',
            label: 'Search',
            value: filters.search,
            type: 'search',
        })
    }

    if (filters.paymentMethod) {
        chips.push({
            id: 'paymentMethod',
            label: 'Payment Method',
            value: filters.paymentMethod,
            type: 'paymentMethod',
        })
    }

    if (filters.currency) {
        chips.push({
            id: 'currency',
            label: 'Currency',
            value: filters.currency,
            type: 'currency',
        })
    }

    return chips
}

/**
 * Remove a filter from filter state
 */
export function removeFilter(filters: FinanceFilterState, filterType: FilterChip['type']): FinanceFilterState {
    const newFilters = { ...filters }

    switch (filterType) {
        case 'type':
            delete newFilters.type
            break
        case 'category':
            delete newFilters.categoryId
            break
        case 'date':
            delete newFilters.startDate
            delete newFilters.endDate
            break
        case 'search':
            delete newFilters.search
            break
        case 'paymentMethod':
            delete newFilters.paymentMethod
            break
        case 'currency':
            delete newFilters.currency
            break
    }

    return newFilters
}

/**
 * Build transaction list URL with filters
 */
export function buildTransactionListUrl(filters: FinanceFilterState): string {
    const params = filtersToQueryParams(filters)
    const queryString = new URLSearchParams(params).toString()
    return `/finance/transactions${queryString ? `?${queryString}` : ''}`
}

