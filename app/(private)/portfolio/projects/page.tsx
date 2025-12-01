"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    reorderProjects,
    type Project,
} from "@/lib/api/portfolio"
import { ApiClientError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { ProjectForm } from "@/components/features/portfolio/projects/project-form"
import { ProjectTable } from "@/components/features/portfolio/projects/project-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function PortfolioProjectsPage() {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    const [projects, setProjects] = useState<Project[]>([])
    const [pagination, setPagination] = useState<{
        page: number
        limit: number
        total: number
        totalPages: number
        hasNextPage: boolean
        hasPreviousPage: boolean
    }>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    })
    const [isFetching, setIsFetching] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [search, setSearch] = useState("")
    const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "non-featured">("all")
    const [technologyFilter, setTechnologyFilter] = useState<string>("all")
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        if (isAuthenticated) {
            void fetchProjects()
        }
    }, [isAuthenticated, page])

  const fetchProjects = async () => {
    setIsFetching(true)
    try {
      const response = await getProjects({ page, limit: pageSize })

      setProjects(response.data)
      setPagination(response.pagination)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to load projects. Please try again."
      toast.error(message)
    } finally {
      setIsFetching(false)
    }
  }

    const technologies = useMemo(() => {
        const set = new Set<string>()
        projects.forEach((project) => {
            project.technologies?.forEach((t) => set.add(t))
        })
        return Array.from(set).sort()
    }, [projects])

    const filteredProjects = useMemo(() => {
        let result = projects

        // Search
        if (search.trim()) {
            const term = search.toLowerCase()
            result = result.filter((project) => {
                return (
                    project.title.toLowerCase().includes(term) ||
                    (project.description && project.description.toLowerCase().includes(term)) ||
                    project.technologies?.some((t) => t.toLowerCase().includes(term)) ||
                    project.tags?.some((t) => t.toLowerCase().includes(term))
                )
            })
        }

        // Featured filter
        if (featuredFilter === "featured") {
            result = result.filter((p) => p.featured)
        } else if (featuredFilter === "non-featured") {
            result = result.filter((p) => !p.featured)
        }

        // Technology filter
        if (technologyFilter !== "all") {
            result = result.filter((p) =>
                p.technologies?.some((t) => t.toLowerCase() === technologyFilter.toLowerCase()),
            )
        }

        return result
    }, [projects, search, featuredFilter, technologyFilter])

    // Reset to first page when filters/search change
    useEffect(() => {
        setPage(1)
    }, [search, featuredFilter, technologyFilter])

    // Use server-side pagination data
    const total = pagination.total
    const pagedProjects = filteredProjects

    const handleCreate = async (values: any) => {
        setIsSubmitting(true)
        try {
            const created = await createProject(values)
            setProjects((prev) => [...prev, created].sort((a, b) => a.order - b.order))
            toast.success("Project created successfully")
            setIsDialogOpen(false)
            setEditingProject(null)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to create project. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (values: any) => {
        if (!editingProject) return
        setIsSubmitting(true)
        try {
            const updated = await updateProject(editingProject.id, values)
            setProjects((prev) =>
                prev
                    .map((p) => (p.id === updated.id ? updated : p))
                    .sort((a, b) => a.order - b.order),
            )
            toast.success("Project updated successfully")
            setIsDialogOpen(false)
            setEditingProject(null)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to update project. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (project: Project) => {
        try {
            await deleteProject(project.id)
            setProjects((prev) => prev.filter((p) => p.id !== project.id))
            toast.success("Project deleted")
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete project. Please try again."
            toast.error(message)
        }
    }

    const openCreateDialog = () => {
        setEditingProject(null)
        setIsDialogOpen(true)
    }

    const openEditDialog = (project: Project) => {
        setEditingProject(project)
        setIsDialogOpen(true)
    }

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            setEditingProject(null)
        }
        setIsDialogOpen(open)
    }

    const onSubmit = async (values: any) => {
        if (editingProject) {
            await handleUpdate(values)
        } else {
            await handleCreate(values)
        }
    }

    if (!isAuthenticated && !isLoading) {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-semibold">Portfolio Projects</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage the projects that appear on your public portfolio.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => void fetchProjects()}
                        disabled={isFetching}
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </Button>
                    <Button type="button" onClick={openCreateDialog}>
                        <Plus className="w-4 h-4 mr-1" />
                        New project
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Featured</Label>
                        <Select
                            value={featuredFilter}
                            onValueChange={(value) =>
                                setFeaturedFilter(value as "all" | "featured" | "non-featured")
                            }
                        >
                            <SelectTrigger className="h-8 px-2 text-xs min-w-[140px]">
                                <SelectValue placeholder="Featured filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All projects</SelectItem>
                                <SelectItem value="featured">Featured only</SelectItem>
                                <SelectItem value="non-featured">Non-featured</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Technology</Label>
                        <Select
                            value={technologyFilter}
                            onValueChange={(value) => setTechnologyFilter(value)}
                        >
                            <SelectTrigger className="h-8 px-2 text-xs min-w-[160px]">
                                <SelectValue placeholder="All technologies" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All technologies</SelectItem>
                                {technologies.map((tech) => (
                                    <SelectItem key={tech} value={tech}>
                                        {tech}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <ProjectTable
                projects={pagedProjects}
                page={pagination.page}
                pageSize={pagination.limit}
                total={pagination.total}
                pagination={pagination}
                onPageChange={setPage}
                search={search}
                onSearchChange={setSearch}
                isLoading={isFetching}
                onEdit={openEditDialog}
                onDelete={handleDelete}
            />

            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProject ? "Edit project" : "New project"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingProject
                                ? "Update your project details."
                                : "Create a new project to display on your portfolio."}
                        </DialogDescription>
                    </DialogHeader>

                    <ProjectForm
                        initialValues={editingProject || undefined}
                        onSubmit={onSubmit}
                        onCancel={() => handleDialogClose(false)}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}


