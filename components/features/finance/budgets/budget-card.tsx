"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { AlertTriangle, AlertCircle, XCircle, Target, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import type { Budget, BudgetAlertLevel } from "@/lib/api/finance/finance-budgets"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface BudgetCardProps {
    budget: Budget
    onClick?: () => void
}

function getAlertBadge(alertLevel?: BudgetAlertLevel) {
    if (!alertLevel || alertLevel === "none") return null

    const config = {
        warning: {
            icon: AlertTriangle,
            label: "Warning",
            className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
        },
        critical: {
            icon: AlertCircle,
            label: "Critical",
            className: "bg-orange-500/10 text-orange-700 border-orange-500/20",
        },
        exceeded: {
            icon: XCircle,
            label: "Exceeded",
            className: "bg-red-500/10 text-red-700 border-red-500/20",
        },
    }

    const { icon: Icon, label, className } = config[alertLevel]

    return (
        <Badge variant="outline" className={cn("text-xs flex items-center gap-1", className)}>
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    )
}

function getProgressColor(percentage: number, alertLevel?: BudgetAlertLevel): string {
    if (alertLevel === "exceeded") return "bg-red-500"
    if (alertLevel === "critical") return "bg-orange-500"
    if (alertLevel === "warning") return "bg-yellow-500"
    if (percentage >= 100) return "bg-red-500"
    if (percentage >= 80) return "bg-orange-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-green-500"
}

export function BudgetCard({ budget, onClick }: BudgetCardProps) {
    const stats = budget.stats
    const percentage = stats ? Math.min(stats.percentageUsed, 100) : 0
    const progressColor = stats ? getProgressColor(percentage, stats.alertLevel) : "bg-muted"

    return (
        <Card className={cn("hover:shadow-md transition-shadow", onClick && "cursor-pointer")} onClick={onClick}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold truncate">{budget.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                            {budget.period === "monthly" ? "Monthly" : "Yearly"} Budget
                            {budget.categoryType && (
                                <span className="ml-1">
                                    • {budget.categoryType === "ExpenseCategory" ? "Expense" : "Income"}
                                </span>
                            )}
                        </CardDescription>
                    </div>
                    {stats && getAlertBadge(stats.alertLevel)}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Budget Amount</span>
                        <span className="font-semibold">
                            ${budget.amount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                    {stats && (
                        <>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Used</span>
                                <span className="font-semibold">
                                    ${stats.actualAmount.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Remaining</span>
                                <span
                                    className={cn(
                                        "font-semibold",
                                        stats.remainingAmount < 0 ? "text-red-600" : "text-green-600"
                                    )}
                                >
                                    ${stats.remainingAmount.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {stats && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className={cn("h-full transition-all", progressColor)}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>
                        {format(new Date(budget.startDate), "MMM dd")}
                        {budget.endDate && ` - ${format(new Date(budget.endDate), "MMM dd")}`}
                    </span>
                    {budget.rolloverEnabled && (
                        <Badge variant="outline" className="text-[10px]">
                            Rollover
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

interface BudgetOverviewCardProps {
    totalBudgets: number
    totalBudgetAmount: number
    totalUsed: number
    totalRemaining: number
    budgetsInAlert: number
}

export function BudgetOverviewCard({
    totalBudgets,
    totalBudgetAmount,
    totalUsed,
    totalRemaining,
    budgetsInAlert,
}: BudgetOverviewCardProps) {
    const overallPercentage = totalBudgetAmount > 0 ? (totalUsed / totalBudgetAmount) * 100 : 0

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Overview</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Budgets</span>
                        <span className="font-semibold">{totalBudgets}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Budget Amount</span>
                        <span className="font-semibold">
                            ${totalBudgetAmount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Used</span>
                        <span className="font-semibold">
                            ${totalUsed.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Remaining</span>
                        <span
                            className={cn(
                                "font-semibold",
                                totalRemaining < 0 ? "text-red-600" : "text-green-600"
                            )}
                        >
                            ${totalRemaining.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                    {budgetsInAlert > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Budgets in Alert</span>
                            <Badge variant="destructive" className="text-xs">
                                {budgetsInAlert}
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-medium">{overallPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className={cn(
                                "h-full transition-all",
                                overallPercentage >= 100
                                    ? "bg-red-500"
                                    : overallPercentage >= 80
                                    ? "bg-orange-500"
                                    : overallPercentage >= 50
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            )}
                            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                        />
                    </div>
                </div>

                <Link href="/finance/budgets">
                    <Button variant="outline" size="sm" className="w-full">
                        View All Budgets
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}

