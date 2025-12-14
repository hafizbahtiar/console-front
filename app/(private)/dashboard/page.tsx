"use client"

import { useAuth } from "@/contexts/auth-context"
import { WelcomeSection } from "@/components/features/dashboard/welcome-section"
import { StatsSection } from "@/components/features/dashboard/stats-section"
import { QuickActionsSection } from "@/components/features/dashboard/quick-actions-section"
import { RecentActivitySection } from "@/components/features/dashboard/recent-activity-section"
import { DashboardErrorBoundary } from "@/components/features/error/error-boundary"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Welcome Section Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-96" />
            </div>

            {/* Stats Section Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions and Recent Activity Skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-3">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function DashboardPage() {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return <DashboardSkeleton />
    }

    if (!user) {
        return null
    }

    return (
        <DashboardErrorBoundary>
            <div className="space-y-6">
                <WelcomeSection />
                <StatsSection />
                <div className="grid gap-6 md:grid-cols-2">
                    <QuickActionsSection />
                    <RecentActivitySection />
                </div>
            </div>
        </DashboardErrorBoundary>
    )
}
