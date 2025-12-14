"use client"

import { ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ChartPreferences } from "@/lib/utils/chart-preferences"

interface EnhancedTooltipProps {
    active?: boolean
    payload?: any[]
    label?: string
    labelFormatter?: (value: any, payload: any[]) => React.ReactNode
    formatter?: (value: any, name: any, item: any, index: number, payload: any) => React.ReactNode
    tooltipFormat?: ChartPreferences['tooltipFormat']
    showTransactionCount?: boolean
    showPercentage?: boolean
    totalValue?: number
    className?: string
}

export function EnhancedTooltip({
    active,
    payload,
    label,
    labelFormatter,
    formatter,
    tooltipFormat = 'default',
    showTransactionCount = false,
    showPercentage = false,
    totalValue,
    className,
}: EnhancedTooltipProps) {
    if (!active || !payload || payload.length === 0) {
        return null
    }

    // Minimal format - just values
    if (tooltipFormat === 'minimal') {
        return (
            <div
                className={cn(
                    "border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
                    className
                )}
            >
                {payload.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.color || item.payload?.fill }}
                        />
                        <span className="font-medium">
                            {typeof item.value === 'number'
                                ? `$${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : item.value}
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    // Detailed format - with all information
    if (tooltipFormat === 'detailed') {
        const total = totalValue || payload.reduce((sum, item) => sum + (Number(item.value) || 0), 0)

        return (
            <div
                className={cn(
                    "border-border/50 bg-background rounded-lg border px-3 py-2 text-xs shadow-xl min-w-[200px]",
                    className
                )}
            >
                {label && (
                    <div className="font-semibold mb-2 pb-2 border-b border-border">
                        {labelFormatter ? labelFormatter(label, payload) : label}
                    </div>
                )}
                <div className="space-y-2">
                    {payload.map((item, index) => {
                        const value = Number(item.value) || 0
                        const percentage = showPercentage && total > 0 ? (value / total) * 100 : 0
                        const payloadData = item.payload as any
                        const transactionCount = payloadData?.transactionCount || payloadData?.count

                        return (
                            <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-2.5 w-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: item.color || item.payload?.fill }}
                                        />
                                        <span className="text-muted-foreground">
                                            {item.name || item.dataKey}
                                        </span>
                                    </div>
                                    <span className="font-mono font-semibold">
                                        ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground pl-4">
                                    {showPercentage && total > 0 && (
                                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                                            {percentage.toFixed(1)}%
                                        </Badge>
                                    )}
                                    {showTransactionCount && transactionCount !== undefined && (
                                        <span>{transactionCount} transaction{transactionCount !== 1 ? 's' : ''}</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
                {totalValue && (
                    <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-mono font-semibold">
                            ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                )}
            </div>
        )
    }

    // Default format - standard ChartTooltipContent with enhancements
    return (
        <ChartTooltipContent
            active={active}
            payload={payload}
            label={label}
            labelFormatter={labelFormatter}
            formatter={(value, name, item, index, payload) => {
                if (formatter) {
                    return formatter(value, name, item, index, payload)
                }

                // Enhanced default formatter
                const formattedValue = typeof value === 'number'
                    ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : value

                const payloadData = payload as any
                const transactionCount = payloadData?.transactionCount || payloadData?.count
                const percentage = showPercentage && totalValue && totalValue > 0
                    ? ((Number(value) || 0) / totalValue) * 100
                    : null

                return (
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{name}:</span>
                        <span className="font-semibold">{formattedValue}</span>
                        {percentage !== null && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                                {percentage.toFixed(1)}%
                            </Badge>
                        )}
                        {showTransactionCount && transactionCount !== undefined && (
                            <span className="text-[10px] text-muted-foreground">
                                ({transactionCount})
                            </span>
                        )}
                    </div>
                )
            }}
            className={className}
        />
    )
}

