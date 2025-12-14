"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Settings, Briefcase, Shield } from "lucide-react"

export function QuickActionsSection() {
    const { user } = useAuth()

    // Base actions for all users
    const baseActions = [
        {
            title: "Settings",
            description: "Manage your account settings",
            icon: Settings,
            href: "/settings",
            variant: "default" as const,
        },
    ]

    // Owner-only actions
    const ownerActions = user?.role === "owner" ? [
        {
            title: "New Project",
            description: "Add a new portfolio project",
            icon: Briefcase,
            href: "/portfolio/projects/new",
            variant: "default" as const,
        },
        {
            title: "Admin Dashboard",
            description: "View system health and metrics",
            icon: Shield,
            href: "/admin/dashboard",
            variant: "outline" as const,
        },
    ] : []

    const actions = [...baseActions, ...ownerActions]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                    Common tasks and shortcuts
                </CardDescription>
            </CardHeader>
            <CardContent>
                {actions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No quick actions available
                    </p>
                ) : (
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
                )}
            </CardContent>
        </Card>
    )
}

