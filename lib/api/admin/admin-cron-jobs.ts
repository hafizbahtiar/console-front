import { getData } from '../../api-client'

/**
 * Cron Job Management
 */
export interface CronJobStatus {
    name: string
    cronExpression: string
    enabled: boolean
    lastExecution?: string
    nextExecution?: string
    executionCount: number
    successCount: number
    failureCount: number
    lastError?: string
    lastDuration?: number
}

export interface CronJobExecution {
    jobName: string
    executedAt: string
    success: boolean
    error?: string
    duration?: number
}

export interface CronJobHistoryResponse {
    jobName: string
    history: CronJobExecution[]
    total: number
}

/**
 * Get all cron job statuses
 * 
 * @returns Array of cron job statuses
 * Backend returns: { success: true, data: { jobs: CronJobStatus[] } }
 */
export async function getCronJobStatuses(): Promise<CronJobStatus[]> {
    const response = await getData<{ jobs: CronJobStatus[] }>('/admin/cron-jobs')
    return response.jobs || []
}

/**
 * Get status for a specific cron job
 * 
 * @param jobName - Name of the cron job
 * @returns Cron job status
 * Backend returns: { success: true, data: CronJobStatus }
 */
export async function getCronJobStatus(jobName: string): Promise<CronJobStatus> {
    return getData<CronJobStatus>(`/admin/cron-jobs/${jobName}`)
}

/**
 * Get execution history for a cron job
 * 
 * @param jobName - Name of the cron job
 * @param limit - Maximum number of executions to return (default: 50)
 * @returns Execution history
 * Backend returns: { success: true, data: { jobName, history: CronJobExecution[], total: number } }
 */
export async function getCronJobHistory(jobName: string, limit: number = 50): Promise<CronJobHistoryResponse> {
    return getData<CronJobHistoryResponse>(`/admin/cron-jobs/${jobName}/history?limit=${limit}`)
}

