"use client"

import { useAuth } from "@/contexts/auth-context"
import { WelcomeSection } from "@/components/features/dashboard/welcome-section"
import { StatsSection } from "@/components/features/dashboard/stats-section"
import { QuickActionsSection } from "@/components/features/dashboard/quick-actions-section"
import { RecentActivitySection } from "@/components/features/dashboard/recent-activity-section"

export default function DashboardPage() {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="space-y-6">
            <WelcomeSection />
            <StatsSection />
            <div className="grid gap-6 md:grid-cols-2">
                <QuickActionsSection />
                <RecentActivitySection />
            </div>
        </div>
    )
}
