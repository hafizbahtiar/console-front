"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Activity,
    Server,
    Clock,
    AlertCircle,
    CheckCircle2,
    Download
} from "lucide-react"
import {
    getSystemMetrics,
    type SystemMetrics,
} from "@/lib/api/admin"
import { ApiClientError } from "@/lib/api-client"
import { toast } from "sonner"
import { format, formatDistanceToNow } from "date-fns"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from "recharts"

type TimeRange = "1h" | "24h" | "7d" | "30d"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

// Chart configurations
const queueChartConfig: ChartConfig = {
    email: {
        label: "Email Queue",
        color: "hsl(var(--chart-1))",
    },
}

const successRateChartConfig: ChartConfig = {
    successRate: {
        label: "Success Rate",
        color: "hsl(var(--chart-2))",
    },
    failureRate: {
        label: "Failure Rate",
        color: "hsl(var(--chart-3))",
    },
}

const throughputChartConfig: ChartConfig = {
    throughput: {
        label: "Jobs/min",
        color: "hsl(var(--chart-1))",
    },
}

const responseTimeChartConfig: ChartConfig = {
    average: {
        label: "Average",
        color: "hsl(var(--chart-1))",
    },
    p50: {
        label: "P50",
        color: "hsl(var(--chart-2))",
    },
    p95: {
        label: "P95",
        color: "hsl(var(--chart-3))",
    },
    p99: {
        label: "P99",
        color: "hsl(var(--chart-4))",
    },
}

