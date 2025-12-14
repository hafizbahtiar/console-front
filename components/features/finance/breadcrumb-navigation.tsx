"use client"

import { useRouter } from "next/navigation"
import {
    Breadcrumb,
    BreadcrumbItem as UIBreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbNavItem {
    label: string
    href?: string
    onClick?: () => void
}

interface BreadcrumbNavigationProps {
    items: BreadcrumbNavItem[]
    onBack?: () => void
    className?: string
}

export function BreadcrumbNavigation({ items, onBack, className }: BreadcrumbNavigationProps) {
    const router = useRouter()

    if (items.length === 0) return null

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {onBack && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="mr-2"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
            )}
            <Breadcrumb>
                <BreadcrumbList>
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1
                        return (
                            <div key={index} className="flex items-center">
                                {index > 0 && <BreadcrumbSeparator />}
                                <UIBreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                    ) : item.href ? (
                                        <BreadcrumbLink
                                            href={item.href}
                                            onClick={(e) => {
                                                if (item.onClick) {
                                                    e.preventDefault()
                                                    item.onClick()
                                                } else if (item.href) {
                                                    e.preventDefault()
                                                    router.push(item.href)
                                                }
                                            }}
                                        >
                                            {item.label}
                                        </BreadcrumbLink>
                                    ) : item.onClick ? (
                                        <BreadcrumbLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                item.onClick?.()
                                            }}
                                        >
                                            {item.label}
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                    )}
                                </UIBreadcrumbItem>
                            </div>
                        )
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    )
}

