"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AppHeader } from "@/components/layout/private/app-header"
import { AdminNav } from "@/components/layout/admin/admin-nav"
import { Separator } from "@/components/ui/separator"

export default function AdminLayout({
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
            {/* Admin Navigation Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <AdminNav onLinkClick={() => setMobileNavOpen(false)} />
            </aside>

            <Separator orientation="vertical" className="hidden md:block h-auto" />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}

