"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts"
import type { Budget } from "@/lib/api/finance/finance-budgets"
import { cn } from "@/lib/utils"

interface BudgetChartProps {
    budgets: Budget[]
    title?: string
    description?: string
}

export function BudgetVsActualChart({ budgets, title, description }: BudgetChartProps) {
    const chartData = budgets
        .filter((b) => b.stats)
        .map((budget) => ({
            name: budget.name.length > 15 ? `${budget.name.substring(0, 15)}...` : budget.name,
            budget: budget.amount,
            actual: budget.stats!.actualAmount,
            remaining: budget.stats!.remainingAmount,
        }))

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title || "Budget vs Actual"}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No budget data available
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title || "Budget vs Actual"}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            formatter={(value: number) =>
                                `$${value.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`
                            }
                        />
                        <Legend />
                        <Bar dataKey="budget" name="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="actual" name="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="remaining" name="Remaining" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export function BudgetProgressChart({ budgets, title, description }: BudgetChartProps) {
    const chartData = budgets
        .filter((b) => b.stats)
        .map((budget) => ({
            name: budget.name.length > 20 ? `${budget.name.substring(0, 20)}...` : budget.name,
            percentage: Math.min(budget.stats!.percentageUsed, 100),
            alertLevel: budget.stats!.alertLevel,
        }))
        .sort((a, b) => b.percentage - a.percentage)

    const getColor = (alertLevel?: string) => {
        if (alertLevel === "exceeded") return "#ef4444"
        if (alertLevel === "critical") return "#f97316"
        if (alertLevel === "warning") return "#f59e0b"
        return "#10b981"
    }

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title || "Budget Progress"}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No budget data available
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title || "Budget Progress"}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={90} />
                        <Tooltip
                            formatter={(value: number) => `${value.toFixed(1)}%`}
                            labelStyle={{ color: "#000" }}
                        />
                        <Bar dataKey="percentage" name="Usage %" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.alertLevel)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

