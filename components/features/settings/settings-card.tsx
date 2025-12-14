"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface SettingsCardProps {
    /** Card title */
    title: string
    /** Card description */
    description?: string
    /** Card content */
    children: React.ReactNode
    /** Optional icon to display next to the title */
    icon?: LucideIcon
    /** Additional className */
    className?: string
    /** Whether the card has a destructive/dangerous action */
    variant?: "default" | "destructive"
}

/**
 * SettingsCard - A reusable card component for settings pages
 * 
 * @example
 * ```tsx
 * <SettingsCard
 *   title="Account Information"
 *   description="Your account details"
 *   icon={UserIcon}
 * >
 *   <YourContent />
 * </SettingsCard>
 * ```
 */
export function SettingsCard({
    title,
    description,
    children,
    icon: Icon,
    className,
    variant = "default",
}: SettingsCardProps) {
    return (
        <Card className={cn(variant === "destructive" && "border-destructive", className)}>
            <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", variant === "destructive" && "text-destructive")}>
                    {Icon && <Icon className="h-5 w-5" />}
                    {title}
                </CardTitle>
                {description && (
                    <CardDescription>
                        {description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
}

