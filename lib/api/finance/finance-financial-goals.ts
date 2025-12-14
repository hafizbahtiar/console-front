import { get, post, patch, del, getData, postData, patchData } from '@/lib/api-client'
import { BulkDeleteResponse } from '../portfolio/types'

export type GoalCategory =
    | 'emergency_fund'
    | 'vacation'
    | 'house'
    | 'car'
    | 'education'
    | 'retirement'
    | 'debt_payoff'
    | 'investment'
    | 'other'

export interface Milestone {
    amount: number
    label: string
    achieved: boolean
    achievedAt?: string
}

export interface FinancialGoal {
    id: string
    userId: string
    name: string
    targetAmount: number
    currentAmount: number
    category: GoalCategory
    targetDate: string
    description?: string
    milestones: Milestone[]
    achieved: boolean
    achievedAt?: string
    createdAt: string
    updatedAt: string
}

export interface FinancialGoalProgress {
    goalId: string
    targetAmount: number
    currentAmount: number
    progressPercentage: number
    remainingAmount: number
    daysRemaining: number
    isOnTrack: boolean
    achievedMilestones: number
    totalMilestones: number
}

export interface FinancialGoalWithProgress extends FinancialGoal {
    progress: FinancialGoalProgress
}

export interface FinancialGoalWithMilestones {
    goal: FinancialGoal
    recentMilestones: Milestone[]
}

export interface MilestoneInput {
    amount: number
    label: string
}

export interface CreateFinancialGoalInput {
    name: string
    targetAmount: number
    currentAmount?: number
    category: GoalCategory
    targetDate: string
    description?: string
    milestones?: MilestoneInput[]
}

export interface UpdateFinancialGoalInput {
    name?: string
    targetAmount?: number
    currentAmount?: number
    category?: GoalCategory
    targetDate?: string
    description?: string
    milestones?: Array<{
        amount?: number
        label?: string
        achieved?: boolean
    }>
    achieved?: boolean
}

export interface FinancialGoalFilters {
    page?: number
    limit?: number
    category?: GoalCategory
    achieved?: boolean
    targetDate?: string
    startDate?: string
    endDate?: string
    search?: string
    sortBy?: 'name' | 'targetAmount' | 'currentAmount' | 'targetDate' | 'createdAt' | 'updatedAt'
    sortOrder?: 'asc' | 'desc'
}

/**
 * Get all financial goals with pagination and filters
 */
export async function getFinancialGoals(
    filters?: FinancialGoalFilters
): Promise<{ data: FinancialGoal[]; pagination: any }> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.category) params.append('category', filters.category)
    if (filters?.achieved !== undefined) params.append('achieved', filters.achieved.toString())
    if (filters?.targetDate) params.append('targetDate', filters.targetDate)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

    const query = params.toString() ? `?${params.toString()}` : ''
    return get<{ data: FinancialGoal[]; pagination: any }>(`/finance/financial-goals${query}`)
}

/**
 * Get all financial goals with progress information
 */
export async function getFinancialGoalsWithProgress(
    filters?: Omit<FinancialGoalFilters, 'page' | 'limit' | 'sortBy' | 'sortOrder'>
): Promise<FinancialGoalWithProgress[]> {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.achieved !== undefined) params.append('achieved', filters.achieved.toString())
    if (filters?.targetDate) params.append('targetDate', filters.targetDate)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.search) params.append('search', filters.search)

    const query = params.toString() ? `?${params.toString()}` : ''
    return getData<FinancialGoalWithProgress[]>(`/finance/financial-goals/progress${query}`)
}

/**
 * Get financial goals with achieved milestones
 */
export async function getFinancialGoalsWithMilestones(): Promise<FinancialGoalWithMilestones[]> {
    return getData<FinancialGoalWithMilestones[]>('/finance/financial-goals/milestones')
}

/**
 * Get a single financial goal by ID
 */
export async function getFinancialGoal(id: string): Promise<FinancialGoal> {
    return getData<FinancialGoal>(`/finance/financial-goals/${id}`)
}

/**
 * Get financial goal progress by ID
 */
export async function getFinancialGoalProgress(id: string): Promise<FinancialGoalProgress> {
    return getData<FinancialGoalProgress>(`/finance/financial-goals/${id}/progress`)
}

/**
 * Create a new financial goal
 */
export async function createFinancialGoal(data: CreateFinancialGoalInput): Promise<FinancialGoal> {
    return postData<FinancialGoal>('/finance/financial-goals', data)
}

/**
 * Update an existing financial goal
 */
export async function updateFinancialGoal(
    id: string,
    data: UpdateFinancialGoalInput
): Promise<FinancialGoal> {
    return patchData<FinancialGoal>(`/finance/financial-goals/${id}`, data)
}

/**
 * Delete a financial goal
 */
export async function deleteFinancialGoal(id: string): Promise<void> {
    return del(`/finance/financial-goals/${id}`)
}

/**
 * Bulk delete financial goals
 */
export async function bulkDeleteFinancialGoals(ids: string[]): Promise<BulkDeleteResponse> {
    return postData<BulkDeleteResponse>('/finance/financial-goals/bulk-delete', { ids })
}

/**
 * Add amount to a financial goal
 */
export async function addAmountToGoal(id: string, amount: number): Promise<FinancialGoal> {
    return postData<FinancialGoal>(`/finance/financial-goals/${id}/add-amount`, { amount })
}

/**
 * Subtract amount from a financial goal
 */
export async function subtractAmountFromGoal(id: string, amount: number): Promise<FinancialGoal> {
    return postData<FinancialGoal>(`/finance/financial-goals/${id}/subtract-amount`, { amount })
}

