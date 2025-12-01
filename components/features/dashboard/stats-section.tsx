"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, ShoppingCart, TrendingUp } from "lucide-react"

export function StatsSection() {
    const { user } = useAuth()

    // TODO: Replace with real data from API
    const stats = [
        {
            title: "Total Customers",
            value: "0",
            description: "Active customers",
            icon: Users,
            trend: null,
        },
        {
            title: "Total Invoices",
            value: "0",
            description: "This month",
            icon: FileText,
            trend: null,
        },
        {
            title: "Total Orders",
            value: "0",
            description: "This month",
            icon: ShoppingCart,
            trend: null,
        },
        {
            title: "Revenue",
            value: "$0",
            description: "This month",
            icon: TrendingUp,
            trend: null,
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

