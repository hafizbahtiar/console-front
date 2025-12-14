import { get, getData } from '@/lib/api-client'

export interface DashboardData {
    totalIncome: number
    totalExpenses: number
    netAmount: number
    transactionCount: number
    recentTransactions: Array<{
        id: string
        amount: number
        date: string
        description: string
        type: 'expense' | 'income'
        categoryId?: string
    }>
    topExpenseCategories: Array<{
        categoryId?: string
        categoryName?: string
        total: number
        count: number
    }>
    topIncomeCategories: Array<{
        categoryId?: string
        categoryName?: string
        total: number
        count: number
    }>
}

export interface IncomeExpensesData {
    totalIncome: number
    totalExpenses: number
    netAmount: number
    incomeCount: number
    expenseCount: number
    period: {
        startDate?: string
        endDate?: string
    }
}

export interface CategoryBreakdownData {
    expenseCategories: Array<{
        categoryId?: string
        categoryName?: string
        total: number
        count: number
        percentage: number
    }>
    incomeCategories: Array<{
        categoryId?: string
        categoryName?: string
        total: number
        count: number
        percentage: number
    }>
    uncategorized: {
        expenses: {
            total: number
            count: number
        }
        income: {
            total: number
            count: number
        }
    }
}

export interface TrendsData {
    period: 'monthly' | 'yearly'
    data: Array<{
        period: string
        income: number
        expenses: number
        net: number
        transactionCount: number
    }>
}

export async function getFinanceDashboard(
    startDate?: string,
    endDate?: string,
    limit?: number,
    currency?: string
): Promise<DashboardData> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (limit) params.append('limit', limit.toString())
    if (currency) params.append('currency', currency)

    const query = params.toString() ? `?${params.toString()}` : ''
    return getData<DashboardData>(`/finance/dashboard${query}`)
}

export async function getIncomeVsExpenses(
    startDate?: string,
    endDate?: string,
    currency?: string
): Promise<IncomeExpensesData> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (currency) params.append('currency', currency)

    const query = params.toString() ? `?${params.toString()}` : ''
    return getData<IncomeExpensesData>(`/finance/analytics/income-expenses${query}`)
}

export async function getCategoryBreakdown(
    startDate?: string,
    endDate?: string,
    currency?: string
): Promise<CategoryBreakdownData> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (currency) params.append('currency', currency)

    const query = params.toString() ? `?${params.toString()}` : ''
    return getData<CategoryBreakdownData>(`/finance/analytics/categories${query}`)
}

export async function getTrends(
    period: 'monthly' | 'yearly' = 'monthly',
    startDate?: string,
    endDate?: string,
    currency?: string
): Promise<TrendsData> {
    const params = new URLSearchParams()
    params.append('period', period)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (currency) params.append('currency', currency)

    return getData<TrendsData>(`/finance/analytics/trends?${params.toString()}`)
}

