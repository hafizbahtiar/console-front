"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

export function RecentActivitySection() {
    // TODO: Replace with real data from API
    const activities: any[] = []

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                </CardTitle>
                <CardDescription>
                    Your latest actions and updates
                </CardDescription>
            </CardHeader>
            <CardContent>
                {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-sm text-muted-foreground">
                            No recent activity
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Your activity will appear here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">{activity.title}</p>
                                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                                </div>
                                <span className="text-xs text-muted-foreground">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

