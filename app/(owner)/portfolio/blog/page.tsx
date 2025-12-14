"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
    getBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    bulkDeleteBlogs,
    type Blog,
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
import { BlogForm } from "@/components/features/portfolio/blog/blog-form"
import { BlogTable } from "@/components/features/portfolio/blog/blog-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function PortfolioBlogPage() {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    const [blogs, setBlogs] = useState<Blog[]>([])
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
    const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null)
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
    const [selectedBlogs, setSelectedBlogs] = useState<Blog[]>([])

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        if (isAuthenticated) {
            void fetchBlogs()
        }
    }, [isAuthenticated, page])

    const fetchBlogs = async () => {
        setIsFetching(true)
        try {
            const response = await getBlogs({ page, limit: pageSize })
            setBlogs(response.data)
            setPagination(response.pagination)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to load blog posts. Please try again."
            toast.error(message)
        } finally {
            setIsFetching(false)
        }
    }

    const filteredBlogs = useMemo(() => {
        let result = blogs

        // Search
        if (search.trim()) {
            const term = search.toLowerCase()
            result = result.filter((blog) => {
                return (
                    blog.title.toLowerCase().includes(term) ||
                    (blog.excerpt && blog.excerpt.toLowerCase().includes(term)) ||
                    blog.content.toLowerCase().includes(term) ||
                    blog.tags?.some((t) => t.toLowerCase().includes(term))
                )
            })
        }

        // Status filter
        if (statusFilter === "published") {
            result = result.filter((b) => b.published)
        } else if (statusFilter === "draft") {
            result = result.filter((b) => !b.published)
        }

        return result
    }, [blogs, search, statusFilter])

    // Reset page on filter/search change
    useEffect(() => {
        setPage(1)
    }, [search, statusFilter])

    // Use server-side pagination data
    const total = pagination.total
    const pagedBlogs = filteredBlogs

    const handleCreate = async (values: any) => {
        setIsSubmitting(true)
        try {
            const created = await createBlog(values)
            setBlogs((prev) => [created, ...prev])
            toast.success("Blog post created successfully")
            setIsDialogOpen(false)
            setEditingBlog(null)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to create blog post. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (values: any) => {
        if (!editingBlog) return
        setIsSubmitting(true)
        try {
            const updated = await updateBlog(editingBlog.id, values)
            setBlogs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
            toast.success("Blog post updated successfully")
            setIsDialogOpen(false)
            setEditingBlog(null)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to update blog post. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteClick = (blog: Blog) => {
        setBlogToDelete(blog)
        setShowDeleteDialog(true)
    }

    const handleDeleteConfirm = async () => {
        if (!blogToDelete) return
        setIsDeleting(true)
        try {
            await deleteBlog(blogToDelete.id)
            setBlogs((prev) => prev.filter((b) => b.id !== blogToDelete.id))
            toast.success("Blog post deleted successfully")
            setBlogToDelete(null)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete blog post. Please try again."
            toast.error(message)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleBulkDeleteClick = (blogs: Blog[]) => {
        setSelectedBlogs(blogs)
        setShowBulkDeleteDialog(true)
    }

    const handleBulkDeleteConfirm = async () => {
        if (selectedBlogs.length === 0) return
        setIsBulkDeleting(true)
        try {
            const ids = selectedBlogs.map((b) => b.id)
            // Try bulk delete first, fallback to individual deletes if endpoint doesn't exist
            try {
                const result = await bulkDeleteBlogs(ids)
                if (result.failedIds.length > 0) {
                    toast.warning(
                        `Deleted ${result.deletedCount} blog post(s). ${result.failedIds.length} failed.`
                    )
                } else {
                    toast.success(`Successfully deleted ${result.deletedCount} blog post(s)`)
                }
                setBlogs((prev) => prev.filter((b) => !ids.includes(b.id)))
            } catch (bulkError) {
                // Fallback to individual deletes if bulk endpoint doesn't exist
                const deletePromises = ids.map((id) => deleteBlog(id))
                await Promise.all(deletePromises)
                setBlogs((prev) => prev.filter((b) => !ids.includes(b.id)))
                toast.success(`Successfully deleted ${ids.length} blog post(s)`)
            }
            setSelectedBlogs([])
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete blog posts. Please try again."
            toast.error(message)
        } finally {
            setIsBulkDeleting(false)
        }
    }

    const openCreateDialog = () => {
        setEditingBlog(null)
        setIsDialogOpen(true)
    }

    const openEditDialog = (blog: Blog) => {
        setEditingBlog(blog)
        setIsDialogOpen(true)
    }

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            setEditingBlog(null)
        }
        setIsDialogOpen(open)
    }

    const onSubmit = async (values: any) => {
        if (editingBlog) {
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
                    <h2 className="text-2xl font-semibold">Portfolio Blog</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your blog posts and articles.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => void fetchBlogs()}
                        disabled={isFetching}
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </Button>
                    <Button type="button" onClick={openCreateDialog}>
                        <Plus className="w-4 h-4 mr-1" />
                        New post
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as "all" | "published" | "draft")}
                        >
                            <SelectTrigger className="h-8 px-2 text-xs min-w-[140px]">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All posts</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <BlogTable
                blogs={pagedBlogs}
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                search={search}
                onSearchChange={setSearch}
                isLoading={isFetching}
                onEdit={openEditDialog}
                onDelete={handleDeleteClick}
                enableRowSelection={true}
                onSelectionChange={setSelectedBlogs}
                onBulkDelete={handleBulkDeleteClick}
            />

            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingBlog ? "Edit blog post" : "New blog post"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingBlog
                                ? "Update your blog post content and settings."
                                : "Create a new blog post or article."}
                        </DialogDescription>
                    </DialogHeader>

                    <BlogForm
                        initialValues={editingBlog || undefined}
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
                title="Delete Blog Post"
                description={`Are you sure you want to delete "${blogToDelete?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="destructive"
                isLoading={isDeleting}
                onConfirm={handleDeleteConfirm}
            />

            {/* Bulk Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showBulkDeleteDialog}
                onOpenChange={setShowBulkDeleteDialog}
                title="Delete Multiple Blog Posts"
                description={`Are you sure you want to delete ${selectedBlogs.length} selected blog post(s)? This action cannot be undone.`}
                confirmText={`Delete ${selectedBlogs.length} Post(s)`}
                confirmVariant="destructive"
                isLoading={isBulkDeleting}
                onConfirm={handleBulkDeleteConfirm}
            />
        </div>
    )
}

