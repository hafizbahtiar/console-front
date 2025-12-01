"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Map path segments to readable labels
const pathLabels: Record<string, string> = {
    dashboard: "Dashboard",
    settings: "Settings",
    profile: "Profile",
    notifications: "Notifications",
    preferences: "Preferences",
    security: "Security",
    sessions: "Sessions",
    account: "Account",
    projects: "Projects",
    companies: "Companies",
    skills: "Skills",
    experiences: "Experiences",
    education: "Education",
    certifications: "Certifications",
    blog: "Blog",
    testimonials: "Testimonials",
    contacts: "Contacts",
    admin: "Admin",
    queues: "Queues",
    health: "Health",
    "cron-jobs": "Cron Jobs",
    metrics: "Metrics",
    inbox: "Inbox",
    calendar: "Calendar",
    search: "Search",
}

// Helper function to format segment labels
function formatLabel(segment: string): string {
    // Check if we have a label mapping
    if (pathLabels[segment]) {
        return pathLabels[segment]
    }

    // Convert kebab-case or snake_case to Title Case
    return segment
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
}

function generateBreadcrumbs(pathname: string) {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs = []

    // Handle root path
    if (segments.length === 0) {
        return [{
            label: "Dashboard",
            href: "/dashboard",
            isActive: true,
        }]
    }

    // Always start with Dashboard for non-dashboard paths
    // If we're in settings or other sections, show Dashboard as first breadcrumb
    if (segments[0] !== "dashboard") {
        breadcrumbs.push({
            label: "Dashboard",
            href: "/dashboard",
            isActive: false,
        })
    }

    // Build breadcrumbs from path segments
    let currentPath = ""
    segments.forEach((segment, index) => {
        currentPath += `/${segment}`
        const isLast = index === segments.length - 1
        const label = formatLabel(segment)

        breadcrumbs.push({
            label,
            href: currentPath,
            isActive: isLast,
        })
    })

    return breadcrumbs
}

export function AppHeader() {
    const pathname = usePathname()
    const breadcrumbs = generateBreadcrumbs(pathname)

    return (
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger />
            <div className="flex flex-1 items-center gap-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={crumb.href}>
                                <BreadcrumbItem>
                                    {crumb.isActive ? (
                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={crumb.href}>{crumb.label}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    )
}

