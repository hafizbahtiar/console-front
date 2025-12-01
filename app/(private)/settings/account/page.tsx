"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CheckCircle2, XCircle, Mail, Calendar, Shield, User as UserIcon } from "lucide-react"
import { AccountDeletionSection } from "@/components/features/settings/account/account-deletion-section"
import { AccountDeactivationSection } from "@/components/features/settings/account/account-deactivation-section"
import { DataExportSection } from "@/components/features/settings/account/data-export-section"

export default function AccountSettingsPage() {
    const { user } = useAuth()

    if (!user) {
        return null
    }

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "N/A"
        try {
            return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a")
        } catch {
            return "Invalid date"
        }
    }

    const formatDateShort = (dateString: string | undefined) => {
        if (!dateString) return "N/A"
        try {
            return format(new Date(dateString), "MMMM d, yyyy")
        } catch {
            return "Invalid date"
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold">Account Settings</h2>
                <p className="text-muted-foreground mt-1">
                    View and manage your account information
                </p>
            </div>

            {/* Account Information Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Account Information
                    </CardTitle>
                    <CardDescription>
                        Your account details and status information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Account Status */}
                    <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Account Status</span>
                        </div>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? (
                                <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Active
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Inactive
                                </>
                            )}
                        </Badge>
                    </div>

                    {/* Email Verification Status */}
                    <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Email Verification</span>
                        </div>
                        <Badge variant={user.emailVerified ? "default" : "secondary"}>
                            {user.emailVerified ? (
                                <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Verified
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Unverified
                                </>
                            )}
                        </Badge>
                    </div>

                    {/* Account Type */}
                    <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Account Type</span>
                        </div>
                        <Badge variant="outline">Email</Badge>
                    </div>

                    {/* Account Creation Date */}
                    <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Account Created</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {formatDateShort(user.createdAt)}
                        </span>
                    </div>

                    {/* Last Login Date */}
                    <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Last Login</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {(user as any).lastLoginAt
                                ? formatDateShort((user as any).lastLoginAt)
                                : "Never"}
                        </span>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Last Updated</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {formatDateShort(user.updatedAt)}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Data Export Section */}
            <DataExportSection />

            {/* Account Deactivation Section */}
            <AccountDeactivationSection />

            {/* Account Deletion Section */}
            <AccountDeletionSection />
        </div>
    )
}

