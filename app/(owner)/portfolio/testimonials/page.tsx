"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw, List, Table2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  bulkDeleteTestimonials,
  reorderTestimonials,
  type Testimonial,
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
import { TestimonialForm } from "@/components/features/portfolio/testimonials/testimonial-form"
import { TestimonialTable } from "@/components/features/portfolio/testimonials/testimonial-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DragDropList } from "@/components/ui/drag-drop-list"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { toast } from "sonner"

export default function PortfolioTestimonialsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
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
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [selectedTestimonials, setSelectedTestimonials] = useState<Testimonial[]>([])
  const [viewMode, setViewMode] = useState<"table" | "reorder">("table")
  const [isReordering, setIsReordering] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      void fetchTestimonials()
    }
  }, [isAuthenticated, page])

  const fetchTestimonials = async () => {
    setIsFetching(true)
    try {
      const response = await getTestimonials({ page, limit: pageSize })
      setTestimonials(response.data.sort((a, b) => a.order - b.order))
      setPagination(response.pagination)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to load testimonials. Please try again."
      toast.error(message)
    } finally {
      setIsFetching(false)
    }
  }

  const filteredTestimonials = useMemo(() => {
    let result = testimonials

    // Search
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter((testimonial) => {
        return (
          testimonial.name.toLowerCase().includes(term) ||
          (testimonial.role && testimonial.role.toLowerCase().includes(term)) ||
          (testimonial.company && testimonial.company.toLowerCase().includes(term)) ||
          testimonial.content.toLowerCase().includes(term)
        )
      })
    }

    // Featured filter
    if (featuredFilter === "featured") {
      result = result.filter((t) => t.featured)
    } else if (featuredFilter === "non-featured") {
      result = result.filter((t) => !t.featured)
    }

    return result
  }, [testimonials, search, featuredFilter])

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1)
  }, [search, featuredFilter])

  // Use server-side pagination data
  const total = pagination.total
  const pagedTestimonials = filteredTestimonials

  const handleCreate = async (values: any) => {
    setIsSubmitting(true)
    try {
      const maxOrder = testimonials.length > 0 ? Math.max(...testimonials.map((t) => t.order)) : -1
      const created = await createTestimonial({ ...values, order: maxOrder + 1 })
      setTestimonials((prev) => [...prev, created].sort((a, b) => a.order - b.order))
      toast.success("Testimonial created successfully")
      setIsDialogOpen(false)
      setEditingTestimonial(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to create testimonial. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (values: any) => {
    if (!editingTestimonial) return
    setIsSubmitting(true)
    try {
      const updated = await updateTestimonial(editingTestimonial.id, values)
      setTestimonials((prev) =>
        prev
          .map((t) => (t.id === updated.id ? updated : t))
          .sort((a, b) => a.order - b.order),
      )
      toast.success("Testimonial updated successfully")
      setIsDialogOpen(false)
      setEditingTestimonial(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to update testimonial. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!testimonialToDelete) return
    setIsDeleting(true)
    try {
      await deleteTestimonial(testimonialToDelete.id)
      setTestimonials((prev) => prev.filter((t) => t.id !== testimonialToDelete.id))
      toast.success("Testimonial deleted successfully")
      setTestimonialToDelete(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete testimonial. Please try again."
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDeleteClick = (testimonials: Testimonial[]) => {
    setSelectedTestimonials(testimonials)
    setShowBulkDeleteDialog(true)
  }

  const handleBulkDeleteConfirm = async () => {
    if (selectedTestimonials.length === 0) return
    setIsBulkDeleting(true)
    try {
      const ids = selectedTestimonials.map((t) => t.id)
      // Try bulk delete first, fallback to individual deletes if endpoint doesn't exist
      try {
        const result = await bulkDeleteTestimonials(ids)
        if (result.failedIds.length > 0) {
          toast.warning(
            `Deleted ${result.deletedCount} testimonial(s). ${result.failedIds.length} failed.`
          )
        } else {
          toast.success(`Successfully deleted ${result.deletedCount} testimonial(s)`)
        }
        setTestimonials((prev) => prev.filter((t) => !ids.includes(t.id)))
      } catch (bulkError) {
        // Fallback to individual deletes if bulk endpoint doesn't exist
        const deletePromises = ids.map((id) => deleteTestimonial(id))
        await Promise.all(deletePromises)
        setTestimonials((prev) => prev.filter((t) => !ids.includes(t.id)))
        toast.success(`Successfully deleted ${ids.length} testimonial(s)`)
      }
      setSelectedTestimonials([])
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete testimonials. Please try again."
      toast.error(message)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const openCreateDialog = () => {
    setEditingTestimonial(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingTestimonial(null)
    }
    setIsDialogOpen(open)
  }

  const onSubmit = async (values: any) => {
    if (editingTestimonial) {
      await handleUpdate(values)
    } else {
      await handleCreate(values)
    }
  }

  const handleReorder = async (reorderedTestimonials: Testimonial[]) => {
    setIsReordering(true)
    try {
      const testimonialIds = reorderedTestimonials.map((t) => t.id)
      await reorderTestimonials(testimonialIds)

      // Update local state with new order
      setTestimonials(reorderedTestimonials)
      toast.success("Testimonials reordered successfully")
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to reorder testimonials. Please try again."
      toast.error(message)
      // Refresh to get original order
      await fetchTestimonials()
    } finally {
      setIsReordering(false)
    }
  }

  // Get sorted testimonials for reorder view (all testimonials, sorted by order)
  const sortedTestimonialsForReorder = useMemo(() => {
    return [...testimonials].sort((a, b) => a.order - b.order)
  }, [testimonials])

  if (!isAuthenticated && !isLoading) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Portfolio Testimonials</h2>
          <p className="text-sm text-muted-foreground">
            Manage testimonials from your clients and colleagues.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => void fetchTestimonials()}
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
            New testimonial
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
                <SelectItem value="all">All testimonials</SelectItem>
                <SelectItem value="featured">Featured only</SelectItem>
                <SelectItem value="non-featured">Non-featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <TestimonialTable
          testimonials={pagedTestimonials}
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
          onSelectionChange={setSelectedTestimonials}
          onBulkDelete={handleBulkDeleteClick}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Drag and drop testimonials to reorder them. Changes are saved automatically.
            </p>
          </div>
          <DragDropList
            items={sortedTestimonialsForReorder}
            getItemKey={(item) => item.id}
            renderItem={(testimonial) => (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{testimonial.name}</h4>
                        {testimonial.featured && (
                          <Badge variant="default" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      {(testimonial.role || testimonial.company) && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {[testimonial.role, testimonial.company].filter(Boolean).join(" • ")}
                        </p>
                      )}
                      <p className="text-sm line-clamp-3">{testimonial.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Order: {testimonial.order}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewMode("table")
                          openEditDialog(testimonial)
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
              {editingTestimonial ? "Edit testimonial" : "New testimonial"}
            </DialogTitle>
            <DialogDescription>
              {editingTestimonial
                ? "Update testimonial details."
                : "Add a new testimonial from a client or colleague."}
            </DialogDescription>
          </DialogHeader>

          <TestimonialForm
            initialValues={editingTestimonial || undefined}
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
        title="Delete Testimonial"
        description={`Are you sure you want to delete the testimonial from "${testimonialToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        title="Delete Multiple Testimonials"
        description={`Are you sure you want to delete ${selectedTestimonials.length} selected testimonial(s)? This action cannot be undone.`}
        confirmText={`Delete ${selectedTestimonials.length} Testimonial(s)`}
        confirmVariant="destructive"
        isLoading={isBulkDeleting}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  )
}

