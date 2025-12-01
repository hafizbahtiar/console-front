"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Database, AlertCircle, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getSystemHealth, getQueueStats, type HealthCheckResponse, type QueueStatsResponse } from "@/lib/api/admin"
import { toast } from "sonner"

export default function AdminDashboardPage() {
    const { user } = useAuth()
    const [systemHealth, setSystemHealth] = useState<HealthCheckResponse | null>(null)
    const [queueStats, setQueueStats] = useState<QueueStatsResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true)
                const [health, stats] = await Promise.all([
                    getSystemHealth().catch(() => null),
                    getQueueStats().catch(() => null),
                ])
                setSystemHealth(health)
                setQueueStats(stats)
            } catch (error) {
                console.error('Failed to fetch admin dashboard data:', error)
                toast.error('Failed to load dashboard data')
            } finally {
                setIsLoading(false)
            }
        }

        if (user?.role === "owner") {
            fetchData()
            // Refresh every 30 seconds
            const interval = setInterval(fetchData, 30000)
            return () => clearInterval(interval)
        }
    }, [user])

    // Aggregate queue stats from all queues
    const aggregatedQueueStats = queueStats
        ? Object.values(queueStats).reduce(
            (acc, stats) => ({
                waiting: acc.waiting + stats.waiting,
                active: acc.active + stats.active,
                completed: acc.completed + stats.completed,
                failed: acc.failed + stats.failed,
                delayed: acc.delayed + stats.delayed,
            }),
            { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
        )
        : { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }

    const getStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
        if (status === "healthy") {
            return (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Healthy
                </Badge>
            )
        } else if (status === "warning") {
            return (
                <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Warning
                </Badge>
            )
        } else {
            return (
                <Badge variant="destructive">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Error
                </Badge>
            )
        }
    }

    const getStatusText = (status: 'healthy' | 'warning' | 'error') => {
        if (status === "healthy") return "Online"
        if (status === "warning") return "Warning"
        return "Error"
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Monitor system health, queues, and infrastructure metrics
                </p>
            </div>

            {/* System Status Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <>
                        <Card><CardContent className="pt-6"><Skeleton className="h-24" /></CardContent></Card>
                        <Card><CardContent className="pt-6"><Skeleton className="h-24" /></CardContent></Card>
                        <Card><CardContent className="pt-6"><Skeleton className="h-24" /></CardContent></Card>
                    </>
                ) : (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    API Server
                                </CardTitle>
                                <Server className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold">
                                        {systemHealth ? getStatusText(systemHealth.api.status) : "Loading..."}
                                    </div>
                                    {systemHealth ? getStatusBadge(systemHealth.api.status) : <Skeleton className="h-5 w-20" />}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {systemHealth?.api.message || "Checking status..."}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Redis
                                </CardTitle>
                                <Database className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold">
                                        {systemHealth?.redis.connected ? "Connected" : "Disconnected"}
                                    </div>
                                    {systemHealth ? getStatusBadge(systemHealth.redis.status) : <Skeleton className="h-5 w-20" />}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {systemHealth?.redis.message || "Checking status..."}
                                    {systemHealth?.redis.latency && ` • ${systemHealth.redis.latency}ms`}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    MongoDB
                                </CardTitle>
                                <Database className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold">
                                        {systemHealth?.mongodb.connected ? "Connected" : "Disconnected"}
                                    </div>
                                    {systemHealth ? getStatusBadge(systemHealth.mongodb.status) : <Skeleton className="h-5 w-20" />}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {systemHealth?.mongodb.message || "Checking status..."}
                                    {systemHealth?.mongodb.database && ` • ${systemHealth.mongodb.database}`}
                                </p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Queue Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Queue Statistics</CardTitle>
                    <CardDescription>
                        Current status of background job queues
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="grid gap-4 md:grid-cols-5">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex flex-col">
                                    <Skeleton className="h-8 w-16 mb-2" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-5">
                            <div className="flex flex-col">
                                <div className="text-2xl font-bold">{aggregatedQueueStats.waiting}</div>
                                <div className="text-sm text-muted-foreground">Waiting</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-bold text-blue-600">{aggregatedQueueStats.active}</div>
                                <div className="text-sm text-muted-foreground">Active</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-bold text-green-600">{aggregatedQueueStats.completed}</div>
                                <div className="text-sm text-muted-foreground">Completed</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-bold text-red-600">{aggregatedQueueStats.failed}</div>
                                <div className="text-sm text-muted-foreground">Failed</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-bold text-yellow-600">{aggregatedQueueStats.delayed}</div>
                                <div className="text-sm text-muted-foreground">Delayed</div>
                            </div>
                        </div>
                    )}
                    {queueStats && Object.keys(queueStats).length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium mb-2">Per-Queue Breakdown:</p>
                            <div className="space-y-2">
                                {Object.entries(queueStats).map(([queueName, stats]) => (
                                    <div key={queueName} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground capitalize">{queueName}</span>
                                        <span className="font-medium">
                                            W:{stats.waiting} A:{stats.active} C:{stats.completed} F:{stats.failed} D:{stats.delayed}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common administrative tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Queue management, health checks, and system monitoring tools will be available here.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest system events and updates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Activity logs and event history will be displayed here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

