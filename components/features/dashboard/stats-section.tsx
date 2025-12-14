"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Briefcase, Code, CalendarDays, FileText } from "lucide-react"
import { getProjects, getSkills, getExperiences, getBlogs, type Skill, type GroupedSkills } from "@/lib/api/portfolio"
import { ApiClientError } from "@/lib/api-client"
import { toast } from "sonner"

interface PortfolioStats {
    projects: number
    skills: number
    experiences: number
    blogPosts: number
}

export function StatsSection() {
    const { user } = useAuth()
    const [stats, setStats] = useState<PortfolioStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            if (!user || user.role !== "owner") {
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                const [projectsResult, skillsResult, experiencesResult, blogsResult] = await Promise.allSettled([
                    getProjects({ limit: 1 }),
                    getSkills(false), // Get flat array, not grouped
                    getExperiences({ limit: 1 }),
                    getBlogs({ limit: 1 }),
                ])

                // Helper to get skills count
                const getSkillsCount = (result: PromiseSettledResult<Skill[] | GroupedSkills>): number => {
                    if (result.status !== 'fulfilled') return 0
                    const value = result.value
                    if (Array.isArray(value)) {
                        return value.length
                    }
                    // If grouped, count all skills across categories
                    return Object.values(value).reduce((total, skills) => total + skills.length, 0)
                }

                const portfolioStats: PortfolioStats = {
                    projects: projectsResult.status === 'fulfilled' ? projectsResult.value.pagination.total : 0,
                    skills: getSkillsCount(skillsResult),
                    experiences: experiencesResult.status === 'fulfilled' ? experiencesResult.value.pagination.total : 0,
                    blogPosts: blogsResult.status === 'fulfilled' ? blogsResult.value.pagination.total : 0,
                }

                setStats(portfolioStats)
            } catch (error) {
                console.error("Failed to fetch portfolio stats:", error)
                // Don't show error toast for stats - it's not critical
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, [user])

    // For non-owners, show general stats or welcome message
    if (!user || user.role !== "owner") {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Active</div>
                        <p className="text-xs text-muted-foreground">
                            Your account is active
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const statsData = [
        {
            title: "Projects",
            value: stats?.projects?.toString() || "0",
            description: "Total projects",
            icon: Briefcase,
        },
        {
            title: "Skills",
            value: stats?.skills?.toString() || "0",
            description: "Total skills",
            icon: Code,
        },
        {
            title: "Experiences",
            value: stats?.experiences?.toString() || "0",
            description: "Work experiences",
            icon: CalendarDays,
        },
        {
            title: "Blog Posts",
            value: stats?.blogPosts?.toString() || "0",
            description: "Published posts",
            icon: FileText,
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat) => {
                const Icon = stat.icon
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <>
                                    <Skeleton className="h-8 w-16 mb-2" />
                                    <Skeleton className="h-3 w-24" />
                                </>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stat.description}
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

