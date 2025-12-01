import { getData } from '../../api-client'

/**
 * System Metrics
 */
export interface QueueMetrics {
    name: string
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
    total: number
    successRate: number
    failureRate: number
    throughput: number
}

export interface RedisMetrics {
    connected: boolean
    memory: {
        used: number
        peak: number
        total: number
        percentage: number
    }
    connections: {
        connected: number
        rejected: number
    }
    commands: {
        processed: number
        total: number
    }
    keyspace: {
        keys: number
        expires: number
    }
    latency?: number
}

export interface MongoMetrics {
    connected: boolean
    connectionPool: {
        current: number
        available: number
        max: number
        min: number
    }
    collections: number
    databases: string[]
    serverStatus?: {
        uptime: number
        version: string
    }
}

export interface ApiMetrics {
    requests: {
        total: number
        successful: number
        failed: number
        rate: number
    }
    responseTime: {
        average: number
        p50: number
        p95: number
        p99: number
    }
    errorRate: number
}

export interface SystemMetrics {
    timestamp: string
    queues: QueueMetrics[]
    redis: RedisMetrics
    mongodb: MongoMetrics
    api: ApiMetrics
}

/**
 * Get system metrics
 * 
 * @returns System metrics including queues, Redis, MongoDB, and API metrics
 * Backend returns: { success: true, data: SystemMetrics }
 */
export async function getSystemMetrics(): Promise<SystemMetrics> {
    return getData<SystemMetrics>('/admin/metrics')
}

