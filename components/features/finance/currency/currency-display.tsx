"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency, getCurrencySymbol, getCurrencyName } from "@/lib/utils/currency"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface CurrencyDisplayProps {
    amount: number
    currency?: string // ISO 4217 currency code (default: 'MYR')
    baseAmount?: number // Amount in base currency (for conversion display)
    baseCurrency?: string // Base currency code
    showSymbol?: boolean // Show currency symbol (default: true)
    showCode?: boolean // Show currency code badge (default: false)
    showConverted?: boolean // Show converted amount in tooltip (default: false)
    symbolPosition?: "before" | "after" // Currency symbol position (default: "before")
    decimals?: number // Number of decimal places (default: 2)
    className?: string
    amountClassName?: string // Additional classes for the amount text
    variant?: "default" | "income" | "expense" // Color variant based on transaction type
}

/**
 * CurrencyDisplay Component
 * 
 * Displays formatted currency amounts with currency symbols, codes, and optional conversion info.
 */
export function CurrencyDisplay({
    amount,
    currency = "MYR",
    baseAmount,
    baseCurrency,
    showSymbol = true,
    showCode = false,
    showConverted = false,
    symbolPosition = "before",
    decimals = 2,
    className,
    amountClassName,
    variant = "default",
}: CurrencyDisplayProps) {
    const currencyCode = currency.toUpperCase()
    const symbol = getCurrencySymbol(currencyCode)
    const hasConversion = baseAmount !== undefined && baseCurrency && currencyCode !== baseCurrency.toUpperCase()

    // Format the amount
    const formattedAmount = amount.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })

    // Determine color based on variant
    const colorClass = cn({
        "text-green-600": variant === "income",
        "text-red-600": variant === "expense",
        "text-foreground": variant === "default",
    })

    // Build the display text
    const displayText = (() => {
        if (symbolPosition === "before") {
            return showSymbol ? `${symbol} ${formattedAmount}` : formattedAmount
        } else {
            return showSymbol ? `${formattedAmount} ${symbol}` : formattedAmount
        }
    })()

    const content = (
        <div className={cn("flex items-center gap-1.5", className)}>
            <span className={cn("font-semibold", colorClass, amountClassName)}>
                {displayText}
            </span>
            {showCode && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {currencyCode}
                </Badge>
            )}
        </div>
    )

    // If we have conversion info and should show it, wrap in tooltip
    if (showConverted && hasConversion && baseAmount !== undefined && baseCurrency) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-help">
                            {content}
                            <Info className="h-3 w-3 text-muted-foreground" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="space-y-1">
                            <p className="font-medium">
                                {formatCurrency(baseAmount, baseCurrency, { showSymbol: true })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Converted to base currency ({baseCurrency})
                            </p>
                            {baseAmount !== amount && (
                                <p className="text-xs text-muted-foreground">
                                    Exchange rate: {(baseAmount / amount).toFixed(4)}
                                </p>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return content
}

