"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
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
import { TestimonialForm } from "@/components/features/portfolio/testimonials/testimonial-form"
import { TestimonialTable } from "@/components/features/portfolio/testimonials/testimonial-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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
  const [search, setSearch] = useState("")
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "non-featured">("all")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)

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

  const handleDelete = async (testimonial: Testimonial) => {
    try {
      await deleteTestimonial(testimonial.id)
      setTestimonials((prev) => prev.filter((t) => t.id !== testimonial.id))
      toast.success("Testimonial deleted")
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete testimonial. Please try again."
      toast.error(message)
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
        onDelete={handleDelete}
      />

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
    </div>
  )
}

