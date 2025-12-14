"use client"

import * as React from "react"
import type { Transaction } from "@/lib/api/finance/finance-transactions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { Edit, Trash2, Repeat, Copy, FileText, Image as ImageIcon, MoreVertical } from "lucide-react"
import Link from "next/link"
import { CurrencyDisplay } from "../currency/currency-display"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TransactionCardViewProps {
    transactions: Transaction[]
    onEdit?: (transaction: Transaction) => void
    onDelete?: (transaction: Transaction) => void
    onDuplicate?: (transaction: Transaction) => void
    onReceiptView?: (transaction: Transaction) => void
}

export function TransactionCardView({
    transactions,
    onEdit,
    onDelete,
    onDuplicate,
    onReceiptView,
}: TransactionCardViewProps) {
    return (
        <div className="space-y-3">
            {transactions.map((transaction) => {
                const isIncome = transaction.type === "income"
                return (
                    <Card key={transaction.id} className="overflow-hidden">
                        <CardContent className="p-4">
                            {/* Header Row */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-sm truncate">
                                            {transaction.description}
                                        </h3>
                                        {transaction.recurringTransactionId && (
                                            <Link
                                                href={`/finance/recurring-transactions?highlight=${transaction.recurringTransactionId}`}
                                                className="inline-flex items-center shrink-0"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] px-1.5 py-0 gap-1"
                                                >
                                                    <Repeat className="h-2.5 w-2.5" />
                                                    Recurring
                                                </Badge>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                                    </div>
                                </div>
                                
                                {/* Amount */}
                                <div className="flex flex-col items-end shrink-0">
                                    <CurrencyDisplay
                                        amount={transaction.amount}
                                        currency={transaction.currency || "MYR"}
                                        baseAmount={transaction.baseAmount}
                                        baseCurrency={transaction.baseCurrency}
                                        showSymbol={true}
                                        showCode={Boolean(transaction.currency && transaction.currency !== "MYR")}
                                        variant={isIncome ? "income" : "expense"}
                                        className="text-base font-semibold"
                                    />
                                    <Badge
                                        variant={isIncome ? "default" : "destructive"}
                                        className="text-[10px] mt-1"
                                    >
                                        {isIncome ? "Income" : "Expense"}
                                    </Badge>
                                </div>
                            </div>

                            {/* Details Row */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                                {transaction.categoryId && (
                                    <span className="px-2 py-0.5 bg-secondary rounded text-xs">
                                        Categorized
                                    </span>
                                )}
                                {transaction.paymentMethod && (
                                    <span>{transaction.paymentMethod}</span>
                                )}
                                {transaction.tags && transaction.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {transaction.tags.slice(0, 3).map((tag, idx) => (
                                            <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {transaction.tags.length > 3 && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                +{transaction.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            {transaction.notes && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                    {transaction.notes}
                                </p>
                            )}

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-3 border-t">
                                <div className="flex items-center gap-2">
                                    {transaction.receiptUrl && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2"
                                            onClick={() => onReceiptView?.(transaction)}
                                        >
                                            {transaction.receiptMimetype?.startsWith("image/") ? (
                                                <ImageIcon className="h-4 w-4" />
                                            ) : (
                                                <FileText className="h-4 w-4" />
                                            )}
                                            <span className="ml-1 text-xs">Receipt</span>
                                        </Button>
                                    )}
                                </div>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">More actions</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {onEdit && (
                                            <DropdownMenuItem onClick={() => onEdit(transaction)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                        )}
                                        {onDuplicate && (
                                            <DropdownMenuItem onClick={() => onDuplicate(transaction)}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Duplicate
                                            </DropdownMenuItem>
                                        )}
                                        {transaction.receiptUrl && onReceiptView && (
                                            <DropdownMenuItem onClick={() => onReceiptView(transaction)}>
                                                {transaction.receiptMimetype?.startsWith("image/") ? (
                                                    <ImageIcon className="mr-2 h-4 w-4" />
                                                ) : (
                                                    <FileText className="mr-2 h-4 w-4" />
                                                )}
                                                View Receipt
                                            </DropdownMenuItem>
                                        )}
                                        {onDelete && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(transaction)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

