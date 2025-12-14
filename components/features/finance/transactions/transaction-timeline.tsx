"use client"

import * as React from "react"
import type { Transaction } from "@/lib/api/finance/finance-transactions"
import { format, parseISO, isSameDay } from "date-fns"
import { ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, ExternalLink, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { CurrencyDisplay } from "../currency/currency-display"

interface TransactionTimelineProps {
    transactions: Transaction[]
    onTransactionClick?: (transaction: Transaction) => void
    onEdit?: (transaction: Transaction) => void
    onDelete?: (transaction: Transaction) => void
    isLoading?: boolean
}

interface GroupedTransaction {
    date: string
    transactions: Transaction[]
    totalIncome: number
    totalExpenses: number
    netAmount: number
    runningBalance: number
}

export function TransactionTimeline({
    transactions,
    onTransactionClick,
    onEdit,
    onDelete,
    isLoading,
}: TransactionTimelineProps) {
    const [expandedDates, setExpandedDates] = React.useState<Set<string>>(new Set())
    const [runningBalance, setRunningBalance] = React.useState<number>(0)

    // Group transactions by date and calculate running balance
    const groupedTransactions = React.useMemo(() => {
        if (!transactions || transactions.length === 0) return []

        // Sort transactions by date (ascending) for proper balance calculation
        const sorted = [...transactions].sort((a, b) => {
            const dateA = parseISO(a.date).getTime()
            const dateB = parseISO(b.date).getTime()
            if (dateA !== dateB) return dateA - dateB
            // If same date, sort by createdAt for consistency
            return parseISO(a.createdAt).getTime() - parseISO(b.createdAt).getTime()
        })

        const grouped: GroupedTransaction[] = []
        let currentBalance = 0

        sorted.forEach((transaction) => {
            const dateStr = format(parseISO(transaction.date), "yyyy-MM-dd")
            const existingGroup = grouped.find((g) => g.date === dateStr)

            if (existingGroup) {
                existingGroup.transactions.push(transaction)
                if (transaction.type === "income") {
                    existingGroup.totalIncome += transaction.amount
                } else {
                    existingGroup.totalExpenses += transaction.amount
                }
            } else {
                const newGroup: GroupedTransaction = {
                    date: dateStr,
                    transactions: [transaction],
                    totalIncome: transaction.type === "income" ? transaction.amount : 0,
                    totalExpenses: transaction.type === "expense" ? transaction.amount : 0,
                    netAmount: 0,
                    runningBalance: 0,
                }
                grouped.push(newGroup)
            }
        })

        // Calculate net amount and running balance for each group
        grouped.forEach((group) => {
            group.netAmount = group.totalIncome - group.totalExpenses
            currentBalance += group.netAmount
            group.runningBalance = currentBalance
        })

        // Store the final balance for display
        setRunningBalance(currentBalance)

        // Sort by date descending (most recent first)
        return grouped.reverse()
    }, [transactions])

    const toggleDateGroup = (date: string) => {
        setExpandedDates((prev) => {
            const next = new Set(prev)
            if (next.has(date)) {
                next.delete(date)
            } else {
                next.add(date)
            }
            return next
        })
    }

    const expandAll = () => {
        setExpandedDates(new Set(groupedTransactions.map((g) => g.date)))
    }

    const collapseAll = () => {
        setExpandedDates(new Set())
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                            <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (groupedTransactions.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No transactions found</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Current Balance</p>
                            <CurrencyDisplay
                                amount={Math.abs(runningBalance)}
                                currency="MYR" // TODO: Get from user preferences
                                variant={runningBalance >= 0 ? "income" : "expense"}
                                amountClassName="text-2xl font-bold"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={expandAll}>
                                Expand All
                            </Button>
                            <Button variant="outline" size="sm" onClick={collapseAll}>
                                Collapse All
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline */}
            <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-6">
                    {groupedTransactions.map((group, index) => {
                        const isExpanded = expandedDates.has(group.date)
                        const dateObj = parseISO(group.date)
                        const isToday = isSameDay(dateObj, new Date())

                        return (
                            <div key={group.date} className="relative">
                                {/* Timeline Dot */}
                                <div className="absolute left-6 w-4 h-4 rounded-full border-2 border-background bg-primary z-10" />

                                {/* Date Group Card */}
                                <div className="ml-16">
                                    <Card
                                        className={cn(
                                            "cursor-pointer transition-colors hover:bg-accent/50",
                                            isToday && "ring-2 ring-primary"
                                        )}
                                        onClick={() => toggleDateGroup(group.date)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold">
                                                            {format(dateObj, "EEEE, MMMM d, yyyy")}
                                                        </h3>
                                                        {isToday && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Today
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span>
                                                            {group.transactions.length} transaction
                                                            {group.transactions.length !== 1 ? "s" : ""}
                                                        </span>
                                                        {group.totalIncome > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-green-600 text-sm">+</span>
                                                                <CurrencyDisplay
                                                                    amount={group.totalIncome}
                                                                    currency="MYR" // TODO: Get from user preferences
                                                                    variant="income"
                                                                    amountClassName="text-sm"
                                                                />
                                                            </div>
                                                        )}
                                                        {group.totalExpenses > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-red-600 text-sm">-</span>
                                                                <CurrencyDisplay
                                                                    amount={group.totalExpenses}
                                                                    currency="MYR" // TODO: Get from user preferences
                                                                    variant="expense"
                                                                    amountClassName="text-sm"
                                                                />
                                                            </div>
                                                        )}
                                                        {group.netAmount !== 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <span className={cn(
                                                                    "text-sm font-medium",
                                                                    group.netAmount >= 0 ? "text-green-600" : "text-red-600"
                                                                )}>
                                                                    Net: {group.netAmount >= 0 ? "+" : "-"}
                                                                </span>
                                                                <CurrencyDisplay
                                                                    amount={Math.abs(group.netAmount)}
                                                                    currency="MYR" // TODO: Get from user preferences
                                                                    variant={group.netAmount >= 0 ? "income" : "expense"}
                                                                    amountClassName="text-sm font-medium"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-right">
                                                        <p className="text-xs text-muted-foreground">Balance</p>
                                                        <p className={cn(
                                                            "font-semibold",
                                                            group.runningBalance >= 0 ? "text-green-600" : "text-red-600"
                                                        )}>
                                                            {group.runningBalance >= 0 ? "+" : ""}
                                                            {group.runningBalance.toLocaleString("en-US", {
                                                                style: "currency",
                                                                currency: "USD",
                                                            })}
                                                        </p>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Expanded Transactions */}
                                    {isExpanded && (
                                        <div className="mt-2 space-y-2 ml-4">
                                            {group.transactions.map((transaction) => (
                                                <Card
                                                    key={transaction.id}
                                                    className="hover:bg-accent/50 transition-colors cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onTransactionClick?.(transaction)
                                                    }}
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    {transaction.type === "income" ? (
                                                                        <ArrowUpRight className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                                    ) : (
                                                                        <ArrowDownRight className="h-4 w-4 text-red-600 flex-shrink-0" />
                                                                    )}
                                                                    <p className="font-medium truncate">
                                                                        {transaction.description}
                                                                    </p>
                                                                    {transaction.recurringTransactionId && (
                                                                        <Link
                                                                            href={`/finance/recurring-transactions?highlight=${transaction.recurringTransactionId}`}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <Badge variant="outline" className="text-xs">
                                                                                <Repeat className="h-3 w-3 mr-1" />
                                                                                Recurring
                                                                            </Badge>
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    {transaction.categoryId && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            Category
                                                                        </Badge>
                                                                    )}
                                                                    {transaction.paymentMethod && (
                                                                        <span>{transaction.paymentMethod}</span>
                                                                    )}
                                                                    {transaction.tags && transaction.tags.length > 0 && (
                                                                        <div className="flex gap-1">
                                                                            {transaction.tags.slice(0, 2).map((tag) => (
                                                                                <Badge key={tag} variant="outline" className="text-xs">
                                                                                    {tag}
                                                                                </Badge>
                                                                            ))}
                                                                            {transaction.tags.length > 2 && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    +{transaction.tags.length - 2}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {transaction.notes && (
                                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                        {transaction.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <div className="text-right">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <span className={cn(
                                                                            "text-sm",
                                                                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                                                                        )}>
                                                                            {transaction.type === "income" ? "+" : "-"}
                                                                        </span>
                                                                        <CurrencyDisplay
                                                                            amount={transaction.amount}
                                                                            currency={transaction.currency || "MYR"}
                                                                            baseAmount={transaction.baseAmount}
                                                                            baseCurrency={transaction.baseCurrency}
                                                                            showSymbol={true}
                                                                            showCode={Boolean(transaction.currency && transaction.currency !== "MYR")}
                                                                            variant={transaction.type === "income" ? "income" : "expense"}
                                                                            amountClassName="font-semibold"
                                                                        />
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {format(parseISO(transaction.date), "h:mm a")}
                                                                    </p>
                                                                </div>
                                                                {onEdit && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            onEdit(transaction)
                                                                        }}
                                                                    >
                                                                        <ExternalLink className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

