import { getData, del } from '../../api-client'

/**
 * Queue Statistics Response
 */
export interface QueueStats {
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
    paused: number
}

export interface QueueStatsResponse {
    [queueName: string]: QueueStats
}

/**
 * Queue Job Management
 */
export interface QueueJob {
    id: string
    name: string
    data: any
    failedReason?: string
    timestamp: number
    processedOn?: number
    finishedOn?: number
    attemptsMade?: number
}

export interface JobHistoryResponse {
    jobs: QueueJob[]
    total: number
    status: 'completed' | 'failed' | 'active' | 'waiting' | 'delayed'
}

export interface CleanJobsResponse {
    queueName: string
    status: 'completed' | 'failed' | 'all'
    cleaned: number
}

/**
 * Get queue statistics for all queues
 * 
 * @returns Queue statistics for all registered queues
 * Backend returns: { success: true, data: { queues: { [queueName]: QueueStats }, summary: {...} } }
 */
export async function getQueueStats(): Promise<QueueStatsResponse> {
    const response = await getData<{ queues: QueueStatsResponse; summary: any }>('/admin/queues/stats')
    // Extract queues object from response
    return response.queues || {}
}

/**
 * Retry a failed job
 * 
 * @param queueName - Name of the queue
 * @param jobId - ID of the job to retry
 */
export async function retryJob(queueName: string, jobId: string): Promise<{ jobId: string; queueName: string }> {
    return getData<{ jobId: string; queueName: string }>(`/admin/queues/${queueName}/jobs/${jobId}/retry`, {
        method: 'POST',
    } as any)
}

/**
 * Clean jobs from a queue
 * 
 * @param queueName - Name of the queue
 * @param status - Type of jobs to clean ('completed', 'failed', or 'all')
 * @param grace - Grace period in milliseconds (default: 24 hours)
 */
export async function cleanJobs(
    queueName: string,
    status: 'completed' | 'failed' | 'all' = 'completed',
    grace: number = 1000 * 60 * 60 * 24
): Promise<CleanJobsResponse> {
    const response = await del<{ data: CleanJobsResponse }>(`/admin/queues/${queueName}/jobs/clean?status=${status}&grace=${grace}`)
    // Handle both SuccessResponse and direct response
    return (response as any).data || response
}

/**
 * Get failed jobs for a queue
 * 
 * @param queueName - Name of the queue
 * @param start - Start index (default: 0)
 * @param end - End index (default: 20)
 */
export async function getFailedJobs(
    queueName: string,
    start: number = 0,
    end: number = 20
): Promise<{ jobs: QueueJob[]; total: number }> {
    return getData<{ jobs: QueueJob[]; total: number }>(`/admin/queues/${queueName}/jobs/failed?start=${start}&end=${end}`)
}

/**
 * Get job history for a queue
 * 
 * @param queueName - Name of the queue
 * @param status - Status filter ('completed', 'failed', 'active', 'waiting', 'delayed')
 * @param start - Start index (default: 0)
 * @param end - End index (default: 20)
 */
export async function getJobHistory(
    queueName: string,
    status: 'completed' | 'failed' | 'active' | 'waiting' | 'delayed' = 'completed',
    start: number = 0,
    end: number = 20
): Promise<JobHistoryResponse> {
    return getData<JobHistoryResponse>(`/admin/queues/${queueName}/jobs/history?status=${status}&start=${start}&end=${end}`)
}

