"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
    ResponsiveContainer,
    Cell,
} from "recharts"
import {
    getMonthOverMonthComparison,
    getYearOverYearComparison,
    type MonthOverMonthComparisonData,
    type YearOverYearComparisonData,
} from "@/lib/api/finance/finance-analytics"
import { getExpenseCategories, type ExpenseCategory } from "@/lib/api/finance/finance-expense-categories"
import { getIncomeCategories, type IncomeCategory } from "@/lib/api/finance/finance-income-categories"
import { ApiClientError } from "@/lib/api-client"
import { toast } from "sonner"
import { Download, RefreshCcw, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { buildTransactionListUrl, type FinanceFilterState } from "@/lib/utils/finance-filters"
import { ChartExportButton } from "./chart-export-button"

interface ComparisonChartsProps {
    title?: string
    description?: string
    onCategoryClick?: (categoryId: string, period: string) => void
    onExport?: (format: 'png' | 'svg' | 'pdf') => void
    currency?: string // Currency filter for analytics
}

export function ComparisonCharts({
    title = "Comparison Analysis",
    description = "Compare financial performance month-over-month or year-over-year",
    onCategoryClick,
    onExport,
    currency,
}: ComparisonChartsProps) {
    const router = useRouter()
    const [comparisonType, setComparisonType] = useState<'mom' | 'yoy'>('mom')
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
    const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false)
    const [momData, setMomData] = useState<MonthOverMonthComparisonData | null>(null)
    const [yoyData, setYoyData] = useState<YearOverYearComparisonData | null>(null)
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
    const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)

    useEffect(() => {
        void loadCategories()
    }, [])

    useEffect(() => {
        void loadComparisonData()
    }, [comparisonType, selectedCategoryId, currency])

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

    const loadComparisonData = async () => {
        setIsLoading(true)
        try {
            if (comparisonType === 'mom') {
                const data = await getMonthOverMonthComparison(selectedCategoryId, currency)
                setMomData(data)
            } else {
                const data = await getYearOverYearComparison(selectedCategoryId, currency)
                setYoyData(data)
            }
        } catch (error) {
            if (error instanceof ApiClientError) {
                toast.error(error.message || 'Failed to load comparison data')
            } else {
                toast.error('Failed to load comparison data')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const allCategories = useMemo(() => {
        return [
            { id: undefined, name: 'All Categories', type: 'all' as const },
            ...expenseCategories.map(cat => ({ ...cat, type: 'expense' as const })),
            ...incomeCategories.map(cat => ({ ...cat, type: 'income' as const })),
        ]
    }, [expenseCategories, incomeCategories])

    // Month-over-Month Chart Data
    const momChartData = useMemo(() => {
        if (!momData) return []

        const data = [
            {
                name: 'Income',
                current: momData.currentMonth.income,
                previous: momData.previousMonth.income,
                change: momData.change.income,
            },
            {
                name: 'Expenses',
                current: momData.currentMonth.expenses,
                previous: momData.previousMonth.expenses,
                change: momData.change.expenses,
            },
            {
                name: 'Net',
                current: momData.currentMonth.net,
                previous: momData.previousMonth.net,
                change: momData.change.net,
            },
        ]

        if (showCategoryBreakdown && momData.categoryBreakdown) {
            return [
                ...data,
                ...momData.categoryBreakdown.slice(0, 5).map(cat => ({
                    name: cat.categoryName || 'Unknown',
                    current: cat.current,
                    previous: cat.previous,
                    change: cat.change,
                })),
            ]
        }

        return data
    }, [momData, showCategoryBreakdown])

    // Year-over-Year Chart Data
    const yoyChartData = useMemo(() => {
        if (!yoyData) return []

        return [
            {
                name: 'Income',
                current: yoyData.currentYear.income,
                previous: yoyData.previousYear.income,
                change: yoyData.change.income,
            },
            {
                name: 'Expenses',
                current: yoyData.currentYear.expenses,
                previous: yoyData.previousYear.expenses,
                change: yoyData.change.expenses,
            },
            {
                name: 'Net',
                current: yoyData.currentYear.net,
                previous: yoyData.previousYear.net,
                change: yoyData.change.net,
            },
        ]
    }, [yoyData])

    const chartConfig = {
        current: { label: comparisonType === 'mom' ? 'Current Month' : 'Current Year', color: '#3b82f6' },
        previous: { label: comparisonType === 'mom' ? 'Previous Month' : 'Previous Year', color: '#94a3b8' },
    }

    const getChangeColor = (percentage: number) => {
        if (percentage > 0) return 'text-green-600'
        if (percentage < 0) return 'text-red-600'
        return 'text-muted-foreground'
    }

    const getChangeIcon = (percentage: number) => {
        if (percentage > 0) return <ArrowUp className="h-4 w-4" />
        if (percentage < 0) return <ArrowDown className="h-4 w-4" />
        return null
    }

    const currentData = comparisonType === 'mom' ? momData : yoyData
    const chartData = comparisonType === 'mom' ? momChartData : yoyChartData

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
                            onClick={() => void loadComparisonData()}
                            disabled={isLoading}
                        >
                            <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </Button>
                        <ChartExportButton
                            chartId="comparison-charts"
                            title={title}
                            description={description}
                            filename="comparison-charts"
                            disabled={chartData.length === 0}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Comparison Type Selector */}
                    <div className="space-y-2">
                        <Label>Comparison Type</Label>
                        <Select value={comparisonType} onValueChange={(value: 'mom' | 'yoy') => setComparisonType(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mom">Month-over-Month</SelectItem>
                                <SelectItem value="yoy">Year-over-Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Category Selector */}
                    <div className="space-y-2">
                        <Label>Category</Label>
                        {isLoadingCategories ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select
                                value={selectedCategoryId || 'all'}
                                onValueChange={(value) => setSelectedCategoryId(value === 'all' ? undefined : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCategories.map(category => (
                                        <SelectItem key={category.id || 'all'} value={category.id || 'all'}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Category Breakdown Toggle (only for MoM) */}
                    {comparisonType === 'mom' && (
                        <div className="space-y-2">
                            <Label>Category Breakdown</Label>
                            <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                    id="category-breakdown"
                                    checked={showCategoryBreakdown}
                                    onCheckedChange={setShowCategoryBreakdown}
                                />
                                <Label htmlFor="category-breakdown" className="text-sm font-normal">
                                    Show top categories
                                </Label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                {currentData && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Income</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${currentData.change.income.amount >= 0 ? '+' : ''}
                                    {currentData.change.income.amount.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </div>
                                <div className={cn("flex items-center gap-1 text-xs", getChangeColor(currentData.change.income.percentage))}>
                                    {getChangeIcon(currentData.change.income.percentage)}
                                    {Math.abs(currentData.change.income.percentage).toFixed(1)}%
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${currentData.change.expenses.amount >= 0 ? '+' : ''}
                                    {currentData.change.expenses.amount.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </div>
                                <div className={cn("flex items-center gap-1 text-xs", getChangeColor(-currentData.change.expenses.percentage))}>
                                    {getChangeIcon(-currentData.change.expenses.percentage)}
                                    {Math.abs(currentData.change.expenses.percentage).toFixed(1)}%
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Net</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${currentData.change.net.amount >= 0 ? '+' : ''}
                                    {currentData.change.net.amount.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </div>
                                <div className={cn("flex items-center gap-1 text-xs", getChangeColor(currentData.change.net.percentage))}>
                                    {getChangeIcon(currentData.change.net.percentage)}
                                    {Math.abs(currentData.change.net.percentage).toFixed(1)}%
                                </div>
                            </CardContent>
                        </Card>
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
                    </div>
                ) : (
                    <ChartContainer id="comparison-charts" config={chartConfig} className="h-[400px]">
                        <BarChart 
                            data={chartData} 
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            onClick={(data) => {
                                if (!data || !data.activePayload?.[0]) return
                                
                                const payload = data.activePayload[0]
                                const name = payload.payload?.name
                                
                                // Build filters based on clicked item
                                const filters: FinanceFilterState = {
                                    categoryId: selectedCategoryId,
                                }
                                
                                // Add date range based on comparison type
                                if (comparisonType === 'mom' && currentData) {
                                    const momData = currentData as MonthOverMonthComparisonData
                                    if (name === 'Income' || name === 'Expenses' || name === 'Net') {
                                        // Navigate to current month
                                        const currentPeriod = momData.currentMonth.period
                                        filters.startDate = `${currentPeriod}-01`
                                        filters.endDate = `${currentPeriod}-31`
                                    }
                                } else if (comparisonType === 'yoy' && currentData) {
                                    const yoyData = currentData as YearOverYearComparisonData
                                    if (name === 'Income' || name === 'Expenses' || name === 'Net') {
                                        // Navigate to current year
                                        const currentPeriod = yoyData.currentYear.period
                                        filters.startDate = `${currentPeriod}-01-01`
                                        filters.endDate = `${currentPeriod}-12-31`
                                    }
                                }
                                
                                // Navigate to transaction list
                                const url = buildTransactionListUrl(filters)
                                router.push(url)
                                
                                if (onCategoryClick) {
                                    onCategoryClick(selectedCategoryId || '', name || '')
                                }
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
                                content={({ active, payload }) => (
                                    <ChartTooltipContent
                                        active={active}
                                        payload={payload}
                                        formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    />
                                )}
                            />
                            <Legend />
                            <Bar dataKey="current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="previous" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                )}

                {/* Change Indicators */}
                {chartData.length > 0 && (
                    <div className="grid gap-2">
                        <Label>Change Indicators</Label>
                        <div className="grid gap-2 md:grid-cols-3">
                            {chartData.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <span className="text-sm font-medium">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-sm font-semibold", getChangeColor(item.change.percentage))}>
                                            {item.change.percentage >= 0 ? '+' : ''}
                                            {item.change.percentage.toFixed(1)}%
                                        </span>
                                        {getChangeIcon(item.change.percentage)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

