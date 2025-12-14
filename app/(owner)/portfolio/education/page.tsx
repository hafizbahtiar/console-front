"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  bulkDeleteEducation,
  type Education,
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
import { EducationForm } from "@/components/features/portfolio/education/education-form"
import { EducationTable } from "@/components/features/portfolio/education/education-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function PortfolioEducationPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [education, setEducation] = useState<Education[]>([])
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
  const [institutionFilter, setInstitutionFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEducation, setEditingEducation] = useState<Education | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [educationToDelete, setEducationToDelete] = useState<Education | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [selectedEducation, setSelectedEducation] = useState<Education[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      void fetchEducation()
    }
  }, [isAuthenticated, page])

  const fetchEducation = async () => {
    setIsFetching(true)
    try {
      const response = await getEducation({ page, limit: pageSize })
      setEducation(response.data)
      setPagination(response.pagination)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to load education. Please try again."
      toast.error(message)
    } finally {
      setIsFetching(false)
    }
  }

  const institutions = useMemo(() => {
    const set = new Set<string>()
    education.forEach((e) => {
      if (e.institution) set.add(e.institution)
    })
    return Array.from(set).sort()
  }, [education])

  const filteredEducation = useMemo(() => {
    let result = education

    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter((e) => {
        return (
          e.institution.toLowerCase().includes(term) ||
          (e.degree && e.degree.toLowerCase().includes(term)) ||
          (e.field && e.field.toLowerCase().includes(term))
        )
      })
    }

    if (institutionFilter !== "all") {
      result = result.filter(
        (e) => e.institution && e.institution.toLowerCase() === institutionFilter.toLowerCase(),
      )
    }

    return result
  }, [education, search, institutionFilter])

  useEffect(() => {
    setPage(1)
  }, [search, institutionFilter])

  // Use server-side pagination data
  const total = pagination.total
  const pagedEducation = filteredEducation

  const handleCreate = async (values: any) => {
    setIsSubmitting(true)
    try {
      const created = await createEducation(values)
      setEducation((prev) => [...prev, created])
      toast.success("Education created successfully")
      setIsDialogOpen(false)
      setEditingEducation(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to create education. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (values: any) => {
    if (!editingEducation) return
    setIsSubmitting(true)
    try {
      const updated = await updateEducation(editingEducation.id, values)
      setEducation((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
      toast.success("Education updated successfully")
      setIsDialogOpen(false)
      setEditingEducation(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to update education. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (item: Education) => {
    setEducationToDelete(item)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!educationToDelete) return
    setIsDeleting(true)
    try {
      await deleteEducation(educationToDelete.id)
      setEducation((prev) => prev.filter((e) => e.id !== educationToDelete.id))
      toast.success("Education deleted successfully")
      setEducationToDelete(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete education. Please try again."
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDeleteClick = (education: Education[]) => {
    setSelectedEducation(education)
    setShowBulkDeleteDialog(true)
  }

  const handleBulkDeleteConfirm = async () => {
    if (selectedEducation.length === 0) return
    setIsBulkDeleting(true)
    try {
      const ids = selectedEducation.map((e) => e.id)
      // Try bulk delete first, fallback to individual deletes if endpoint doesn't exist
      try {
        const result = await bulkDeleteEducation(ids)
        if (result.failedIds.length > 0) {
          toast.warning(
            `Deleted ${result.deletedCount} education entries. ${result.failedIds.length} failed.`
          )
        } else {
          toast.success(`Successfully deleted ${result.deletedCount} education entry(ies)`)
        }
        setEducation((prev) => prev.filter((e) => !ids.includes(e.id)))
      } catch (bulkError) {
        // Fallback to individual deletes if bulk endpoint doesn't exist
        const deletePromises = ids.map((id) => deleteEducation(id))
        await Promise.all(deletePromises)
        setEducation((prev) => prev.filter((e) => !ids.includes(e.id)))
        toast.success(`Successfully deleted ${ids.length} education entry(ies)`)
      }
      setSelectedEducation([])
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete education entries. Please try again."
      toast.error(message)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const openCreateDialog = () => {
    setEditingEducation(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (item: Education) => {
    setEditingEducation(item)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingEducation(null)
    }
    setIsDialogOpen(open)
  }

  const onSubmit = async (values: any) => {
    if (editingEducation) {
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
          <h2 className="text-2xl font-semibold">Portfolio Education</h2>
          <p className="text-sm text-muted-foreground">Manage your education history and coursework.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" onClick={() => void fetchEducation()} disabled={isFetching}>
            <RefreshCcw className="w-4 h-4" />
          </Button>
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-1" />
            New education
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Institution</Label>
            <Select value={institutionFilter} onValueChange={(value) => setInstitutionFilter(value)}>
              <SelectTrigger className="h-8 px-2 text-xs min-w-[180px]">
                <SelectValue placeholder="All institutions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All institutions</SelectItem>
                {institutions.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <EducationTable
        education={pagedEducation}
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
        onSelectionChange={setSelectedEducation}
        onBulkDelete={handleBulkDeleteClick}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEducation ? "Edit education" : "New education"}</DialogTitle>
            <DialogDescription>
              {editingEducation ? "Update your education details." : "Add a new education entry to your portfolio."}
            </DialogDescription>
          </DialogHeader>

          <EducationForm
            initialValues={editingEducation || undefined}
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
        title="Delete Education"
        description={`Are you sure you want to delete "${educationToDelete?.institution}" ${educationToDelete?.degree ? `- ${educationToDelete.degree}` : ""}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        title="Delete Multiple Education Entries"
        description={`Are you sure you want to delete ${selectedEducation.length} selected education entry(ies)? This action cannot be undone.`}
        confirmText={`Delete ${selectedEducation.length} Entry(ies)`}
        confirmVariant="destructive"
        isLoading={isBulkDeleting}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  )
}


