"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Budget, BudgetAlertLevel } from "@/lib/api/finance/finance-budgets"
import { DataTable } from "@/components/ui/data-table"
import { PaginationMeta } from "@/lib/types/api-response"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Edit, Trash2, RefreshCcw, AlertTriangle, AlertCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface BudgetTableProps {
    budgets: Budget[]
    page: number
    pageSize: number
    total: number
    pagination?: PaginationMeta
    onPageChange: (page: number) => void
    search: string
    onSearchChange: (value: string) => void
    isLoading?: boolean
    onEdit?: (budget: Budget) => void
    onDelete?: (budget: Budget) => void
    onRollover?: (budget: Budget) => void
    enableRowSelection?: boolean
    onSelectionChange?: (selectedBudgets: Budget[]) => void
    onBulkDelete?: (selectedBudgets: Budget[]) => void
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

export function BudgetTable({
    budgets,
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
    onRollover,
    enableRowSelection = false,
    onSelectionChange,
    onBulkDelete,
}: BudgetTableProps) {
    const columns = React.useMemo<ColumnDef<Budget, any>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Budget Name",
                cell: ({ row }) => {
                    const budget = row.original
                    return (
                        <div className="flex flex-col gap-1">
                            <div className="font-medium text-sm">{budget.name}</div>
                            {budget.description && (
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                    {budget.description}
                                </div>
                            )}
                        </div>
                    )
                },
            },
            {
                accessorKey: "category",
                header: "Category",
                cell: ({ row }) => {
                    const budget = row.original
                    if (!budget.categoryId) {
                        return <span className="text-sm text-muted-foreground">General</span>
                    }
                    return (
                        <Badge variant="outline" className="text-xs">
                            {budget.categoryType === "ExpenseCategory" ? "Expense" : "Income"}
                        </Badge>
                    )
                },
            },
            {
                accessorKey: "period",
                header: "Period",
                cell: ({ row }) => {
                    const period = row.original.period
                    return (
                        <Badge variant="secondary" className="text-xs capitalize">
                            {period}
                        </Badge>
                    )
                },
            },
            {
                accessorKey: "amount",
                header: "Budget Amount",
                cell: ({ row }) => {
                    const amount = row.original.amount
                    return (
                        <div className="font-semibold text-sm">
                            ${amount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                    )
                },
            },
            {
                accessorKey: "progress",
                header: "Progress",
                cell: ({ row }) => {
                    const budget = row.original
                    const stats = budget.stats
                    if (!stats) {
                        return <span className="text-sm text-muted-foreground">—</span>
                    }

                    const percentage = Math.min(stats.percentageUsed, 100)
                    const progressColor = getProgressColor(percentage, stats.alertLevel)

                    return (
                        <div className="space-y-1.5 min-w-[200px]">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-muted-foreground">Used</span>
                                <div className="flex items-center gap-2">
                                    {getAlertBadge(stats.alertLevel)}
                                    <span className="text-xs font-medium">
                                        {percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className={cn(
                                        "h-full transition-all",
                                        progressColor
                                    )}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                    ${stats.actualAmount.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}{" "}
                                    of ${budget.amount.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                                <span>
                                    ${stats.remainingAmount.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}{" "}
                                    remaining
                                </span>
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorKey: "dates",
                header: "Date Range",
                cell: ({ row }) => {
                    const budget = row.original
                    return (
                        <div className="text-sm">
                            <div>{format(new Date(budget.startDate), "MMM dd, yyyy")}</div>
                            {budget.endDate && (
                                <div className="text-muted-foreground">
                                    to {format(new Date(budget.endDate), "MMM dd, yyyy")}
                                </div>
                            )}
                        </div>
                    )
                },
            },
            {
                accessorKey: "rollover",
                header: "Rollover",
                cell: ({ row }) => {
                    const rolloverEnabled = row.original.rolloverEnabled
                    return (
                        <Badge variant={rolloverEnabled ? "default" : "outline"} className="text-xs">
                            {rolloverEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                    )
                },
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const budget = row.original
                    return (
                        <div className="flex items-center gap-2">
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(budget)}
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                            {onRollover && budget.rolloverEnabled && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRollover(budget)}
                                    title="Process Rollover"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDelete(budget)}
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
        [onEdit, onDelete, onRollover]
    )

    const renderBulkActions = React.useCallback(
        (selectedRows: Budget[]) => {
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
            data={budgets}
            page={page}
            pageSize={pageSize}
            total={total}
            pagination={pagination}
            onPageChange={onPageChange}
            search={search}
            onSearchChange={onSearchChange}
            isLoading={isLoading}
            enableRowSelection={enableRowSelection}
            onSelectionChange={onSelectionChange}
            renderBulkActions={renderBulkActions}
        />
    )
}

