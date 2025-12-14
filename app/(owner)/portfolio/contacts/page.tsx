"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  reorderContacts,
  type Contact,
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
import { ContactForm } from "@/components/features/portfolio/contacts/contact-form"
import { ContactTable } from "@/components/features/portfolio/contacts/contact-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function PortfolioContactsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [contacts, setContacts] = useState<Contact[]>([])
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
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      void fetchContacts()
    }
  }, [isAuthenticated, page])

  const fetchContacts = async () => {
    setIsFetching(true)
    try {
      const response = await getContacts({ page, limit: pageSize })
      setContacts(response.data.sort((a, b) => a.order - b.order))
      setPagination(response.pagination)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to load contacts. Please try again."
      toast.error(message)
    } finally {
      setIsFetching(false)
    }
  }

  const filteredContacts = useMemo(() => {
    let result = contacts

    // Search
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter((contact) => {
        return (
          contact.platform.toLowerCase().includes(term) ||
          contact.url.toLowerCase().includes(term) ||
          (contact.icon && contact.icon.toLowerCase().includes(term))
        )
      })
    }

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((c) => c.active)
    } else if (statusFilter === "inactive") {
      result = result.filter((c) => !c.active)
    }

    return result
  }, [contacts, search, statusFilter])

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  // Use server-side pagination data
  const total = pagination.total
  const pagedContacts = filteredContacts

  const handleCreate = async (values: any) => {
    setIsSubmitting(true)
    try {
      const maxOrder = contacts.length > 0 ? Math.max(...contacts.map((c) => c.order)) : -1
      const created = await createContact({ ...values, order: maxOrder + 1 })
      setContacts((prev) => [...prev, created].sort((a, b) => a.order - b.order))
      toast.success("Contact created successfully")
      setIsDialogOpen(false)
      setEditingContact(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to create contact. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (values: any) => {
    if (!editingContact) return
    setIsSubmitting(true)
    try {
      const updated = await updateContact(editingContact.id, values)
      setContacts((prev) =>
        prev
          .map((c) => (c.id === updated.id ? updated : c))
          .sort((a, b) => a.order - b.order),
      )
      toast.success("Contact updated successfully")
      setIsDialogOpen(false)
      setEditingContact(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to update contact. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (contact: Contact) => {
    setContactToDelete(contact)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return
    setIsDeleting(true)
    try {
      await deleteContact(contactToDelete.id)
      setContacts((prev) => prev.filter((c) => c.id !== contactToDelete.id))
      toast.success("Contact deleted successfully")
      setContactToDelete(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete contact. Please try again."
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDeleteClick = (contacts: Contact[]) => {
    setSelectedContacts(contacts)
    setShowBulkDeleteDialog(true)
  }

  const handleBulkDeleteConfirm = async () => {
    if (selectedContacts.length === 0) return
    setIsBulkDeleting(true)
    try {
      const ids = selectedContacts.map((c) => c.id)
      // Try bulk delete first, fallback to individual deletes if endpoint doesn't exist
      try {
        const result = await bulkDeleteContacts(ids)
        if (result.failedIds.length > 0) {
          toast.warning(
            `Deleted ${result.deletedCount} contact link(s). ${result.failedIds.length} failed.`
          )
        } else {
          toast.success(`Successfully deleted ${result.deletedCount} contact link(s)`)
        }
        setContacts((prev) => prev.filter((c) => !ids.includes(c.id)))
      } catch (bulkError) {
        // Fallback to individual deletes if bulk endpoint doesn't exist
        const deletePromises = ids.map((id) => deleteContact(id))
        await Promise.all(deletePromises)
        setContacts((prev) => prev.filter((c) => !ids.includes(c.id)))
        toast.success(`Successfully deleted ${ids.length} contact link(s)`)
      }
      setSelectedContacts([])
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete contacts. Please try again."
      toast.error(message)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const openCreateDialog = () => {
    setEditingContact(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingContact(null)
    }
    setIsDialogOpen(open)
  }

  const onSubmit = async (values: any) => {
    if (editingContact) {
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
          <h2 className="text-2xl font-semibold">Portfolio Contacts</h2>
          <p className="text-sm text-muted-foreground">
            Manage your social media links and contact information.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => void fetchContacts()}
            disabled={isFetching}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-1" />
            New contact
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
              onValueChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}
            >
              <SelectTrigger className="h-8 px-2 text-xs min-w-[140px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All contacts</SelectItem>
                <SelectItem value="active">Active only</SelectItem>
                <SelectItem value="inactive">Inactive only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <ContactTable
        contacts={pagedContacts}
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
        onSelectionChange={setSelectedContacts}
        onBulkDelete={handleBulkDeleteClick}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Edit contact" : "New contact"}
            </DialogTitle>
            <DialogDescription>
              {editingContact
                ? "Update your contact link details."
                : "Add a new social media link or contact information."}
            </DialogDescription>
          </DialogHeader>

          <ContactForm
            initialValues={editingContact || undefined}
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
        title="Delete Contact Link"
        description={`Are you sure you want to delete the "${contactToDelete?.platform}" contact link? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        title="Delete Multiple Contact Links"
        description={`Are you sure you want to delete ${selectedContacts.length} selected contact link(s)? This action cannot be undone.`}
        confirmText={`Delete ${selectedContacts.length} Link(s)`}
        confirmVariant="destructive"
        isLoading={isBulkDeleting}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  )
}