export async function exportTransactions(
    format: 'csv' | 'json' | 'xlsx' | 'pdf' = 'csv',
    startDate?: string,
    endDate?: string,
    type?: 'expense' | 'income',
    currency?: string
): Promise<Blob> {
    const params = new URLSearchParams()
    params.append('format', format)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (type) params.append('type', type)
    if (currency) params.append('currency', currency)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    const endpoint = `/finance/export?${params.toString()}`

    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken || ''}`,
        },
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to export data' }))
        throw new Error(error.message || 'Failed to export data')
    }

    return response.blob()
}

// Advanced Analytics Interfaces

export interface CategoryTrendsData {
    categoryId?: string
    categoryName?: string
    aggregation: 'daily' | 'weekly' | 'monthly'
    data: Array<{
        period: string
        total: number
        count: number
    }>
}

export interface MonthOverMonthComparisonData {
    currentMonth: {
        period: string
        income: number
        expenses: number
        net: number
        transactionCount: number
    }
    previousMonth: {
        period: string
        income: number
        expenses: number
        net: number
        transactionCount: number
    }
    change: {
        income: { amount: number; percentage: number }
        expenses: { amount: number; percentage: number }
        net: { amount: number; percentage: number }
        transactionCount: { amount: number; percentage: number }
    }
    categoryBreakdown?: Array<{
        categoryId?: string
        categoryName?: string
        current: number
        previous: number
        change: { amount: number; percentage: number }
    }>
}

export interface YearOverYearComparisonData {
    currentYear: {
        period: string
        income: number
        expenses: number
        net: number
        transactionCount: number
        monthlyBreakdown: Array<{ month: string; income: number; expenses: number; net: number }>
    }
    previousYear: {
        period: string
        income: number
        expenses: number
        net: number
        transactionCount: number
        monthlyBreakdown: Array<{ month: string; income: number; expenses: number; net: number }>
    }
    change: {
        income: { amount: number; percentage: number }
        expenses: { amount: number; percentage: number }
        net: { amount: number; percentage: number }
        transactionCount: { amount: number; percentage: number }
    }
}

export interface ForecastData {
    period: '1month' | '3months' | '6months' | '1year'
    forecast: Array<{
        period: string
        projectedIncome: number
        projectedExpenses: number
        projectedNet: number
        confidenceInterval: {
            income: { lower: number; upper: number }
            expenses: { lower: number; upper: number }
            net: { lower: number; upper: number }
        }
    }>
    historicalAverage: {
        income: number
        expenses: number
        net: number
    }
}

export interface HeatmapData {
    data: Array<{
        date: string // YYYY-MM-DD
        income: number
        expenses: number
        net: number
        transactionCount: number
    }>
}

export interface SpendingPatternsData {
    patterns: {
        daily: Array<{
            dayOfWeek: number // 0 = Sunday, 6 = Saturday
            averageAmount: number
            transactionCount: number
        }>
        weekly: Array<{
            weekOfMonth: number // 1-4
            averageAmount: number
            transactionCount: number
        }>
        monthly: Array<{
            dayOfMonth: number // 1-31
            averageAmount: number
            transactionCount: number
        }>
    }
    anomalies: Array<{
        date: string
        type: 'income' | 'expense'
        amount: number
        deviation: number // Standard deviations from mean
        description: string
    }>
}

// Advanced Analytics API Functions

export async function getCategoryTrends(
    categoryId?: string,
    startDate?: string,
    endDate?: string,
    aggregation: 'daily' | 'weekly' | 'monthly' = 'monthly',
    currency?: string
): Promise<CategoryTrendsData> {
    const params = new URLSearchParams()
    if (categoryId) params.append('categoryId', categoryId)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    params.append('aggregation', aggregation)
    if (currency) params.append('currency', currency)

    const query = params.toString() ? `?${params.toString()}` : ''
    return getData<CategoryTrendsData>(`/finance/analytics/category-trends${query}`)
}

export async function getMonthOverMonthComparison(
    categoryId?: string,
    currency?: string
): Promise<MonthOverMonthComparisonData> {
    const params = new URLSearchParams()
    if (categoryId) params.append('categoryId', categoryId)
    if (currency) params.append('currency', currency)

    const query = params.toString() ? `?${params.toString()}` : ''
    return getData<MonthOverMonthComparisonData>(`/finance/analytics/comparison/mom${query}`)
}

export async function getYearOverYearComparison(
    categoryId?: string,
    currency?: string
): Promise<YearOverYearComparisonData> {
    const params = new URLSearchParams()
    if (categoryId) params.append('categoryId', categoryId)
    if (currency) params.append('currency', currency)

    const query = params.toString() ? `?${params.toString()}` : ''
    return getData<YearOverYearComparisonData>(`/finance/analytics/comparison/yoy${query}`)
}

export async function getForecast(
    period: '1month' | '3months' | '6months' | '1year' = '3months',
    startDate?: string,
    endDate?: string,
    currency?: string
): Promise<ForecastData> {
    const params = new URLSearchParams()
    params.append('period', period)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (currency) params.append('currency', currency)

    return getData<ForecastData>(`/finance/analytics/forecast?${params.toString()}`)
}

export async function getHeatmapData(
    startDate?: string,
    endDate?: string,
    currency?: string
): Promise<HeatmapData> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (currency) params.append('currency', currency)

    const query = params.toString() ? `?${params.toString()}` : ''
    return getData<HeatmapData>(`/finance/analytics/heatmap${query}`)
}

export async function getSpendingPatterns(
    startDate?: string,
    endDate?: string,
    currency?: string
): Promise<SpendingPatternsData> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (currency) params.append('currency', currency)

    const query = params.toString() ? `?${params.toString()}` : ''
    return getData<SpendingPatternsData>(`/finance/analytics/patterns${query}`)
}

