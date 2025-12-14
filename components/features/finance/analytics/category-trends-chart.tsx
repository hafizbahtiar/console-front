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
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts"
import { getCategoryTrends, type CategoryTrendsData } from "@/lib/api/finance/finance-analytics"
import { getExpenseCategories, type ExpenseCategory } from "@/lib/api/finance/finance-expense-categories"
import { getIncomeCategories, type IncomeCategory } from "@/lib/api/finance/finance-income-categories"
import { ApiClientError } from "@/lib/api-client"
import { toast } from "sonner"
import { Calendar, Download, RefreshCcw, TrendingUp } from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { useRouter } from "next/navigation"
import { buildTransactionListUrl, type FinanceFilterState } from "@/lib/utils/finance-filters"
import {
    getChartPreferences,
    saveChartPreferences,
    updateChartPreference,
    type ChartPreferences,
    type ChartType,
} from "@/lib/utils/chart-preferences"
import { ChartControls } from "./chart-controls"
import { EnhancedTooltip } from "./enhanced-tooltip"
import { ChartExportButton } from "./chart-export-button"

interface CategoryTrendsChartProps {
    title?: string
    description?: string
    onCategoryClick?: (categoryId: string, period: string) => void
    onExport?: (format: 'png' | 'svg' | 'pdf') => void
    currency?: string // Currency filter for analytics
}

const CHART_COLORS = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#ec4899', // pink
    '#6366f1', // indigo
]

