"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    BarChart3,
    Activity,
    Clock,
    Server,
    Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

type MenuItem = {
    title: string
    url: string
    icon: React.ComponentType<{ className?: string }>
}

const adminMenuItems: MenuItem[] = [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Queues", url: "/admin/queues", icon: BarChart3 },
    { title: "Health", url: "/admin/health", icon: Activity },
    { title: "Cron Jobs", url: "/admin/cron-jobs", icon: Clock },
    { title: "Metrics", url: "/admin/metrics", icon: Server },
]

export function AdminNav({ onLinkClick }: { onLinkClick?: () => void }) {
    const pathname = usePathname()

    // Helper function to check if a menu item is active
    const isActive = (url: string): boolean => {
        // Exact match
        if (pathname === url) return true

        // For dashboard, only match exactly (not sub-pages)
        if (url === "/admin/dashboard") {
            return pathname === "/admin/dashboard"
        }

        // For other routes, check if pathname starts with the menu URL
        return pathname.startsWith(url + "/") || pathname === url
    }

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="px-2 py-4">
                    <h2 className="text-lg font-semibold">Admin Panel</h2>
                    <p className="text-sm text-muted-foreground">
                        System monitoring & management
                    </p>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {adminMenuItems.map((item) => {
                                const Icon = item.icon
                                const active = isActive(item.url)
                                return (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                        >
                                            <Link
                                                href={item.url}
                                                onClick={onLinkClick}
                                            >
                                                <Icon className="mr-2 h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

