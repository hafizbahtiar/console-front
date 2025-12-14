"use client"

import * as React from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./alert-dialog"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface ConfirmDialogProps {
    /** Whether the dialog is open */
    open: boolean
    /** Callback when open state changes */
    onOpenChange: (open: boolean) => void
    /** Dialog title */
    title: string
    /** Dialog description */
    description: string
    /** Confirm button text */
    confirmText?: string
    /** Cancel button text */
    cancelText?: string
    /** Confirm button variant */
    confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    /** Whether the action is in progress */
    isLoading?: boolean
    /** Callback when confirmed */
    onConfirm: () => void | Promise<void>
    /** Additional className */
    className?: string
}

/**
 * Reusable confirmation dialog component
 * 
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={showDeleteDialog}
 *   onOpenChange={setShowDeleteDialog}
 *   title="Delete Project"
 *   description="Are you sure you want to delete this project? This action cannot be undone."
 *   confirmText="Delete"
 *   confirmVariant="destructive"
 *   isLoading={isDeleting}
 *   onConfirm={handleDelete}
 * />
 * ```
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "default",
    isLoading = false,
    onConfirm,
    className,
}: ConfirmDialogProps) {
    const handleConfirm = async () => {
        await onConfirm()
        onOpenChange(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className={className}>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={cn(
                            confirmVariant === "destructive" &&
                            "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        )}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

