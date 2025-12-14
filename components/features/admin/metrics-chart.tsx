"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart as PieChartIcon,
    Activity,
    Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

export type ChartType = 'area' | 'bar' | 'pie' | 'line'

interface ChartData {
    name: string
    value: number
    [key: string]: any
}

interface MetricsChartProps {
    title: string
    description?: string
    data: ChartData[]
    type: ChartType
    dataKey?: string
    xAxisKey?: string
    colors?: string[]
    height?: number
    showLegend?: boolean
    showTooltip?: boolean
    className?: string
    isLoading?: boolean
    trend?: {
        value: number
        label: string
        isPositive: boolean
    }
}

const DEFAULT_COLORS = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
]

export function MetricsChart({
    title,
    description,
    data,
    type,
    dataKey = 'value',
    xAxisKey = 'name',
    colors = DEFAULT_COLORS,
    height = 300,
    showLegend = true,
    showTooltip = true,
    className,
    isLoading = false,
    trend
}: MetricsChartProps) {
    const renderChart = () => {
        switch (type) {
            case 'area':
                return (
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                            dataKey={xAxisKey}
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        {showTooltip && <Tooltip />}
                        {showLegend && <Legend />}
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={colors[0]}
                            fill={colors[0]}
                            fillOpacity={0.3}
                            strokeWidth={2}
                        />
                    </AreaChart>
                )

            case 'bar':
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                            dataKey={xAxisKey}
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        {showTooltip && <Tooltip />}
                        {showLegend && <Legend />}
                        <Bar
                            dataKey={dataKey}
                            fill={colors[0]}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                )

            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey={dataKey}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        {showTooltip && <Tooltip />}
                        {showLegend && <Legend />}
                    </PieChart>
                )

            case 'line':
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                            dataKey={xAxisKey}
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        {showTooltip && <Tooltip />}
                        {showLegend && <Legend />}
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={colors[0]}
                            strokeWidth={2}
                            dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                )

            default:
                return <div>Unsupported chart type</div>
        }
    }

    const getChartIcon = () => {
        switch (type) {
            case 'area':
                return <TrendingUp className="h-5 w-5" />
            case 'bar':
                return <BarChart3 className="h-5 w-5" />
            case 'pie':
                return <PieChartIcon className="h-5 w-5" />
            case 'line':
                return <Activity className="h-5 w-5" />
            default:
                return <BarChart3 className="h-5 w-5" />
        }
    }

    if (isLoading) {
        return (
            <Card className={cn("", className)}>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        {getChartIcon()}
                        <span className="ml-2">{title}</span>
                    </CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {getChartIcon()}
                        <div className="ml-2">
                            <CardTitle>{title}</CardTitle>
                            {description && <CardDescription>{description}</CardDescription>}
                        </div>
                    </div>
                    {trend && (
                        <Badge variant={trend.isPositive ? "default" : "secondary"} className={cn(
                            "flex items-center",
                            trend.isPositive ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                        )}>
                            {trend.isPositive ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={height}>
                        {renderChart()}
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
