"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from "lucide-react"
import {
    getCronJobStatuses,
    getCronJobHistory,
    type CronJobStatus,
    type CronJobExecution
} from "@/lib/api/admin"
import { ApiClientError } from "@/lib/api-client"
import { toast } from "sonner"
import { formatDistanceToNow, format } from "date-fns"

export default function CronJobsMonitoringPage() {
    const { user } = useAuth()
    const [cronJobs, setCronJobs] = useState<CronJobStatus[]>([])
    const [selectedJob, setSelectedJob] = useState<string | null>(null)
    const [jobHistory, setJobHistory] = useState<CronJobExecution[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)

    useEffect(() => {
        async function fetchCronJobs() {
            try {
                setIsLoading(true)
                const jobs = await getCronJobStatuses()
                setCronJobs(jobs)
                if (jobs.length > 0 && !selectedJob) {
                    setSelectedJob(jobs[0].name)
                }
            } catch (error: any) {
                console.error('Failed to fetch cron jobs:', error)
                const message =
                    error instanceof ApiClientError
                        ? error.message
                        : 'Failed to load cron jobs. Please try again.'
                toast.error(message)
            } finally {
                setIsLoading(false)
            }
        }

        // Owner check is handled by parent owner layout
        fetchCronJobs()
        // Refresh every 30 seconds
        const interval = setInterval(fetchCronJobs, 30000)
        return () => clearInterval(interval)
    }, [selectedJob])

    useEffect(() => {
        async function fetchHistory() {
            if (!selectedJob) return

            try {
                setIsLoadingHistory(true)
                const history = await getCronJobHistory(selectedJob, 50)
                setJobHistory(history.history || [])
            } catch (error: any) {
                console.error('Failed to fetch cron job history:', error)
                const message =
                    error instanceof ApiClientError
                        ? error.message
                        : 'Failed to load execution history. Please try again.'
                toast.error(message)
            } finally {
                setIsLoadingHistory(false)
            }
        }

        if (selectedJob) {
            fetchHistory()
        }
    }, [selectedJob])

    const getStatusBadge = (job: CronJobStatus) => {
        if (!job.enabled) {
            return <Badge variant="secondary">Disabled</Badge>
        }
        if (job.failureCount > 0 && job.lastError) {
            return <Badge variant="destructive">Error</Badge>
        }
        if (job.executionCount === 0) {
            return <Badge variant="outline">Never Run</Badge>
        }
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>
    }

    const getSuccessRate = (job: CronJobStatus) => {
        if (job.executionCount === 0) return 0
        return Math.round((job.successCount / job.executionCount) * 100)
    }

    // Owner check is handled by parent owner layout
    return (
        <div className="container mx-auto py-8 space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Cron Jobs Monitoring</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                    Monitor scheduled tasks and their execution history
                </p>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="history">Execution History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {isLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24 mt-2" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-20 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : cronJobs.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-center text-muted-foreground">
                                    No cron jobs found
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {cronJobs.map((job) => (
                                <Card key={job.name} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg">{job.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    {job.cronExpression}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(job)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Status</p>
                                                <p className="font-medium">
                                                    {job.enabled ? "Enabled" : "Disabled"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Success Rate</p>
                                                <p className="font-medium">
                                                    {getSuccessRate(job)}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Executions</p>
                                                <p className="font-medium">
                                                    {job.executionCount}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Failures</p>
                                                <p className="font-medium text-destructive">
                                                    {job.failureCount}
                                                </p>
                                            </div>
                                        </div>

                                        {job.lastExecution && (
                                            <div className="pt-2 border-t">
                                                <p className="text-xs text-muted-foreground mb-1">Last Execution</p>
                                                <p className="text-sm font-medium">
                                                    {formatDistanceToNow(new Date(job.lastExecution), { addSuffix: true })}
                                                </p>
                                                {job.lastDuration !== undefined && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Duration: {job.lastDuration}ms
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {job.nextExecution && (
                                            <div className="pt-2 border-t">
                                                <p className="text-xs text-muted-foreground mb-1">Next Execution</p>
                                                <p className="text-sm font-medium">
                                                    {formatDistanceToNow(new Date(job.nextExecution), { addSuffix: true })}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {format(new Date(job.nextExecution), "PPpp")}
                                                </p>
                                            </div>
                                        )}

                                        {job.lastError && (
                                            <div className="pt-2 border-t">
                                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Last Error
                                                </p>
                                                <p className="text-xs text-destructive line-clamp-2">
                                                    {job.lastError}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Execution History</CardTitle>
                            <CardDescription>
                                View detailed execution history for cron jobs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {cronJobs.length > 0 && (
                                <div className="mb-4">
                                    <label className="text-sm font-medium mb-2 block">
                                        Select Job
                                    </label>
                                    <select
                                        value={selectedJob || ""}
                                        onChange={(e) => setSelectedJob(e.target.value)}
                                        className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        {cronJobs.map((job) => (
                                            <option key={job.name} value={job.name}>
                                                {job.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {isLoadingHistory ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Skeleton key={i} className="h-16 w-full" />
                                    ))}
                                </div>
                            ) : jobHistory.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No execution history available
                                </p>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Time</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead>Error</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {jobHistory.map((execution, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {format(new Date(execution.executedAt), "PPpp")}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDistanceToNow(new Date(execution.executedAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {execution.success ? (
                                                            <Badge variant="default" className="bg-green-500">
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                Success
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive">
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                                Failed
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {execution.duration !== undefined ? (
                                                            <span className="text-sm">
                                                                {execution.duration}ms
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {execution.error ? (
                                                            <span className="text-sm text-destructive line-clamp-2">
                                                                {execution.error}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

