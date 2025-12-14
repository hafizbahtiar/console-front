"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { MerchantCategory } from "@/lib/api/finance/finance-merchant-categories"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface MerchantCategoryTableProps {
    mappings: MerchantCategory[]
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    search: string
    onSearchChange: (value: string) => void
    isLoading?: boolean
    onEdit?: (mapping: MerchantCategory) => void
    onDelete?: (mapping: MerchantCategory) => void
}

export function MerchantCategoryTable({
    mappings,
    page,
    pageSize,
    total,
    onPageChange,
    search,
    onSearchChange,
    isLoading,
    onEdit,
    onDelete,
}: MerchantCategoryTableProps) {
    const columns = React.useMemo<ColumnDef<MerchantCategory, any>[]>(
        () => [
            {
                accessorKey: "merchantName",
                header: "Merchant Name",
                cell: ({ row }) => {
                    const merchantName = row.original.merchantName
                    return (
                        <span className="text-sm font-medium">{merchantName}</span>
                    )
                },
            },
            {
                accessorKey: "categoryName",
                header: "Category",
                cell: ({ row }) => {
                    const categoryName = row.original.categoryName
                    return (
                        <Badge variant="outline" className="text-xs">
                            {categoryName}
                        </Badge>
                    )
                },
            },
            {
                accessorKey: "matchCount",
                header: "Matches",
                cell: ({ row }) => {
                    const matchCount = row.original.matchCount
                    return (
                        <span className="text-xs text-muted-foreground">{matchCount}</span>
                    )
                },
            },
            {
                accessorKey: "confidence",
                header: "Confidence",
                cell: ({ row }) => {
                    const confidence = row.original.confidence
                    const percentage = Math.round(confidence * 100)
                    const variant = confidence >= 0.7 ? "default" : confidence >= 0.4 ? "secondary" : "destructive"
                    return (
                        <Badge variant={variant} className="text-xs">
                            {percentage}%
                        </Badge>
                    )
                },
            },
            {
                accessorKey: "lastUsedAt",
                header: "Last Used",
                cell: ({ row }) => {
                    const lastUsedAt = row.original.lastUsedAt
                    if (!lastUsedAt) return <span className="text-xs text-muted-foreground">—</span>
                    return (
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(lastUsedAt), "MMM dd, yyyy")}
                        </span>
                    )
                },
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const mapping = row.original
                    return (
                        <div className="flex items-center gap-2">
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(mapping)}
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDelete(mapping)}
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
        [onEdit, onDelete]
    )

    return (
        <DataTable
            columns={columns}
            data={mappings}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={onPageChange}
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search merchant mappings..."
            isLoading={isLoading}
            emptyTitle="No merchant mappings yet"
            emptyDescription="Create a mapping to automatically categorize transactions by merchant name."
        />
    )
}