export default function SystemMetricsPage() {
    const { user } = useAuth()
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [timeRange, setTimeRange] = useState<TimeRange>("1h")
    const [metricsHistory, setMetricsHistory] = useState<SystemMetrics[]>([])

    useEffect(() => {
        async function fetchMetrics() {
            try {
                setIsLoading(true)
                const data = await getSystemMetrics()
                setMetrics(data)

                // Add to history (keep last 60 data points for 1h range)
                setMetricsHistory((prev) => {
                    const updated = [...prev, data]
                    return updated.slice(-60) // Keep last 60 points
                })
            } catch (error: any) {
                console.error('Failed to fetch metrics:', error)
                const message =
                    error instanceof ApiClientError
                        ? error.message
                        : 'Failed to load system metrics. Please try again.'
                toast.error(message)
            } finally {
                setIsLoading(false)
            }
        }

        // Owner check is handled by parent owner layout
        fetchMetrics()
        // Refresh every 10 seconds
        const interval = setInterval(fetchMetrics, 10000)
        return () => clearInterval(interval)
    }, [timeRange])

    const handleExport = () => {
        if (!metrics) return

        const dataStr = JSON.stringify(metrics, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `system-metrics-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('Metrics exported successfully')
    }

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
    }

    const formatDuration = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
        return `${Math.floor(seconds / 86400)}d`
    }

    // Owner check is handled by parent owner layout
    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">System Metrics</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-2">
                        Monitor system performance and resource usage
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Time Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1h">Last Hour</SelectItem>
                            <SelectItem value="24h">Last 24 Hours</SelectItem>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleExport} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {isLoading && !metrics ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : metrics ? (
                <>
                    {/* Overview Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">API Requests</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.api.requests.total.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {metrics.api.requests.rate.toFixed(1)} req/min
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.api.errorRate.toFixed(2)}%</div>
                                <p className="text-xs text-muted-foreground">
                                    {metrics.api.requests.failed} failed requests
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.api.responseTime.average.toFixed(0)}ms</div>
                                <p className="text-xs text-muted-foreground">
                                    P95: {metrics.api.responseTime.p95.toFixed(0)}ms
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Redis Memory</CardTitle>
                                <Server className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatBytes(metrics.redis.memory.used)}</div>
                                <p className="text-xs text-muted-foreground">
                                    {metrics.redis.memory.percentage.toFixed(1)}% of {formatBytes(metrics.redis.memory.total)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Queue Metrics */}
                    {isLoading ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-48 mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-[300px] w-full" />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-6 w-40" />
                                    <Skeleton className="h-4 w-56 mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-[300px] w-full" />
                                </CardContent>
                            </Card>
                        </div>
                    ) : metrics.queues.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Queue Status</CardTitle>
                                    <CardDescription>Current queue job distribution</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={queueChartConfig}
                                        className="h-[300px] w-full"
                                    >
                                        <PieChart>
                                            <ChartTooltip
                                                content={({ active, payload }) => {
                                                    if (!active || !payload?.length) return null
                                                    const data = payload[0]
                                                    return (
                                                        <ChartTooltipContent
                                                            active={active}
                                                            payload={payload}
                                                            label={data.name}
                                                        />
                                                    )
                                                }}
                                            />
                                            <Pie
                                                data={metrics.queues.map((q) => ({
                                                    name: q.name,
                                                    value: q.total,
                                                    fill: `var(--color-${q.name})`,
                                                }))}
                                                dataKey="value"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {metrics.queues.map((q, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Queue Success Rates</CardTitle>
                                    <CardDescription>Success vs failure rates by queue</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={successRateChartConfig}
                                        className="h-[300px] w-full"
                                    >
                                        <BarChart data={metrics.queues}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="name"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                            />
                                            <ChartTooltip
                                                content={<ChartTooltipContent />}
                                            />
                                            <ChartLegend
                                                content={<ChartLegendContent />}
                                            />
                                            <Bar
                                                dataKey="successRate"
                                                fill="var(--color-successRate)"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="failureRate"
                                                fill="var(--color-failureRate)"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
                    ) : null}

                    {/* Redis Metrics */}
                    {isLoading ? (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-4 w-56 mt-2" />
                                    </div>
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i}>
                                            <Skeleton className="h-4 w-24 mb-2" />
                                            <Skeleton className="h-8 w-20 mb-1" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Redis Metrics</CardTitle>
                                        <CardDescription>Memory usage, connections, and performance</CardDescription>
                                    </div>
                                    <Badge variant={metrics.redis.connected ? "default" : "destructive"}>
                                        {metrics.redis.connected ? (
                                            <>
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Connected
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                Disconnected
                                            </>
                                        )}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Memory Used</p>
                                        <p className="text-2xl font-bold">{formatBytes(metrics.redis.memory.used)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {metrics.redis.memory.percentage.toFixed(1)}% of total
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Connections</p>
                                        <p className="text-2xl font-bold">{metrics.redis.connections.connected}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {metrics.redis.connections.rejected} rejected
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Keys</p>
                                        <p className="text-2xl font-bold">{metrics.redis.keyspace.keys.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {metrics.redis.keyspace.expires} with expiry
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Latency</p>
                                        <p className="text-2xl font-bold">
                                            {metrics.redis.latency !== undefined ? `${metrics.redis.latency}ms` : 'N/A'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Ping time</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* MongoDB Metrics */}
                    {isLoading ? (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Skeleton className="h-6 w-36" />
                                        <Skeleton className="h-4 w-64 mt-2" />
                                    </div>
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i}>
                                            <Skeleton className="h-4 w-28 mb-2" />
                                            <Skeleton className="h-8 w-20 mb-1" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>MongoDB Metrics</CardTitle>
                                        <CardDescription>Connection pool and database information</CardDescription>
                                    </div>
                                    <Badge variant={metrics.mongodb.connected ? "default" : "destructive"}>
                                        {metrics.mongodb.connected ? (
                                            <>
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Connected
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                Disconnected
                                            </>
                                        )}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Connection Pool</p>
                                        <p className="text-2xl font-bold">
                                            {metrics.mongodb.connectionPool.current}/{metrics.mongodb.connectionPool.max}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {metrics.mongodb.connectionPool.available} available
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Collections</p>
                                        <p className="text-2xl font-bold">{metrics.mongodb.collections}</p>
                                        <p className="text-xs text-muted-foreground">Total collections</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Databases</p>
                                        <p className="text-2xl font-bold">{metrics.mongodb.databases.length}</p>
                                        <p className="text-xs text-muted-foreground">Total databases</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Uptime</p>
                                        <p className="text-2xl font-bold">
                                            {metrics.mongodb.serverStatus
                                                ? formatDuration(metrics.mongodb.serverStatus.uptime)
                                                : 'N/A'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {metrics.mongodb.serverStatus?.version || 'Version unknown'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* API Response Time Chart */}
                    {isLoading ? (
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-56 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[300px] w-full" />
                            </CardContent>
                        </Card>
                    ) : metricsHistory.length > 1 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>API Response Time Trend</CardTitle>
                                <CardDescription>Average response time over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={responseTimeChartConfig}
                                    className="h-[300px] w-full"
                                >
                                    <AreaChart data={metricsHistory.map((m, i) => ({
                                        time: i,
                                        average: m.api.responseTime.average,
                                        p50: m.api.responseTime.p50,
                                        p95: m.api.responseTime.p95,
                                        p99: m.api.responseTime.p99,
                                    }))}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="time"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                        />
                                        <ChartLegend
                                            content={<ChartLegendContent />}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="average"
                                            fill="var(--color-average)"
                                            fillOpacity={0.6}
                                            stroke="var(--color-average)"
                                            stackId="1"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="p50"
                                            fill="var(--color-p50)"
                                            fillOpacity={0.6}
                                            stroke="var(--color-p50)"
                                            stackId="2"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="p95"
                                            fill="var(--color-p95)"
                                            fillOpacity={0.6}
                                            stroke="var(--color-p95)"
                                            stackId="3"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="p99"
                                            fill="var(--color-p99)"
                                            fillOpacity={0.6}
                                            stroke="var(--color-p99)"
                                            stackId="4"
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Queue Throughput */}
                    {isLoading ? (
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-4 w-52 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[300px] w-full" />
                            </CardContent>
                        </Card>
                    ) : metrics.queues.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Queue Throughput</CardTitle>
                                <CardDescription>Jobs processed per minute by queue</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                    config={throughputChartConfig}
                                    className="h-[300px] w-full"
                                >
                                    <BarChart data={metrics.queues}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="name"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                        />
                                        <ChartLegend
                                            content={<ChartLegendContent />}
                                        />
                                        <Bar
                                            dataKey="throughput"
                                            fill="var(--color-throughput)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Last Updated */}
                    <div className="text-sm text-muted-foreground text-center">
                        Last updated: {format(new Date(metrics.timestamp), "PPpp")} (
                        {formatDistanceToNow(new Date(metrics.timestamp), { addSuffix: true })})
                    </div>
                </>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            No metrics data available
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

