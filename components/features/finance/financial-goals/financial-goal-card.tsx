"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, TrendingUp, AlertTriangle, Calendar, Sparkles } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import type { FinancialGoal, GoalCategory, FinancialGoalWithProgress } from "@/lib/api/finance/finance-financial-goals"
import { cn } from "@/lib/utils"
import Link from "next/link"

const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
    emergency_fund: "Emergency Fund",
    vacation: "Vacation",
    house: "House",
    car: "Car",
    education: "Education",
    retirement: "Retirement",
    debt_payoff: "Debt Payoff",
    investment: "Investment",
    other: "Other",
}

interface FinancialGoalCardProps {
    goal: FinancialGoal | FinancialGoalWithProgress
    onClick?: () => void
    showMilestones?: boolean
}

function getProgressColor(percentage: number): string {
    if (percentage >= 100) return "bg-green-500"
    if (percentage >= 75) return "bg-blue-500"
    if (percentage >= 50) return "bg-yellow-500"
    if (percentage >= 25) return "bg-orange-500"
    return "bg-red-500"
}

function calculateOnTrackStatus(goal: FinancialGoal): boolean {
    const now = new Date()
    const targetDate = new Date(goal.targetDate)
    const createdAt = new Date(goal.createdAt)
    const totalDays = Math.ceil((targetDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const progressPercentage = goal.targetAmount > 0
        ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
        : 0
    const expectedProgress = totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 0
    return progressPercentage >= expectedProgress || goal.achieved || daysRemaining < 0
}

export function FinancialGoalCard({ goal, onClick, showMilestones = false }: FinancialGoalCardProps) {
    const progressPercentage = goal.targetAmount > 0
        ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
        : 0
    const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0)
    const targetDate = new Date(goal.targetDate)
    const daysRemaining = differenceInDays(targetDate, new Date())
    const isOnTrack = calculateOnTrackStatus(goal)
    const progress = "progress" in goal ? goal.progress : null
    const achievedMilestones = goal.milestones?.filter(m => m.achieved).length || 0
    const totalMilestones = goal.milestones?.length || 0

    return (
        <Card className={cn("hover:shadow-md transition-shadow", onClick && "cursor-pointer")} onClick={onClick}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base font-semibold truncate">{goal.name}</CardTitle>
                            {goal.achieved && (
                                <Badge variant="default" className="text-xs bg-green-500 shrink-0 animate-pulse">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Achieved
                                </Badge>
                            )}
                            {!goal.achieved && isOnTrack && daysRemaining >= 0 && (
                                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-500/20 shrink-0">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    On Track
                                </Badge>
                            )}
                            {!goal.achieved && !isOnTrack && daysRemaining >= 0 && (
                                <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-700 border-orange-500/20 shrink-0">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Behind
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="text-xs mt-1">
                            {GOAL_CATEGORY_LABELS[goal.category]}
                            {daysRemaining >= 0 && (
                                <span className={cn(
                                    "ml-2",
                                    daysRemaining < 30 ? "text-red-600" : daysRemaining < 90 ? "text-orange-600" : ""
                                )}>
                                    • {daysRemaining} days left
                                </span>
                            )}
                            {daysRemaining < 0 && (
                                <span className="ml-2 text-red-600">
                                    • {Math.abs(daysRemaining)} days overdue
                                </span>
                            )}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Target Amount</span>
                        <span className="font-semibold">
                            ${goal.targetAmount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Current Amount</span>
                        <span className="font-semibold">
                            ${goal.currentAmount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className="font-semibold text-green-600">
                            ${remainingAmount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                    {totalMilestones > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Milestones</span>
                            <span className="font-semibold">
                                {achievedMilestones} / {totalMilestones} achieved
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className={cn("h-full transition-all duration-500 ease-out", getProgressColor(progressPercentage))}
                            style={{ width: `${progressPercentage}%` }}
                        />
                        {/* Milestone markers */}
                        {showMilestones && goal.milestones && goal.milestones.length > 0 && (
                            <div className="absolute inset-0 flex items-center pointer-events-none">
                                {goal.milestones.map((milestone, index) => {
                                    const milestonePercentage = (milestone.amount / goal.targetAmount) * 100
                                    return (
                                        <div
                                            key={index}
                                            className={cn(
                                                "absolute h-3 w-3 rounded-full border-2 transition-all duration-300",
                                                milestone.achieved
                                                    ? "bg-green-500 border-green-600 animate-pulse shadow-lg shadow-green-500/50"
                                                    : "bg-white border-gray-400",
                                                milestonePercentage > progressPercentage && "opacity-50"
                                            )}
                                            style={{ left: `${Math.min(milestonePercentage, 100)}%`, transform: "translateX(-50%)" }}
                                            title={milestone.label}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {progress && (
                    <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                            <span>Days Remaining</span>
                            <span className={cn(
                                "font-medium",
                                progress.daysRemaining < 30 ? "text-red-600" : progress.daysRemaining < 90 ? "text-orange-600" : ""
                            )}>
                                {progress.daysRemaining}
                            </span>
                        </div>
                        {progress.isOnTrack !== undefined && (
                            <div className="flex items-center justify-between">
                                <span>Status</span>
                                <span className={cn(
                                    "font-medium",
                                    progress.isOnTrack ? "text-green-600" : "text-orange-600"
                                )}>
                                    {progress.isOnTrack ? "On Track" : "Behind Schedule"}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(targetDate, "MMM dd, yyyy")}
                    </span>
                    {goal.achieved && goal.achievedAt && (
                        <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-700 border-green-500/20">
                            Achieved {format(new Date(goal.achievedAt), "MMM dd")}
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

interface FinancialGoalsOverviewCardProps {
    totalGoals: number
    achievedGoals: number
    totalTargetAmount: number
    totalCurrentAmount: number
    goalsInAlert: number
    averageProgress: number
}

export function FinancialGoalsOverviewCard({
    totalGoals,
    achievedGoals,
    totalTargetAmount,
    totalCurrentAmount,
    goalsInAlert,
    averageProgress,
}: FinancialGoalsOverviewCardProps) {
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0
    const remainingAmount = totalTargetAmount - totalCurrentAmount

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Goals Overview</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Goals</span>
                        <span className="font-semibold">{totalGoals}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Achieved</span>
                        <span className="font-semibold text-green-600">{achievedGoals}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Target</span>
                        <span className="font-semibold">
                            ${totalTargetAmount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Saved</span>
                        <span className="font-semibold">
                            ${totalCurrentAmount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className="font-semibold text-green-600">
                            ${remainingAmount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                    {goalsInAlert > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Goals in Alert</span>
                            <Badge variant="destructive" className="text-xs">
                                {goalsInAlert}
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Average Progress</span>
                        <span className="font-medium">{averageProgress.toFixed(1)}%</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className={cn(
                                "h-full transition-all",
                                overallProgress >= 100
                                    ? "bg-green-500"
                                    : overallProgress >= 75
                                        ? "bg-blue-500"
                                        : overallProgress >= 50
                                            ? "bg-yellow-500"
                                            : overallProgress >= 25
                                                ? "bg-orange-500"
                                                : "bg-red-500"
                            )}
                            style={{ width: `${Math.min(overallProgress, 100)}%` }}
                        />
                    </div>
                </div>

                <Link href="/finance/goals">
                    <Button variant="outline" size="sm" className="w-full">
                        View All Goals
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}

