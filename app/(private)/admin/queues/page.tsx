"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Trash2,
    Clock,
    XCircle,
} from "lucide-react"
import {
    getQueueStats,
    getFailedJobs,
    getJobHistory,
    retryJob,
    cleanJobs,
    type QueueStatsResponse,
    type QueueJob,
} from "@/lib/api/admin"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { formatDistanceToNow } from "date-fns"

export default function QueueMonitoringPage() {
    const { user } = useAuth()
    const [queueStats, setQueueStats] = useState<QueueStatsResponse | null>(null)
    const [failedJobs, setFailedJobs] = useState<QueueJob[]>([])
    const [completedJobs, setCompletedJobs] = useState<QueueJob[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("overview")
    const [selectedQueue, setSelectedQueue] = useState<string | null>(null)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const bullBoardUrl = `${API_URL}/api/v1/admin/queues/ui`

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true)
                const stats = await getQueueStats().catch(() => null)
                setQueueStats(stats)

                if (stats && Object.keys(stats).length > 0) {
                    const firstQueue = Object.keys(stats)[0]
                    setSelectedQueue(firstQueue)

                    // Fetch failed and completed jobs for the first queue
                    const [failed, completed] = await Promise.all([
                        getFailedJobs(firstQueue, 0, 10).catch(() => ({ jobs: [], total: 0 })),
                        getJobHistory(firstQueue, 'completed', 0, 10).catch(() => ({ jobs: [], total: 0 })),
                    ])
                    setFailedJobs(failed.jobs || [])
                    setCompletedJobs(completed.jobs || [])
                }
            } catch (error) {
                console.error('Failed to fetch queue data:', error)
                toast.error('Failed to load queue data')
            } finally {
                setIsLoading(false)
            }
        }

        if (user?.role === "owner") {
            fetchData()
            // Refresh every 10 seconds
            const interval = setInterval(fetchData, 10000)
            return () => clearInterval(interval)
        }
    }, [user, selectedQueue])

    const handleRetryJob = async (queueName: string, jobId: string) => {
        try {
            await retryJob(queueName, jobId)
            toast.success(`Job ${jobId} has been retried`)
            // Refresh data
            const stats = await getQueueStats().catch(() => null)
            setQueueStats(stats)
            if (queueName) {
                const failed = await getFailedJobs(queueName, 0, 10).catch(() => ({ jobs: [], total: 0 }))
                setFailedJobs(failed.jobs || [])
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to retry job')
        }
    }

    const handleCleanJobs = async (queueName: string, status: 'completed' | 'failed' | 'all') => {
        try {
            const result = await cleanJobs(queueName, status)
            toast.success(`Cleaned ${result.cleaned} ${status} jobs`)
            // Refresh data
            const stats = await getQueueStats().catch(() => null)
            setQueueStats(stats)
            if (queueName) {
                const [failed, completed] = await Promise.all([
                    getFailedJobs(queueName, 0, 10).catch(() => ({ jobs: [], total: 0 })),
                    getJobHistory(queueName, 'completed', 0, 10).catch(() => ({ jobs: [], total: 0 })),
                ])
                setFailedJobs(failed.jobs || [])
                setCompletedJobs(completed.jobs || [])
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to clean jobs')
        }
    }

    const getQueueHealthStatus = (stats: QueueStatsResponse[string]) => {
        const total = stats.waiting + stats.active + stats.completed + stats.failed + stats.delayed
        const failureRate = total > 0 ? stats.failed / total : 0

        if (failureRate > 0.1) return 'error' // More than 10% failure rate
        if (failureRate > 0.05) return 'warning' // More than 5% failure rate
        return 'healthy'
    }

    const getHealthBadge = (status: 'healthy' | 'warning' | 'error') => {
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

    // Aggregate stats across all queues
    const aggregatedStats = queueStats
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

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Queue Monitoring</h1>
                    <p className="text-muted-foreground">
                        Monitor and manage background job queues
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => window.open(bullBoardUrl, '_blank')}
                >
                    <Activity className="mr-2 h-4 w-4" />
                    Open Bull Board
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="bull-board">Bull Board UI</TabsTrigger>
                    <TabsTrigger value="jobs">Job History</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    {/* Overall Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Queue Statistics</CardTitle>
                            <CardDescription>
                                Aggregated statistics across all queues
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
                                        <div className="text-2xl font-bold">{aggregatedStats.waiting}</div>
                                        <div className="text-sm text-muted-foreground">Waiting</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-2xl font-bold text-blue-600">{aggregatedStats.active}</div>
                                        <div className="text-sm text-muted-foreground">Active</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-2xl font-bold text-green-600">{aggregatedStats.completed}</div>
                                        <div className="text-sm text-muted-foreground">Completed</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-2xl font-bold text-red-600">{aggregatedStats.failed}</div>
                                        <div className="text-sm text-muted-foreground">Failed</div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-2xl font-bold text-yellow-600">{aggregatedStats.delayed}</div>
                                        <div className="text-sm text-muted-foreground">Delayed</div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Per-Queue Statistics */}
                    {queueStats && Object.keys(queueStats).length > 0 && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(queueStats).map(([queueName, stats]) => {
                                const healthStatus = getQueueHealthStatus(stats)
                                return (
                                    <Card key={queueName}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium capitalize">
                                                {queueName} Queue
                                            </CardTitle>
                                            {getHealthBadge(healthStatus)}
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Waiting:</span>
                                                    <span className="font-medium">{stats.waiting}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Active:</span>
                                                    <span className="font-medium text-blue-600">{stats.active}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Completed:</span>
                                                    <span className="font-medium text-green-600">{stats.completed}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Failed:</span>
                                                    <span className="font-medium text-red-600">{stats.failed}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Delayed:</span>
                                                    <span className="font-medium text-yellow-600">{stats.delayed}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t flex gap-2">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="flex-1">
                                                            <Trash2 className="mr-1 h-3 w-3" />
                                                            Clean
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Clean Queue Jobs</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Choose which jobs to clean from the {queueName} queue.
                                                                This will permanently remove jobs older than 24 hours.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                                            <AlertDialogAction
                                                                onClick={() => handleCleanJobs(queueName, 'completed')}
                                                            >
                                                                Clean Completed
                                                            </AlertDialogAction>
                                                            <AlertDialogAction
                                                                onClick={() => handleCleanJobs(queueName, 'failed')}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Clean Failed
                                                            </AlertDialogAction>
                                                            <AlertDialogAction
                                                                onClick={() => handleCleanJobs(queueName, 'all')}
                                                                className="bg-destructive hover:bg-destructive/90"
                                                            >
                                                                Clean All
                                                            </AlertDialogAction>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Bull Board UI Tab */}
                <TabsContent value="bull-board" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bull Board Dashboard</CardTitle>
                            <CardDescription>
                                Full-featured queue management interface
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden" style={{ height: '800px' }}>
                                <iframe
                                    src={bullBoardUrl}
                                    className="w-full h-full border-0"
                                    title="Bull Board Queue Dashboard"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Job History Tab */}
                <TabsContent value="jobs" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Failed Jobs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                    Failed Jobs
                                </CardTitle>
                                <CardDescription>
                                    Jobs that have failed and need attention
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="space-y-2">
                                        {[...Array(3)].map((_, i) => (
                                            <Skeleton key={i} className="h-16 w-full" />
                                        ))}
                                    </div>
                                ) : failedJobs.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
                                        <p>No failed jobs</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {failedJobs.map((job) => (
                                            <div
                                                key={job.id}
                                                className="border rounded-lg p-3 space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">Job {job.id}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {job.name || 'Unknown job'}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => selectedQueue && handleRetryJob(selectedQueue, job.id)}
                                                    >
                                                        <RefreshCw className="mr-1 h-3 w-3" />
                                                        Retry
                                                    </Button>
                                                </div>
                                                {job.failedReason && (
                                                    <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
                                                        {job.failedReason}
                                                    </div>
                                                )}
                                                {job.finishedOn && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Failed {formatDistanceToNow(new Date(job.finishedOn), { addSuffix: true })}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Completed Jobs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    Recent Completed Jobs
                                </CardTitle>
                                <CardDescription>
                                    Recently completed jobs
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="space-y-2">
                                        {[...Array(3)].map((_, i) => (
                                            <Skeleton key={i} className="h-16 w-full" />
                                        ))}
                                    </div>
                                ) : completedJobs.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Clock className="h-12 w-12 mx-auto mb-2" />
                                        <p>No completed jobs yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {completedJobs.map((job) => (
                                            <div
                                                key={job.id}
                                                className="border rounded-lg p-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">Job {job.id}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {job.name || 'Unknown job'}
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        Completed
                                                    </Badge>
                                                </div>
                                                {job.finishedOn && (
                                                    <div className="text-xs text-muted-foreground mt-2">
                                                        Completed {formatDistanceToNow(new Date(job.finishedOn), { addSuffix: true })}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

