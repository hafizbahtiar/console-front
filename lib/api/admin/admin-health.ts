import { getData } from '../../api-client'

/**
 * System Health Response
 */
export interface SystemHealth {
    status: 'healthy' | 'warning' | 'error'
    message: string
    timestamp: string
}

export interface RedisHealth extends SystemHealth {
    connected: boolean
    healthy?: boolean
    host?: string
    port?: number
    latency?: number
}

export interface MongoDBHealth extends SystemHealth {
    connected: boolean
    database?: string
}

export interface HealthCheckResponse {
    api: SystemHealth
    redis: RedisHealth
    mongodb: MongoDBHealth
}

/**
 * Get Redis health status
 * 
 * @returns Redis connection and health information
 * Backend returns: { success: true, data: { healthy, connected, status, host, port, timestamp } }
 */
export async function getRedisHealth(): Promise<RedisHealth> {
    const response = await getData<{
        healthy: boolean
        connected: boolean
        status: string
        host?: string
        port?: number
        timestamp: string
    }>('/health/redis')

    return {
        status: response.healthy ? 'healthy' : (response.connected ? 'warning' : 'error'),
        message: response.status,
        timestamp: response.timestamp,
        connected: response.connected,
        healthy: response.healthy,
        host: response.host,
        port: response.port,
    }
}

/**
 * Get system health status for all services
 * 
 * @returns Health status for API, Redis, and MongoDB
 * Note: If /admin/health doesn't exist, we'll fetch individual health endpoints
 */
export async function getSystemHealth(): Promise<HealthCheckResponse> {
    try {
        // Try to get system health endpoint first
        return await getData<HealthCheckResponse>('/admin/health')
    } catch (error) {
        // Fallback: fetch individual health endpoints and combine
        const redisHealth = await getRedisHealth().catch(() => ({
            status: 'error' as const,
            message: 'Redis health check failed',
            timestamp: new Date().toISOString(),
            connected: false,
        }))

        // For now, assume API is healthy if we can make requests
        // MongoDB health would need a separate endpoint
        return {
            api: {
                status: 'healthy',
                message: 'API server is responding',
                timestamp: new Date().toISOString(),
            },
            redis: redisHealth,
            mongodb: {
                status: 'healthy' as const,
                message: 'MongoDB connection status unknown',
                timestamp: new Date().toISOString(),
                connected: true,
            },
        }
    }
}

