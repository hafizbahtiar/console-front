"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    LayoutDashboard,
    BarChart3,
    Activity,
    Clock,
    Server,
    Menu,
} from "lucide-react"

const adminNavItems = [
    {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Queues",
        href: "/admin/queues",
        icon: BarChart3,
    },
    {
        title: "Health",
        href: "/admin/health",
        icon: Activity,
    },
    {
        title: "Cron Jobs",
        href: "/admin/cron-jobs",
        icon: Clock,
    },
    {
        title: "Metrics",
        href: "/admin/metrics",
        icon: Server,
    },
]

// Navigation component (reusable for desktop and mobile)
function AdminNav({ onLinkClick }: { onLinkClick?: () => void }) {
    const pathname = usePathname()

    // Helper function to check if a menu item is active
    const isActive = (href: string): boolean => {
        // Exact match
        if (pathname === href) return true

        // For dashboard, only match exactly (not sub-pages)
        if (href === "/admin/dashboard") {
            return pathname === "/admin/dashboard"
        }

        // For other routes, check if pathname starts with the menu URL
        return pathname.startsWith(href + "/") || pathname === href
    }

    return (
        <nav className="space-y-1">
            {adminNavItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onLinkClick}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            active
                                ? "bg-foreground text-background"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                    </Link>
                )
            })}
        </nav>
    )
}

/**
 * Admin Layout
 * 
 * This layout is nested within the owner layout, so owner role checking
 * is handled by the parent owner layout. This layout only handles the
 * admin-specific navigation (similar to settings layout).
 */
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    // Close mobile nav when pathname changes
    useEffect(() => {
        setMobileNavOpen(false)
    }, [pathname])

    return (
        <div className="flex flex-col md:flex-row h-full gap-4 md:gap-6">
            {/* Mobile Navigation Button */}
            <div className="flex md:hidden items-center justify-between">
                <h1 className="text-xl font-semibold">Admin</h1>
                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open admin menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <SheetHeader className="p-6 pb-4">
                            <SheetTitle>Admin Panel</SheetTitle>
                        </SheetHeader>
                        <div className="px-6">
                <AdminNav onLinkClick={() => setMobileNavOpen(false)} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Navigation - Fixed on left */}
            <aside className="hidden md:block w-64 flex-shrink-0">
                <AdminNav />
            </aside>

            {/* Separator - Hidden on mobile */}
            <Separator orientation="vertical" className="hidden md:block" />

            {/* Admin Content */}
            <div className="flex-1 min-w-0 w-full md:w-auto">
                    {children}
            </div>
        </div>
    )
}

