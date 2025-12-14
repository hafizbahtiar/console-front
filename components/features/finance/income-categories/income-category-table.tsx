"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { IncomeCategory } from "@/lib/api/finance"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface IncomeCategoryTableProps {
    categories: IncomeCategory[]
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    search: string
    onSearchChange: (value: string) => void
    isLoading?: boolean
    onEdit?: (category: IncomeCategory) => void
    onDelete?: (category: IncomeCategory) => void
    enableRowSelection?: boolean
    onSelectionChange?: (selectedCategories: IncomeCategory[]) => void
    onBulkDelete?: (selectedCategories: IncomeCategory[]) => void
}

export function IncomeCategoryTable({
    categories,
    page,
    pageSize,
    total,
    onPageChange,
    search,
    onSearchChange,
    isLoading,
    onEdit,
    onDelete,
    enableRowSelection = false,
    onSelectionChange,
    onBulkDelete,
}: IncomeCategoryTableProps) {
    const columns = React.useMemo<ColumnDef<IncomeCategory, any>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Name",
                cell: ({ row }) => {
                    const category = row.original
                    return (
                        <div className="flex items-center gap-2">
                            {category.icon && (
                                <span className="text-lg flex-shrink-0" aria-hidden="true">
                                    {category.icon}
                                </span>
                            )}
                            {category.color && (
                                <div
                                    className="w-4 h-4 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: category.color }}
                                    aria-hidden="true"
                                />
                            )}
                            <span className="text-sm font-medium">{category.name}</span>
                        </div>
                    )
                },
            },
            {
                accessorKey: "color",
                header: "Color",
                cell: ({ row }) => {
                    const color = row.original.color
                    if (!color) return <span className="text-xs text-muted-foreground">—</span>
                    return (
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-xs text-muted-foreground">{color}</span>
                        </div>
                    )
                },
            },
            {
                accessorKey: "order",
                header: "Order",
                cell: ({ row }) => {
                    const order = row.original.order
                    return (
                        <span className="text-xs text-muted-foreground">{order}</span>
                    )
                },
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const category = row.original
                    return (
                        <div className="flex items-center justify-end gap-1.5">
                            {onEdit && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(category)}
                                >
                                    Edit
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive border-destructive/40 hover:bg-destructive/10"
                                    onClick={() => onDelete(category)}
                                >
                                    Delete
                                </Button>
                            )}
                        </div>
                    )
                },
            },
        ],
        [onEdit, onDelete],
    )

    return (
        <DataTable
            columns={columns}
            data={categories}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={onPageChange}
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search categories..."
            isLoading={isLoading}
            emptyTitle="No income categories yet"
            emptyDescription="Start by creating your first income category."
            enableRowSelection={enableRowSelection}
            getRowId={(row) => row.id}
            onSelectionChange={onSelectionChange}
            renderBulkActions={
                onBulkDelete
                    ? (selected) => (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onBulkDelete(selected)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Selected ({selected.length})
                        </Button>
                    )
                    : undefined
            }
        />
    )
}

