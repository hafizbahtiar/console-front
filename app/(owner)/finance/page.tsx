"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, TrendingUp, TrendingDown, Wallet, Repeat, Calendar } from "lucide-react"
import { getRecurringTransactions, type RecurringTransaction } from "@/lib/api/finance"
import { ApiClientError } from "@/lib/api-client"
import { format, isPast, isToday, differenceInDays } from "date-fns"

export default function FinancePage() {
    const { user, isLoading } = useAuth()
    const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
    const [isLoadingRecurring, setIsLoadingRecurring] = useState(false)
    const [upcomingRecurring, setUpcomingRecurring] = useState<RecurringTransaction[]>([])

    useEffect(() => {
        if (user?.role === "owner" && !isLoading) {
            void fetchRecurringTransactions()
        }
    }, [user, isLoading])

    const fetchRecurringTransactions = async () => {
        setIsLoadingRecurring(true)
        try {
            const data = await getRecurringTransactions({ isActive: true })
            setRecurringTransactions(data)

            // Get upcoming recurring transactions (next 7 days)
            const now = new Date()
            const nextWeek = new Date(now)
            nextWeek.setDate(nextWeek.getDate() + 7)

            const upcoming = data
                .filter(rt => {
                    const nextRun = new Date(rt.nextRunDate)
                    return nextRun >= now && nextRun <= nextWeek
                })
                .sort((a, b) => {
                    const dateA = new Date(a.nextRunDate)
                    const dateB = new Date(b.nextRunDate)
                    return dateA.getTime() - dateB.getTime()
                })
                .slice(0, 5) // Show top 5 upcoming

            setUpcomingRecurring(upcoming)
        } catch (error: any) {
            // Silently fail - this is optional data
            console.error("Failed to load recurring transactions:", error)
        } finally {
            setIsLoadingRecurring(false)
        }
    }

    const activeRecurringCount = recurringTransactions.filter(rt => rt.isActive).length

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-32 mb-1" />
                                <Skeleton className="h-3 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Finance</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                    Manage your financial transactions, categories, and analytics
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Income
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-muted-foreground">
                            No transactions yet
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Expenses
                        </CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-muted-foreground">
                            No transactions yet
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Net Amount
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-muted-foreground">
                            Income - Expenses
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Transactions
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Total transactions
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/finance/transactions">
                    <Card className="cursor-pointer hover:bg-accent transition-colors h-full">
                        <CardHeader>
                            <CardTitle>Transactions</CardTitle>
                            <CardDescription>
                                Manage your income and expense transactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                View, create, edit, and delete financial transactions.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/finance/recurring-transactions">
                    <Card className="cursor-pointer hover:bg-accent transition-colors h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recurring Transactions</CardTitle>
                                    <CardDescription>
                                        Automate recurring income and expenses
                                    </CardDescription>
                                </div>
                                {!isLoadingRecurring && activeRecurringCount > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                        {activeRecurringCount}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Set up recurring transactions that generate automatically.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/finance/categories/expenses">
                    <Card className="cursor-pointer hover:bg-accent transition-colors h-full">
                        <CardHeader>
                            <CardTitle>Categories</CardTitle>
                            <CardDescription>
                                Organize transactions with categories
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Manage expense and income categories for better organization.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/finance/categories/merchant-mappings">
                    <Card className="cursor-pointer hover:bg-accent transition-colors h-full">
                        <CardHeader>
                            <CardTitle>Merchant Mappings</CardTitle>
                            <CardDescription>
                                Auto-categorize transactions by merchant
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Manage merchant-to-category mappings for automatic categorization.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/finance/dashboard">
                    <Card className="cursor-pointer hover:bg-accent transition-colors h-full">
                        <CardHeader>
                            <CardTitle>Dashboard</CardTitle>
                            <CardDescription>
                                View financial overview and insights
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Overview of your finances with key metrics and charts.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/finance/analytics">
                    <Card className="cursor-pointer hover:bg-accent transition-colors h-full">
                        <CardHeader>
                            <CardTitle>Advanced Analytics</CardTitle>
                            <CardDescription>
                                Deep insights with advanced visualizations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Explore category trends, comparisons, forecasts, and patterns.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Upcoming Recurring Transactions Widget */}
            {user?.role === "owner" && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Upcoming Recurring Transactions
                                </CardTitle>
                                <CardDescription>
                                    Transactions scheduled to generate in the next 7 days
                                </CardDescription>
                            </div>
                            <Link href="/finance/recurring-transactions">
                                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                                    View All
                                </Badge>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingRecurring ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                ))}
                            </div>
                        ) : upcomingRecurring.length === 0 ? (
                            <div className="text-center py-6">
                                <Repeat className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    No upcoming recurring transactions in the next 7 days
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingRecurring.map((rt) => {
                                    const nextRun = new Date(rt.nextRunDate)
                                    const daysUntil = differenceInDays(nextRun, new Date())
                                    const isOverdue = isPast(nextRun) && !isToday(nextRun)
                                    const isTodayDate = isToday(nextRun)

                                    return (
                                        <div
                                            key={rt.id}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-sm truncate">
                                                        {rt.template.description}
                                                    </p>
                                                    <Badge
                                                        variant={rt.template.type === "income" ? "default" : "destructive"}
                                                        className="text-xs"
                                                    >
                                                        {rt.template.type === "income" ? "Income" : "Expense"}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>
                                                        {rt.template.type === "income" ? "+" : "-"}$
                                                        {rt.template.amount.toLocaleString("en-US", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {rt.frequency === "daily"
                                                            ? "Daily"
                                                            : rt.frequency === "weekly"
                                                                ? "Weekly"
                                                                : rt.frequency === "monthly"
                                                                    ? "Monthly"
                                                                    : rt.frequency === "yearly"
                                                                        ? "Yearly"
                                                                        : `Every ${rt.interval} days`}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 ml-4">
                                                {isOverdue ? (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Overdue
                                                    </Badge>
                                                ) : isTodayDate ? (
                                                    <Badge variant="default" className="text-xs bg-orange-500">
                                                        Today
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {daysUntil === 0
                                                            ? "Today"
                                                            : daysUntil === 1
                                                                ? "Tomorrow"
                                                                : `In ${daysUntil} days`}
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {format(nextRun, "MMM dd, yyyy")}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

