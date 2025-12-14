import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Play,
    Pause,
    TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, format } from "date-fns"

interface CronJobExecution {
    timestamp: string
    success: boolean
    duration?: number
    error?: string
}

interface CronJobStatus {
    name: string
    enabled: boolean
    lastExecution?: string
    nextExecution?: string
    executionCount: number
    successCount: number
    failureCount: number
    lastError?: string
    recentExecutions?: CronJobExecution[]
}

interface CronJobCardProps {
    job: CronJobStatus
    isLoading?: boolean
    onToggleJob?: (jobName: string, enabled: boolean) => void
    onRunJob?: (jobName: string) => void
    className?: string
}

export function CronJobCard({
    job,
    isLoading = false,
    onToggleJob,
    onRunJob,
    className
}: CronJobCardProps) {
    const getStatusBadge = (enabled: boolean) => {
        return (
            <Badge variant={enabled ? "default" : "secondary"} className={cn(
                enabled ? "bg-green-500 hover:bg-green-600 text-white" : ""
            )}>
                {enabled ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                    <Pause className="h-3 w-3 mr-1" />
                )}
                {enabled ? 'Enabled' : 'Disabled'}
            </Badge>
        )
    }

    const getSuccessRate = () => {
        const total = job.executionCount
        if (total === 0) return 0
        return Math.round((job.successCount / total) * 100)
    }

    const getHealthStatus = (): 'healthy' | 'warning' | 'error' => {
        const successRate = getSuccessRate()
        const hasRecentFailure = job.recentExecutions?.some(exec => !exec.success) ?? false

        if (successRate < 80 || hasRecentFailure) return 'error'
        if (successRate < 95) return 'warning'
        return 'healthy'
    }

    const getHealthIcon = (status: 'healthy' | 'warning' | 'error') => {
        switch (status) {
            case 'healthy':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />
        }
    }

    const successRate = getSuccessRate()
    const healthStatus = getHealthStatus()

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-lg">
                                {job.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </CardTitle>
                            <CardDescription>
                                Scheduled background task
                            </CardDescription>
                        </div>
                    </div>
                    {getStatusBadge(job.enabled)}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Success Rate */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium flex items-center">
                            {getHealthIcon(healthStatus)}
                            <span className="ml-1">Success Rate</span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {successRate}%
                        </span>
                    </div>
                    <Progress value={successRate} className="h-2" />
                </div>

                {/* Execution Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {job.executionCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Total Runs
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {job.successCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Success
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                            {job.failureCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Failed
                        </div>
                    </div>
                </div>

                {/* Timing Information */}
                <div className="space-y-2">
                    {job.lastExecution && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Last Run:</span>
                            <span className="font-medium">
                                {formatDistanceToNow(new Date(job.lastExecution), { addSuffix: true })}
                            </span>
                        </div>
                    )}

                    {job.nextExecution && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Next Run:</span>
                            <span className="font-medium">
                                {formatDistanceToNow(new Date(job.nextExecution), { addSuffix: true })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Recent Execution Status */}
                {job.recentExecutions && job.recentExecutions.length > 0 && (
                    <div className="pt-2 border-t">
                        <div className="text-sm font-medium mb-2">Recent Executions</div>
                        <div className="flex gap-1">
                            {job.recentExecutions.slice(0, 5).map((execution, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "w-2 h-2 rounded-full",
                                        execution.success ? "bg-green-500" : "bg-red-500"
                                    )}
                                    title={`${execution.success ? 'Success' : 'Failed'} at ${format(new Date(execution.timestamp), 'HH:mm')}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Last Error */}
                {job.lastError && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-start">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                            <div className="text-sm text-red-700">
                                <div className="font-medium">Last Error</div>
                                <div className="mt-1">{job.lastError}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {(onToggleJob || onRunJob) && (
                    <div className="flex gap-2 pt-2 border-t">
                        {onRunJob && job.enabled && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRunJob(job.name)}
                                disabled={isLoading}
                            >
                                <Play className="h-3 w-3 mr-1" />
                                Run Now
                            </Button>
                        )}
                        {onToggleJob && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onToggleJob(job.name, !job.enabled)}
                                disabled={isLoading}
                            >
                                {job.enabled ? (
                                    <>
                                        <Pause className="h-3 w-3 mr-1" />
                                        Disable
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-3 w-3 mr-1" />
                                        Enable
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
