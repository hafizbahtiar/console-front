"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
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
    User,
    Bell,
    Settings as SettingsIcon,
    Shield,
    Monitor,
    Menu,
    UserCircle,
} from "lucide-react"

const settingsNavItems = [
    {
        title: "Profile",
        href: "/settings/profile",
        icon: User,
    },
    {
        title: "Account",
        href: "/settings/account",
        icon: UserCircle,
    },
    {
        title: "Notifications",
        href: "/settings/notifications",
        icon: Bell,
    },
    {
        title: "Preferences",
        href: "/settings/preferences",
        icon: SettingsIcon,
    },
    {
        title: "Security",
        href: "/settings/security",
        icon: Shield,
    },
    {
        title: "Sessions",
        href: "/settings/sessions",
        icon: Monitor,
    },
]

// Navigation component (reusable for desktop and mobile)
function SettingsNav({ onLinkClick }: { onLinkClick?: () => void }) {
    const pathname = usePathname()

    return (
        <nav className="space-y-1">
            {settingsNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onLinkClick}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive
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

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    useEffect(() => {
        if (!isLoading) {
            // Check if user is owner
            if (!user || user.role !== "owner") {
                router.push("/dashboard")
            }
        }
    }, [user, isLoading, router])

    // Close mobile nav when pathname changes
    useEffect(() => {
        setMobileNavOpen(false)
    }, [pathname])

    // Show loading or nothing while checking
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        )
    }

    // If not owner, don't render (redirect will happen)
    if (!user || user.role !== "owner") {
        return null
    }

    return (
        <div className="flex flex-col md:flex-row h-full gap-4 md:gap-6">
            {/* Mobile Navigation Button */}
            <div className="flex md:hidden items-center justify-between">
                <h1 className="text-xl font-semibold">Settings</h1>
                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open settings menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <SheetHeader className="p-6 pb-4">
                            <SheetTitle>Settings</SheetTitle>
                        </SheetHeader>
                        <div className="px-6">
                            <SettingsNav onLinkClick={() => setMobileNavOpen(false)} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Navigation - Fixed on left */}
            <aside className="hidden md:block w-64 flex-shrink-0">
                <SettingsNav />
            </aside>

            {/* Separator - Hidden on mobile */}
            <Separator orientation="vertical" className="hidden md:block" />

            {/* Settings Content */}
            <div className="flex-1 min-w-0 w-full md:w-auto">
                {children}
            </div>
        </div>
    )
}

