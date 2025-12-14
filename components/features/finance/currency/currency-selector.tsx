"use client"

import { useState, useEffect } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SUPPORTED_CURRENCIES, getCurrencySymbol, getCurrencyName, formatCurrency } from "@/lib/utils/currency"
import { getCurrencyPreferences, getExchangeRates, type CurrencyPreferences } from "@/lib/api/finance/finance-currency"
import { toast } from "sonner"
import { ApiClientError } from "@/lib/api-client"

interface CurrencySelectorProps {
    value?: string
    onValueChange: (value: string) => void
    showExchangeRate?: boolean // Show exchange rate info when currency differs from base
    showConvertedAmount?: boolean // Show converted amount preview (optional)
    amount?: number // Amount to convert (for converted amount preview)
    baseCurrency?: string // Base currency (optional, will fetch from API if not provided)
    disabled?: boolean
    className?: string
}

export function CurrencySelector({
    value = "MYR",
    onValueChange,
    showExchangeRate = true,
    showConvertedAmount = false,
    amount,
    baseCurrency: propBaseCurrency,
    disabled = false,
    className,
}: CurrencySelectorProps) {
    const [baseCurrency, setBaseCurrency] = useState<string>(propBaseCurrency || "MYR")
    const [exchangeRate, setExchangeRate] = useState<number | null>(null)
    const [isLoadingRate, setIsLoadingRate] = useState(false)
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(!propBaseCurrency)

    // Load user's base currency preference
    useEffect(() => {
        if (propBaseCurrency) {
            setBaseCurrency(propBaseCurrency)
            return
        }

        async function loadPreferences() {
            setIsLoadingPreferences(true)
            try {
                const preferences = await getCurrencyPreferences()
                setBaseCurrency(preferences.baseCurrency || "MYR")
            } catch (error: any) {
                // Silently fail - use default MYR
                console.error("Failed to load currency preferences:", error)
            } finally {
                setIsLoadingPreferences(false)
            }
        }

        void loadPreferences()
    }, [propBaseCurrency])

    // Load exchange rate when currency differs from base
    useEffect(() => {
        if (!showExchangeRate || !value || value === baseCurrency || isLoadingPreferences) {
            setExchangeRate(null)
            return
        }

        async function loadExchangeRate() {
            setIsLoadingRate(true)
            try {
                const rates = await getExchangeRates(value, baseCurrency)
                // Handle both single rate and array of rates
                const rate = Array.isArray(rates)
                    ? rates.find((r) => r.toCurrency === baseCurrency)?.rate
                    : rates.rate
                setExchangeRate(rate || null)
            } catch (error: any) {
                console.error("Failed to load exchange rate:", error)
                setExchangeRate(null)
            } finally {
                setIsLoadingRate(false)
            }
        }

        void loadExchangeRate()
    }, [value, baseCurrency, showExchangeRate, isLoadingPreferences])

    const selectedCurrency = value || "MYR"
    const isDifferentFromBase = selectedCurrency !== baseCurrency
    const convertedAmount = exchangeRate && amount ? amount * exchangeRate : null

    return (
        <div className={`space-y-2 ${className || ""}`}>
            <Select value={selectedCurrency} onValueChange={onValueChange} disabled={disabled || isLoadingPreferences}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency">
                        {isLoadingPreferences ? (
                            <Skeleton className="h-4 w-20" />
                        ) : (
                            <span>
                                {getCurrencySymbol(selectedCurrency)} ({selectedCurrency})
                            </span>
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {SUPPORTED_CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                            <div className="flex items-center justify-between w-full">
                                <span>
                                    {getCurrencySymbol(currency)} {currency}
                                </span>
                                <span className="text-muted-foreground text-xs ml-2">
                                    {getCurrencyName(currency)}
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Exchange Rate Info */}
            {showExchangeRate && isDifferentFromBase && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isLoadingRate ? (
                        <Skeleton className="h-4 w-32" />
                    ) : exchangeRate ? (
                        <>
                            <Info className="h-3 w-3" />
                            <span>
                                1 {selectedCurrency} = {formatCurrency(exchangeRate, baseCurrency, { showSymbol: false })}{" "}
                                {baseCurrency}
                            </span>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="outline" className="cursor-help">
                                            Rate
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Exchange rate: {exchangeRate.toFixed(4)}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            Exchange rate unavailable
                        </span>
                    )}
                </div>
            )}

            {/* Converted Amount Preview */}
            {showConvertedAmount && isDifferentFromBase && convertedAmount && (
                <div className="text-sm text-muted-foreground">
                    <span className="font-medium">
                        ≈ {formatCurrency(convertedAmount, baseCurrency)} ({baseCurrency})
                    </span>
                </div>
            )}
        </div>
    )
}

