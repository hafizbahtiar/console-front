import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
    BarChart3,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Play,
    Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QueueStats {
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

interface QueueStatsCardProps {
    queue: QueueStats
    isLoading?: boolean
    onRetryJob?: (jobId: string) => void
    onCleanJobs?: (status: 'completed' | 'failed' | 'all') => void
    className?: string
}

export function QueueStatsCard({
    queue,
    isLoading = false,
    onRetryJob,
    onCleanJobs,
    className
}: QueueStatsCardProps) {
    const getHealthStatus = (queue: QueueStats): 'healthy' | 'warning' | 'error' => {
        if (queue.failureRate > 10) return 'error'
        if (queue.failureRate > 5) return 'warning'
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

    const getHealthBadge = (status: 'healthy' | 'warning' | 'error') => {
        const variants = {
            healthy: 'default',
            warning: 'secondary',
            error: 'destructive'
        } as const

        const colors = {
            healthy: 'bg-green-500 hover:bg-green-600 text-white',
            warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
            error: 'bg-red-500 hover:bg-red-600 text-white'
        }

        return (
            <Badge variant={variants[status]} className={colors[status]}>
                {getHealthIcon(status)}
                <span className="ml-1 capitalize">{status}</span>
            </Badge>
        )
    }

    const stats = [
        { label: 'Waiting', value: queue.waiting, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
        { label: 'Active', value: queue.active, color: 'text-blue-600', bgColor: 'bg-blue-100' },
        { label: 'Completed', value: queue.completed, color: 'text-green-600', bgColor: 'bg-green-100' },
        { label: 'Failed', value: queue.failed, color: 'text-red-600', bgColor: 'bg-red-100' },
        { label: 'Delayed', value: queue.delayed, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    ]

    const healthStatus = getHealthStatus(queue)

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-lg capitalize">
                                {queue.name} Queue
                            </CardTitle>
                            <CardDescription>
                                Background job processing
                            </CardDescription>
                        </div>
                    </div>
                    {getHealthBadge(healthStatus)}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Throughput */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Throughput</span>
                    <Badge variant="outline" className="flex items-center">
                        <Play className="h-3 w-3 mr-1" />
                        {queue.throughput}/min
                    </Badge>
                </div>

                {/* Success Rate Progress */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-sm text-muted-foreground">
                            {queue.successRate.toFixed(1)}%
                        </span>
                    </div>
                    <Progress value={queue.successRate} className="h-2" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-5 gap-2">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className={cn("text-lg font-bold", stat.color)}>
                                {stat.value}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Failure Rate Warning */}
                {queue.failureRate > 0 && (
                    <div className={cn(
                        "p-2 rounded-md text-sm flex items-center",
                        queue.failureRate > 10 ? "bg-red-50 text-red-700" :
                            queue.failureRate > 5 ? "bg-yellow-50 text-yellow-700" :
                                "bg-gray-50 text-gray-700"
                    )}>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {queue.failureRate.toFixed(1)}% failure rate
                        {queue.failed > 0 && (
                            <span className="ml-1">({queue.failed} failed jobs)</span>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                {(onRetryJob || onCleanJobs) && (
                    <div className="flex gap-2 pt-2 border-t">
                        {onRetryJob && queue.failed > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRetryJob('latest')}
                                disabled={isLoading}
                            >
                                <Play className="h-3 w-3 mr-1" />
                                Retry Failed
                            </Button>
                        )}
                        {onCleanJobs && (queue.completed > 0 || queue.failed > 0) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onCleanJobs('completed')}
                                disabled={isLoading}
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Clean Jobs
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
