"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Server,
    Database,
    Activity,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    RefreshCw,
    Clock,
    Zap,
    TrendingUp,
    AlertCircle,
    Wifi,
    WifiOff
} from "lucide-react"
import { getSystemHealth, getRedisHealth, getSystemMetrics } from "@/lib/api/admin"
import { ApiClientError } from "@/lib/api-client"
import { toast } from "sonner"
import { io, Socket } from 'socket.io-client'

interface SystemHealth {
    api: {
        status: 'healthy' | 'warning' | 'error'
        message: string
        timestamp: string
    }
    redis: {
        status: 'healthy' | 'warning' | 'error'
        message: string
        timestamp: string
        connected: boolean
        healthy?: boolean
        host?: string
        port?: number
        latency?: number
    }
    mongodb: {
        status: 'healthy' | 'warning' | 'error'
        message: string
        timestamp: string
        connected: boolean
        database?: string
    }
}

interface SystemMetrics {
    timestamp: string
    queues: Array<{
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
    }>
    redis: {
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
    mongodb: {
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
    api: {
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
}

export default function HealthDashboardPage() {
    const { user } = useAuth()
    const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
    const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

    // Real-time monitoring settings
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [refreshInterval, setRefreshInterval] = useState(30) // seconds
    const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')

    // WebSocket and polling refs
    const socketRef = useRef<Socket | null>(null)
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const websocketIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const fetchHealthData = async () => {
        try {
            setIsLoading(true)
            const [healthResult, metricsResult] = await Promise.allSettled([
                getSystemHealth(),
                getSystemMetrics(),
            ])

            // Handle health check result
            if (healthResult.status === 'fulfilled') {
                setSystemHealth(healthResult.value)
            } else {
                console.error('Failed to fetch system health:', healthResult.reason)
                const errorMessage =
                    healthResult.reason instanceof ApiClientError
                        ? healthResult.reason.message
                        : 'Failed to load system health data'
                toast.error(errorMessage)
            }

            // Handle metrics result (optional - might fail)
            if (metricsResult.status === 'fulfilled') {
                setSystemMetrics(metricsResult.value)
            } else {
                console.error('Failed to fetch system metrics:', metricsResult.reason)
                // Don't show error toast for metrics as it's optional
                // Metrics might not be available in all environments
            }

            setLastRefresh(new Date())
        } catch (error: any) {
            console.error('Failed to fetch health data:', error)
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : 'Failed to load health data. Please try again.'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    // WebSocket connection management
    const connectWebSocket = () => {
        // Owner check is handled by parent owner layout
        if (socketRef.current?.connected) return

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const socket = io(`${apiUrl}/monitoring`, {
            auth: {
                token: localStorage.getItem('accessToken')
            },
            transports: ['websocket', 'polling']
        })

        socket.on('connect', () => {
            console.log('Connected to monitoring WebSocket')
            setIsWebSocketConnected(true)
            setConnectionStatus('connected')
            toast.success('Real-time monitoring connected')
        })

        socket.on('disconnect', () => {
            console.log('Disconnected from monitoring WebSocket')
            setIsWebSocketConnected(false)
            setConnectionStatus('disconnected')
            toast.warning('Real-time monitoring disconnected')
        })

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error)
            setConnectionStatus('disconnected')
            setIsWebSocketConnected(false)
        })

        socket.on('monitoring:initial', (data) => {
            console.log('Received initial monitoring data')
            setSystemHealth(data.systemHealth)
            setSystemMetrics(data.systemMetrics)
            setLastRefresh(new Date(data.timestamp))
            setIsLoading(false)
        })

        socket.on('monitoring:update', (data) => {
            console.log('Received monitoring update')
            setSystemHealth(data.systemHealth)
            setSystemMetrics(data.systemMetrics)
            setLastRefresh(new Date(data.timestamp))
        })

        socket.on('monitoring:error', (data) => {
            console.error('Monitoring error:', data)
            toast.error(data.message)
        })

        socketRef.current = socket
    }

    const disconnectWebSocket = () => {
        if (socketRef.current) {
            socketRef.current.disconnect()
            socketRef.current = null
            setIsWebSocketConnected(false)
            setConnectionStatus('disconnected')
        }
    }

    // Polling fallback
    const startPolling = () => {
        if (pollingIntervalRef.current) return

        pollingIntervalRef.current = setInterval(() => {
            if (autoRefresh && !isWebSocketConnected) {
                fetchHealthData()
            }
        }, refreshInterval * 1000)
    }

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
        }
    }

