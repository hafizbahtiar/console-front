"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SettingsPageHeaderProps {
    /** Page title */
    title: string
    /** Page description */
    description?: string
    /** Additional className */
    className?: string
}

/**
 * SettingsPageHeader - A reusable header component for settings pages
 * 
 * @example
 * ```tsx
 * <SettingsPageHeader
 *   title="Profile Settings"
 *   description="Update your personal information"
 * />
 * ```
 */
export function SettingsPageHeader({
    title,
    description,
    className,
}: SettingsPageHeaderProps) {
    return (
        <div className={cn("space-y-1", className)}>
            <h2 className="text-2xl font-semibold">{title}</h2>
            {description && (
                <p className="text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    )
}

