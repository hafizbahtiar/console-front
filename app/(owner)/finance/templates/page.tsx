"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
    getTransactionTemplates,
    createTransactionTemplate,
    updateTransactionTemplate,
    deleteTransactionTemplate,
    bulkDeleteTransactionTemplates,
    type SavedTransactionTemplate,
    type TransactionTemplateFilters,
    type TransactionType,
} from "@/lib/api/finance"
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
import { TransactionTemplateForm } from "@/components/features/finance/transaction-templates/transaction-template-form"
import { TransactionTemplateTable } from "@/components/features/finance/transaction-templates/transaction-template-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { FloatingActionButton } from "@/components/ui/floating-action-button"

export default function TransactionTemplatesPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()

    const [templates, setTemplates] = useState<SavedTransactionTemplate[]>([])
    const [isFetching, setIsFetching] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [sortBy, setSortBy] = useState<"usageCount" | "name" | "createdAt" | "updatedAt">("usageCount")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<SavedTransactionTemplate | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [templateToDelete, setTemplateToDelete] = useState<SavedTransactionTemplate | null>(null)
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
    const [selectedTemplates, setSelectedTemplates] = useState<SavedTransactionTemplate[]>([])

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "owner")) {
            router.push("/403")
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user?.role === "owner") {
            void fetchTemplates()
        }
    }, [user, typeFilter, categoryFilter, search, sortBy, sortOrder])

    const fetchTemplates = async () => {
        setIsFetching(true)
        try {
            const filters: TransactionTemplateFilters = {
                type: typeFilter !== "all" ? typeFilter : undefined,
                category: categoryFilter !== "all" ? categoryFilter : undefined,
                search: search.trim() || undefined,
                sortBy,
                sortOrder,
            }

            const data = await getTransactionTemplates(filters)
            setTemplates(data)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to load transaction templates. Please try again."
            toast.error(message)
        } finally {
            setIsFetching(false)
        }
    }

    const handleCreate = async (values: any) => {
        setIsSubmitting(true)
        try {
            await createTransactionTemplate(values)
            toast.success("Transaction template created successfully")
            setIsDialogOpen(false)
            setEditingTemplate(null)
            await fetchTemplates()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to create transaction template. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (values: any) => {
        if (!editingTemplate) return

        setIsSubmitting(true)
        try {
            await updateTransactionTemplate(editingTemplate.id, values)
            toast.success("Transaction template updated successfully")
            setIsDialogOpen(false)
            setEditingTemplate(null)
            await fetchTemplates()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to update transaction template. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!templateToDelete) return

        setIsDeleting(true)
        try {
            await deleteTransactionTemplate(templateToDelete.id)
            toast.success("Transaction template deleted successfully")
            setShowDeleteDialog(false)
            setTemplateToDelete(null)
            await fetchTemplates()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete transaction template. Please try again."
            toast.error(message)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleBulkDelete = async () => {
        if (selectedTemplates.length === 0) return

        setIsBulkDeleting(true)
        try {
            const ids = selectedTemplates.map((t) => t.id)
            const result = await bulkDeleteTransactionTemplates(ids)
            toast.success(`Successfully deleted ${result.deletedCount} template(s)`)
            setShowBulkDeleteDialog(false)
            setSelectedTemplates([])
            await fetchTemplates()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete transaction templates. Please try again."
            toast.error(message)
        } finally {
            setIsBulkDeleting(false)
        }
    }

    const openCreateDialog = () => {
        setEditingTemplate(null)
        setIsDialogOpen(true)
    }

    const openEditDialog = (template: SavedTransactionTemplate) => {
        setEditingTemplate(template)
        setIsDialogOpen(true)
    }

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            setEditingTemplate(null)
        }
        setIsDialogOpen(open)
    }

    const onSubmit = async (values: any) => {
        if (editingTemplate) {
            await handleUpdate(values)
        } else {
            await handleCreate(values)
        }
    }

    const categories = Array.from(new Set(templates.map((t) => t.category).filter(Boolean))).sort()

    if (authLoading) {
        return <div>Loading...</div>
    }

    if (!user || user.role !== "owner") {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-semibold">Transaction Templates</h2>
                    <p className="text-sm text-muted-foreground">
                        Save and reuse common transactions for quick entry
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="type-filter">Type:</Label>
                        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as "all" | TransactionType)}>
                            <SelectTrigger id="type-filter" className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {categories.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Label htmlFor="category-filter">Category:</Label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger id="category-filter" className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat || ""} value={cat || ""}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Label htmlFor="sort-by">Sort By:</Label>
                        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                            <SelectTrigger id="sort-by" className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="usageCount">Most Used</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="createdAt">Created</SelectItem>
                                <SelectItem value="updatedAt">Updated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label htmlFor="sort-order">Order:</Label>
                        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "asc" | "desc")}>
                            <SelectTrigger id="sort-order" className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">Desc</SelectItem>
                                <SelectItem value="asc">Asc</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchTemplates} disabled={isFetching}>
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Template
                    </Button>
                </div>
            </div>

            <TransactionTemplateTable
                templates={templates}
                search={search}
                onSearchChange={setSearch}
                isLoading={isFetching}
                onEdit={openEditDialog}
                onDelete={(template) => {
                    setTemplateToDelete(template)
                    setShowDeleteDialog(true)
                }}
                enableRowSelection={true}
                onSelectionChange={setSelectedTemplates}
                onBulkDelete={
                    selectedTemplates.length > 0
                        ? () => setShowBulkDeleteDialog(true)
                        : undefined
                }
            />

            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTemplate ? "Edit Transaction Template" : "Create Transaction Template"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTemplate
                                ? "Update the transaction template details below."
                                : "Create a new transaction template that you can reuse for quick transaction entry."}
                        </DialogDescription>
                    </DialogHeader>
                    <TransactionTemplateForm
                        initialValues={editingTemplate ? {
                            name: editingTemplate.name,
                            amount: editingTemplate.amount,
                            description: editingTemplate.description,
                            type: editingTemplate.type,
                            categoryId: editingTemplate.categoryId,
                            notes: editingTemplate.notes,
                            tags: editingTemplate.tags,
                            paymentMethod: editingTemplate.paymentMethod,
                            reference: editingTemplate.reference,
                            category: editingTemplate.category,
                        } : undefined}
                        onSubmit={onSubmit}
                        onCancel={() => setIsDialogOpen(false)}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDelete}
                title="Delete Transaction Template"
                description={`Are you sure you want to delete "${templateToDelete?.name || ""}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="destructive"
                isLoading={isDeleting}
            />

            <ConfirmDialog
                open={showBulkDeleteDialog}
                onOpenChange={setShowBulkDeleteDialog}
                onConfirm={handleBulkDelete}
                title="Delete Transaction Templates"
                description={`Are you sure you want to delete ${selectedTemplates.length} selected template(s)? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="destructive"
                isLoading={isBulkDeleting}
            />

            {/* Floating Action Button */}
            <FloatingActionButton
                onClick={openCreateDialog}
                label="New Template"
            />
        </div>
    )
}

