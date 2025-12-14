"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { SavedTransactionTemplate } from "@/lib/api/finance/finance-transaction-templates"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react"

interface TransactionTemplateTableProps {
    templates: SavedTransactionTemplate[]
    search: string
    onSearchChange: (value: string) => void
    isLoading?: boolean
    onEdit?: (template: SavedTransactionTemplate) => void
    onDelete?: (template: SavedTransactionTemplate) => void
    enableRowSelection?: boolean
    onSelectionChange?: (selectedTemplates: SavedTransactionTemplate[]) => void
    onBulkDelete?: (selectedTemplates: SavedTransactionTemplate[]) => void
}

export function TransactionTemplateTable({
    templates,
    search,
    onSearchChange,
    isLoading,
    onEdit,
    onDelete,
    enableRowSelection = false,
    onSelectionChange,
    onBulkDelete,
}: TransactionTemplateTableProps) {
    const columns = React.useMemo<ColumnDef<SavedTransactionTemplate, any>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Name",
                cell: ({ row }) => {
                    const template = row.original
                    return (
                        <div className="flex flex-col gap-0.5 max-w-md">
                            <div className="font-medium text-sm">{template.name}</div>
                            {template.description && (
                                <div className="text-[11px] text-muted-foreground line-clamp-1">
                                    {template.description}
                                </div>
                            )}
                        </div>
                    )
                },
            },
            {
                accessorKey: "type",
                header: "Type",
                cell: ({ row }) => {
                    const type = row.original.type
                    return (
                        <Badge
                            variant={type === "income" ? "default" : "destructive"}
                            className="text-xs"
                        >
                            {type === "income" ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {type === "income" ? "Income" : "Expense"}
                        </Badge>
                    )
                },
            },
            {
                accessorKey: "amount",
                header: "Amount",
                cell: ({ row }) => {
                    const amount = row.original.amount
                    return (
                        <div className="font-medium">
                            ${amount.toFixed(2)}
                        </div>
                    )
                },
            },
            {
                accessorKey: "category",
                header: "Category",
                cell: ({ row }) => {
                    const category = row.original.category
                    return category ? (
                        <Badge variant="outline" className="text-xs">
                            {category}
                        </Badge>
                    ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                    )
                },
            },
            {
                accessorKey: "usageCount",
                header: "Usage",
                cell: ({ row }) => {
                    const usageCount = row.original.usageCount
                    return (
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{usageCount}</span>
                            <span className="text-xs text-muted-foreground">times</span>
                        </div>
                    )
                },
            },
            {
                accessorKey: "lastUsedAt",
                header: "Last Used",
                cell: ({ row }) => {
                    const lastUsedAt = row.original.lastUsedAt
                    return lastUsedAt ? (
                        <span className="text-sm text-muted-foreground">
                            {format(new Date(lastUsedAt), "MMM d, yyyy")}
                        </span>
                    ) : (
                        <span className="text-muted-foreground text-sm">Never</span>
                    )
                },
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const template = row.original
                    return (
                        <div className="flex items-center gap-2">
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(template)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDelete(template)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )
                },
            },
        ],
        [onEdit, onDelete]
    )

    return (
        <DataTable
            columns={columns}
            data={templates}
            page={1}
            pageSize={templates.length || 10}
            total={templates.length}
            onPageChange={() => { }}
            search={search}
            onSearchChange={onSearchChange}
            isLoading={isLoading}
            enableRowSelection={enableRowSelection}
            getRowId={(row) => row.id}
            onSelectionChange={onSelectionChange as (rows: any[]) => void}
            renderBulkActions={
                onBulkDelete && enableRowSelection
                    ? (selectedRows) => (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onBulkDelete(selectedRows as SavedTransactionTemplate[])}
                            >
                                Delete Selected ({selectedRows.length})
                            </Button>
                        </div>
                    )
                    : undefined
            }
        />
    )
}

