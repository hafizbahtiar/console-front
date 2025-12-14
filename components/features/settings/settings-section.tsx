"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SettingsSectionProps {
    /** Section title */
    title: string
    /** Section description */
    description?: string
    /** Section content */
    children: React.ReactNode
    /** Additional className */
    className?: string
    /** Whether to show a separator after the section */
    separator?: boolean
}

/**
 * SettingsSection - A reusable component for grouping related settings
 * 
 * @example
 * ```tsx
 * <SettingsSection
 *   title="Appearance"
 *   description="Customize the look and feel"
 * >
 *   <YourSettingsContent />
 * </SettingsSection>
 * ```
 */
export function SettingsSection({
    title,
    description,
    children,
    className,
    separator = false,
}: SettingsSectionProps) {
    return (
        <div className={cn("space-y-4", separator && "pb-6 border-b", className)}>
            <div>
                <h3 className="text-lg font-medium">{title}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </div>
    )
}

