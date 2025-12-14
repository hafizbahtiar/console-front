"use client"

import * as React from "react"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Transaction } from "@/lib/api/finance/finance-transactions"
import { DataTable } from "@/components/ui/data-table"
import { PaginationMeta } from "@/lib/types/api-response"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Edit, Trash2, Repeat, ExternalLink, Copy, FileText, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { ReceiptViewerModal } from "../receipts/receipt-viewer-modal"
import { ReceiptActions } from "../receipts/receipt-actions"
import { CurrencyDisplay } from "../currency/currency-display"

interface TransactionTableProps {
    transactions: Transaction[]
    page: number
    pageSize: number
    total: number
    pagination?: PaginationMeta
    onPageChange: (page: number) => void
    search: string
    onSearchChange: (value: string) => void
    isLoading?: boolean
    onEdit?: (transaction: Transaction) => void
    onDelete?: (transaction: Transaction) => void
    onDuplicate?: (transaction: Transaction) => void
    enableRowSelection?: boolean
    onSelectionChange?: (selectedTransactions: Transaction[]) => void
    onBulkDelete?: (selectedTransactions: Transaction[]) => void
    onBulkDuplicate?: (selectedTransactions: Transaction[]) => void
    onReceiptDelete?: (transaction: Transaction) => Promise<void>
}

