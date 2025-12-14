"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { FinancialGoal, GoalCategory } from "@/lib/api/finance/finance-financial-goals"
import { DataTable } from "@/components/ui/data-table"
import { PaginationMeta } from "@/lib/types/api-response"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { Edit, Trash2, CheckCircle2, Plus, Minus, TrendingUp, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface FinancialGoalTableProps {
    goals: FinancialGoal[]
    page: number
    pageSize: number
    total: number
    pagination?: PaginationMeta
    onPageChange: (page: number) => void
    search: string
    onSearchChange: (value: string) => void
    isLoading?: boolean
    onEdit?: (goal: FinancialGoal) => void
    onDelete?: (goal: FinancialGoal) => void
    onAddAmount?: (goal: FinancialGoal) => void
    onSubtractAmount?: (goal: FinancialGoal) => void
    enableRowSelection?: boolean
    onSelectionChange?: (selectedGoals: FinancialGoal[]) => void
    onBulkDelete?: (selectedGoals: FinancialGoal[]) => void
}

function getCategoryBadge(category: GoalCategory) {
    const label = GOAL_CATEGORY_LABELS[category] || category
    return (
        <Badge variant="outline" className="text-xs">
            {label}
        </Badge>
    )
}

function getProgressColor(percentage: number): string {
    if (percentage >= 100) return "bg-green-500"
    if (percentage >= 75) return "bg-blue-500"
    if (percentage >= 50) return "bg-yellow-500"
    if (percentage >= 25) return "bg-orange-500"
    return "bg-red-500"
}

export function FinancialGoalTable({
    goals,
    page,
    pageSize,
    total,
    pagination,
    onPageChange,
    search,
    onSearchChange,
    isLoading,
    onEdit,
    onDelete,
    onAddAmount,
    onSubtractAmount,
    enableRowSelection = false,
    onSelectionChange,
    onBulkDelete,
}: FinancialGoalTableProps) {
    const columns = React.useMemo<ColumnDef<FinancialGoal, any>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Goal Name",
                cell: ({ row }) => {
                    const goal = row.original
                    const progressPercentage = goal.targetAmount > 0
                        ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                        : 0
                    const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0)

                    // Calculate "on track" status
                    const now = new Date()
                    const targetDate = new Date(goal.targetDate)
                    const createdAt = new Date(goal.createdAt)
                    const totalDays = Math.ceil((targetDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
                    const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    const expectedProgress = totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 0
                    const isOnTrack = progressPercentage >= expectedProgress || goal.achieved || daysRemaining < 0

                    return (
                        <div className="flex flex-col gap-1">
                            <div className="font-medium text-sm flex items-center gap-2">
                                {goal.name}
                                {goal.achieved && (
                                    <Badge variant="default" className="text-xs bg-green-500 animate-pulse">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        Achieved
                                    </Badge>
                                )}
                                {!goal.achieved && isOnTrack && daysRemaining >= 0 && (
                                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-500/20">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        On Track
                                    </Badge>
                                )}
                            </div>
                            {goal.description && (
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                    {goal.description}
                                </div>
                            )}
                            <div className="mt-1">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <span>Progress: {progressPercentage.toFixed(1)}%</span>
                                    <span>
                                        ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="relative">
                                    <Progress
                                        value={progressPercentage}
                                        className="h-2 transition-all duration-500 ease-out"
                                    />
                                    {/* Milestone markers on progress bar */}
                                    {goal.milestones && goal.milestones.length > 0 && (
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
                                <div className="text-xs text-muted-foreground mt-1">
                                    ${remainingAmount.toLocaleString()} remaining
                                </div>
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorKey: "category",
                header: "Category",
                cell: ({ row }) => getCategoryBadge(row.original.category),
            },
            {
                accessorKey: "targetDate",
                header: "Target Date",
                cell: ({ row }) => {
                    const date = new Date(row.original.targetDate)
                    const now = new Date()
                    const daysRemaining = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                    return (
                        <div className="flex flex-col gap-1">
                            <div className="text-sm">{format(date, "MMM dd, yyyy")}</div>
                            {daysRemaining >= 0 && (
                                <div className={cn(
                                    "text-xs",
                                    daysRemaining < 30 ? "text-red-600" : daysRemaining < 90 ? "text-orange-600" : "text-muted-foreground"
                                )}>
                                    {daysRemaining} days left
                                </div>
                            )}
                            {daysRemaining < 0 && (
                                <div className="text-xs text-muted-foreground">
                                    {Math.abs(daysRemaining)} days overdue
                                </div>
                            )}
                        </div>
                    )
                },
            },
            {
                accessorKey: "milestones",
                header: "Milestones",
                cell: ({ row }) => {
                    const milestones = row.original.milestones || []
                    const achievedCount = milestones.filter(m => m.achieved).length
                    return (
                        <div className="text-sm">
                            {achievedCount} / {milestones.length} achieved
                        </div>
                    )
                },
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const goal = row.original
                    return (
                        <div className="flex items-center gap-1">
                            {onAddAmount && !goal.achieved && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onAddAmount(goal)}
                                    title="Add Amount"
                                >
                                    <Plus className="h-4 w-4 text-green-600" />
                                </Button>
                            )}
                            {onSubtractAmount && !goal.achieved && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onSubtractAmount(goal)}
                                    title="Subtract Amount"
                                >
                                    <Minus className="h-4 w-4 text-orange-600" />
                                </Button>
                            )}
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(goal)}
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDelete(goal)}
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            )}
                        </div>
                    )
                },
            },
        ],
        [onEdit, onDelete, onAddAmount, onSubtractAmount]
    )

    const renderBulkActions = React.useCallback(
        (selectedRows: FinancialGoal[]) => {
            if (!onBulkDelete || selectedRows.length === 0) return null
            return (
                <div className="flex items-center gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onBulkDelete(selectedRows)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete ({selectedRows.length})
                    </Button>
                </div>
            )
        },
        [onBulkDelete]
    )

    return (
        <DataTable
            columns={columns}
            data={goals}
            page={page}
            pageSize={pageSize}
            total={total}
            pagination={pagination}
            onPageChange={onPageChange}
            search={search}
            onSearchChange={onSearchChange}
            isLoading={isLoading}
            enableRowSelection={enableRowSelection}
            getRowId={(row) => row.id}
            onSelectionChange={onSelectionChange}
            renderBulkActions={renderBulkActions}
            emptyTitle="No financial goals found"
            emptyDescription="Create your first goal to get started."
        />
    )
}

