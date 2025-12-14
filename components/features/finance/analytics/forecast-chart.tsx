"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    Area,
} from "recharts"
import { getForecast, type ForecastData } from "@/lib/api/finance/finance-analytics"
import { ApiClientError } from "@/lib/api-client"
import { toast } from "sonner"
import { Download, RefreshCcw, TrendingUp, Info } from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { ChartExportButton } from "./chart-export-button"

interface ForecastChartProps {
    title?: string
    description?: string
    onExport?: (format: 'png' | 'svg' | 'pdf') => void
    currency?: string // Currency filter for analytics
}

export function ForecastChart({
    title = "Financial Forecast",
    description = "Projected income, expenses, and net based on historical trends",
    onExport,
    currency,
}: ForecastChartProps) {
    const [forecastData, setForecastData] = useState<ForecastData | null>(null)
    const [period, setPeriod] = useState<'1month' | '3months' | '6months' | '1year'>('3months')
    const [startDate, setStartDate] = useState<string>(format(subMonths(new Date(), 12), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        void loadForecastData()
    }, [period, startDate, endDate, currency])

    const loadForecastData = async () => {
        setIsLoading(true)
        try {
            const data = await getForecast(period, startDate, endDate, currency)
            setForecastData(data)
        } catch (error) {
            if (error instanceof ApiClientError) {
                toast.error(error.message || 'Failed to load forecast data')
            } else {
                toast.error('Failed to load forecast data')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const chartData = useMemo(() => {
        if (!forecastData) return []

        return forecastData.forecast.map(item => ({
            period: item.period,
            projectedIncome: item.projectedIncome,
            projectedExpenses: item.projectedExpenses,
            projectedNet: item.projectedNet,
            incomeLower: item.confidenceInterval.income.lower,
            incomeUpper: item.confidenceInterval.income.upper,
            expensesLower: item.confidenceInterval.expenses.lower,
            expensesUpper: item.confidenceInterval.expenses.upper,
            netLower: item.confidenceInterval.net.lower,
            netUpper: item.confidenceInterval.net.upper,
        }))
    }, [forecastData])

    const chartConfig = {
        projectedIncome: { label: 'Projected Income', color: '#10b981' },
        projectedExpenses: { label: 'Projected Expenses', color: '#ef4444' },
        projectedNet: { label: 'Projected Net', color: '#3b82f6' },
        incomeLower: { label: 'Income Lower', color: '#10b981' },
        incomeUpper: { label: 'Income Upper', color: '#10b981' },
        expensesLower: { label: 'Expenses Lower', color: '#ef4444' },
        expensesUpper: { label: 'Expenses Upper', color: '#ef4444' },
        netLower: { label: 'Net Lower', color: '#3b82f6' },
        netUpper: { label: 'Net Upper', color: '#3b82f6' },
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
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Info className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Forecast Assumptions</h4>
                                    <div className="text-sm space-y-1">
                                        <p>
                                            <strong>Historical Average:</strong> Based on {forecastData?.historicalAverage ? 'recent' : 'historical'} data
                                        </p>
                                        {forecastData?.historicalAverage && (
                                            <>
                                                <p>Income: ${forecastData.historicalAverage.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                <p>Expenses: ${forecastData.historicalAverage.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                <p>Net: ${forecastData.historicalAverage.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Confidence intervals show 95% prediction range based on historical variance.
                                        </p>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void loadForecastData()}
                            disabled={isLoading}
                        >
                            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <ChartExportButton
                            chartId="forecast-chart"
                            title={title}
                            description={description}
                            filename="forecast-chart"
                            disabled={chartData.length === 0}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Forecast Period Selector */}
                    <div className="space-y-2">
                        <Label>Forecast Period</Label>
                        <Select value={period} onValueChange={(value: '1month' | '3months' | '6months' | '1year') => setPeriod(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1month">1 Month</SelectItem>
                                <SelectItem value="3months">3 Months</SelectItem>
                                <SelectItem value="6months">6 Months</SelectItem>
                                <SelectItem value="1year">1 Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Historical Data Date Range */}
                    <div className="space-y-2">
                        <Label>Historical Data Range</Label>
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

                    {/* Historical Average Display */}
                    {forecastData?.historicalAverage && (
                        <div className="space-y-2">
                            <Label>Historical Average</Label>
                            <div className="text-sm space-y-1 p-2 border rounded-md bg-muted/50">
                                <div>Income: ${forecastData.historicalAverage.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                <div>Expenses: ${forecastData.historicalAverage.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                <div>Net: ${forecastData.historicalAverage.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chart */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <Skeleton className="h-full w-full" />
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
                        <p>No forecast data available</p>
                        <p className="text-sm">Adjust date range to view forecast</p>
                    </div>
                ) : (
                    <ChartContainer id="forecast-chart" config={chartConfig} className="h-[400px]">
                        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis
                                dataKey="period"
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
                                    return (
                                        <div className="border border-border bg-background rounded-lg p-3 shadow-lg">
                                            <div className="font-medium mb-2">{payload[0]?.payload?.period}</div>
                                            {payload.map((item, index) => {
                                                if (item.dataKey?.toString().includes('Lower') || item.dataKey?.toString().includes('Upper')) {
                                                    return null
                                                }
                                                return (
                                                    <div key={index} className="flex items-center justify-between gap-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: item.color }}
                                                            />
                                                            <span>{item.name}</span>
                                                        </div>
                                                        <span className="font-mono font-semibold">
                                                            ${Number(item.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )
                                }}
                            />
                            <Legend />
                            {/* Confidence Intervals - Income */}
                            <Area
                                type="monotone"
                                dataKey="incomeUpper"
                                stackId="income"
                                stroke="none"
                                fill="#10b981"
                                fillOpacity={0.1}
                            />
                            <Area
                                type="monotone"
                                dataKey="incomeLower"
                                stackId="income"
                                stroke="none"
                                fill="#ffffff"
                                fillOpacity={1}
                            />
                            {/* Confidence Intervals - Expenses */}
                            <Area
                                type="monotone"
                                dataKey="expensesUpper"
                                stackId="expenses"
                                stroke="none"
                                fill="#ef4444"
                                fillOpacity={0.1}
                            />
                            <Area
                                type="monotone"
                                dataKey="expensesLower"
                                stackId="expenses"
                                stroke="none"
                                fill="#ffffff"
                                fillOpacity={1}
                            />
                            {/* Confidence Intervals - Net */}
                            <Area
                                type="monotone"
                                dataKey="netUpper"
                                stackId="net"
                                stroke="none"
                                fill="#3b82f6"
                                fillOpacity={0.1}
                            />
                            <Area
                                type="monotone"
                                dataKey="netLower"
                                stackId="net"
                                stroke="none"
                                fill="#ffffff"
                                fillOpacity={1}
                            />
                            {/* Projected Lines */}
                            <Line
                                type="monotone"
                                dataKey="projectedIncome"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="projectedExpenses"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="projectedNet"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </ComposedChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}