export function TransactionTable({
    transactions,
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
    onDuplicate,
    enableRowSelection = false,
    onSelectionChange,
    onBulkDelete,
    onBulkDuplicate,
    onReceiptDelete,
}: TransactionTableProps) {
    const [viewingReceipt, setViewingReceipt] = useState<Transaction | null>(null)
    const columns = React.useMemo<ColumnDef<Transaction, any>[]>(
        () => [
            {
                accessorKey: "date",
                header: "Date",
                cell: ({ row }) => {
                    const date = row.original.date
                    return (
                        <div className="text-sm">
                            {format(new Date(date), "MMM dd, yyyy")}
                        </div>
                    )
                },
            },
            {
                accessorKey: "description",
                header: "Description",
                cell: ({ row }) => {
                    const transaction = row.original
                    return (
                        <div className="flex flex-col gap-0.5 max-w-md">
                            <div className="flex items-center gap-2">
                                <div className="font-medium text-sm">{transaction.description}</div>
                                {transaction.recurringTransactionId && (
                                    <Link
                                        href={`/finance/recurring-transactions?highlight=${transaction.recurringTransactionId}`}
                                        className="inline-flex items-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Badge
                                            variant="secondary"
                                            className="text-[10px] px-1.5 py-0 gap-1 cursor-pointer hover:bg-secondary/80"
                                            title="Generated from recurring transaction"
                                        >
                                            <Repeat className="h-2.5 w-2.5" />
                                            Recurring
                                            <ExternalLink className="h-2.5 w-2.5" />
                                        </Badge>
                                    </Link>
                                )}
                                {transaction.receiptUrl && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setViewingReceipt(transaction)
                                        }}
                                        className="inline-flex items-center"
                                        title="View receipt"
                                    >
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] px-1.5 py-0 gap-1 cursor-pointer hover:bg-secondary/80"
                                        >
                                            {transaction.receiptMimetype?.startsWith("image/") ? (
                                                <ImageIcon className="h-2.5 w-2.5" />
                                            ) : (
                                                <FileText className="h-2.5 w-2.5" />
                                            )}
                                            Receipt
                                        </Badge>
                                    </button>
                                )}
                            </div>
                            {transaction.notes && (
                                <div className="text-[11px] text-muted-foreground line-clamp-1">
                                    {transaction.notes}
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
                            {type === "income" ? "Income" : "Expense"}
                        </Badge>
                    )
                },
            },
            {
                accessorKey: "amount",
                header: "Amount",
                cell: ({ row }) => {
                    const transaction = row.original
                    const isIncome = transaction.type === "income"
                    return (
                        <div className="flex items-center gap-2">
                            <CurrencyDisplay
                                amount={transaction.amount}
                                currency={transaction.currency || "MYR"}
                                baseAmount={transaction.baseAmount}
                                baseCurrency={transaction.baseCurrency}
                                showSymbol={true}
                                showCode={Boolean(transaction.currency && transaction.currency !== "MYR")}
                                showConverted={Boolean(transaction.baseAmount && transaction.baseCurrency && transaction.currency !== transaction.baseCurrency)}
                                variant={isIncome ? "income" : "expense"}
                                amountClassName="text-sm"
                            />
                            {isIncome && <span className="text-green-600 text-sm">+</span>}
                            {!isIncome && <span className="text-red-600 text-sm">-</span>}
                        </div>
                    )
                },
            },
            {
                accessorKey: "categoryId",
                header: "Category",
                cell: ({ row }) => {
                    const categoryId = row.original.categoryId
                    return (
                        <div className="text-sm text-muted-foreground">
                            {categoryId ? "Categorized" : "Uncategorized"}
                        </div>
                    )
                },
            },
            {
                accessorKey: "paymentMethod",
                header: "Payment Method",
                cell: ({ row }) => {
                    const method = row.original.paymentMethod
                    return (
                        <div className="text-sm">
                            {method || <span className="text-muted-foreground">—</span>}
                        </div>
                    )
                },
            },
            {
                accessorKey: "tags",
                header: "Tags",
                cell: ({ row }) => {
                    const tags = row.original.tags || []
                    if (!tags.length) return <span className="text-xs text-muted-foreground">—</span>
                    return (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                            {tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                                    {tag}
                                </Badge>
                            ))}
                            {tags.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">
                                    +{tags.length - 3} more
                                </span>
                            )}
                        </div>
                    )
                },
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const transaction = row.original
                    return (
                        <div className="flex items-center gap-2">
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(transaction)}
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                            {onDuplicate && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDuplicate(transaction)}
                                    title="Duplicate"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDelete(transaction)}
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
        [onEdit, onDelete, onDuplicate]
    )

    const renderBulkActions = React.useCallback(
        (selectedRows: Transaction[]) => {
            if ((!onBulkDelete && !onBulkDuplicate) || selectedRows.length === 0) return null
            return (
                <div className="flex items-center gap-2">
                    {onBulkDuplicate && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onBulkDuplicate(selectedRows)}
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate ({selectedRows.length})
                        </Button>
                    )}
                    {onBulkDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onBulkDelete(selectedRows)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete ({selectedRows.length})
                        </Button>
                    )}
                </div>
            )
        },
        [onBulkDelete, onBulkDuplicate]
    )

    return (
        <>
            <DataTable
                columns={columns}
                data={transactions}
                page={page}
                pageSize={pageSize}
                total={total}
                pagination={pagination}
                onPageChange={onPageChange}
                search={search}
                onSearchChange={onSearchChange}
                hideSearch={true}
                isLoading={isLoading}
                enableRowSelection={enableRowSelection}
                onSelectionChange={onSelectionChange}
                renderBulkActions={renderBulkActions}
                enableVirtualScrolling={transactions.length > 100} // Enable for large datasets
                estimatedRowHeight={60}
            />

            {/* Receipt Viewer Modal */}
            {viewingReceipt && (
                <ReceiptViewerModal
                    transactionId={viewingReceipt.id}
                    receiptUrl={viewingReceipt.receiptUrl}
                    receiptFilename={viewingReceipt.receiptFilename}
                    receiptMimetype={viewingReceipt.receiptMimetype}
                    receiptSize={viewingReceipt.receiptSize}
                    open={!!viewingReceipt}
                    onClose={() => setViewingReceipt(null)}
                    onDelete={async () => {
                        if (onReceiptDelete) {
                            await onReceiptDelete(viewingReceipt)
                        }
                        setViewingReceipt(null)
                    }}
                    showDelete={!!onReceiptDelete}
                />
            )}
        </>
    )
}


