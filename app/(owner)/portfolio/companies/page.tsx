"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  bulkDeleteCompanies,
  type Company,
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
import { CompanyForm } from "@/components/features/portfolio/companies/company-form"
import { CompanyTable } from "@/components/features/portfolio/companies/company-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function PortfolioCompaniesPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [companies, setCompanies] = useState<Company[]>([])
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
  const [industryFilter, setIndustryFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      void fetchCompanies()
    }
  }, [isAuthenticated, page])

  const fetchCompanies = async () => {
    setIsFetching(true)
    try {
      const response = await getCompanies({ page, limit: pageSize })
      setCompanies(response.data)
      setPagination(response.pagination)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to load companies. Please try again."
      toast.error(message)
    } finally {
      setIsFetching(false)
    }
  }

  const industries = useMemo(() => {
    const set = new Set<string>()
    companies.forEach((company) => {
      if (company.industry) set.add(company.industry)
    })
    return Array.from(set).sort()
  }, [companies])

  const locations = useMemo(() => {
    const set = new Set<string>()
    companies.forEach((company) => {
      if (company.location) set.add(company.location)
    })
    return Array.from(set).sort()
  }, [companies])

  const filteredCompanies = useMemo(() => {
    let result = companies

    // Search
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter((company) => {
        return (
          company.name.toLowerCase().includes(term) ||
          (company.description && company.description.toLowerCase().includes(term)) ||
          (company.industry && company.industry.toLowerCase().includes(term)) ||
          (company.location && company.location.toLowerCase().includes(term))
        )
      })
    }

    // Industry filter
    if (industryFilter !== "all") {
      result = result.filter(
        (c) => c.industry && c.industry.toLowerCase() === industryFilter.toLowerCase(),
      )
    }

    // Location filter
    if (locationFilter !== "all") {
      result = result.filter(
        (c) => c.location && c.location.toLowerCase() === locationFilter.toLowerCase(),
      )
    }

    return result
  }, [companies, search, industryFilter, locationFilter])

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1)
  }, [search, industryFilter, locationFilter])

  // Use server-side pagination data
  const total = pagination.total
  const pagedCompanies = filteredCompanies

  const handleCreate = async (values: any) => {
    setIsSubmitting(true)
    try {
      const created = await createCompany(values)
      setCompanies((prev) => [...prev, created])
      toast.success("Company created successfully")
      setIsDialogOpen(false)
      setEditingCompany(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to create company. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (values: any) => {
    if (!editingCompany) return
    setIsSubmitting(true)
    try {
      const updated = await updateCompany(editingCompany.id, values)
      setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      toast.success("Company updated successfully")
      setIsDialogOpen(false)
      setEditingCompany(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to update company. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return
    setIsDeleting(true)
    try {
      await deleteCompany(companyToDelete.id)
      setCompanies((prev) => prev.filter((c) => c.id !== companyToDelete.id))
      toast.success("Company deleted successfully")
      setCompanyToDelete(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete company. Please try again."
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDeleteClick = (companies: Company[]) => {
    setSelectedCompanies(companies)
    setShowBulkDeleteDialog(true)
  }

  const handleBulkDeleteConfirm = async () => {
    if (selectedCompanies.length === 0) return
    setIsBulkDeleting(true)
    try {
      const ids = selectedCompanies.map((c) => c.id)
      // Try bulk delete first, fallback to individual deletes if endpoint doesn't exist
      try {
        const result = await bulkDeleteCompanies(ids)
        if (result.failedIds.length > 0) {
          toast.warning(
            `Deleted ${result.deletedCount} companies. ${result.failedIds.length} failed.`
          )
        } else {
          toast.success(`Successfully deleted ${result.deletedCount} company(ies)`)
        }
        setCompanies((prev) => prev.filter((c) => !ids.includes(c.id)))
      } catch (bulkError) {
        // Fallback to individual deletes if bulk endpoint doesn't exist
        const deletePromises = ids.map((id) => deleteCompany(id))
        await Promise.all(deletePromises)
        setCompanies((prev) => prev.filter((c) => !ids.includes(c.id)))
        toast.success(`Successfully deleted ${ids.length} company(ies)`)
      }
      setSelectedCompanies([])
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete companies. Please try again."
      toast.error(message)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const openCreateDialog = () => {
    setEditingCompany(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (company: Company) => {
    setEditingCompany(company)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingCompany(null)
    }
    setIsDialogOpen(open)
  }

  const onSubmit = async (values: any) => {
    if (editingCompany) {
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
          <h2 className="text-2xl font-semibold">Portfolio Companies</h2>
          <p className="text-sm text-muted-foreground">
            Manage the companies associated with your experiences and projects.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => void fetchCompanies()}
            disabled={isFetching}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-1" />
            New company
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Industry</Label>
            <Select
              value={industryFilter}
              onValueChange={(value) => setIndustryFilter(value)}
            >
              <SelectTrigger className="h-8 px-2 text-xs min-w-[160px]">
                <SelectValue placeholder="All industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Location</Label>
            <Select
              value={locationFilter}
              onValueChange={(value) => setLocationFilter(value)}
            >
              <SelectTrigger className="h-8 px-2 text-xs min-w-[160px]">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <CompanyTable
        companies={pagedCompanies}
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
        onSelectionChange={setSelectedCompanies}
        onBulkDelete={handleBulkDeleteClick}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? "Edit company" : "New company"}
            </DialogTitle>
            <DialogDescription>
              {editingCompany
                ? "Update your company details."
                : "Create a new company to associate with your portfolio."}
            </DialogDescription>
          </DialogHeader>

          <CompanyForm
            initialValues={editingCompany || undefined}
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
        title="Delete Company"
        description={`Are you sure you want to delete "${companyToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        title="Delete Multiple Companies"
        description={`Are you sure you want to delete ${selectedCompanies.length} selected company(ies)? This action cannot be undone.`}
        confirmText={`Delete ${selectedCompanies.length} Company(ies)`}
        confirmVariant="destructive"
        isLoading={isBulkDeleting}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  )
}