    // Manual refresh
    const handleManualRefresh = () => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('monitoring:refresh')
        } else {
            fetchHealthData()
        }
    }

    useEffect(() => {
        // Owner check is handled by parent owner layout
        // Initial data load
        fetchHealthData()

        // Connect to WebSocket for real-time updates
        connectWebSocket()

        // Start polling as fallback
        startPolling()

        return () => {
            disconnectWebSocket()
            stopPolling()
        }
    }, [])

    // Handle auto-refresh toggle
    useEffect(() => {
        if (autoRefresh) {
            if (isWebSocketConnected) {
                // WebSocket handles updates automatically
                stopPolling()
            } else {
                // Use polling when WebSocket is not available
                startPolling()
            }
        } else {
            stopPolling()
        }
    }, [autoRefresh, isWebSocketConnected, refreshInterval])

    const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
        switch (status) {
            case 'healthy':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />
        }
    }

    const getStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
        const variants = {
            healthy: 'default',
            warning: 'secondary',
            error: 'destructive'
        } as const

        const colors = {
            healthy: 'bg-green-500 hover:bg-green-600',
            warning: 'bg-yellow-500 hover:bg-yellow-600',
            error: 'bg-red-500 hover:bg-red-600'
        }

        return (
            <Badge variant={variants[status]} className={colors[status]}>
                {getStatusIcon(status)}
                <span className="ml-1 capitalize">{status}</span>
            </Badge>
        )
    }

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400)
        const hours = Math.floor((seconds % 86400) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if (days > 0) return `${days}d ${hours}h ${minutes}m`
        if (hours > 0) return `${hours}h ${minutes}m`
        return `${minutes}m`
    }

    const formatBytes = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        if (bytes === 0) return '0 Bytes'
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    }

    // Owner check is handled by parent owner layout
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">System Health</h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Real-time monitoring of system components and performance metrics
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Connection Status */}
                        <div className="flex items-center gap-2 text-sm">
                            {connectionStatus === 'connected' ? (
                                <Wifi className="h-4 w-4 text-green-500" />
                            ) : connectionStatus === 'connecting' ? (
                                <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
                            ) : (
                                <WifiOff className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-muted-foreground">
                                {connectionStatus === 'connected' ? 'Real-time' : connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                            </span>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Last updated: {lastRefresh.toLocaleTimeString()}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleManualRefresh}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Real-time Monitoring Controls */}
                <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="auto-refresh"
                            checked={autoRefresh}
                            onCheckedChange={setAutoRefresh}
                        />
                        <Label htmlFor="auto-refresh">Auto-refresh</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Label htmlFor="refresh-interval">Refresh interval:</Label>
                        <Select
                            value={refreshInterval.toString()}
                            onValueChange={(value) => setRefreshInterval(parseInt(value))}
                            disabled={!autoRefresh}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">1 minute</SelectItem>
                                <SelectItem value="300">5 minutes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                        {isWebSocketConnected ? (
                            <span className="text-green-600">⚡ Real-time updates active</span>
                        ) : autoRefresh ? (
                            <span className="text-yellow-600">⏰ Polling every {refreshInterval}s</span>
                        ) : (
                            <span>⏸️ Auto-refresh disabled</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Health Status Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* API Server Health */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">API Server</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-16" />
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    {getStatusBadge(systemHealth?.api.status || 'error')}
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    {systemHealth?.api.message || 'Checking status...'}
                                </p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {systemHealth?.api.timestamp ?
                                        new Date(systemHealth.api.timestamp).toLocaleString() :
                                        'Unknown'
                                    }
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Redis Health */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Redis Cache</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-16" />
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    {getStatusBadge(systemHealth?.redis.status || 'error')}
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    {systemHealth?.redis.message || 'Checking status...'}
                                </p>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Connection:</span>
                                        <span className={systemHealth?.redis.connected ? 'text-green-600' : 'text-red-600'}>
                                            {systemHealth?.redis.connected ? 'Connected' : 'Disconnected'}
                                        </span>
                                    </div>
                                    {systemHealth?.redis.host && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Host:</span>
                                            <span>{systemHealth.redis.host}:{systemHealth.redis.port}</span>
                                        </div>
                                    )}
                                    {systemHealth?.redis.latency && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Latency:</span>
                                            <span>{systemHealth.redis.latency}ms</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* MongoDB Health */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MongoDB</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-16" />
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    {getStatusBadge(systemHealth?.mongodb.status || 'error')}
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    {systemHealth?.mongodb.message || 'Checking status...'}
                                </p>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Connection:</span>
                                        <span className={systemHealth?.mongodb.connected ? 'text-green-600' : 'text-red-600'}>
                                            {systemHealth?.mongodb.connected ? 'Connected' : 'Disconnected'}
                                        </span>
                                    </div>
                                    {systemHealth?.mongodb.database && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Database:</span>
                                            <span>{systemHealth.mongodb.database}</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Metrics */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Redis Metrics */}
                {isLoading ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Database className="h-5 w-5 mr-2" />
                                Redis Metrics
                            </CardTitle>
                            <CardDescription>
                                Memory usage, connections, and performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-20" />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                            </div>
                            <Skeleton className="h-10" />
                        </CardContent>
                    </Card>
                ) : systemMetrics?.redis ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Database className="h-5 w-5 mr-2" />
                                Redis Metrics
                            </CardTitle>
                            <CardDescription>
                                Memory usage, connections, and performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Memory Usage</span>
                                    <span className="text-sm text-muted-foreground">
                                        {formatBytes(systemMetrics.redis.memory.used)} / {formatBytes(systemMetrics.redis.memory.total)}
                                    </span>
                                </div>
                                <Progress value={systemMetrics.redis.memory.percentage} className="h-2" />
                                <div className="text-xs text-muted-foreground mt-1">
                                    Peak: {formatBytes(systemMetrics.redis.memory.peak)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-2xl font-bold">{systemMetrics.redis.connections.connected}</div>
                                    <div className="text-xs text-muted-foreground">Connected Clients</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{systemMetrics.redis.keyspace.keys.toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">Total Keys</div>
                                </div>
                            </div>

                            {systemMetrics.redis.latency && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Response Time</span>
                                    <Badge variant="outline">
                                        <Zap className="h-3 w-3 mr-1" />
                                        {systemMetrics.redis.latency}ms
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : null}

                {/* MongoDB Metrics */}
                {isLoading ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Database className="h-5 w-5 mr-2" />
                                MongoDB Metrics
                            </CardTitle>
                            <CardDescription>
                                Connection pool, collections, and server status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                            </div>
                            <Skeleton className="h-10" />
                            <Skeleton className="h-10" />
                            <Skeleton className="h-20" />
                        </CardContent>
                    </Card>
                ) : systemMetrics?.mongodb ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Database className="h-5 w-5 mr-2" />
                                MongoDB Metrics
                            </CardTitle>
                            <CardDescription>
                                Connection pool, collections, and server status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-2xl font-bold">{systemMetrics.mongodb.connectionPool.current}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Active Connections ({systemMetrics.mongodb.connectionPool.min}-{systemMetrics.mongodb.connectionPool.max})
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{systemMetrics.mongodb.collections}</div>
                                    <div className="text-xs text-muted-foreground">Collections</div>
                                </div>
                            </div>

                            {systemMetrics.mongodb.serverStatus && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Server Version</span>
                                        <Badge variant="outline">{systemMetrics.mongodb.serverStatus.version}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Uptime</span>
                                        <Badge variant="outline">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {formatUptime(systemMetrics.mongodb.serverStatus.uptime)}
                                        </Badge>
                                    </div>
                                </>
                            )}

                            <div>
                                <div className="text-sm font-medium mb-2">Databases</div>
                                <div className="flex flex-wrap gap-1">
                                    {systemMetrics.mongodb.databases.slice(0, 5).map((db) => (
                                        <Badge key={db} variant="secondary" className="text-xs">
                                            {db}
                                        </Badge>
                                    ))}
                                    {systemMetrics.mongodb.databases.length > 5 && (
                                        <Badge variant="secondary" className="text-xs">
                                            +{systemMetrics.mongodb.databases.length - 5} more
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}
            </div>

            {/* API Metrics */}
            {isLoading ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="h-5 w-5 mr-2" />
                            API Performance
                        </CardTitle>
                        <CardDescription>
                            Request metrics and response times
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i}>
                                    <Skeleton className="h-8 w-16 mb-2" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 space-y-4">
                            <Skeleton className="h-20" />
                            <div className="grid gap-4 md:grid-cols-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i}>
                                        <Skeleton className="h-6 w-16 mb-2" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : systemMetrics?.api ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="h-5 w-5 mr-2" />
                            API Performance
                        </CardTitle>
                        <CardDescription>
                            Request metrics and response times
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div>
                                <div className="text-2xl font-bold">{systemMetrics.api.requests.total.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">Total Requests</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {systemMetrics.api.requests.successful.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">Successful</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {systemMetrics.api.requests.failed.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">Failed</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {systemMetrics.api.requests.rate.toFixed(1)}
                                </div>
                                <div className="text-xs text-muted-foreground">Requests/min</div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Error Rate</span>
                                    <span className="text-sm text-muted-foreground">
                                        {systemMetrics.api.errorRate.toFixed(2)}%
                                    </span>
                                </div>
                                <Progress value={systemMetrics.api.errorRate} className="h-2" />
                            </div>

                            <div className="grid gap-4 md:grid-cols-4">
                                <div>
                                    <div className="text-lg font-semibold">{systemMetrics.api.responseTime.average.toFixed(0)}ms</div>
                                    <div className="text-xs text-muted-foreground">Avg Response Time</div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold">{systemMetrics.api.responseTime.p50.toFixed(0)}ms</div>
                                    <div className="text-xs text-muted-foreground">P50 (Median)</div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold">{systemMetrics.api.responseTime.p95.toFixed(0)}ms</div>
                                    <div className="text-xs text-muted-foreground">P95</div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold">{systemMetrics.api.responseTime.p99.toFixed(0)}ms</div>
                                    <div className="text-xs text-muted-foreground">P99</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {/* Queue Metrics */}
            {isLoading ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2" />
                            Queue Performance
                        </CardTitle>
                        <CardDescription>
                            Background job processing statistics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="border rounded-lg p-4">
                                    <Skeleton className="h-6 w-32 mb-3" />
                                    <div className="grid gap-4 md:grid-cols-5 mb-3">
                                        {[...Array(5)].map((_, j) => (
                                            <div key={j}>
                                                <Skeleton className="h-8 w-12 mb-2" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                        ))}
                                    </div>
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : systemMetrics?.queues && systemMetrics.queues.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2" />
                            Queue Performance
                        </CardTitle>
                        <CardDescription>
                            Background job processing statistics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {systemMetrics.queues.map((queue) => (
                                <div key={queue.name} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium capitalize">{queue.name} Queue</h4>
                                        <Badge variant="outline">
                                            {queue.throughput}/min throughput
                                        </Badge>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-5 mb-3">
                                        <div>
                                            <div className="text-xl font-bold">{queue.waiting}</div>
                                            <div className="text-xs text-muted-foreground">Waiting</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-blue-600">{queue.active}</div>
                                            <div className="text-xs text-muted-foreground">Active</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-green-600">{queue.completed}</div>
                                            <div className="text-xs text-muted-foreground">Completed</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-red-600">{queue.failed}</div>
                                            <div className="text-xs text-muted-foreground">Failed</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-yellow-600">{queue.delayed}</div>
                                            <div className="text-xs text-muted-foreground">Delayed</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Success Rate: {queue.successRate.toFixed(1)}%
                                        </span>
                                        <span className="text-muted-foreground">
                                            Total: {queue.total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    )
}
