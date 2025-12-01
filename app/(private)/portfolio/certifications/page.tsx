"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  type Certification,
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
import { CertificationForm } from "@/components/features/portfolio/certifications/certification-form"
import { CertificationTable } from "@/components/features/portfolio/certifications/certification-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function PortfolioCertificationsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [certifications, setCertifications] = useState<Certification[]>([])
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
  const [statusFilter, setStatusFilter] = useState<"all" | "valid" | "expiring" | "expired">("all")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      void fetchCertifications()
    }
  }, [isAuthenticated, page])

  const fetchCertifications = async () => {
    setIsFetching(true)
    try {
      const response = await getCertifications({ page, limit: pageSize })
      setCertifications(response.data)
      setPagination(response.pagination)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to load certifications. Please try again."
      toast.error(message)
    } finally {
      setIsFetching(false)
    }
  }

  const getExpiryStatus = (expiryDate?: string): "valid" | "expiring" | "expired" => {
    if (!expiryDate) return "valid"
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilExpiry < 0) return "expired"
    if (daysUntilExpiry <= 30) return "expiring"
    return "valid"
  }

  const filteredCertifications = useMemo(() => {
    let result = certifications

    // Search
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter((cert) => {
        return (
          cert.name.toLowerCase().includes(term) ||
          cert.issuer.toLowerCase().includes(term) ||
          (cert.credentialId && cert.credentialId.toLowerCase().includes(term))
        )
      })
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((cert) => {
        const status = getExpiryStatus(cert.expiryDate)
        return status === statusFilter
      })
    }

    return result
  }, [certifications, search, statusFilter])

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  // Use server-side pagination data
  const total = pagination.total
  const pagedCertifications = filteredCertifications

  const handleCreate = async (values: any) => {
    setIsSubmitting(true)
    try {
      const created = await createCertification(values)
      setCertifications((prev) => [...prev, created])
      toast.success("Certification created successfully")
      setIsDialogOpen(false)
      setEditingCertification(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to create certification. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (values: any) => {
    if (!editingCertification) return
    setIsSubmitting(true)
    try {
      const updated = await updateCertification(editingCertification.id, values)
      setCertifications((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      toast.success("Certification updated successfully")
      setIsDialogOpen(false)
      setEditingCertification(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to update certification. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (certification: Certification) => {
    try {
      await deleteCertification(certification.id)
      setCertifications((prev) => prev.filter((c) => c.id !== certification.id))
      toast.success("Certification deleted")
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete certification. Please try again."
      toast.error(message)
    }
  }

  const openCreateDialog = () => {
    setEditingCertification(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (certification: Certification) => {
    setEditingCertification(certification)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingCertification(null)
    }
    setIsDialogOpen(open)
  }

  const onSubmit = async (values: any) => {
    if (editingCertification) {
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
          <h2 className="text-2xl font-semibold">Portfolio Certifications</h2>
          <p className="text-sm text-muted-foreground">
            Manage your professional certifications and credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => void fetchCertifications()}
            disabled={isFetching}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-1" />
            New certification
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
              onValueChange={(value) => setStatusFilter(value as "all" | "valid" | "expiring" | "expired")}
            >
              <SelectTrigger className="h-8 px-2 text-xs min-w-[140px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="expiring">Expiring soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <CertificationTable
        certifications={pagedCertifications}
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
              {editingCertification ? "Edit certification" : "New certification"}
            </DialogTitle>
            <DialogDescription>
              {editingCertification
                ? "Update your certification details."
                : "Add a new professional certification or credential."}
            </DialogDescription>
          </DialogHeader>

          <CertificationForm
            initialValues={editingCertification || undefined}
            onSubmit={onSubmit}
            onCancel={() => handleDialogClose(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

