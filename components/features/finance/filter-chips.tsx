"use client"

import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { FilterChip, removeFilter, type FinanceFilterState } from "@/lib/utils/finance-filters"
import { cn } from "@/lib/utils"

interface FilterChipsProps {
    chips: FilterChip[]
    onRemove: (filterType: FilterChip['type']) => void
    onClearAll?: () => void
    className?: string
}

export function FilterChips({ chips, onRemove, onClearAll, className }: FilterChipsProps) {
    if (chips.length === 0) return null

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            <span className="text-sm text-muted-foreground">Filters:</span>
            {chips.map((chip) => (
                <Badge
                    key={chip.id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                >
                    <span className="text-xs font-medium">{chip.label}:</span>
                    <span className="text-xs">{chip.value}</span>
                    <button
                        onClick={() => onRemove(chip.type)}
                        className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors"
                        aria-label={`Remove ${chip.label} filter`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}
            {onClearAll && (
                <button
                    onClick={onClearAll}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                    Clear all
                </button>
            )}
        </div>
    )
}

