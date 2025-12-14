"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileImage, FileText, File } from "lucide-react"
import { exportChart, type ExportFormat, type ChartExportOptions } from "@/lib/utils/chart-export"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ChartExportButtonProps {
    chartId: string
    title?: string
    description?: string
    filename?: string
    disabled?: boolean
    className?: string
    onExportStart?: () => void
    onExportComplete?: () => void
    onExportError?: (error: Error) => void
}

export function ChartExportButton({
    chartId,
    title,
    description,
    filename,
    disabled = false,
    className,
    onExportStart,
    onExportComplete,
    onExportError,
}: ChartExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async (format: ExportFormat) => {
        // Find the chart element by data-chart attribute
        // ChartContainer creates data-chart="chart-{id}" so we need to search for that
        const chartElement = document.querySelector(`[data-chart="chart-${chartId}"]`) as HTMLElement
        if (!chartElement) {
            toast.error('Chart element not found')
            return
        }

        // Find the actual chart container (parent of the ResponsiveContainer)
        const chartContainer = chartElement.closest('[data-slot="chart"]') as HTMLElement
        const targetElement = chartContainer || chartElement

        setIsExporting(true)
        onExportStart?.()

        try {
            const options: ChartExportOptions = {
                title,
                description,
                filename: filename || chartId,
                includeMetadata: true,
                includeTimestamp: true,
            }

            await exportChart(targetElement, format, options)
            toast.success(`Chart exported as ${format.toUpperCase()}`)
            onExportComplete?.()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to export chart'
            toast.error(errorMessage)
            onExportError?.(error instanceof Error ? error : new Error(errorMessage))
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled || isExporting}
                    className={cn(className)}
                >
                    <Download className={cn("h-4 w-4", isExporting && "animate-pulse")} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => void handleExport('png')}
                    disabled={isExporting}
                >
                    <FileImage className="mr-2 h-4 w-4" />
                    Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => void handleExport('svg')}
                    disabled={isExporting}
                >
                    <File className="mr-2 h-4 w-4" />
                    Export as SVG
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => void handleExport('pdf')}
                    disabled={isExporting}
                >
                    <FileText className="mr-2 h-4 w-4" />
                    Export as PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

