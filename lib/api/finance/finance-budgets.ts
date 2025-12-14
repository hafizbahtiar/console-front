import { get, post, patch, del, getData, postData, patchData } from '@/lib/api-client'
import { BulkDeleteResponse } from '../portfolio/types'

export type BudgetPeriod = 'monthly' | 'yearly'
export type BudgetCategoryType = 'ExpenseCategory' | 'IncomeCategory'
export type BudgetAlertLevel = 'none' | 'warning' | 'critical' | 'exceeded'

export interface BudgetStats {
    actualAmount: number
    percentageUsed: number
    remainingAmount: number
    alertLevel: BudgetAlertLevel
}

export interface Budget {
    id: string
    userId: string
    name: string
    categoryId?: string
    categoryType?: BudgetCategoryType
    amount: number
    period: BudgetPeriod
    startDate: string
    endDate?: string
    alertThresholds?: {
        warning: number
        critical: number
        exceeded: number
    }
    rolloverEnabled: boolean
    description?: string
    createdAt: string
    updatedAt: string
    stats?: BudgetStats
}

export interface CreateBudgetInput {
    name: string
    categoryId?: string
    categoryType?: BudgetCategoryType
    amount: number
    period: BudgetPeriod
    startDate: string
    endDate?: string
    alertThresholds?: {
        warning?: number
        critical?: number
        exceeded?: number
    }
    rolloverEnabled?: boolean
    description?: string
}

export interface UpdateBudgetInput {
    name?: string
    categoryId?: string
    categoryType?: BudgetCategoryType
    amount?: number
    period?: BudgetPeriod
    startDate?: string
    endDate?: string
    alertThresholds?: {
        warning?: number
        critical?: number
        exceeded?: number
    }
    rolloverEnabled?: boolean
    description?: string
}

export interface BudgetFilters {
    page?: number
    limit?: number
    period?: BudgetPeriod
    categoryType?: BudgetCategoryType
    categoryId?: string
    startDate?: string
    endDate?: string
    search?: string
    alertLevel?: BudgetAlertLevel
    sortBy?: 'name' | 'amount' | 'startDate' | 'createdAt' | 'updatedAt'
    sortOrder?: 'asc' | 'desc'
}

export async function getBudgets(
    filters?: BudgetFilters
): Promise<{ data: Budget[]; pagination: any }> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.period) params.append('period', filters.period)
    if (filters?.categoryType) params.append('categoryType', filters.categoryType)
    if (filters?.categoryId) params.append('categoryId', filters.categoryId)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.alertLevel) params.append('alertLevel', filters.alertLevel)
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

    const query = params.toString() ? `?${params.toString()}` : ''
    return get<{ data: Budget[]; pagination: any }>(`/finance/budgets${query}`)
}

export async function getBudgetsWithStats(
    filters?: BudgetFilters
): Promise<{ data: Budget[]; pagination: any }> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.period) params.append('period', filters.period)
    if (filters?.categoryType) params.append('categoryType', filters.categoryType)
    if (filters?.categoryId) params.append('categoryId', filters.categoryId)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.alertLevel) params.append('alertLevel', filters.alertLevel)
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

    const query = params.toString() ? `?${params.toString()}` : ''
    return get<{ data: Budget[]; pagination: any }>(`/finance/budgets/stats${query}`)
}

export async function getBudgetAlerts(): Promise<Budget[]> {
    return getData<Budget[]>('/finance/budgets/alerts')
}

export async function getBudget(id: string): Promise<Budget> {
    return getData<Budget>(`/finance/budgets/${id}`)
}

export async function getBudgetStats(id: string): Promise<Budget & { stats: BudgetStats }> {
    return getData<Budget & { stats: BudgetStats }>(`/finance/budgets/${id}/stats`)
}

export async function createBudget(data: CreateBudgetInput): Promise<Budget> {
    return postData<Budget>('/finance/budgets', data)
}

export async function updateBudget(
    id: string,
    data: UpdateBudgetInput
): Promise<Budget> {
    return patchData<Budget>(`/finance/budgets/${id}`, data)
}

export async function deleteBudget(id: string): Promise<void> {
    return del(`/finance/budgets/${id}`)
}

export async function bulkDeleteBudgets(ids: string[]): Promise<BulkDeleteResponse> {
    return postData<BulkDeleteResponse>('/finance/budgets/bulk-delete', { ids })
}

export async function processBudgetRollover(id: string): Promise<Budget | null> {
    return postData<Budget | null>(`/finance/budgets/${id}/rollover`, {})
}

