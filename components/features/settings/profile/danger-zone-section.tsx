"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface DangerZoneSectionProps {
    onDelete?: () => Promise<void>
}

export function DangerZoneSection({ onDelete }: DangerZoneSectionProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        try {
            if (onDelete) {
                await onDelete()
            } else {
                // TODO: Call API to delete account
                // await deleteAccount()
                toast.success("Account deletion request submitted. You will receive a confirmation email.")
            }
        } catch (error) {
            toast.error("Failed to submit deletion request. Please try again.")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-4 pt-8 border-t">
            <div>
                <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                    Irreversible and destructive actions
                </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/50">
                <div className="space-y-0.5">
                    <Label className="text-destructive">Delete Account</Label>
                    <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete
                                your account and all associated data from our servers. You will
                                lose access to all your data, projects, and settings.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteAccount}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {isDeleting ? "Deleting..." : "Delete Account"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}

