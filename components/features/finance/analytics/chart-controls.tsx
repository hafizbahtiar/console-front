"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Settings, Palette } from "lucide-react"
import { ChartType, type ChartPreferences } from "@/lib/utils/chart-preferences"
import { cn } from "@/lib/utils"

interface ChartControlsProps {
    chartId: string
    chartType?: ChartType
    availableTypes?: ChartType[]
    preferences: ChartPreferences
    onChartTypeChange?: (type: ChartType) => void
    onPreferenceChange?: (key: keyof ChartPreferences, value: any) => void
    showLabels?: boolean
    showGrid?: boolean
    showLegend?: boolean
    className?: string
}

const CHART_TYPE_LABELS: Record<ChartType, string> = {
    line: 'Line',
    area: 'Area',
    bar: 'Bar',
    pie: 'Pie',
    composed: 'Composed',
}

export function ChartControls({
    chartId,
    chartType,
    availableTypes = ['line', 'area', 'bar'],
    preferences,
    onChartTypeChange,
    onPreferenceChange,
    showLabels = true,
    showGrid = true,
    showLegend = true,
    className,
}: ChartControlsProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Chart Type Selector */}
            {availableTypes.length > 1 && chartType && onChartTypeChange && (
                <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <Select
                        value={chartType}
                        onValueChange={(value) => onChartTypeChange(value as ChartType)}
                    >
                        <SelectTrigger className="h-8 w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {availableTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {CHART_TYPE_LABELS[type]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Chart Settings Popover */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                        <Settings className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Display Options</Label>
                            {showLabels && (
                                <div className="flex items-center justify-between">
                                    <Label htmlFor={`${chartId}-labels`} className="text-sm font-normal">
                                        Show Labels
                                    </Label>
                                    <Switch
                                        id={`${chartId}-labels`}
                                        checked={preferences.showLabels ?? true}
                                        onCheckedChange={(checked) =>
                                            onPreferenceChange?.('showLabels', checked)
                                        }
                                    />
                                </div>
                            )}
                            {showGrid && (
                                <div className="flex items-center justify-between">
                                    <Label htmlFor={`${chartId}-grid`} className="text-sm font-normal">
                                        Show Grid
                                    </Label>
                                    <Switch
                                        id={`${chartId}-grid`}
                                        checked={preferences.showGrid ?? true}
                                        onCheckedChange={(checked) =>
                                            onPreferenceChange?.('showGrid', checked)
                                        }
                                    />
                                </div>
                            )}
                            {showLegend && (
                                <div className="flex items-center justify-between">
                                    <Label htmlFor={`${chartId}-legend`} className="text-sm font-normal">
                                        Show Legend
                                    </Label>
                                    <Switch
                                        id={`${chartId}-legend`}
                                        checked={preferences.showLegend ?? true}
                                        onCheckedChange={(checked) =>
                                            onPreferenceChange?.('showLegend', checked)
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Tooltip</Label>
                            <Select
                                value={preferences.tooltipFormat || 'default'}
                                onValueChange={(value) =>
                                    onPreferenceChange?.('tooltipFormat', value)
                                }
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="minimal">Minimal</SelectItem>
                                    <SelectItem value="default">Default</SelectItem>
                                    <SelectItem value="detailed">Detailed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

