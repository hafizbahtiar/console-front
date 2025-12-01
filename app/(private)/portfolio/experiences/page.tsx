"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  type Experience,
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
import { ExperienceForm } from "@/components/features/portfolio/experiences/experience-form"
import { ExperienceTable } from "@/components/features/portfolio/experiences/experience-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function PortfolioExperiencesPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [experiences, setExperiences] = useState<Experience[]>([])
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
  const [companyFilter, setCompanyFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "current" | "past">("all")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      void fetchExperiences()
    }
  }, [isAuthenticated, page])

  const fetchExperiences = async () => {
    setIsFetching(true)
    try {
      const response = await getExperiences({ page, limit: pageSize })
      setExperiences(response.data)
      setPagination(response.pagination)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to load experiences. Please try again."
      toast.error(message)
    } finally {
      setIsFetching(false)
    }
  }

  const companies = useMemo(() => {
    const set = new Set<string>()
    experiences.forEach((exp) => {
      if (exp.company) set.add(exp.company)
    })
    return Array.from(set).sort()
  }, [experiences])

  const filteredExperiences = useMemo(() => {
    let result = experiences

    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter((exp) => {
        return (
          exp.title.toLowerCase().includes(term) ||
          (exp.company && exp.company.toLowerCase().includes(term)) ||
          (exp.location && exp.location.toLowerCase().includes(term)) ||
          exp.technologies?.some((t) => t.toLowerCase().includes(term))
        )
      })
    }

    if (companyFilter !== "all") {
      result = result.filter(
        (e) => e.company && e.company.toLowerCase() === companyFilter.toLowerCase(),
      )
    }

    if (statusFilter === "current") {
      result = result.filter((e) => e.current)
    } else if (statusFilter === "past") {
      result = result.filter((e) => !e.current)
    }

    return result
  }, [experiences, search, companyFilter, statusFilter])

  useEffect(() => {
    setPage(1)
  }, [search, companyFilter, statusFilter])

    // Use server-side pagination data
    const total = pagination.total
    const pagedExperiences = filteredExperiences

  const handleCreate = async (values: any) => {
    setIsSubmitting(true)
    try {
      const created = await createExperience(values)
      setExperiences((prev) => [...prev, created])
      toast.success("Experience created successfully")
      setIsDialogOpen(false)
      setEditingExperience(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to create experience. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (values: any) => {
    if (!editingExperience) return
    setIsSubmitting(true)
    try {
      const updated = await updateExperience(editingExperience.id, values)
      setExperiences((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
      toast.success("Experience updated successfully")
      setIsDialogOpen(false)
      setEditingExperience(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to update experience. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (experience: Experience) => {
    try {
      await deleteExperience(experience.id)
      setExperiences((prev) => prev.filter((e) => e.id !== experience.id))
      toast.success("Experience deleted")
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete experience. Please try again."
      toast.error(message)
    }
  }

  const openCreateDialog = () => {
    setEditingExperience(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (experience: Experience) => {
    setEditingExperience(experience)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingExperience(null)
    }
    setIsDialogOpen(open)
  }

  const onSubmit = async (values: any) => {
    if (editingExperience) {
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
          <h2 className="text-2xl font-semibold">Portfolio Experiences</h2>
          <p className="text-sm text-muted-foreground">
            Manage your professional experiences and career history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => void fetchExperiences()}
            disabled={isFetching}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-1" />
            New experience
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Company</Label>
            <Select
              value={companyFilter}
              onValueChange={(value) => setCompanyFilter(value)}
            >
              <SelectTrigger className="h-8 px-2 text-xs min-w-[160px]">
                <SelectValue placeholder="All companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "all" | "current" | "past")
              }
            >
              <SelectTrigger className="h-8 px-2 text-xs min-w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="current">Current only</SelectItem>
                <SelectItem value="past">Past only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <ExperienceTable
        experiences={pagedExperiences}
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
              {editingExperience ? "Edit experience" : "New experience"}
            </DialogTitle>
            <DialogDescription>
              {editingExperience
                ? "Update your experience details and responsibilities."
                : "Add a new professional experience to your portfolio."}
            </DialogDescription>
          </DialogHeader>

          <ExperienceForm
            initialValues={editingExperience || undefined}
            onSubmit={onSubmit}
            onCancel={() => handleDialogClose(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}


