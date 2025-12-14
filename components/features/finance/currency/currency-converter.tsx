"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeftRight, RefreshCw, Loader2, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CurrencySelector } from "./currency-selector"
import { formatCurrency, getCurrencySymbol, getCurrencyName } from "@/lib/utils/currency"
import { convertCurrency, getExchangeRates, type ConvertCurrencyResponse } from "@/lib/api/finance/finance-currency"
import { toast } from "sonner"
import { ApiClientError } from "@/lib/api-client"
import { SUPPORTED_CURRENCIES } from "@/lib/utils/currency"

interface CurrencyConverterProps {
    defaultAmount?: number
    defaultFromCurrency?: string
    defaultToCurrency?: string
    showHistoricalRate?: boolean // Allow selecting historical date
    className?: string
    compact?: boolean // Compact mode for inline use
}

/**
 * CurrencyConverter Component
 * 
 * A standalone currency conversion calculator with real-time conversion,
 * exchange rate display, and optional historical rate selection.
 */
export function CurrencyConverter({
    defaultAmount = 1,
    defaultFromCurrency = "MYR",
    defaultToCurrency = "USD",
    showHistoricalRate = false,
    className,
    compact = false,
}: CurrencyConverterProps) {
    const [amount, setAmount] = useState<number>(defaultAmount)
    const [fromCurrency, setFromCurrency] = useState<string>(defaultFromCurrency)
    const [toCurrency, setToCurrency] = useState<string>(defaultToCurrency)
    const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
    const [exchangeRate, setExchangeRate] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [historicalDate, setHistoricalDate] = useState<string>("")

    // Perform conversion when inputs change
    useEffect(() => {
        if (amount > 0 && fromCurrency && toCurrency && fromCurrency !== toCurrency) {
            void performConversion()
        } else if (fromCurrency === toCurrency) {
            // Same currency, no conversion needed
            setConvertedAmount(amount)
            setExchangeRate(1)
            setLastUpdated(new Date())
        } else {
            setConvertedAmount(null)
            setExchangeRate(null)
        }
    }, [amount, fromCurrency, toCurrency, historicalDate])

    const performConversion = async () => {
        if (amount <= 0 || !fromCurrency || !toCurrency || fromCurrency === toCurrency) {
            return
        }

        setIsLoading(true)
        try {
            const response: ConvertCurrencyResponse = await convertCurrency({
                amount,
                fromCurrency,
                toCurrency,
                date: historicalDate || undefined,
            })

            setConvertedAmount(response.convertedAmount)
            setExchangeRate(response.exchangeRate)
            setLastUpdated(new Date())
        } catch (error: any) {
            console.error("Currency conversion failed:", error)
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to convert currency. Please try again."
            toast.error(message)
            setConvertedAmount(null)
            setExchangeRate(null)
        } finally {
            setIsLoading(false)
        }
    }

    const swapCurrencies = () => {
        const temp = fromCurrency
        setFromCurrency(toCurrency)
        setToCurrency(temp)
    }

    const formatTimestamp = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(date)
    }

    if (compact) {
        return (
            <div className={`flex items-center gap-2 ${className || ""}`}>
                <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-24"
                    min="0"
                    step="0.01"
                />
                <CurrencySelector
                    value={fromCurrency}
                    onValueChange={setFromCurrency}
                    showExchangeRate={false}
                    showConvertedAmount={false}
                    disabled={isLoading}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={swapCurrencies}
                    disabled={isLoading}
                    className="h-8 w-8"
                >
                    <ArrowLeftRight className="h-4 w-4" />
                </Button>
                <CurrencySelector
                    value={toCurrency}
                    onValueChange={setToCurrency}
                    showExchangeRate={false}
                    showConvertedAmount={false}
                    disabled={isLoading}
                />
                {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                ) : convertedAmount !== null ? (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">
                            {formatCurrency(convertedAmount, toCurrency, { showSymbol: true })}
                        </span>
                        {exchangeRate && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="outline" className="cursor-help text-xs">
                                            {exchangeRate.toFixed(4)}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Exchange rate: 1 {fromCurrency} = {formatCurrency(exchangeRate, toCurrency, { showSymbol: false })} {toCurrency}</p>
                                        {lastUpdated && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Updated: {formatTimestamp(lastUpdated)}
                                            </p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                ) : null}
            </div>
        )
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Currency Converter</CardTitle>
                <CardDescription>
                    Convert amounts between different currencies using current exchange rates
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Amount Input */}
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        placeholder="Enter amount"
                    />
                </div>

                {/* Currency Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>From</Label>
                        <CurrencySelector
                            value={fromCurrency}
                            onValueChange={setFromCurrency}
                            showExchangeRate={false}
                            showConvertedAmount={false}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Swap Button */}
                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={swapCurrencies}
                            disabled={isLoading}
                            className="w-full"
                        >
                            <ArrowLeftRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label>To</Label>
                        <CurrencySelector
                            value={toCurrency}
                            onValueChange={setToCurrency}
                            showExchangeRate={false}
                            showConvertedAmount={false}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Historical Date (Optional) */}
                {showHistoricalRate && (
                    <div className="space-y-2">
                        <Label htmlFor="historical-date">Historical Date (Optional)</Label>
                        <Input
                            id="historical-date"
                            type="date"
                            value={historicalDate}
                            onChange={(e) => setHistoricalDate(e.target.value)}
                            max={new Date().toISOString().split("T")[0]}
                        />
                        <p className="text-xs text-muted-foreground">
                            Select a date to use historical exchange rates
                        </p>
                    </div>
                )}

                {/* Conversion Result */}
                <div className="space-y-2">
                    <Label>Converted Amount</Label>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : convertedAmount !== null ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                <div>
                                    <p className="text-sm text-muted-foreground">Result</p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(convertedAmount, toCurrency, { showSymbol: true })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Exchange Rate</p>
                                    <p className="text-lg font-semibold">
                                        1 {fromCurrency} = {formatCurrency(exchangeRate || 0, toCurrency, { showSymbol: false, decimals: 4 })} {toCurrency}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Info className="h-3 w-3" />
                                    <span>
                                        {formatCurrency(amount, fromCurrency, { showSymbol: true })} = {formatCurrency(convertedAmount, toCurrency, { showSymbol: true })}
                                    </span>
                                </div>
                                {lastUpdated && (
                                    <span>Updated: {formatTimestamp(lastUpdated)}</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 border rounded-lg bg-muted/50 text-center text-muted-foreground">
                            Enter an amount and select currencies to convert
                        </div>
                    )}
                </div>

                {/* Refresh Button */}
                <Button
                    onClick={() => void performConversion()}
                    disabled={isLoading || amount <= 0 || !fromCurrency || !toCurrency || fromCurrency === toCurrency}
                    className="w-full"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Converting...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Rate
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}

