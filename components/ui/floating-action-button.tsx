"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

interface FloatingActionButtonProps {
    onClick: () => void
    icon?: React.ReactNode
    label?: string
    className?: string
    disabled?: boolean
}

/**
 * Floating Action Button (FAB) Component
 * 
 * A floating button that appears in the bottom-right corner of the screen.
 * Typically used for primary actions like "Add" or "Create".
 */
export function FloatingActionButton({
    onClick,
    icon = <Plus className="h-5 w-5" />,
    label,
    className,
    disabled = false,
}: FloatingActionButtonProps) {
    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button
                onClick={onClick}
                disabled={disabled}
                size="lg"
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200",
                    "flex items-center justify-center",
                    label && "w-auto px-6 gap-2",
                    className
                )}
            >
                {icon}
                {label && <span className="font-medium">{label}</span>}
            </Button>
        </div>
    )
}

