"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SettingsActionButtonsProps {
    /** Save button text */
    saveText?: string
    /** Cancel button text */
    cancelText?: string
    /** Reset button text */
    resetText?: string
    /** Whether form is submitting */
    isSubmitting?: boolean
    /** Whether form is resetting */
    isResetting?: boolean
    /** Cancel button onClick handler */
    onCancel?: () => void
    /** Reset button onClick handler */
    onReset?: () => void
    /** Save button onClick handler (if not using form submit) */
    onSave?: () => void
    /** Whether to show cancel button */
    showCancel?: boolean
    /** Whether to show reset button */
    showReset?: boolean
    /** Additional className */
    className?: string
}

/**
 * SettingsActionButtons - Reusable action buttons for settings pages
 * 
 * @example
 * ```tsx
 * <SettingsActionButtons
 *   onCancel={() => reset()}
 *   onReset={handleReset}
 *   isSubmitting={isSubmitting}
 *   isResetting={isResetting}
 * />
 * ```
 */
export function SettingsActionButtons({
    saveText = "Save Changes",
    cancelText = "Cancel",
    resetText = "Reset to Defaults",
    isSubmitting = false,
    isResetting = false,
    onCancel,
    onReset,
    onSave,
    showCancel = true,
    showReset = false,
    className,
}: SettingsActionButtonsProps) {
    return (
        <div className={cn("flex justify-end gap-3 pt-4 border-t", className)}>
            {showReset && onReset && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onReset}
                    disabled={isSubmitting || isResetting}
                >
                    {isResetting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting...
                        </>
                    ) : (
                        resetText
                    )}
                </Button>
            )}
            {showCancel && onCancel && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting || isResetting}
                >
                    {cancelText}
                </Button>
            )}
            {onSave ? (
                <Button
                    type="button"
                    onClick={onSave}
                    disabled={isSubmitting || isResetting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        saveText
                    )}
                </Button>
            ) : (
                <Button
                    type="submit"
                    disabled={isSubmitting || isResetting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        saveText
                    )}
                </Button>
            )}
        </div>
    )
}

