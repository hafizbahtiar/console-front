"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
    getRecurringTransactions,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    bulkDeleteRecurringTransactions,
    pauseRecurringTransaction,
    resumeRecurringTransaction,
    skipNextRecurringTransaction,
    generateRecurringTransaction,
    type RecurringTransaction,
    type RecurringTransactionFilters,
    type RecurringFrequency,
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
import { RecurringTransactionForm } from "@/components/features/finance/recurring-transactions/recurring-transaction-form"
import { RecurringTransactionTable } from "@/components/features/finance/recurring-transactions/recurring-transaction-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { FloatingActionButton } from "@/components/ui/floating-action-button"

export default function RecurringTransactionsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()

    const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
    const [isFetching, setIsFetching] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)
    const [isPausing, setIsPausing] = useState(false)
    const [isResuming, setIsResuming] = useState(false)
    const [isSkipping, setIsSkipping] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [search, setSearch] = useState("")
    const [frequencyFilter, setFrequencyFilter] = useState<"all" | RecurringFrequency>("all")
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRecurringTransaction, setEditingRecurringTransaction] = useState<RecurringTransaction | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [recurringTransactionToDelete, setRecurringTransactionToDelete] = useState<RecurringTransaction | null>(null)
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
    const [selectedRecurringTransactions, setSelectedRecurringTransactions] = useState<RecurringTransaction[]>([])

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "owner")) {
            router.push("/403")
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user?.role === "owner") {
            void fetchRecurringTransactions()
        }
    }, [user, frequencyFilter, statusFilter, search])

    const fetchRecurringTransactions = async () => {
        setIsFetching(true)
        try {
            const filters: RecurringTransactionFilters = {
                frequency: frequencyFilter !== "all" ? frequencyFilter : undefined,
                isActive: statusFilter === "all" ? undefined : statusFilter === "active",
                search: search.trim() || undefined,
            }

            const data = await getRecurringTransactions(filters)
            setRecurringTransactions(data)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to load recurring transactions. Please try again."
            toast.error(message)
        } finally {
            setIsFetching(false)
        }
    }

    const handleCreate = async (values: any) => {
        setIsSubmitting(true)
        try {
            await createRecurringTransaction(values)
            toast.success("Recurring transaction created successfully")
            setIsDialogOpen(false)
            setEditingRecurringTransaction(null)
            await fetchRecurringTransactions()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to create recurring transaction. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (values: any) => {
        if (!editingRecurringTransaction) return
        setIsSubmitting(true)
        try {
            await updateRecurringTransaction(editingRecurringTransaction.id, values)
            toast.success("Recurring transaction updated successfully")
            setIsDialogOpen(false)
            setEditingRecurringTransaction(null)
            await fetchRecurringTransactions()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to update recurring transaction. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteClick = (rt: RecurringTransaction) => {
        setRecurringTransactionToDelete(rt)
        setShowDeleteDialog(true)
    }

    const handleDeleteConfirm = async () => {
        if (!recurringTransactionToDelete) return
        setIsDeleting(true)
        try {
            await deleteRecurringTransaction(recurringTransactionToDelete.id)
            toast.success("Recurring transaction deleted successfully")
            setRecurringTransactionToDelete(null)
            await fetchRecurringTransactions()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete recurring transaction. Please try again."
            toast.error(message)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleBulkDeleteClick = (rts: RecurringTransaction[]) => {
        setSelectedRecurringTransactions(rts)
        setShowBulkDeleteDialog(true)
    }

    const handleBulkDeleteConfirm = async () => {
        if (selectedRecurringTransactions.length === 0) return
        setIsBulkDeleting(true)
        try {
            const ids = selectedRecurringTransactions.map((rt) => rt.id)
            const result = await bulkDeleteRecurringTransactions(ids)
            if (result.failedIds.length > 0) {
                toast.warning(
                    `Deleted ${result.deletedCount} recurring transactions. ${result.failedIds.length} failed.`
                )
            } else {
                toast.success(`Successfully deleted ${result.deletedCount} recurring transaction(s)`)
            }
            setSelectedRecurringTransactions([])
            await fetchRecurringTransactions()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete recurring transactions. Please try again."
            toast.error(message)
        } finally {
            setIsBulkDeleting(false)
        }
    }

    const handlePause = async (rt: RecurringTransaction) => {
        setIsPausing(true)
        try {
            await pauseRecurringTransaction(rt.id)
            toast.success("Recurring transaction paused successfully")
            await fetchRecurringTransactions()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to pause recurring transaction. Please try again."
            toast.error(message)
        } finally {
            setIsPausing(false)
        }
    }

    const handleResume = async (rt: RecurringTransaction) => {
        setIsResuming(true)
        try {
            await resumeRecurringTransaction(rt.id)
            toast.success("Recurring transaction resumed successfully")
            await fetchRecurringTransactions()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to resume recurring transaction. Please try again."
            toast.error(message)
        } finally {
            setIsResuming(false)
        }
    }

    const handleSkipNext = async (rt: RecurringTransaction) => {
        setIsSkipping(true)
        try {
            await skipNextRecurringTransaction(rt.id)
            toast.success("Next occurrence skipped successfully")
            await fetchRecurringTransactions()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to skip next occurrence. Please try again."
            toast.error(message)
        } finally {
            setIsSkipping(false)
        }
    }

    const handleGenerate = async (rt: RecurringTransaction) => {
        setIsGenerating(true)
        try {
            const result = await generateRecurringTransaction(rt.id)
            toast.success(`Generated ${result.generatedCount} transaction(s) successfully`)
            await fetchRecurringTransactions()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to generate transactions. Please try again."
            toast.error(message)
        } finally {
            setIsGenerating(false)
        }
    }

    const openCreateDialog = () => {
        setEditingRecurringTransaction(null)
        setIsDialogOpen(true)
    }

    const openEditDialog = (rt: RecurringTransaction) => {
        setEditingRecurringTransaction(rt)
        setIsDialogOpen(true)
    }

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            setEditingRecurringTransaction(null)
        }
        setIsDialogOpen(open)
    }

    const onSubmit = async (values: any) => {
        if (editingRecurringTransaction) {
            await handleUpdate(values)
        } else {
            await handleCreate(values)
        }
    }

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
                    <h2 className="text-2xl font-semibold">Recurring Transactions</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage recurring transactions that automatically generate transactions on a schedule.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => void fetchRecurringTransactions()}
                        disabled={isFetching}
                    >
                        <RefreshCcw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                    </Button>
                    <Button type="button" onClick={openCreateDialog}>
                        <Plus className="w-4 h-4 mr-1" />
                        New Recurring Transaction
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Frequency</Label>
                        <Select
                            value={frequencyFilter}
                            onValueChange={(value) => setFrequencyFilter(value as "all" | RecurringFrequency)}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="All frequencies" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All frequencies</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as "all" | "active" | "paused")}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Recurring Transaction Table */}
            <RecurringTransactionTable
                recurringTransactions={recurringTransactions}
                search={search}
                onSearchChange={setSearch}
                isLoading={isFetching}
                onEdit={openEditDialog}
                onDelete={handleDeleteClick}
                onPause={handlePause}
                onResume={handleResume}
                onSkipNext={handleSkipNext}
                onGenerate={handleGenerate}
                enableRowSelection={true}
                onSelectionChange={setSelectedRecurringTransactions}
                onBulkDelete={handleBulkDeleteClick}
            />

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRecurringTransaction ? "Edit Recurring Transaction" : "Create Recurring Transaction"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingRecurringTransaction
                                ? "Update the recurring transaction details below."
                                : "Fill in the details to create a new recurring transaction."}
                        </DialogDescription>
                    </DialogHeader>
                    <RecurringTransactionForm
                        initialValues={editingRecurringTransaction ? {
                            template: {
                                amount: editingRecurringTransaction.template.amount,
                                description: editingRecurringTransaction.template.description,
                                type: editingRecurringTransaction.template.type,
                                categoryId: editingRecurringTransaction.template.categoryId,
                                notes: editingRecurringTransaction.template.notes,
                                tags: editingRecurringTransaction.template.tags,
                                paymentMethod: editingRecurringTransaction.template.paymentMethod,
                                reference: editingRecurringTransaction.template.reference,
                            },
                            frequency: editingRecurringTransaction.frequency,
                            interval: editingRecurringTransaction.interval,
                            startDate: editingRecurringTransaction.startDate.split("T")[0],
                            endDate: editingRecurringTransaction.endDate ? editingRecurringTransaction.endDate.split("T")[0] : undefined,
                            isActive: editingRecurringTransaction.isActive,
                        } : undefined}
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
                onConfirm={handleDeleteConfirm}
                title="Delete Recurring Transaction"
                description={`Are you sure you want to delete this recurring transaction? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="destructive"
                isLoading={isDeleting}
            />

            {/* Bulk Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showBulkDeleteDialog}
                onOpenChange={setShowBulkDeleteDialog}
                onConfirm={handleBulkDeleteConfirm}
                title="Delete Recurring Transactions"
                description={`Are you sure you want to delete ${selectedRecurringTransactions.length} recurring transaction(s)? This action cannot be undone.`}
                confirmText="Delete All"
                cancelText="Cancel"
                confirmVariant="destructive"
                isLoading={isBulkDeleting}
            />
        </div>
    )
}

