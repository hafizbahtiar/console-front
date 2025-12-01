"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
    ChevronUp,
    Home,
    Settings,
    User2,
    LogOut,
    Briefcase,
    Code,
    CalendarDays,
    GraduationCap,
    Award,
    FileText,
    MessageSquare,
    Link2,
    UserCircle,
    Shield,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Types
type MenuItem = {
    title: string
    url: string
    icon: React.ComponentType<{ className?: string }>
    badge?: number
}

// Data
const mainMenuItems: MenuItem[] = [
    { title: "Home", url: "/dashboard", icon: Home },
]

const portfolioMenuItems: MenuItem[] = [
    { title: "Profile", url: "/portfolio/profile", icon: UserCircle },
    { title: "Projects", url: "/portfolio/projects", icon: Briefcase },
    { title: "Companies", url: "/portfolio/companies", icon: Briefcase },
    { title: "Skills", url: "/portfolio/skills", icon: Code },
    { title: "Experiences", url: "/portfolio/experiences", icon: CalendarDays },
    { title: "Education", url: "/portfolio/education", icon: GraduationCap },
    { title: "Certifications", url: "/portfolio/certifications", icon: Award },
    { title: "Blog", url: "/portfolio/blog", icon: FileText },
    { title: "Testimonials", url: "/portfolio/testimonials", icon: MessageSquare },
    { title: "Contacts", url: "/portfolio/contacts", icon: Link2 },
]

export function AppSidebar() {
    const { user, logout } = useAuth()
    const pathname = usePathname()

    const currentUser = {
        name: user?.displayName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
        email: user?.email || "",
    }

    const handleLogout = () => {
        logout()
    }

    // Helper function to check if a menu item is active
    const isActive = (url: string): boolean => {
        // Exact match
        if (pathname === url) return true

        // For dashboard, only match exactly (not sub-pages)
        if (url === "/dashboard") {
            return pathname === "/dashboard"
        }

        // For other routes, check if pathname starts with the menu URL
        // This handles sub-pages like /settings/profile, /settings/security, etc.
        return pathname.startsWith(url + "/") || pathname === url
    }

    // Add Settings and Admin to menu if user is owner
    const menuItems: MenuItem[] = user?.role === "owner"
        ? [
            ...mainMenuItems,
            { title: "Settings", url: "/settings", icon: Settings },
            { title: "Admin", url: "/admin/dashboard", icon: Shield },
        ]
        : mainMenuItems

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="font-semibold">
                            Console
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    {item.badge && (
                                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Portfolio Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Portfolio</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {portfolioMenuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    {item.badge && (
                                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="group/trigger data-[state=open]:bg-sidebar-accent">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                                        <User2 className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 leading-none">
                                        <span className="font-medium">{currentUser.name}</span>
                                        <span className="text-xs text-sidebar-foreground/70">
                                            {currentUser.email}
                                        </span>
                                    </div>
                                    <ChevronUp className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/trigger:rotate-180" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="!w-[var(--radix-popper-anchor-width)]"
                                align="end"
                                sideOffset={4}
                            >
                                <div className="px-2 py-2">
                                    <DropdownMenuLabel className="px-0 py-1.5 text-xs font-semibold text-muted-foreground">
                                        Account
                                    </DropdownMenuLabel>
                                    <div className="flex items-center gap-3 rounded-md px-2 py-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                            <User2 className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium">
                                                {currentUser.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {currentUser.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                {user?.role === "owner" && (
                                    <DropdownMenuItem
                                        asChild
                                        className={cn(
                                            "cursor-pointer px-2 py-2 focus:bg-accent",
                                            pathname.startsWith("/settings") && "bg-accent font-medium"
                                        )}
                                    >
                                        <Link href="/settings" className="flex items-center">
                                            <Settings className="h-4 w-4 text-muted-foreground" />
                                            <span>Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer px-2 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}