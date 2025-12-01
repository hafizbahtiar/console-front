"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export default function NotificationSettingsPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [preferences, setPreferences] = useState({
        emailAccountActivity: true,
        emailSecurityAlerts: true,
        emailMarketing: false,
        emailWeeklyDigest: false,
        inAppSystem: true,
        inAppProjects: true,
        inAppMentions: true,
    })

    const handleToggle = (key: keyof typeof preferences) => {
        setPreferences((prev) => ({
            ...prev,
            [key]: !prev[key],
        }))
    }

    const onSubmit = async () => {
        setIsSubmitting(true)
        try {
            // TODO: Call API to update notification preferences
            // await updateNotificationPreferences(preferences)
            toast.success("Notification preferences updated successfully!")
        } catch (error) {
            toast.error("Failed to update preferences. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
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
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        // Reset to defaults
                        setPreferences({
                            emailAccountActivity: true,
                            emailSecurityAlerts: true,
                            emailMarketing: false,
                            emailWeeklyDigest: false,
                            inAppSystem: true,
                            inAppProjects: true,
                            inAppMentions: true,
                        })
                    }}
                    disabled={isSubmitting}
                >
                    Reset
                </Button>
                <Button onClick={onSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    )
}

