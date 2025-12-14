"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    Cell,
} from "recharts"
import { getSpendingPatterns, type SpendingPatternsData } from "@/lib/api/finance/finance-analytics"
import { ApiClientError } from "@/lib/api-client"
import { toast } from "sonner"
import { Download, RefreshCcw, TrendingUp, AlertTriangle } from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { buildTransactionListUrl, type FinanceFilterState } from "@/lib/utils/finance-filters"
import { ChartExportButton } from "./chart-export-button"

interface SpendingPatternsChartProps {
    title?: string
    description?: string
    onAnomalyClick?: (date: string, type: 'income' | 'expense') => void
    onExport?: (format: 'png' | 'svg' | 'pdf') => void
    currency?: string // Currency filter for analytics
}

type PatternType = 'daily' | 'weekly' | 'monthly'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEK_NAMES = ['Week 1', 'Week 2', 'Week 3', 'Week 4']

export function SpendingPatternsChart({
    title = "Spending Patterns",
    description = "Analyze spending patterns and detect anomalies",
    onAnomalyClick,
    onExport,
    currency,
}: SpendingPatternsChartProps) {
    const router = useRouter()
    const [patternsData, setPatternsData] = useState<SpendingPatternsData | null>(null)
    const [patternType, setPatternType] = useState<PatternType>('daily')
    const [startDate, setStartDate] = useState<string>(format(subMonths(new Date(), 6), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        void loadPatternsData()
    }, [startDate, endDate, currency])

    const loadPatternsData = async () => {
        setIsLoading(true)
        try {
            const data = await getSpendingPatterns(startDate, endDate, currency)
            setPatternsData(data)
        } catch (error) {
            if (error instanceof ApiClientError) {
                toast.error(error.message || 'Failed to load spending patterns')
            } else {
                toast.error('Failed to load spending patterns')
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Prepare chart data based on pattern type
    const chartData = useMemo(() => {
        if (!patternsData) return []

        const patterns = patternsData.patterns[patternType]
        return patterns.map((item) => {
            let name: string
            if (patternType === 'daily') {
                name = DAY_NAMES[(item as { dayOfWeek: number }).dayOfWeek]
            } else if (patternType === 'weekly') {
                const weekItem = item as { weekOfMonth: number }
                name = WEEK_NAMES[weekItem.weekOfMonth - 1] || `Week ${weekItem.weekOfMonth}`
            } else {
                name = `Day ${(item as { dayOfMonth: number }).dayOfMonth}`
            }

            return {
                name,
                averageAmount: item.averageAmount,
                transactionCount: item.transactionCount,
                originalData: item,
            }
        })
    }, [patternsData, patternType])

    // Calculate average for highlighting anomalies
    const averageAmount = useMemo(() => {
        if (chartData.length === 0) return 0
        const sum = chartData.reduce((acc, item) => acc + item.averageAmount, 0)
        return sum / chartData.length
    }, [chartData])

    const stdDev = useMemo(() => {
        if (chartData.length === 0) return 0
        const variance = chartData.reduce((acc, item) => {
            return acc + Math.pow(item.averageAmount - averageAmount, 2)
        }, 0) / chartData.length
        return Math.sqrt(variance)
    }, [chartData, averageAmount])

    // Check if a data point is an anomaly (more than 2 standard deviations)
    const isAnomaly = (amount: number) => {
        return Math.abs(amount - averageAmount) > 2 * stdDev
    }

    const chartConfig = {
        averageAmount: { label: 'Average Amount', color: '#3b82f6' },
    }

    const handleQuickDateRange = (range: '3months' | '6months' | '1year') => {
        const now = new Date()
        let start: Date
        switch (range) {
            case '3months':
                start = subMonths(now, 3)
                break
            case '6months':
                start = subMonths(now, 6)
                break
            case '1year':
                start = subMonths(now, 12)
                break
        }
        setStartDate(format(startOfMonth(start), 'yyyy-MM-dd'))
        setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'))
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void loadPatternsData()}
                            disabled={isLoading}
                        >
                            <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </Button>
                        <ChartExportButton
                            chartId="spending-patterns"
                            title={title}
                            description={description}
                            filename="spending-patterns"
                            disabled={chartData.length === 0}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Pattern Type Selector */}
                    <div className="space-y-2">
                        <Label>Pattern Type</Label>
                        <Select value={patternType} onValueChange={(value: PatternType) => setPatternType(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily (Day of Week)</SelectItem>
                                <SelectItem value="weekly">Weekly (Week of Month)</SelectItem>
                                <SelectItem value="monthly">Monthly (Day of Month)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                        <Label>Date Range</Label>
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="flex-1"
                            />
                        </div>
                        <div className="flex gap-1 flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => handleQuickDateRange('3months')}>
                                3M
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleQuickDateRange('6months')}>
                                6M
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleQuickDateRange('1year')}>
                                1Y
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Anomalies Section */}
                {patternsData && patternsData.anomalies.length > 0 && (
                    <div className="space-y-2">
                        <Label>Detected Anomalies</Label>
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 max-h-32 overflow-y-auto">
                            {patternsData.anomalies.slice(0, 6).map((anomaly, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-accent transition-colors",
                                        anomaly.type === 'expense' ? "border-red-200 bg-red-50/50" : "border-green-200 bg-green-50/50"
                                    )}
                                    onClick={() => {
                                        // Build filters for navigation
                                        const filters: FinanceFilterState = {
                                            type: anomaly.type,
                                            startDate: anomaly.date,
                                            endDate: anomaly.date,
                                        }

                                        // Navigate to transaction list with filters
                                        const url = buildTransactionListUrl(filters)
                                        router.push(url)

                                        // Also call custom handler if provided
                                        if (onAnomalyClick) {
                                            onAnomalyClick(anomaly.date, anomaly.type)
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className={cn(
                                            "h-4 w-4",
                                            anomaly.type === 'expense' ? "text-red-600" : "text-green-600"
                                        )} />
                                        <div className="text-sm">
                                            <div className="font-medium">{format(new Date(anomaly.date), 'MMM dd, yyyy')}</div>
                                            <div className="text-xs text-muted-foreground">{anomaly.description}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold">
                                        ${anomaly.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chart */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <Skeleton className="h-full w-full" />
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
                        <p>No data available</p>
                        <p className="text-sm">Adjust date range to view patterns</p>
                    </div>
                ) : (
                    <ChartContainer id="spending-patterns" config={chartConfig} className="h-[400px]">
                        <BarChart 
                            data={chartData} 
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            onClick={(data) => {
                                if (!data || !data.activePayload?.[0]) return
                                
                                const payload = data.activePayload[0]
                                const name = payload.payload?.name
                                
                                // Build filters based on pattern type and clicked item
                                const filters: FinanceFilterState = {}
                                
                                // For daily patterns, we could filter by day of week
                                // For weekly/monthly, we could filter by date range
                                // This is a simplified version - can be enhanced
                                
                                // Navigate to transaction list with date range
                                const url = buildTransactionListUrl({
                                    ...filters,
                                    startDate,
                                    endDate,
                                })
                                router.push(url)
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `$${value.toLocaleString()}`}
                            />
                            <ChartTooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null
                                    const data = payload[0]?.payload
                                    return (
                                        <div className="border border-border bg-background rounded-lg p-3 shadow-lg">
                                            <div className="font-medium mb-2">{data?.name}</div>
                                            <div className="text-sm space-y-1">
                                                <div>
                                                    Average: ${Number(data?.averageAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                <div>
                                                    Transactions: {data?.transactionCount}
                                                </div>
                                                {isAnomaly(data?.averageAmount) && (
                                                    <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Anomaly detected
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                }}
                            />
                            <Legend />
                            <Bar dataKey="averageAmount" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => {
                                    const isAnomalyPoint = isAnomaly(entry.averageAmount)
                                    return (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={isAnomalyPoint ? '#f59e0b' : '#3b82f6'}
                                            stroke={isAnomalyPoint ? '#d97706' : undefined}
                                            strokeWidth={isAnomalyPoint ? 2 : 0}
                                        />
                                    )
                                })}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}

