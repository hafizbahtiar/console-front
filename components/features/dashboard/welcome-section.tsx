"use client"

import { useAuth } from "@/contexts/auth-context"

export function WelcomeSection() {
    const { user } = useAuth()
    const currentHour = new Date().getHours()
    const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening"
    const displayName = user?.displayName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User"

    return (
        <div className="space-y-2">
            <h1 className="text-3xl font-bold">
                {greeting}, {displayName} 👋
            </h1>
            <p className="text-muted-foreground">
                Welcome back to Console. Here's what's happening today.
            </p>
        </div>
    )
}

