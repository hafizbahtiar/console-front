"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw, List, Table2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    reorderProjects,
    bulkDeleteProjects,
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ProjectForm } from "@/components/features/portfolio/projects/project-form"
import { ProjectTable } from "@/components/features/portfolio/projects/project-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DragDropList } from "@/components/ui/drag-drop-list"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    const [isDeleting, setIsDeleting] = useState(false)
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)
    const [search, setSearch] = useState("")
    const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "non-featured">("all")
    const [technologyFilter, setTechnologyFilter] = useState<string>("all")
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
    const [selectedProjects, setSelectedProjects] = useState<Project[]>([])
    const [viewMode, setViewMode] = useState<"table" | "reorder">("table")
    const [isReordering, setIsReordering] = useState(false)

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

    const handleDeleteClick = (project: Project) => {
        setProjectToDelete(project)
        setShowDeleteDialog(true)
    }

    const handleDeleteConfirm = async () => {
        if (!projectToDelete) return
        setIsDeleting(true)
        try {
            await deleteProject(projectToDelete.id)
            setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id))
            toast.success("Project deleted successfully")
            setProjectToDelete(null)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete project. Please try again."
            toast.error(message)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleBulkDeleteClick = (projects: Project[]) => {
        setSelectedProjects(projects)
        setShowBulkDeleteDialog(true)
    }

    const handleBulkDeleteConfirm = async () => {
        if (selectedProjects.length === 0) return
        setIsBulkDeleting(true)
        try {
            const ids = selectedProjects.map((p) => p.id)
            // Try bulk delete first, fallback to individual deletes if endpoint doesn't exist
            try {
                const result = await bulkDeleteProjects(ids)
                if (result.failedIds.length > 0) {
                    toast.warning(
                        `Deleted ${result.deletedCount} projects. ${result.failedIds.length} failed.`
                    )
                } else {
                    toast.success(`Successfully deleted ${result.deletedCount} project(s)`)
                }
                setProjects((prev) => prev.filter((p) => !ids.includes(p.id)))
            } catch (bulkError) {
                // Fallback to individual deletes if bulk endpoint doesn't exist
                const deletePromises = ids.map((id) => deleteProject(id))
                await Promise.all(deletePromises)
                setProjects((prev) => prev.filter((p) => !ids.includes(p.id)))
                toast.success(`Successfully deleted ${ids.length} project(s)`)
            }
            setSelectedProjects([])
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete projects. Please try again."
            toast.error(message)
        } finally {
            setIsBulkDeleting(false)
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

    const handleReorder = async (reorderedProjects: Project[]) => {
        setIsReordering(true)
        try {
            const projectIds = reorderedProjects.map((p) => p.id)
            await reorderProjects(projectIds)

            // Update local state with new order
            setProjects(reorderedProjects)
            toast.success("Projects reordered successfully")
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to reorder projects. Please try again."
            toast.error(message)
            // Refresh to get original order
            await fetchProjects()
        } finally {
            setIsReordering(false)
        }
    }

    // Get sorted projects for reorder view (all projects, sorted by order)
    const sortedProjectsForReorder = useMemo(() => {
        return [...projects].sort((a, b) => a.order - b.order)
    }, [projects])

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
                    <Button
                        type="button"
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                    >
                        <Table2 className="w-4 h-4 mr-1" />
                        Table
                    </Button>
                    <Button
                        type="button"
                        variant={viewMode === "reorder" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("reorder")}
                    >
                        <List className="w-4 h-4 mr-1" />
                        Reorder
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

            {viewMode === "table" ? (
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
                    onDelete={handleDeleteClick}
                    enableRowSelection={true}
                    onSelectionChange={setSelectedProjects}
                    onBulkDelete={handleBulkDeleteClick}
                />
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Drag and drop projects to reorder them. Changes are saved automatically.
                        </p>
                    </div>
                    <DragDropList
                        items={sortedProjectsForReorder}
                        getItemKey={(item) => item.id}
                        renderItem={(project) => (
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium">{project.title}</h4>
                                                {project.featured && (
                                                    <Badge variant="default" className="text-xs">
                                                        Featured
                                                    </Badge>
                                                )}
                                            </div>
                                            {project.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {project.description}
                                                </p>
                                            )}
                                            {project.technologies && project.technologies.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {project.technologies.slice(0, 3).map((tech) => (
                                                        <Badge key={tech} variant="outline" className="text-xs">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                    {project.technologies.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{project.technologies.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <span className="text-xs text-muted-foreground">
                                                Order: {project.order}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setViewMode("table")
                                                    openEditDialog(project)
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        onReorder={handleReorder}
                        disabled={isReordering}
                        direction="vertical"
                        className="space-y-2"
                    />
                    {isReordering && (
                        <p className="text-sm text-muted-foreground text-center">
                            Saving new order...
                        </p>
                    )}
                </div>
            )}

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

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Delete Project"
                description={`Are you sure you want to delete "${projectToDelete?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="destructive"
                isLoading={isDeleting}
                onConfirm={handleDeleteConfirm}
            />

            {/* Bulk Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showBulkDeleteDialog}
                onOpenChange={setShowBulkDeleteDialog}
                title="Delete Multiple Projects"
                description={`Are you sure you want to delete ${selectedProjects.length} selected project(s)? This action cannot be undone.`}
                confirmText={`Delete ${selectedProjects.length} Project(s)`}
                confirmVariant="destructive"
                isLoading={isBulkDeleting}
                onConfirm={handleBulkDeleteConfirm}
            />
        </div>
    )
}


