"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, subDays } from "date-fns"

export type QuickFilterType = 
    | "this-week"
    | "last-month"
    | "this-month"
    | "last-7-days"
    | "last-30-days"
    | "large-expenses"

export interface QuickFilter {
    id: QuickFilterType
    label: string
    getDateRange?: () => { startDate: string; endDate: string }
    getTypeFilter?: () => "expense"
    getAmountFilter?: () => number // Minimum amount for large expenses
}

export interface QuickFilterButtonsProps {
    activeFilter?: QuickFilterType | null
    onFilterClick: (filter: QuickFilterType, dateRange?: { startDate: string; endDate: string }, typeFilter?: "expense", amountFilter?: number) => void
    onClearFilter: () => void
    largeExpenseThreshold?: number // Default: 100
    className?: string
}

const quickFilters: QuickFilter[] = [
    {
        id: "this-week",
        label: "This Week",
        getDateRange: () => ({
            startDate: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
            endDate: format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
        }),
    },
    {
        id: "last-month",
        label: "Last Month",
        getDateRange: () => {
            const lastMonth = subMonths(new Date(), 1)
            return {
                startDate: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
                endDate: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
            }
        },
    },
    {
        id: "this-month",
        label: "This Month",
        getDateRange: () => ({
            startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
            endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
        }),
    },
    {
        id: "last-7-days",
        label: "Last 7 Days",
        getDateRange: () => ({
            startDate: format(subDays(new Date(), 7), "yyyy-MM-dd"),
            endDate: format(new Date(), "yyyy-MM-dd"),
        }),
    },
    {
        id: "last-30-days",
        label: "Last 30 Days",
        getDateRange: () => ({
            startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
            endDate: format(new Date(), "yyyy-MM-dd"),
        }),
    },
    {
        id: "large-expenses",
        label: "Large Expenses",
        getTypeFilter: () => "expense",
        getAmountFilter: () => 100, // Default threshold, can be overridden
    },
]

export function QuickFilterButtons({
    activeFilter,
    onFilterClick,
    onClearFilter,
    largeExpenseThreshold = 100,
    className,
}: QuickFilterButtonsProps) {
    const handleFilterClick = (filter: QuickFilter) => {
        if (activeFilter === filter.id) {
            // If clicking the same filter, clear it
            onClearFilter()
            return
        }

        const dateRange = filter.getDateRange?.()
        const typeFilter = filter.getTypeFilter?.()
        const amountFilter = filter.id === "large-expenses" 
            ? (filter.getAmountFilter?.() ?? largeExpenseThreshold)
            : undefined

        onFilterClick(filter.id, dateRange, typeFilter, amountFilter)
    }

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            <span className="text-sm text-muted-foreground font-medium">Quick Filters:</span>
            {quickFilters.map((filter) => {
                const isActive = activeFilter === filter.id
                return (
                    <Button
                        key={filter.id}
                        type="button"
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterClick(filter)}
                        className={cn(
                            "h-8 text-xs",
                            isActive && "font-semibold"
                        )}
                    >
                        {filter.label}
                        {isActive && (
                            <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-xs">
                                Active
                            </Badge>
                        )}
                    </Button>
                )
            })}
        </div>
    )
}