export function CategoryTrendsChart({
    title = "Category Trends",
    description = "Track spending and income trends by category over time",
    onCategoryClick,
    onExport,
    currency,
}: CategoryTrendsChartProps) {
    const router = useRouter()
    const [data, setData] = useState<CategoryTrendsData[]>([])
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
    const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([])
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
    const [aggregation, setAggregation] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
    const [chartType, setChartType] = useState<'line' | 'area'>('line')
    const [startDate, setStartDate] = useState<string>(format(subMonths(new Date(), 6), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)
    const [preferences, setPreferences] = useState<ChartPreferences>(() =>
        getChartPreferences('category-trends')
    )

    // Load preferences on mount
    useEffect(() => {
        const prefs = getChartPreferences('category-trends')
        setPreferences(prefs)
        if (prefs.chartType && (prefs.chartType === 'line' || prefs.chartType === 'area')) {
            setChartType(prefs.chartType)
        }
    }, [])

    // Save preferences when they change
    const handlePreferenceChange = (key: keyof ChartPreferences, value: any) => {
        const newPrefs = { ...preferences, [key]: value }
        setPreferences(newPrefs)
        saveChartPreferences('category-trends', newPrefs)
    }

    // Save chart type preference
    const handleChartTypeChange = (type: ChartType) => {
        if (type === 'line' || type === 'area') {
            setChartType(type)
            updateChartPreference('category-trends', 'chartType', type)
        }
    }

    // Load categories on mount
    useEffect(() => {
        void loadCategories()
    }, [])

    // Load trends data when filters change
    useEffect(() => {
        if (selectedCategoryIds.length > 0) {
            void loadTrendsData()
        } else {
            setData([])
        }
    }, [selectedCategoryIds, aggregation, startDate, endDate, currency])

    const loadCategories = async () => {
        setIsLoadingCategories(true)
        try {
            const [expense, income] = await Promise.all([
                getExpenseCategories(),
                getIncomeCategories(),
            ])
            setExpenseCategories(expense)
            setIncomeCategories(income)
        } catch (error) {
            if (error instanceof ApiClientError) {
                toast.error(error.message || 'Failed to load categories')
            } else {
                toast.error('Failed to load categories')
            }
        } finally {
            setIsLoadingCategories(false)
        }
    }

    const loadTrendsData = async () => {
        setIsLoading(true)
        try {
            const promises = selectedCategoryIds.map(categoryId =>
                getCategoryTrends(categoryId, startDate, endDate, aggregation, currency)
            )
            const results = await Promise.all(promises)
            setData(results)
        } catch (error) {
            if (error instanceof ApiClientError) {
                toast.error(error.message || 'Failed to load category trends')
            } else {
                toast.error('Failed to load category trends')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const allCategories = useMemo(() => {
        return [
            ...expenseCategories.map(cat => ({ ...cat, type: 'expense' as const })),
            ...incomeCategories.map(cat => ({ ...cat, type: 'income' as const })),
        ]
    }, [expenseCategories, incomeCategories])

    // Prepare chart data
    const chartData = useMemo(() => {
        if (data.length === 0) return []

        // Get all unique periods from all datasets
        const periodSet = new Set<string>()
        data.forEach(dataset => {
            dataset.data.forEach(item => periodSet.add(item.period))
        })
        const periods = Array.from(periodSet).sort()

        // Combine data by period
        return periods.map(period => {
            const entry: Record<string, any> = { period }
            data.forEach((dataset, index) => {
                const dataPoint = dataset.data.find(d => d.period === period)
                entry[`value_${index}`] = dataPoint?.total || 0
                entry[`count_${index}`] = dataPoint?.count || 0
            })
            return entry
        })
    }, [data])

    const chartConfig = useMemo(() => {
        const config: Record<string, { label: string; color: string }> = {}
        data.forEach((dataset, index) => {
            const category = allCategories.find(c => c.id === dataset.categoryId)
            const color = CHART_COLORS[index % CHART_COLORS.length]
            config[`value_${index}`] = {
                label: dataset.categoryName || category?.name || `Category ${index + 1}`,
                color,
            }
        })
        return config
    }, [data, allCategories])

    const handleCategoryToggle = (categoryId: string) => {
        setSelectedCategoryIds(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId)
            } else {
                return [...prev, categoryId]
            }
        })
    }

    const handleQuickDateRange = (range: 'week' | 'month' | 'quarter' | 'year') => {
        const now = new Date()
        let start: Date
        switch (range) {
            case 'week':
                start = subMonths(now, 1)
                break
            case 'month':
                start = subMonths(now, 1)
                break
            case 'quarter':
                start = subMonths(now, 3)
                break
            case 'year':
                start = subMonths(now, 12)
                break
        }
        setStartDate(format(startOfMonth(start), 'yyyy-MM-dd'))
        setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'))
    }

    const handleChartClick = (data: any, index: number) => {
        if (!data || !selectedCategoryIds[index]) return

        const period = data.activePayload?.[0]?.payload?.period
        const categoryId = selectedCategoryIds[index]
        
        // Build filters for navigation
        const filters: FinanceFilterState = {
            categoryId,
            startDate: period ? `${period}-01` : startDate,
            endDate: period ? `${period}-31` : endDate,
        }

        // Navigate to transaction list with filters
        const url = buildTransactionListUrl(filters)
        router.push(url)

        // Also call custom handler if provided
        if (onCategoryClick && period) {
            onCategoryClick(categoryId, period)
        }
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
                        <ChartControls
                            chartId="category-trends"
                            chartType={chartType}
                            availableTypes={['line', 'area']}
                            preferences={preferences}
                            onChartTypeChange={handleChartTypeChange}
                            onPreferenceChange={handlePreferenceChange}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void loadTrendsData()}
                            disabled={isLoading || selectedCategoryIds.length === 0}
                        >
                            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <ChartExportButton
                            chartId="category-trends"
                            title={title}
                            description={description}
                            filename="category-trends"
                            disabled={chartData.length === 0}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Category Selector */}
                    <div className="space-y-2">
                        <Label>Categories</Label>
                        {isLoadingCategories ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {allCategories.map(category => (
                                    <Badge
                                        key={category.id}
                                        variant={selectedCategoryIds.includes(category.id) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => handleCategoryToggle(category.id)}
                                    >
                                        {category.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {selectedCategoryIds.length === 0 && (
                            <p className="text-xs text-muted-foreground">Select at least one category</p>
                        )}
                    </div>

                    {/* Aggregation Selector */}
                    <div className="space-y-2">
                        <Label>Aggregation</Label>
                        <Select value={aggregation} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setAggregation(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
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
                            <Button variant="outline" size="sm" onClick={() => handleQuickDateRange('month')}>
                                1M
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleQuickDateRange('quarter')}>
                                3M
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleQuickDateRange('year')}>
                                1Y
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <Skeleton className="h-full w-full" />
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
                        <p>No data available</p>
                        <p className="text-sm">Select categories and adjust date range to view trends</p>
                    </div>
                ) : (
                    <ChartContainer id="category-trends" config={chartConfig} className="h-[400px]">
                        {chartType === 'line' ? (
                            <LineChart data={chartData} onClick={handleChartClick}>
                                {preferences.showGrid !== false && (
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                )}
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
                                    content={({ active, payload }) => (
                                        <ChartTooltipContent
                                            active={active}
                                            payload={payload}
                                            formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                        />
                                    )}
                                />
                                <Legend />
                                {data.map((_, index) => (
                                    <Line
                                        key={`line-${index}`}
                                        type="monotone"
                                        dataKey={`value_${index}`}
                                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                ))}
                            </LineChart>
                        ) : (
                            <AreaChart data={chartData} onClick={handleChartClick}>
                                {preferences.showGrid !== false && (
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                )}
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
                                    content={({ active, payload, label }) => {
                                        const total = payload?.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 0
                                        return (
                                            <EnhancedTooltip
                                                active={active}
                                                payload={payload}
                                                label={label}
                                                tooltipFormat={preferences.tooltipFormat}
                                                showPercentage={true}
                                                totalValue={total}
                                                labelFormatter={(value) => value}
                                                formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                            />
                                        )
                                    }}
                                />
                                {preferences.showLegend !== false && <Legend />}
                                {data.map((_, index) => (
                                    <Area
                                        key={`area-${index}`}
                                        type="monotone"
                                        dataKey={`value_${index}`}
                                        stackId="1"
                                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                        fillOpacity={0.6}
                                    />
                                ))}
                            </AreaChart>
                        )}
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}

