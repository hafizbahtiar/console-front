"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Power, PowerOff, AlertTriangle } from "lucide-react"
import { deactivateAccount, reactivateAccount } from "@/lib/api/settings"

export function AccountDeactivationSection() {
    const { user, refreshUser } = useAuth()
    const [isDeactivating, setIsDeactivating] = useState(false)
    const [isReactivating, setIsReactivating] = useState(false)
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
    const [showReactivateDialog, setShowReactivateDialog] = useState(false)

    const handleDeactivate = async () => {
        setIsDeactivating(true)
        try {
            await deactivateAccount()
            toast.success("Account deactivated successfully")
            await refreshUser()
            setShowDeactivateDialog(false)
        } catch (error: any) {
            const errorMessage = error?.message || "Failed to deactivate account. Please try again."
            toast.error(errorMessage)
        } finally {
            setIsDeactivating(false)
        }
    }

    const handleReactivate = async () => {
        setIsReactivating(true)
        try {
            await reactivateAccount()
            toast.success("Account reactivated successfully")
            await refreshUser()
            setShowReactivateDialog(false)
        } catch (error: any) {
            const errorMessage = error?.message || "Failed to reactivate account. Please try again."
            toast.error(errorMessage)
        } finally {
            setIsReactivating(false)
        }
    }

    if (!user) {
        return null
    }

    const isActive = user.isActive

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Power className="h-5 w-5" />
                    Account Status
                </CardTitle>
                <CardDescription>
                    Temporarily disable or enable your account
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Status Info */}
                <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                Current Status: {isActive ? "Active" : "Inactive"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {isActive
                                    ? "Your account is currently active and you can access all features."
                                    : "Your account is deactivated. You won't be able to access your account until you reactivate it."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Warning Message */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                What happens when you deactivate?
                            </p>
                            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                                <li>You won't be able to log in to your account</li>
                                <li>Your data will be preserved and can be restored</li>
                                <li>You can reactivate your account at any time</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {isActive ? (
                    <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Deactivate Account?</AlertDialogTitle>
                                <AlertDialogDescription className="space-y-2">
                                    <p>
                                        Your account will be temporarily disabled. You won't be able to log in
                                        until you reactivate it.
                                    </p>
                                    <p className="font-medium">
                                        Your data will be preserved and you can reactivate your account at any time.
                                    </p>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeactivating}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeactivate}
                                    disabled={isDeactivating}
                                    className="bg-yellow-600 text-white hover:bg-yellow-700"
                                >
                                    {isDeactivating ? "Deactivating..." : "Deactivate Account"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : (
                    <AlertDialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Reactivate Account?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Your account will be reactivated and you'll be able to log in and access all
                                    features again.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isReactivating}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleReactivate}
                                    disabled={isReactivating}
                                >
                                    {isReactivating ? "Reactivating..." : "Reactivate Account"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

                <Button
                    type="button"
                    variant={isActive ? "outline" : "default"}
                    onClick={() => (isActive ? setShowDeactivateDialog(true) : setShowReactivateDialog(true))}
                    disabled={isDeactivating || isReactivating}
                    className="w-full"
                >
                    {isActive ? (
                        <>
                            <PowerOff className="h-4 w-4 mr-2" />
                            {isDeactivating ? "Deactivating..." : "Deactivate Account"}
                        </>
                    ) : (
                        <>
                            <Power className="h-4 w-4 mr-2" />
                            {isReactivating ? "Reactivating..." : "Reactivate Account"}
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}

