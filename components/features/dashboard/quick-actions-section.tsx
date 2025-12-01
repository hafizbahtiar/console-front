"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, FileText, ShoppingCart } from "lucide-react"

export function QuickActionsSection() {
    const actions = [
        {
            title: "New Customer",
            description: "Add a new customer to your system",
            icon: Users,
            href: "/dashboard/customers/new",
            variant: "default" as const,
        },
        {
            title: "Create Invoice",
            description: "Generate a new invoice",
            icon: FileText,
            href: "/dashboard/invoices/new",
            variant: "default" as const,
        },
        {
            title: "New Order",
            description: "Create a new order",
            icon: ShoppingCart,
            href: "/dashboard/orders/new",
            variant: "outline" as const,
        },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                    Common tasks and shortcuts
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                    {actions.map((action) => {
                        const Icon = action.icon
                        return (
                            <Button
                                key={action.title}
                                asChild
                                variant={action.variant}
                                className="h-auto flex-col items-start justify-start gap-2 p-4"
                            >
                                <Link href={action.href}>
                                    <Icon className="h-5 w-5" />
                                    <div className="text-left">
                                        <div className="font-semibold">{action.title}</div>
                                        <div className="text-xs opacity-70">{action.description}</div>
                                    </div>
                                </Link>
                            </Button>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

