"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Trash2, AlertTriangle, Mail } from "lucide-react"
import { requestAccountDeletion, deleteAccount } from "@/lib/api/settings"

export function AccountDeletionSection() {
    const { logout } = useAuth()
    const router = useRouter()
    const [isRequesting, setIsRequesting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [confirmationToken, setConfirmationToken] = useState("")
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [hasRequestedDeletion, setHasRequestedDeletion] = useState(false)

    const handleRequestDeletion = async () => {
        setIsRequesting(true)
        try {
            await requestAccountDeletion()
            setHasRequestedDeletion(true)
            toast.success("Confirmation email sent! Please check your email for the deletion token.")
        } catch (error: any) {
            const errorMessage = error?.message || "Failed to send deletion request. Please try again."
            toast.error(errorMessage)
        } finally {
            setIsRequesting(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!confirmationToken.trim()) {
            toast.error("Please enter the confirmation token from your email")
            return
        }

        setIsDeleting(true)
        try {
            await deleteAccount({ confirmationToken: confirmationToken.trim() })
            toast.success("Account deleted successfully")
            // Logout and redirect
            await logout()
            router.push("/")
        } catch (error: any) {
            const errorMessage = error?.message || "Failed to delete account. Please check your token and try again."
            toast.error(errorMessage)
        } finally {
            setIsDeleting(false)
            setShowDeleteDialog(false)
        }
    }

    const dataToBeDeleted = [
        "Your profile and account information",
        "All portfolio projects, skills, experiences, and other content",
        "All active sessions",
        "All uploaded files and images",
        "All blog posts and articles",
        "All testimonials and contacts",
    ]

    return (
        <Card className="border-destructive/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription>
                    Irreversible and destructive actions. Please proceed with caution.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Warning Message */}
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-destructive">
                                Warning: Account Deletion is Permanent
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Deleting your account will permanently remove all your data. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Data to be Deleted */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">The following data will be permanently deleted:</Label>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                        {dataToBeDeleted.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                {/* Request Deletion Button */}
                {!hasRequestedDeletion && (
                    <div className="space-y-2">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleRequestDeletion}
                            disabled={isRequesting}
                            className="w-full"
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            {isRequesting ? "Sending Request..." : "Request Account Deletion"}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            You will receive a confirmation email with a token to complete the deletion.
                        </p>
                    </div>
                )}

                {/* Confirmation Token Input */}
                {hasRequestedDeletion && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-start gap-2">
                                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        Check Your Email
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        We've sent a confirmation token to your email address. Enter it below to proceed with account deletion.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmation-token">Confirmation Token</Label>
                            <Input
                                id="confirmation-token"
                                type="text"
                                placeholder="Enter token from email"
                                value={confirmationToken}
                                onChange={(e) => setConfirmationToken(e.target.value)}
                                disabled={isDeleting}
                            />
                            <p className="text-xs text-muted-foreground">
                                The token expires in 24 hours. If you didn't receive it, you can request a new one.
                            </p>
                        </div>

                        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="space-y-2">
                                        <p>
                                            This action cannot be undone. This will permanently delete your account
                                            and all associated data from our servers.
                                        </p>
                                        <p className="font-medium text-destructive">
                                            You will lose access to all your data, projects, and settings immediately.
                                        </p>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting || !confirmationToken.trim()}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {isDeleting ? "Deleting Account..." : "Yes, Delete My Account"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={!confirmationToken.trim() || isDeleting}
                            className="w-full"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {isDeleting ? "Deleting..." : "Delete Account"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

