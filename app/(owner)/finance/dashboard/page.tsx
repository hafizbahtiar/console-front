"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
    getFinanceDashboard,
    getIncomeVsExpenses,
    getCategoryBreakdown,
    getTrends,
    exportTransactions,
    getBudgetsWithStats,
    getBudgetAlerts,
    getFinancialGoalsWithProgress,
    getFinancialGoalsWithMilestones,
    type DashboardData,
    type IncomeExpensesData,
    type CategoryBreakdownData,
    type TrendsData,
    type Budget,
    type FinancialGoalWithProgress,
    type FinancialGoalWithMilestones,
} from "@/lib/api/finance"
import { BudgetCard, BudgetOverviewCard } from "@/components/features/finance/budgets/budget-card"
import { BudgetVsActualChart, BudgetProgressChart } from "@/components/features/finance/budgets/budget-chart"
import { FinancialGoalCard, FinancialGoalsOverviewCard } from "@/components/features/finance/financial-goals/financial-goal-card"
import { ApiClientError } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Wallet,
    Download,
    RefreshCcw,
    Calendar,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react"
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import { format, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInDays } from "date-fns"
import { toast } from "sonner"

const COLORS = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#ec4899', // pink
    '#6366f1', // indigo
]

export default function FinanceDashboardPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const router = useRouter()

    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [incomeExpensesData, setIncomeExpensesData] = useState<IncomeExpensesData | null>(null)
    const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdownData | null>(null)
    const [trendsData, setTrendsData] = useState<TrendsData | null>(null)
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [budgetAlerts, setBudgetAlerts] = useState<Budget[]>([])
    const [financialGoals, setFinancialGoals] = useState<FinancialGoalWithProgress[]>([])
    const [goalsWithMilestones, setGoalsWithMilestones] = useState<FinancialGoalWithMilestones[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [period, setPeriod] = useState<"monthly" | "yearly">("monthly")
    const [dateRange, setDateRange] = useState<"all" | "month" | "year" | "custom">("all")
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")
    const [isExporting, setIsExporting] = useState(false)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isAuthenticated, authLoading, router])

    useEffect(() => {
        if (isAuthenticated) {
            void fetchDashboardData()
        }
    }, [isAuthenticated, dateRange, startDate, endDate, period])

    const getDateRangeParams = () => {
        let start: string | undefined
        let end: string | undefined

        if (dateRange === "month") {
            start = format(startOfMonth(new Date()), "yyyy-MM-dd")
            end = format(endOfMonth(new Date()), "yyyy-MM-dd")
        } else if (dateRange === "year") {
            start = format(startOfYear(new Date()), "yyyy-MM-dd")
            end = format(endOfYear(new Date()), "yyyy-MM-dd")
        } else if (dateRange === "custom") {
            start = startDate || undefined
            end = endDate || undefined
        }

        return { startDate: start, endDate: end }
    }

    const fetchDashboardData = async () => {
        setIsLoading(true)
        try {
            const { startDate: start, endDate: end } = getDateRangeParams()

            const [dashboard, incomeExpenses, breakdown, trends, budgetsResponse, alerts, goalsResponse, milestonesResponse] = await Promise.all([
                getFinanceDashboard(start, end, 5),
                getIncomeVsExpenses(start, end),
                getCategoryBreakdown(start, end),
                getTrends(period, start, end),
                getBudgetsWithStats({ limit: 10 }),
                getBudgetAlerts(),
                getFinancialGoalsWithProgress(),
                getFinancialGoalsWithMilestones(),
            ])

            setDashboardData(dashboard)
            setIncomeExpensesData(incomeExpenses)
            setCategoryBreakdown(breakdown)
            setTrendsData(trends)
            setBudgets(budgetsResponse.data)
            setBudgetAlerts(alerts)
            setFinancialGoals(goalsResponse)
            setGoalsWithMilestones(milestonesResponse)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to load finance dashboard. Please try again."
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleExport = async (exportFormat: "csv" | "json" | "xlsx" | "pdf" = "csv") => {
        setIsExporting(true)
        try {
            const { startDate: start, endDate: end } = getDateRangeParams()
            const blob = await exportTransactions(exportFormat, start, end)

            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `transactions-${format(new Date(), "yyyy-MM-dd")}.${exportFormat}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast.success(`Transactions exported as ${exportFormat.toUpperCase()} successfully`)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to export transactions. Please try again."
            toast.error(message)
        } finally {
            setIsExporting(false)
        }
    }

    const incomeExpensesChartData = useMemo(() => {
        if (!incomeExpensesData) return []
        return [
            {
                name: "Income",
                value: incomeExpensesData.totalIncome,
                color: "#10b981",
            },
            {
                name: "Expenses",
                value: incomeExpensesData.totalExpenses,
                color: "#ef4444",
            },
        ]
    }, [incomeExpensesData])

    const expenseCategoryChartData = useMemo(() => {
        if (!categoryBreakdown) return []
        return categoryBreakdown.expenseCategories.map((cat) => ({
            name: cat.categoryName || "Uncategorized",
            value: cat.total,
            percentage: cat.percentage,
        }))
    }, [categoryBreakdown])

    const incomeCategoryChartData = useMemo(() => {
        if (!categoryBreakdown) return []
        return categoryBreakdown.incomeCategories.map((cat) => ({
            name: cat.categoryName || "Uncategorized",
            value: cat.total,
            percentage: cat.percentage,
        }))
    }, [categoryBreakdown])

    const trendsChartData = useMemo(() => {
        if (!trendsData) return []
        return trendsData.data.map((item) => ({
            period: item.period,
            income: item.income,
            expenses: item.expenses,
            net: item.net,
        }))
    }, [trendsData])

    if (authLoading || isLoading) {
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Finance Dashboard</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        View your financial overview, analytics, and trends
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={isLoading}>
                        <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                        <span className="sm:hidden">↻</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport("csv")}
                        disabled={isExporting}
                        className="hidden sm:flex"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport("json")}
                        disabled={isExporting}
                        className="hidden sm:flex"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export JSON
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport("xlsx")}
                        disabled={isExporting}
                        className="hidden sm:flex"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export Excel
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport("pdf")}
                        disabled={isExporting}
                        className="hidden sm:flex"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                    {/* Mobile Export Dropdown */}
                    <div className="sm:hidden">
                        <Select onValueChange={(value) => handleExport(value as "csv" | "json" | "xlsx" | "pdf")} disabled={isExporting}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Export" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="csv">CSV</SelectItem>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="xlsx">Excel</SelectItem>
                                <SelectItem value="pdf">PDF</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Date Range Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Date Range</CardTitle>
                    <CardDescription>Filter data by date range</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row flex-wrap items-end gap-4">
                        <div className="space-y-2 w-full sm:w-auto">
                            <Label htmlFor="date-range">Range</Label>
                            <Select value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
                                <SelectTrigger id="date-range" className="w-full sm:w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="year">This Year</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {dateRange === "custom" && (
                            <>
                                <div className="space-y-2 w-full sm:w-auto">
                                    <Label htmlFor="start-date">Start Date</Label>
                                    <Input
                                        id="start-date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full sm:w-auto"
                                    />
                                </div>
                                <div className="space-y-2 w-full sm:w-auto">
                                    <Label htmlFor="end-date">End Date</Label>
                                    <Input
                                        id="end-date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full sm:w-auto"
                                    />
                                </div>
                            </>
                        )}
                        <div className="space-y-2 w-full sm:w-auto">
                            <Label htmlFor="period">Trend Period</Label>
                            <Select value={period} onValueChange={(value) => setPeriod(value as any)}>
                                <SelectTrigger id="period" className="w-full sm:w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${dashboardData?.totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {incomeExpensesData?.incomeCount || 0} transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${dashboardData?.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {incomeExpensesData?.expenseCount || 0} transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-2xl font-bold ${(dashboardData?.netAmount || 0) >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            ${dashboardData?.netAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">Income - Expenses</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData?.transactionCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Total transactions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Income vs Expenses Chart */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Income vs Expenses</CardTitle>
                        <CardDescription>Comparison of total income and expenses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {incomeExpensesChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={incomeExpensesChartData}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        formatter={(value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {incomeExpensesChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Category Breakdown - Expenses */}
                <Card>
                    <CardHeader>
                        <CardTitle>Expense Categories</CardTitle>
                        <CardDescription>Breakdown by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {expenseCategoryChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={expenseCategoryChartData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                                    >
                                        {expenseCategoryChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No expense categories data
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Income Categories & Trends */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Income Categories</CardTitle>
                        <CardDescription>Breakdown by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {incomeCategoryChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={incomeCategoryChartData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                                    >
                                        {incomeCategoryChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No income categories data
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Trends Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>{period === "monthly" ? "Monthly" : "Yearly"} Trends</CardTitle>
                        <CardDescription>Income and expenses over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {trendsChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={trendsChartData}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        formatter={(value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="income"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        name="Income"
                                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="expenses"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        name="Expenses"
                                        dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="net"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        name="Net"
                                        strokeDasharray="5 5"
                                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No trends data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Budget Overview */}
            {budgets.length > 0 && (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <BudgetOverviewCard
                            totalBudgets={budgets.length}
                            totalBudgetAmount={budgets.reduce((sum, b) => sum + b.amount, 0)}
                            totalUsed={budgets.reduce((sum, b) => sum + (b.stats?.actualAmount || 0), 0)}
                            totalRemaining={budgets.reduce((sum, b) => sum + (b.stats?.remainingAmount || 0), 0)}
                            budgetsInAlert={budgetAlerts.length}
                        />
                        {budgets.slice(0, 3).map((budget) => (
                            <BudgetCard
                                key={budget.id}
                                budget={budget}
                                onClick={() => router.push(`/finance/budgets?id=${budget.id}`)}
                            />
                        ))}
                    </div>

                    {/* Budget Charts */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <BudgetVsActualChart
                            budgets={budgets}
                            title="Budget vs Actual Spending"
                            description="Comparison of budgeted amounts vs actual spending"
                        />
                        <BudgetProgressChart
                            budgets={budgets}
                            title="Budget Progress"
                            description="Percentage of budget used for each budget"
                        />
                    </div>
                </>
            )}

            {/* Budget Alerts */}
            {budgetAlerts.length > 0 && (
                <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            Budget Alerts
                        </CardTitle>
                        <CardDescription>
                            {budgetAlerts.length} budget{budgetAlerts.length !== 1 ? "s" : ""} requiring attention
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {budgetAlerts.slice(0, 6).map((budget) => (
                                <BudgetCard
                                    key={budget.id}
                                    budget={budget}
                                    onClick={() => router.push(`/finance/budgets?id=${budget.id}`)}
                                />
                            ))}
                        </div>
                        {budgetAlerts.length > 6 && (
                            <div className="mt-4 text-center">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/finance/budgets?alertLevel=warning")}
                                >
                                    View All Alerts ({budgetAlerts.length})
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Financial Goals Overview */}
            {financialGoals.length > 0 && (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <FinancialGoalsOverviewCard
                            totalGoals={financialGoals.length}
                            achievedGoals={financialGoals.filter(g => g.achieved).length}
                            totalTargetAmount={financialGoals.reduce((sum, g) => sum + g.targetAmount, 0)}
                            totalCurrentAmount={financialGoals.reduce((sum, g) => sum + g.currentAmount, 0)}
                            goalsInAlert={financialGoals.filter(g => {
                                const daysRemaining = differenceInDays(new Date(g.targetDate), new Date())
                                const progressPercentage = g.targetAmount > 0
                                    ? Math.min((g.currentAmount / g.targetAmount) * 100, 100)
                                    : 0
                                const createdAt = new Date(g.createdAt)
                                const targetDate = new Date(g.targetDate)
                                const totalDays = Math.ceil((targetDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
                                const expectedProgress = totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 0
                                const isOnTrack = progressPercentage >= expectedProgress || g.achieved || daysRemaining < 0
                                return !g.achieved && (daysRemaining < 30 || !isOnTrack)
                            }).length}
                            averageProgress={financialGoals.length > 0
                                ? financialGoals.reduce((sum, g) => {
                                    const progress = g.targetAmount > 0
                                        ? Math.min((g.currentAmount / g.targetAmount) * 100, 100)
                                        : 0
                                    return sum + progress
                                }, 0) / financialGoals.length
                                : 0}
                        />
                        {financialGoals
                            .sort((a, b) => {
                                // Sort by progress percentage (highest first), then by target date (soonest first)
                                const aProgress = a.targetAmount > 0 ? (a.currentAmount / a.targetAmount) * 100 : 0
                                const bProgress = b.targetAmount > 0 ? (b.currentAmount / b.targetAmount) * 100 : 0
                                if (Math.abs(aProgress - bProgress) > 1) {
                                    return bProgress - aProgress
                                }
                                return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
                            })
                            .slice(0, 3)
                            .map((goal) => (
                                <FinancialGoalCard
                                    key={goal.id}
                                    goal={goal}
                                    onClick={() => router.push(`/finance/goals?id=${goal.id}`)}
                                    showMilestones={true}
                                />
                            ))}
                    </div>

                    {/* Goals Alerts */}
                    {financialGoals.filter(g => {
                        const daysRemaining = differenceInDays(new Date(g.targetDate), new Date())
                        const progressPercentage = g.targetAmount > 0
                            ? Math.min((g.currentAmount / g.targetAmount) * 100, 100)
                            : 0
                        const createdAt = new Date(g.createdAt)
                        const targetDate = new Date(g.targetDate)
                        const totalDays = Math.ceil((targetDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
                        const expectedProgress = totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 0
                        const isOnTrack = progressPercentage >= expectedProgress || g.achieved || daysRemaining < 0
                        return !g.achieved && (daysRemaining < 30 || !isOnTrack)
                    }).length > 0 && (
                            <Card className="border-orange-200 bg-orange-50/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                                        Goals Requiring Attention
                                    </CardTitle>
                                    <CardDescription>
                                        {financialGoals.filter(g => {
                                            const daysRemaining = differenceInDays(new Date(g.targetDate), new Date())
                                            const progressPercentage = g.targetAmount > 0
                                                ? Math.min((g.currentAmount / g.targetAmount) * 100, 100)
                                                : 0
                                            const createdAt = new Date(g.createdAt)
                                            const targetDate = new Date(g.targetDate)
                                            const totalDays = Math.ceil((targetDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
                                            const expectedProgress = totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 0
                                            const isOnTrack = progressPercentage >= expectedProgress || g.achieved || daysRemaining < 0
                                            return !g.achieved && (daysRemaining < 30 || !isOnTrack)
                                        }).length} goal{financialGoals.filter(g => {
                                            const daysRemaining = differenceInDays(new Date(g.targetDate), new Date())
                                            const progressPercentage = g.targetAmount > 0
                                                ? Math.min((g.currentAmount / g.targetAmount) * 100, 100)
                                                : 0
                                            const createdAt = new Date(g.createdAt)
                                            const targetDate = new Date(g.targetDate)
                                            const totalDays = Math.ceil((targetDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
                                            const expectedProgress = totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 0
                                            const isOnTrack = progressPercentage >= expectedProgress || g.achieved || daysRemaining < 0
                                            return !g.achieved && (daysRemaining < 30 || !isOnTrack)
                                        }).length !== 1 ? "s" : ""} requiring attention
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {financialGoals
                                            .filter(g => {
                                                const daysRemaining = differenceInDays(new Date(g.targetDate), new Date())
                                                const progressPercentage = g.targetAmount > 0
                                                    ? Math.min((g.currentAmount / g.targetAmount) * 100, 100)
                                                    : 0
                                                const createdAt = new Date(g.createdAt)
                                                const targetDate = new Date(g.targetDate)
                                                const totalDays = Math.ceil((targetDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
                                                const expectedProgress = totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 0
                                                const isOnTrack = progressPercentage >= expectedProgress || g.achieved || daysRemaining < 0
                                                return !g.achieved && (daysRemaining < 30 || !isOnTrack)
                                            })
                                            .slice(0, 6)
                                            .map((goal) => (
                                                <FinancialGoalCard
                                                    key={goal.id}
                                                    goal={goal}
                                                    onClick={() => router.push(`/finance/goals?id=${goal.id}`)}
                                                    showMilestones={true}
                                                />
                                            ))}
                                    </div>
                                    {financialGoals.filter(g => {
                                        const daysRemaining = differenceInDays(new Date(g.targetDate), new Date())
                                        const progressPercentage = g.targetAmount > 0
                                            ? Math.min((g.currentAmount / g.targetAmount) * 100, 100)
                                            : 0
                                        const createdAt = new Date(g.createdAt)
                                        const targetDate = new Date(g.targetDate)
                                        const totalDays = Math.ceil((targetDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
                                        const expectedProgress = totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 0
                                        const isOnTrack = progressPercentage >= expectedProgress || g.achieved || daysRemaining < 0
                                        return !g.achieved && (daysRemaining < 30 || !isOnTrack)
                                    }).length > 6 && (
                                            <div className="mt-4 text-center">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => router.push("/finance/goals")}
                                                >
                                                    View All Goals
                                                </Button>
                                            </div>
                                        )}
                                </CardContent>
                            </Card>
                        )}

                    {/* Recent Milestone Achievements */}
                    {goalsWithMilestones.length > 0 && (
                        <Card className="border-green-200 bg-green-50/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    Recent Milestone Achievements
                                </CardTitle>
                                <CardDescription>
                                    Celebrate your recent milestone achievements
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {goalsWithMilestones.slice(0, 6).map((item) => (
                                        <Card key={item.goal.id} className="bg-white">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-semibold">{item.goal.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    {item.recentMilestones.slice(0, 3).map((milestone, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                                <span className="text-sm font-medium">{milestone.label}</span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                ${milestone.amount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Recent Transactions */}
            {dashboardData && dashboardData.recentTransactions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Latest financial transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {dashboardData.recentTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium">{transaction.description}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {format(new Date(transaction.date), "MMM dd, yyyy")}
                                        </div>
                                    </div>
                                    <div
                                        className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {transaction.type === "income" ? "+" : "-"}$
                                        {transaction.amount.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

