"use client"

import { useState, useEffect } from "react"
import { Control } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Controller } from "react-hook-form"
import { CurrencySelector } from "@/components/features/finance/currency/currency-selector"
import { SUPPORTED_CURRENCIES, getCurrencySymbol, getCurrencyName } from "@/lib/utils/currency"
import { getCurrencyPreferences, updateCurrencyPreferences, type CurrencyPreferences } from "@/lib/api/finance/finance-currency"
import { getCurrencyDisplayPreferences, saveCurrencyDisplayPreferences } from "@/lib/utils/currency-preferences"
import { toast } from "sonner"
import { ApiClientError } from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface CurrencySectionProps {
    control?: Control<any>
}

/**
 * Currency Preferences Section
 * 
 * Manages user currency preferences including:
 * - Base currency selection
 * - Supported currencies (multi-select)
 * - Currency display preferences (localStorage)
 */
export function CurrencySection({ control }: CurrencySectionProps) {
    const [baseCurrency, setBaseCurrency] = useState<string>("MYR")
    const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>(["MYR"])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [selectedCurrencies, setSelectedCurrencies] = useState<Set<string>>(new Set(["MYR"]))

    // UI Preferences (stored in localStorage)
    const [symbolPosition, setSymbolPosition] = useState<"before" | "after">("before")
    const [showCode, setShowCode] = useState<boolean>(false)

    // Load preferences from backend
    useEffect(() => {
        void loadPreferences()
    }, [])

    // Load UI preferences from localStorage
    useEffect(() => {
        const prefs = getCurrencyDisplayPreferences()
        setSymbolPosition(prefs.symbolPosition)
        setShowCode(prefs.showCode)
    }, [])

    const loadPreferences = async () => {
        setIsLoading(true)
        try {
            const preferences = await getCurrencyPreferences()
            setBaseCurrency(preferences.baseCurrency || "MYR")
            setSupportedCurrencies(preferences.supportedCurrencies || ["MYR"])
            setSelectedCurrencies(new Set(preferences.supportedCurrencies || ["MYR"]))
        } catch (error: any) {
            console.error("Failed to load currency preferences:", error)
            toast.error("Failed to load currency preferences")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSavePreferences = async () => {
        setIsSaving(true)
        try {
            // Ensure base currency is in supported currencies
            const currenciesToSave = Array.from(selectedCurrencies)
            if (!currenciesToSave.includes(baseCurrency)) {
                currenciesToSave.push(baseCurrency)
            }

            await updateCurrencyPreferences({
                baseCurrency,
                supportedCurrencies: currenciesToSave,
            })

            // Save UI preferences to localStorage
            saveCurrencyDisplayPreferences({
                symbolPosition,
                showCode,
            })

            toast.success("Currency preferences saved successfully")
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to save currency preferences. Please try again."
            toast.error(message)
        } finally {
            setIsSaving(false)
        }
    }

    const toggleCurrency = (currency: string) => {
        const newSet = new Set(selectedCurrencies)
        if (newSet.has(currency)) {
            // Don't allow removing base currency
            if (currency === baseCurrency) {
                toast.error("Cannot remove base currency from supported currencies")
                return
            }
            newSet.delete(currency)
        } else {
            newSet.add(currency)
        }
        setSelectedCurrencies(newSet)
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Currency</h3>
                    <p className="text-sm text-muted-foreground">
                        Configure your currency preferences and display settings
                    </p>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Currency</h3>
                <p className="text-sm text-muted-foreground">
                    Configure your currency preferences and display settings
                </p>
            </div>

            {/* Base Currency */}
            <div className="space-y-2">
                <Label htmlFor="baseCurrency">Base Currency</Label>
                <p className="text-sm text-muted-foreground">
                    Your primary currency for transactions and reports. All amounts will be converted to this currency.
                </p>
                <CurrencySelector
                    value={baseCurrency}
                    onValueChange={(value) => {
                        setBaseCurrency(value)
                        // Ensure base currency is in supported currencies
                        if (!selectedCurrencies.has(value)) {
                            setSelectedCurrencies(new Set([...selectedCurrencies, value]))
                        }
                    }}
                    showExchangeRate={false}
                    showConvertedAmount={false}
                />
            </div>

            <Separator />

            {/* Supported Currencies */}
            <div className="space-y-2">
                <Label>Supported Currencies</Label>
                <p className="text-sm text-muted-foreground">
                    Select currencies you frequently use. Your base currency is always included.
                </p>
                <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/50 min-h-[100px]">
                    {SUPPORTED_CURRENCIES.map((currency) => {
                        const isSelected = selectedCurrencies.has(currency)
                        const isBase = currency === baseCurrency
                        return (
                            <div
                                key={currency}
                                className="flex items-center gap-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`currency-${currency}`}
                                        checked={isSelected}
                                        onCheckedChange={() => toggleCurrency(currency)}
                                        disabled={isBase}
                                    />
                                    <Label
                                        htmlFor={`currency-${currency}`}
                                        className={cn(
                                            "cursor-pointer flex items-center gap-2",
                                            isBase && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <Badge
                                            variant={isBase ? "default" : isSelected ? "secondary" : "outline"}
                                            className="flex items-center gap-1"
                                        >
                                            {getCurrencySymbol(currency)} {currency}
                                            {isBase && (
                                                <span className="text-xs ml-1">(Base)</span>
                                            )}
                                        </Badge>
                                    </Label>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <p className="text-xs text-muted-foreground">
                    Selected: {selectedCurrencies.size} currency{selectedCurrencies.size !== 1 ? "ies" : ""}
                </p>
            </div>

            <Separator />

            {/* Display Preferences (localStorage only) */}
            <div className="space-y-4">
                <div>
                    <Label>Display Preferences</Label>
                    <p className="text-sm text-muted-foreground">
                        These preferences are stored locally in your browser and affect how currencies are displayed.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="symbolPosition">Currency Symbol Position</Label>
                        <Select
                            value={symbolPosition}
                            onValueChange={(value: "before" | "after") => setSymbolPosition(value)}
                        >
                            <SelectTrigger id="symbolPosition" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="before">Before amount (e.g., $100)</SelectItem>
                                <SelectItem value="after">After amount (e.g., 100 $)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="showCode">Show Currency Code</Label>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="showCode"
                                checked={showCode}
                                onCheckedChange={(checked) => setShowCode(checked === true)}
                            />
                            <Label htmlFor="showCode" className="cursor-pointer">
                                Display currency code (e.g., MYR) alongside symbol
                            </Label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                >
                    {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
            </div>
        </div>
    )
}

