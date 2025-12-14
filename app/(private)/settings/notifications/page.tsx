"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
    getNotificationPreferences,
    updateNotificationPreferences,
    resetNotificationPreferences,
    type NotificationPreferences,
} from "@/lib/api/settings"
import { ApiClientError } from "@/lib/api-client"

type NotificationPreferencesState = Pick<
    NotificationPreferences,
    | "emailAccountActivity"
    | "emailSecurityAlerts"
    | "emailMarketing"
    | "emailWeeklyDigest"
    | "inAppSystem"
    | "inAppProjects"
    | "inAppMentions"
    | "pushEnabled"
    | "pushBrowser"
    | "pushMobile"
>

export default function NotificationSettingsPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isResetting, setIsResetting] = useState(false)
    const [preferences, setPreferences] = useState<NotificationPreferencesState>({
        emailAccountActivity: true,
        emailSecurityAlerts: true,
        emailMarketing: false,
        emailWeeklyDigest: false,
        inAppSystem: true,
        inAppProjects: true,
        inAppMentions: true,
        pushEnabled: false,
        pushBrowser: true,
        pushMobile: false,
    })

    // Load preferences from backend on mount
    useEffect(() => {
        loadPreferences()
    }, [])

    const loadPreferences = async () => {
        setIsLoading(true)
        try {
            const data = await getNotificationPreferences()
            setPreferences({
                emailAccountActivity: data.emailAccountActivity,
                emailSecurityAlerts: data.emailSecurityAlerts,
                emailMarketing: data.emailMarketing,
                emailWeeklyDigest: data.emailWeeklyDigest,
                inAppSystem: data.inAppSystem,
                inAppProjects: data.inAppProjects,
                inAppMentions: data.inAppMentions,
                pushEnabled: data.pushEnabled ?? false,
                pushBrowser: data.pushBrowser ?? true,
                pushMobile: data.pushMobile ?? false,
            })
        } catch (error) {
            console.error("Failed to load notification preferences:", error)
            toast.error("Failed to load preferences. Using defaults.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggle = (key: keyof NotificationPreferencesState) => {
        setPreferences((prev) => ({
            ...prev,
            [key]: !prev[key],
        }))
    }

    const onSubmit = async () => {
        setIsSubmitting(true)
        try {
            await updateNotificationPreferences(preferences)
            toast.success("Notification preferences updated successfully!")
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to update preferences. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = async () => {
        setIsResetting(true)
        try {
            const resetPrefs = await resetNotificationPreferences()
            setPreferences({
                emailAccountActivity: resetPrefs.emailAccountActivity,
                emailSecurityAlerts: resetPrefs.emailSecurityAlerts,
                emailMarketing: resetPrefs.emailMarketing,
                emailWeeklyDigest: resetPrefs.emailWeeklyDigest,
                inAppSystem: resetPrefs.inAppSystem,
                inAppProjects: resetPrefs.inAppProjects,
                inAppMentions: resetPrefs.inAppMentions,
                pushEnabled: resetPrefs.pushEnabled ?? false,
                pushBrowser: resetPrefs.pushBrowser ?? true,
                pushMobile: resetPrefs.pushMobile ?? false,
            })
            toast.success("Notification preferences reset to defaults!")
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to reset preferences. Please try again."
            toast.error(message)
        } finally {
            setIsResetting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>

                <div className="space-y-8">
                    {/* Email Notifications Skeleton */}
                    <div className="space-y-4">
                        <div>
                            <Skeleton className="h-6 w-40 mb-2" />
                            <Skeleton className="h-4 w-80" />
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-64" />
                                    </div>
                                    <Skeleton className="h-6 w-11 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* In-App Notifications Skeleton */}
                    <div className="space-y-4">
                        <div>
                            <Skeleton className="h-6 w-40 mb-2" />
                            <Skeleton className="h-4 w-80" />
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-64" />
                                    </div>
                                    <Skeleton className="h-6 w-11 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Push Notifications Skeleton */}
                    <div className="space-y-4">
                        <div>
                            <Skeleton className="h-6 w-40 mb-2" />
                            <Skeleton className="h-4 w-80" />
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-64" />
                                    </div>
                                    <Skeleton className="h-6 w-11 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold">Notification Settings</h2>
                <p className="text-muted-foreground mt-1">
                    Manage how you receive notifications
                </p>
            </div>

            <div className="space-y-8">
                {/* Email Notifications */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                            Choose which email notifications you want to receive
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="email-account">Account Activity</Label>
                                <p className="text-sm text-muted-foreground">
                                    Login attempts, password changes, and account updates
                                </p>
                            </div>
                            <Switch
                                id="email-account"
                                checked={preferences.emailAccountActivity}
                                onCheckedChange={() => handleToggle("emailAccountActivity")}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="email-security">Security Alerts</Label>
                                <p className="text-sm text-muted-foreground">
                                    Important security notifications and warnings
                                </p>
                            </div>
                            <Switch
                                id="email-security"
                                checked={preferences.emailSecurityAlerts}
                                onCheckedChange={() => handleToggle("emailSecurityAlerts")}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="email-marketing">Marketing Emails</Label>
                                <p className="text-sm text-muted-foreground">
                                    Product updates, tips, and promotional content
                                </p>
                            </div>
                            <Switch
                                id="email-marketing"
                                checked={preferences.emailMarketing}
                                onCheckedChange={() => handleToggle("emailMarketing")}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="email-digest">Weekly Digest</Label>
                                <p className="text-sm text-muted-foreground">
                                    A weekly summary of your activity
                                </p>
                            </div>
                            <Switch
                                id="email-digest"
                                checked={preferences.emailWeeklyDigest}
                                onCheckedChange={() => handleToggle("emailWeeklyDigest")}
                            />
                        </div>
                    </div>
                </div>

                {/* In-App Notifications */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium">In-App Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                            Control notifications within the application
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="inapp-system">System Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    System updates and important announcements
                                </p>
                            </div>
                            <Switch
                                id="inapp-system"
                                checked={preferences.inAppSystem}
                                onCheckedChange={() => handleToggle("inAppSystem")}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="inapp-projects">Project Updates</Label>
                                <p className="text-sm text-muted-foreground">
                                    Notifications about your projects
                                </p>
                            </div>
                            <Switch
                                id="inapp-projects"
                                checked={preferences.inAppProjects}
                                onCheckedChange={() => handleToggle("inAppProjects")}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="inapp-mentions">Mentions</Label>
                                <p className="text-sm text-muted-foreground">
                                    When someone mentions you
                                </p>
                            </div>
                            <Switch
                                id="inapp-mentions"
                                checked={preferences.inAppMentions}
                                onCheckedChange={() => handleToggle("inAppMentions")}
                            />
                        </div>
                    </div>
                </div>

                {/* Push Notifications */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium">Push Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                            Enable push notifications to receive real-time updates
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="push-enabled">Enable Push Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Master switch for all push notifications
                                </p>
                            </div>
                            <Switch
                                id="push-enabled"
                                checked={preferences.pushEnabled}
                                onCheckedChange={() => handleToggle("pushEnabled")}
                            />
                        </div>

                        {preferences.pushEnabled && (
                            <>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="push-browser">Browser Push</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive push notifications in your browser
                                        </p>
                                    </div>
                                    <Switch
                                        id="push-browser"
                                        checked={preferences.pushBrowser}
                                        onCheckedChange={() => handleToggle("pushBrowser")}
                                        disabled={!preferences.pushEnabled}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="push-mobile">Mobile Push</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive push notifications on mobile devices (if app is installed)
                                        </p>
                                    </div>
                                    <Switch
                                        id="push-mobile"
                                        checked={preferences.pushMobile}
                                        onCheckedChange={() => handleToggle("pushMobile")}
                                        disabled={!preferences.pushEnabled}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isSubmitting || isResetting}
                >
                    {isResetting ? "Resetting..." : "Reset to Defaults"}
                </Button>
                <Button onClick={onSubmit} disabled={isSubmitting || isResetting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    )
}

