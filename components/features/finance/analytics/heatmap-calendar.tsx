"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getHeatmapData, type HeatmapData } from "@/lib/api/finance/finance-analytics"
import { ApiClientError } from "@/lib/api-client"
import { toast } from "sonner"
import { Download, RefreshCcw, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, parseISO, getDay } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { buildTransactionListUrl, type FinanceFilterState } from "@/lib/utils/finance-filters"
import { ChartExportButton } from "./chart-export-button"

interface HeatmapCalendarProps {
    title?: string
    description?: string
    onDateClick?: (date: string) => void
    onExport?: (format: 'png' | 'svg' | 'pdf') => void
    currency?: string // Currency filter for analytics
}

type ViewMode = 'income' | 'expenses' | 'net'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function HeatmapCalendar({
    title = "Transaction Heatmap",
    description = "Visualize daily transaction activity over time",
    onDateClick,
    onExport,
    currency,
}: HeatmapCalendarProps) {
    const router = useRouter()
    const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('net')
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
    const [startDate, setStartDate] = useState<string>(format(subMonths(new Date(), 12), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        void loadHeatmapData()
    }, [startDate, endDate, currency])

    const loadHeatmapData = async () => {
        setIsLoading(true)
        try {
            const data = await getHeatmapData(startDate, endDate, currency)
            setHeatmapData(data)
        } catch (error) {
            if (error instanceof ApiClientError) {
                toast.error(error.message || 'Failed to load heatmap data')
            } else {
                toast.error('Failed to load heatmap data')
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Create a map of date to data for quick lookup
    const dataMap = useMemo(() => {
        const map = new Map<string, HeatmapData['data'][0]>()
        if (heatmapData) {
            heatmapData.data.forEach(item => {
                map.set(item.date, item)
            })
        }
        return map
    }, [heatmapData])

    // Get value for current view mode
    const getValue = (date: string) => {
        const data = dataMap.get(date)
        if (!data) return 0
        switch (viewMode) {
            case 'income':
                return data.income
            case 'expenses':
                return data.expenses
            case 'net':
                return data.net
        }
    }

    // Get transaction count for a date
    const getTransactionCount = (date: string) => {
        return dataMap.get(date)?.transactionCount || 0
    }

    // Calculate color intensity
    const getColorIntensity = (value: number, maxValue: number) => {
        if (maxValue === 0) return 0
        const ratio = Math.abs(value) / maxValue
        return Math.min(ratio, 1)
    }

    // Get color based on view mode and value
    const getColor = (value: number, intensity: number) => {
        if (viewMode === 'income') {
            // Green gradient for income
            const opacity = 0.3 + intensity * 0.7
            return `rgba(16, 185, 129, ${opacity})` // green-500
        } else if (viewMode === 'expenses') {
            // Red gradient for expenses
            const opacity = 0.3 + intensity * 0.7
            return `rgba(239, 68, 68, ${opacity})` // red-500
        } else {
            // Gradient from red (negative) to green (positive) for net
            if (value >= 0) {
                const opacity = 0.3 + intensity * 0.7
                return `rgba(16, 185, 129, ${opacity})` // green-500
            } else {
                const opacity = 0.3 + intensity * 0.7
                return `rgba(239, 68, 68, ${opacity})` // red-500
            }
        }
    }

    // Get max value for color scaling
    const maxValue = useMemo(() => {
        if (!heatmapData) return 0
        return Math.max(
            ...heatmapData.data.map(item => {
                switch (viewMode) {
                    case 'income':
                        return item.income
                    case 'expenses':
                        return item.expenses
                    case 'net':
                        return Math.abs(item.net)
                }
            })
        )
    }, [heatmapData, viewMode])

    // Get calendar days for current month
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)
        const calendarStart = startOfWeek(monthStart)
        const calendarEnd = endOfWeek(monthEnd)
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    }, [currentMonth])

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

    const handlePreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1))
    }

    const handleNextMonth = () => {
        setCurrentMonth(subMonths(currentMonth, -1))
    }

    const handleDateClick = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        if (!dataMap.has(dateStr)) return

        // Build filters for navigation
        const filters: FinanceFilterState = {
            startDate: dateStr,
            endDate: dateStr,
        }

        // Navigate to transaction list with filters
        const url = buildTransactionListUrl(filters)
        router.push(url)

        // Also call custom handler if provided
        if (onDateClick) {
            onDateClick(dateStr)
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
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void loadHeatmapData()}
                            disabled={isLoading}
                        >
                            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <ChartExportButton
                            chartId="heatmap-calendar"
                            title={title}
                            description={description}
                            filename="heatmap-calendar"
                            disabled={!heatmapData || heatmapData.data.length === 0}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* View Mode Selector */}
                    <div className="space-y-2">
                        <Label>View Mode</Label>
                        <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expenses">Expenses</SelectItem>
                                <SelectItem value="net">Net</SelectItem>
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

                    {/* Legend */}
                    <div className="space-y-2">
                        <Label>Legend</Label>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Less</span>
                            <div className="flex-1 flex gap-1">
                                {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
                                    <div
                                        key={intensity}
                                        className="flex-1 h-4 rounded"
                                        style={{
                                            backgroundColor: getColor(
                                                viewMode === 'expenses' ? -1 : 1,
                                                intensity
                                            ),
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="text-muted-foreground">More</span>
                        </div>
                    </div>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-lg font-semibold">
                        {format(currentMonth, 'MMMM yyyy')}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Calendar Heatmap */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <Skeleton className="h-full w-full" />
                    </div>
                ) : !heatmapData || heatmapData.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                        <CalendarIcon className="h-12 w-12 mb-4 opacity-50" />
                        <p>No data available</p>
                        <p className="text-sm">Adjust date range to view heatmap</p>
                    </div>
                ) : (
                    <TooltipProvider>
                        <div className="space-y-2">
                            {/* Day labels */}
                            <div className="grid grid-cols-7 gap-1">
                                {DAYS.map((day) => (
                                    <div key={day} className="text-xs text-center text-muted-foreground font-medium p-1">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, index) => {
                                    const dateStr = format(day, 'yyyy-MM-dd')
                                    const value = getValue(dateStr)
                                    const intensity = getColorIntensity(value, maxValue)
                                    const color = getColor(value, intensity)
                                    const isCurrentMonth = isSameMonth(day, currentMonth)
                                    const hasData = dataMap.has(dateStr)
                                    const transactionCount = getTransactionCount(dateStr)

                                    return (
                                        <Tooltip key={index}>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => handleDateClick(day)}
                                                    disabled={!hasData}
                                                    className={cn(
                                                        "aspect-square rounded-md text-xs transition-colors",
                                                        "hover:ring-2 hover:ring-ring hover:ring-offset-2",
                                                        "disabled:cursor-not-allowed disabled:opacity-50",
                                                        !isCurrentMonth && "opacity-30"
                                                    )}
                                                    style={{
                                                        backgroundColor: hasData ? color : 'transparent',
                                                        border: hasData ? '1px solid rgba(0,0,0,0.1)' : '1px solid transparent',
                                                    }}
                                                >
                                                    <span className={cn(
                                                        "text-[10px]",
                                                        !isCurrentMonth && "text-muted-foreground"
                                                    )}>
                                                        {format(day, 'd')}
                                                    </span>
                                                </button>
                                            </TooltipTrigger>
                                            {hasData && (
                                                <TooltipContent>
                                                    <div className="space-y-1">
                                                        <div className="font-semibold">{format(day, 'MMM dd, yyyy')}</div>
                                                        <div className="text-xs space-y-0.5">
                                                            <div>Income: ${dataMap.get(dateStr)?.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            <div>Expenses: ${dataMap.get(dateStr)?.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            <div>Net: ${dataMap.get(dateStr)?.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            <div>Transactions: {transactionCount}</div>
                                                        </div>
                                                    </div>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    )
                                })}
                            </div>
                        </div>
                    </TooltipProvider>
                )}
            </CardContent>
        </Card>
    )
}

