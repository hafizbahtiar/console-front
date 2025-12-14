"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoryTrendsChart } from "@/components/features/finance/analytics/category-trends-chart"
import { ComparisonCharts } from "@/components/features/finance/analytics/comparison-charts"
import { ForecastChart } from "@/components/features/finance/analytics/forecast-chart"
import { HeatmapCalendar } from "@/components/features/finance/analytics/heatmap-calendar"
import { SpendingPatternsChart } from "@/components/features/finance/analytics/spending-patterns-chart"
import { Grid3x3, LayoutGrid, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrencyPreferences } from "@/lib/api/finance/finance-currency"

type ChartTab = 'trends' | 'comparison' | 'forecast' | 'heatmap' | 'patterns'
type LayoutMode = 'grid' | 'single'

export default function FinanceAnalyticsPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const router = useRouter()

    const [activeTab, setActiveTab] = useState<ChartTab>('trends')
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid')
    const [currencyFilter, setCurrencyFilter] = useState<string>("all")
    const [baseCurrency, setBaseCurrency] = useState<string>("MYR")

    // Load user's base currency preference
    useEffect(() => {
        async function loadBaseCurrency() {
            try {
                const preferences = await getCurrencyPreferences()
                setBaseCurrency(preferences.baseCurrency || "MYR")
            } catch (error) {
                // Silently fail - use default MYR
                console.error("Failed to load currency preferences:", error)
            }
        }
        void loadBaseCurrency()
    }, [])

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isAuthenticated, authLoading, router])

    if (!isAuthenticated && !authLoading) {
        return null
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Advanced Analytics</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Deep insights into your financial data with advanced visualizations
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Layout Toggle */}
                    <div className="flex items-center gap-1 border rounded-lg p-1">
                        <Button
                            variant={layoutMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setLayoutMode('grid')}
                            className="h-8"
                        >
                            <Grid3x3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={layoutMode === 'single' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setLayoutMode('single')}
                            className="h-8"
                        >
                            <Square className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Global Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>
                        Configure global filters for all charts. Each chart also has its own date range selector.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Currency Filter</Label>
                            <Select
                                value={currencyFilter}
                                onValueChange={setCurrencyFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All currencies" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All currencies</SelectItem>
                                    <SelectItem value={baseCurrency}>{baseCurrency} (Base Currency)</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                    <SelectItem value="SGD">SGD</SelectItem>
                                    <SelectItem value="AUD">AUD</SelectItem>
                                    <SelectItem value="JPY">JPY</SelectItem>
                                    <SelectItem value="CNY">CNY</SelectItem>
                                    <SelectItem value="HKD">HKD</SelectItem>
                                    <SelectItem value="THB">THB</SelectItem>
                                    <SelectItem value="IDR">IDR</SelectItem>
                                    <SelectItem value="PHP">PHP</SelectItem>
                                    <SelectItem value="VND">VND</SelectItem>
                                    <SelectItem value="INR">INR</SelectItem>
                                    <SelectItem value="KRW">KRW</SelectItem>
                                    <SelectItem value="CAD">CAD</SelectItem>
                                    <SelectItem value="NZD">NZD</SelectItem>
                                    <SelectItem value="CHF">CHF</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Filter analytics by currency. All amounts are converted to your base currency ({baseCurrency}) for display.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Chart Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ChartTab)}>
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="trends">Category Trends</TabsTrigger>
                    <TabsTrigger value="comparison">Comparisons</TabsTrigger>
                    <TabsTrigger value="forecast">Forecast</TabsTrigger>
                    <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                    <TabsTrigger value="patterns">Spending Patterns</TabsTrigger>
                </TabsList>

                {/* Category Trends Tab */}
                <TabsContent value="trends" className="space-y-4">
                    <div className={cn(
                        layoutMode === 'grid' ? "grid gap-4 md:grid-cols-1" : "space-y-4"
                    )}>
                        <CategoryTrendsChart
                            title="Category Trends"
                            description="Track spending and income trends by category over time"
                        />
                    </div>
                </TabsContent>

                {/* Comparison Charts Tab */}
                <TabsContent value="comparison" className="space-y-4">
                    <div className={cn(
                        layoutMode === 'grid' ? "grid gap-4 md:grid-cols-1" : "space-y-4"
                    )}>
                        <ComparisonCharts
                            title="Comparison Analysis"
                            description="Compare financial performance month-over-month or year-over-year"
                            currency={currencyFilter !== "all" ? currencyFilter : undefined}
                        />
                    </div>
                </TabsContent>

                {/* Forecast Chart Tab */}
                <TabsContent value="forecast" className="space-y-4">
                    <div className={cn(
                        layoutMode === 'grid' ? "grid gap-4 md:grid-cols-1" : "space-y-4"
                    )}>
                        <ForecastChart
                            title="Financial Forecast"
                            description="Projected income, expenses, and net based on historical trends"
                            currency={currencyFilter !== "all" ? currencyFilter : undefined}
                        />
                    </div>
                </TabsContent>

                {/* Heatmap Calendar Tab */}
                <TabsContent value="heatmap" className="space-y-4">
                    <div className={cn(
                        layoutMode === 'grid' ? "grid gap-4 md:grid-cols-1" : "space-y-4"
                    )}>
                        <HeatmapCalendar
                            title="Transaction Heatmap"
                            description="Visualize daily transaction activity over time"
                            currency={currencyFilter !== "all" ? currencyFilter : undefined}
                        />
                    </div>
                </TabsContent>

                {/* Spending Patterns Tab */}
                <TabsContent value="patterns" className="space-y-4">
                    <div className={cn(
                        layoutMode === 'grid' ? "grid gap-4 md:grid-cols-1" : "space-y-4"
                    )}>
                        <SpendingPatternsChart
                            title="Spending Patterns"
                            description="Analyze spending patterns and detect anomalies"
                            currency={currencyFilter !== "all" ? currencyFilter : undefined}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

