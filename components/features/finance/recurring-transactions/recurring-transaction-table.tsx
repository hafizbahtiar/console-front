"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { RecurringTransaction } from "@/lib/api/finance/finance-recurring-transactions"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Edit, Trash2, Pause, Play, SkipForward, Zap, MoreVertical } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface RecurringTransactionTableProps {
    recurringTransactions: RecurringTransaction[]
    search: string
    onSearchChange: (value: string) => void
    isLoading?: boolean
    onEdit?: (recurringTransaction: RecurringTransaction) => void
    onDelete?: (recurringTransaction: RecurringTransaction) => void
    onPause?: (recurringTransaction: RecurringTransaction) => void
    onResume?: (recurringTransaction: RecurringTransaction) => void
    onSkipNext?: (recurringTransaction: RecurringTransaction) => void
    onGenerate?: (recurringTransaction: RecurringTransaction) => void
    enableRowSelection?: boolean
    onSelectionChange?: (selectedTransactions: RecurringTransaction[]) => void
    onBulkDelete?: (selectedTransactions: RecurringTransaction[]) => void
}

export function RecurringTransactionTable({
    recurringTransactions,
    search,
    onSearchChange,
    isLoading,
    onEdit,
    onDelete,
    onPause,
    onResume,
    onSkipNext,
    onGenerate,
    enableRowSelection = false,
    onSelectionChange,
    onBulkDelete,
}: RecurringTransactionTableProps) {
    const columns = React.useMemo<ColumnDef<RecurringTransaction, any>[]>(
        () => [
            {
                accessorKey: "template.description",
                header: "Description",
                cell: ({ row }) => {
                    const rt = row.original
                    return (
                        <div className="flex flex-col gap-0.5 max-w-md">
                            <div className="font-medium text-sm">{rt.template.description}</div>
                            {rt.template.notes && (
                                <div className="text-[11px] text-muted-foreground line-clamp-1">
                                    {rt.template.notes}
                                </div>
                            )}
                        </div>
                    )
                },
            },
            {
                accessorKey: "template.type",
                header: "Type",
                cell: ({ row }) => {
                    const type = row.original.template.type
                    return (
                        <Badge
                            variant={type === "income" ? "default" : "destructive"}
                            className="text-xs"
                        >
                            {type === "income" ? "Income" : "Expense"}
                        </Badge>
                    )
                },
            },
            {
                accessorKey: "template.amount",
                header: "Amount",
                cell: ({ row }) => {
                    const rt = row.original
                    const isIncome = rt.template.type === "income"
                    return (
                        <div
                            className={`font-semibold text-sm ${isIncome ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {isIncome ? "+" : "-"}$
                            {rt.template.amount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                    )
                },
            },
            {
                accessorKey: "frequency",
                header: "Frequency",
                cell: ({ row }) => {
                    const rt = row.original
                    const frequencyLabel =
                        rt.frequency === "daily"
                            ? "Daily"
                            : rt.frequency === "weekly"
                                ? "Weekly"
                                : rt.frequency === "monthly"
                                    ? "Monthly"
                                    : rt.frequency === "yearly"
                                        ? "Yearly"
                                        : `Every ${rt.interval} days`
                    return (
                        <div className="text-sm">
                            {frequencyLabel}
                        </div>
                    )
                },
            },
            {
                accessorKey: "nextRunDate",
                header: "Next Run",
                cell: ({ row }) => {
                    const nextRun = row.original.nextRunDate
                    const isPast = new Date(nextRun) < new Date()
                    return (
                        <div className="text-sm">
                            <div className={isPast ? "text-orange-600 font-medium" : ""}>
                                {format(new Date(nextRun), "MMM dd, yyyy")}
                            </div>
                            {isPast && (
                                <div className="text-[10px] text-muted-foreground">Overdue</div>
                            )}
                        </div>
                    )
                },
            },
            {
                accessorKey: "isActive",
                header: "Status",
                cell: ({ row }) => {
                    const isActive = row.original.isActive
                    return (
                        <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                            {isActive ? "Active" : "Paused"}
                        </Badge>
                    )
                },
            },
            {
                accessorKey: "runCount",
                header: "Runs",
                cell: ({ row }) => {
                    const runCount = row.original.runCount
                    return (
                        <div className="text-sm text-muted-foreground">
                            {runCount} time{runCount !== 1 ? "s" : ""}
                        </div>
                    )
                },
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const rt = row.original
                    return (
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {onEdit && (
                                        <DropdownMenuItem onClick={() => onEdit(rt)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                    )}
                                    {rt.isActive && onPause && (
                                        <DropdownMenuItem onClick={() => onPause(rt)}>
                                            <Pause className="h-4 w-4 mr-2" />
                                            Pause
                                        </DropdownMenuItem>
                                    )}
                                    {!rt.isActive && onResume && (
                                        <DropdownMenuItem onClick={() => onResume(rt)}>
                                            <Play className="h-4 w-4 mr-2" />
                                            Resume
                                        </DropdownMenuItem>
                                    )}
                                    {onSkipNext && (
                                        <DropdownMenuItem onClick={() => onSkipNext(rt)}>
                                            <SkipForward className="h-4 w-4 mr-2" />
                                            Skip Next
                                        </DropdownMenuItem>
                                    )}
                                    {onGenerate && (
                                        <DropdownMenuItem onClick={() => onGenerate(rt)}>
                                            <Zap className="h-4 w-4 mr-2" />
                                            Generate Now
                                        </DropdownMenuItem>
                                    )}
                                    {onDelete && (
                                        <DropdownMenuItem
                                            onClick={() => onDelete(rt)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                },
            },
        ],
        [onEdit, onDelete, onPause, onResume, onSkipNext, onGenerate]
    )

    const renderBulkActions = React.useCallback(
        (selectedRows: RecurringTransaction[]) => {
            if (!onBulkDelete || selectedRows.length === 0) return null
            return (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onBulkDelete(selectedRows)}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete {selectedRows.length} recurring transaction{selectedRows.length !== 1 ? "s" : ""}
                </Button>
            )
        },
        [onBulkDelete]
    )

    return (
        <DataTable
            columns={columns}
            data={recurringTransactions}
            page={1}
            pageSize={recurringTransactions.length}
            total={recurringTransactions.length}
            onPageChange={() => { }}
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search recurring transactions..."
            isLoading={isLoading}
            emptyTitle="No recurring transactions yet"
            emptyDescription="Start by creating your first recurring transaction."
            enableRowSelection={enableRowSelection}
            getRowId={(row) => row.id}
            onSelectionChange={onSelectionChange}
            renderBulkActions={renderBulkActions}
        />
    )
}

