"use client"

import * as React from "react"
import type { Transaction } from "@/lib/api/finance/finance-transactions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay, startOfWeek, endOfWeek, isSameMonth, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { buildTransactionListUrl, type FinanceFilterState } from "@/lib/utils/finance-filters"

interface TransactionCalendarProps {
    transactions: Transaction[]
    onTransactionClick?: (transaction: Transaction) => void
    onDateClick?: (date: string) => void
    isLoading?: boolean
    currentMonth?: Date
    onMonthChange?: (date: Date) => void
}

interface DailySummary {
    date: string
    income: number
    expenses: number
    net: number
    transactionCount: number
    transactions: Transaction[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function TransactionCalendar({
    transactions,
    onTransactionClick,
    onDateClick,
    isLoading,
    currentMonth = new Date(),
    onMonthChange,
}: TransactionCalendarProps) {
    const router = useRouter()
    const [selectedMonth, setSelectedMonth] = React.useState<Date>(currentMonth)

    // Aggregate transactions by date
    const dailySummaries = React.useMemo(() => {
        const summaries = new Map<string, DailySummary>()

        transactions.forEach((transaction) => {
            const dateStr = format(parseISO(transaction.date), "yyyy-MM-dd")
            const existing = summaries.get(dateStr)

            if (existing) {
                if (transaction.type === "income") {
                    existing.income += transaction.amount
                } else {
                    existing.expenses += transaction.amount
                }
                existing.net = existing.income - existing.expenses
                existing.transactionCount += 1
                existing.transactions.push(transaction)
            } else {
                summaries.set(dateStr, {
                    date: dateStr,
                    income: transaction.type === "income" ? transaction.amount : 0,
                    expenses: transaction.type === "expense" ? transaction.amount : 0,
                    net: transaction.type === "income" ? transaction.amount : -transaction.amount,
                    transactionCount: 1,
                    transactions: [transaction],
                })
            }
        })

        return summaries
    }, [transactions])

    // Calculate max amounts for color intensity
    const maxIncome = React.useMemo(() => {
        return Math.max(...Array.from(dailySummaries.values()).map((s) => s.income), 1)
    }, [dailySummaries])

    const maxExpenses = React.useMemo(() => {
        return Math.max(...Array.from(dailySummaries.values()).map((s) => s.expenses), 1)
    }, [dailySummaries])

    const maxNet = React.useMemo(() => {
        const nets = Array.from(dailySummaries.values()).map((s) => Math.abs(s.net))
        return Math.max(...nets, 1)
    }, [dailySummaries])

    // Get calendar days for selected month
    const calendarDays = React.useMemo(() => {
        const monthStart = startOfMonth(selectedMonth)
        const monthEnd = endOfMonth(selectedMonth)
        const calendarStart = startOfWeek(monthStart)
        const calendarEnd = endOfWeek(monthEnd)
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    }, [selectedMonth])

    // Get color intensity for a date
    const getDateColor = (date: Date, viewMode: "income" | "expenses" | "net" = "net") => {
        const dateStr = format(date, "yyyy-MM-dd")
        const summary = dailySummaries.get(dateStr)

        if (!summary || summary.transactionCount === 0) {
            return "bg-muted/30 hover:bg-muted/50"
        }

        let intensity = 0
        if (viewMode === "income") {
            intensity = summary.income / maxIncome
        } else if (viewMode === "expenses") {
            intensity = summary.expenses / maxExpenses
        } else {
            intensity = Math.abs(summary.net) / maxNet
        }

        // Clamp intensity between 0.1 and 1
        intensity = Math.max(0.1, Math.min(1, intensity))

        // Calculate opacity (30% to 50%)
        const opacity = 30 + intensity * 20

        if (viewMode === "income") {
            return `bg-green-500/30 hover:bg-green-500/50`
        } else if (viewMode === "expenses") {
            return `bg-red-500/30 hover:bg-red-500/50`
        } else {
            // Net: green for positive, red for negative
            if (summary.net >= 0) {
                return `bg-green-500/30 hover:bg-green-500/50`
            } else {
                return `bg-red-500/30 hover:bg-red-500/50`
            }
        }
    }

    const handleDateClick = (date: Date) => {
        if (onDateClick) {
            onDateClick(format(date, "yyyy-MM-dd"))
        } else {
            // Default: navigate to transaction list with date filter
            const filters: FinanceFilterState = {
                startDate: format(date, "yyyy-MM-dd"),
                endDate: format(date, "yyyy-MM-dd"),
            }
            router.push(buildTransactionListUrl(filters))
        }
    }

    const handleMonthChange = (date: Date) => {
        setSelectedMonth(date)
        onMonthChange?.(date)
    }

    const goToPreviousMonth = () => {
        handleMonthChange(subMonths(selectedMonth, 1))
    }

    const goToNextMonth = () => {
        handleMonthChange(addMonths(selectedMonth, 1))
    }

    const goToToday = () => {
        handleMonthChange(new Date())
    }

    // Get summary for a specific date
    const getDateSummary = (date: Date): DailySummary | null => {
        const dateStr = format(date, "yyyy-MM-dd")
        return dailySummaries.get(dateStr) || null
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="h-8 bg-muted rounded animate-pulse" />
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Get transactions for selected month
    const monthStart = startOfMonth(selectedMonth)
    const monthEnd = endOfMonth(selectedMonth)
    const monthTransactions = transactions.filter((t) => {
        const tDate = parseISO(t.date)
        return tDate >= monthStart && tDate <= monthEnd
    })

    const monthSummary = React.useMemo(() => {
        let income = 0
        let expenses = 0
        monthTransactions.forEach((t) => {
            if (t.type === "income") {
                income += t.amount
            } else {
                expenses += t.amount
            }
        })
        return {
            income,
            expenses,
            net: income - expenses,
            count: monthTransactions.length,
        }
    }, [monthTransactions])

    return (
        <div className="space-y-4">
            {/* Month Summary Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                            {format(selectedMonth, "MMMM yyyy")}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPreviousMonth}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToToday}
                            >
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextMonth}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Transactions</p>
                            <p className="text-2xl font-bold">{monthSummary.count}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Income</p>
                            <p className="text-2xl font-bold text-green-600">
                                +{monthSummary.income.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Expenses</p>
                            <p className="text-2xl font-bold text-red-600">
                                -{monthSummary.expenses.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Net</p>
                            <p className={cn(
                                "text-2xl font-bold",
                                monthSummary.net >= 0 ? "text-green-600" : "text-red-600"
                            )}>
                                {monthSummary.net >= 0 ? "+" : ""}
                                {monthSummary.net.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                })}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Calendar Grid */}
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-2">
                            {DAYS.map((day) => (
                                <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((date) => {
                                const summary = getDateSummary(date)
                                const hasTransactions = summary && summary.transactionCount > 0
                                const isCurrentDay = isToday(date)
                                const isSelectedMonth = isSameMonth(date, selectedMonth)

                                return (
                                    <TooltipProvider key={format(date, "yyyy-MM-dd")}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={cn(
                                                        "relative h-20 flex flex-col items-center justify-center p-2 rounded-md cursor-pointer transition-colors border",
                                                        getDateColor(date, "net"),
                                                        !isSelectedMonth && "opacity-40",
                                                        isCurrentDay && "ring-2 ring-primary ring-offset-1",
                                                        hasTransactions && "font-semibold",
                                                        "hover:opacity-80"
                                                    )}
                                                    onClick={() => handleDateClick(date)}
                                                >
                                                    <span className={cn(
                                                        "text-sm",
                                                        isCurrentDay && "font-bold"
                                                    )}>
                                                        {format(date, "d")}
                                                    </span>
                                                    {hasTransactions && (
                                                        <div className="flex gap-0.5 mt-1">
                                                            {summary!.income > 0 && (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                                                            )}
                                                            {summary!.expenses > 0 && (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                                            )}
                                                        </div>
                                                    )}
                                                    {hasTransactions && (
                                                        <span className="text-xs text-muted-foreground mt-0.5">
                                                            {summary!.transactionCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            {hasTransactions && summary && (
                                                <TooltipContent side="top" className="max-w-xs">
                                                    <div className="space-y-1">
                                                        <p className="font-semibold">{format(date, "EEEE, MMMM d, yyyy")}</p>
                                                        <div className="text-sm space-y-0.5">
                                                            <p>
                                                                <span className="text-green-600">{summary.transactionCount}</span> transaction
                                                                {summary.transactionCount !== 1 ? "s" : ""}
                                                            </p>
                                                            {summary.income > 0 && (
                                                                <p className="text-green-600">
                                                                    Income: {summary.income.toLocaleString("en-US", {
                                                                        style: "currency",
                                                                        currency: "USD",
                                                                    })}
                                                                </p>
                                                            )}
                                                            {summary.expenses > 0 && (
                                                                <p className="text-red-600">
                                                                    Expenses: {summary.expenses.toLocaleString("en-US", {
                                                                        style: "currency",
                                                                        currency: "USD",
                                                                    })}
                                                                </p>
                                                            )}
                                                            <p className={cn(
                                                                "font-medium",
                                                                summary.net >= 0 ? "text-green-600" : "text-red-600"
                                                            )}>
                                                                Net: {summary.net >= 0 ? "+" : ""}
                                                                {summary.net.toLocaleString("en-US", {
                                                                    style: "currency",
                                                                    currency: "USD",
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                )
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-500/30 border" />
                            <span className="text-muted-foreground">Positive net / Income</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-500/30 border" />
                            <span className="text-muted-foreground">Negative net / Expenses</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                            <span className="text-muted-foreground">Has income</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            <span className="text-muted-foreground">Has expenses</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
