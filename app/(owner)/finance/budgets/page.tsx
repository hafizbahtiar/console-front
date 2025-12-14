"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
    getBudgetsWithStats,
    createBudget,
    updateBudget,
    deleteBudget,
    bulkDeleteBudgets,
    processBudgetRollover,
    type Budget,
    type BudgetFilters,
    type BudgetPeriod,
    type BudgetCategoryType,
    type BudgetAlertLevel,
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
import { BudgetForm } from "@/components/features/finance/budgets/budget-form"
import { BudgetTable } from "@/components/features/finance/budgets/budget-table"
import { BudgetSetupWizard } from "@/components/features/finance/budgets/budget-setup-wizard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function FinanceBudgetsPage() {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    const [budgets, setBudgets] = useState<Budget[]>([])
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
    const [isRollingOver, setIsRollingOver] = useState(false)
    const [search, setSearch] = useState("")
    const [periodFilter, setPeriodFilter] = useState<"all" | BudgetPeriod>("all")
    const [categoryTypeFilter, setCategoryTypeFilter] = useState<"all" | BudgetCategoryType>("all")
    const [alertLevelFilter, setAlertLevelFilter] = useState<"all" | BudgetAlertLevel>("all")
    const [sortBy, setSortBy] = useState<"name" | "amount" | "startDate" | "createdAt" | "updatedAt">("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null)
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
    const [selectedBudgets, setSelectedBudgets] = useState<Budget[]>([])
    const [showRolloverDialog, setShowRolloverDialog] = useState(false)
    const [budgetToRollover, setBudgetToRollover] = useState<Budget | null>(null)
    const [showWizard, setShowWizard] = useState(false)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        if (isAuthenticated) {
            void fetchBudgets()
        }
    }, [isAuthenticated, page, periodFilter, categoryTypeFilter, alertLevelFilter, sortBy, sortOrder, search])

    const fetchBudgets = async () => {
        setIsFetching(true)
        try {
            const filters: BudgetFilters = {
                page,
                limit: pageSize,
                period: periodFilter !== "all" ? periodFilter : undefined,
                categoryType: categoryTypeFilter !== "all" ? categoryTypeFilter : undefined,
                alertLevel: alertLevelFilter !== "all" ? alertLevelFilter : undefined,
                search: search || undefined,
                sortBy,
                sortOrder,
            }

            const response = await getBudgetsWithStats(filters)
            setBudgets(response.data)
            setPagination(response.pagination)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to load budgets. Please try again."
            toast.error(message)
        } finally {
            setIsFetching(false)
        }
    }

    // Reset to first page when filters/search change
    useEffect(() => {
        setPage(1)
    }, [periodFilter, categoryTypeFilter, alertLevelFilter, sortBy, sortOrder, search])

    const total = pagination.total

    const handleCreate = async (values: any) => {
        setIsSubmitting(true)
        try {
            await createBudget(values)
            toast.success("Budget created successfully")
            setIsDialogOpen(false)
            setEditingBudget(null)
            await fetchBudgets()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to create budget. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (values: any) => {
        if (!editingBudget) return
        setIsSubmitting(true)
        try {
            await updateBudget(editingBudget.id, values)
            toast.success("Budget updated successfully")
            setIsDialogOpen(false)
            setEditingBudget(null)
            await fetchBudgets()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to update budget. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteClick = (budget: Budget) => {
        setBudgetToDelete(budget)
        setShowDeleteDialog(true)
    }

    const handleDeleteConfirm = async () => {
        if (!budgetToDelete) return
        setIsDeleting(true)
        try {
            await deleteBudget(budgetToDelete.id)
            toast.success("Budget deleted successfully")
            setBudgetToDelete(null)
            await fetchBudgets()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete budget. Please try again."
            toast.error(message)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleBulkDeleteClick = (budgets: Budget[]) => {
        setSelectedBudgets(budgets)
        setShowBulkDeleteDialog(true)
    }

    const handleBulkDeleteConfirm = async () => {
        if (selectedBudgets.length === 0) return
        setIsBulkDeleting(true)
        try {
            const ids = selectedBudgets.map((b) => b.id)
            const result = await bulkDeleteBudgets(ids)
            if (result.failedIds.length > 0) {
                toast.warning(
                    `Deleted ${result.deletedCount} budgets. ${result.failedIds.length} failed.`
                )
            } else {
                toast.success(`Successfully deleted ${result.deletedCount} budget(s)`)
            }
            setSelectedBudgets([])
            await fetchBudgets()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete budgets. Please try again."
            toast.error(message)
        } finally {
            setIsBulkDeleting(false)
        }
    }

    const handleRolloverClick = (budget: Budget) => {
        setBudgetToRollover(budget)
        setShowRolloverDialog(true)
    }

    const handleRolloverConfirm = async () => {
        if (!budgetToRollover) return
        setIsRollingOver(true)
        try {
            const result = await processBudgetRollover(budgetToRollover.id)
            if (result) {
                toast.success("Budget rolled over successfully")
            } else {
                toast.info("Budget rollover not applicable (rollover disabled or no remaining budget)")
            }
            setBudgetToRollover(null)
            await fetchBudgets()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to process budget rollover. Please try again."
            toast.error(message)
        } finally {
            setIsRollingOver(false)
        }
    }

    const openCreateDialog = () => {
        setEditingBudget(null)
        setIsDialogOpen(true)
    }

    const openEditDialog = (budget: Budget) => {
        setEditingBudget(budget)
        setIsDialogOpen(true)
    }

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            setEditingBudget(null)
        }
        setIsDialogOpen(open)
    }

    const onSubmit = async (values: any) => {
        if (editingBudget) {
            await handleUpdate(values)
        } else {
            await handleCreate(values)
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Budgets</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        Manage your financial budgets and track spending
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchBudgets}
                        disabled={isFetching}
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={() => setShowWizard(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Setup Wizard
                    </Button>
                    <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Budget
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-4 p-4 border rounded-lg bg-card">
                <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs text-muted-foreground">Search</Label>
                    <Input
                        placeholder="Search budgets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mt-1"
                    />
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Period</Label>
                    <Select
                        value={periodFilter}
                        onValueChange={(value) => setPeriodFilter(value as any)}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Periods</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Category Type</Label>
                    <Select
                        value={categoryTypeFilter}
                        onValueChange={(value) => setCategoryTypeFilter(value as any)}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="ExpenseCategory">Expense</SelectItem>
                            <SelectItem value="IncomeCategory">Income</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Alert Level</Label>
                    <Select
                        value={alertLevelFilter}
                        onValueChange={(value) => setAlertLevelFilter(value as any)}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Alerts</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="exceeded">Exceeded</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Sort By</Label>
                    <Select
                        value={sortBy}
                        onValueChange={(value) => setSortBy(value as any)}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="amount">Amount</SelectItem>
                            <SelectItem value="startDate">Start Date</SelectItem>
                            <SelectItem value="createdAt">Created</SelectItem>
                            <SelectItem value="updatedAt">Updated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Sort Order</Label>
                    <Select
                        value={sortOrder}
                        onValueChange={(value) => setSortOrder(value as any)}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="desc">Descending</SelectItem>
                            <SelectItem value="asc">Ascending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Budget Table */}
            <BudgetTable
                budgets={budgets}
                page={page}
                pageSize={pageSize}
                total={total}
                pagination={pagination}
                onPageChange={setPage}
                search={search}
                onSearchChange={setSearch}
                isLoading={isFetching}
                onEdit={openEditDialog}
                onDelete={handleDeleteClick}
                onRollover={handleRolloverClick}
                enableRowSelection={true}
                onSelectionChange={setSelectedBudgets}
                onBulkDelete={handleBulkDeleteClick}
            />

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingBudget ? "Edit Budget" : "Create New Budget"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingBudget
                                ? "Update your budget details below."
                                : "Create a new budget to track your spending or income."}
                        </DialogDescription>
                    </DialogHeader>
                    <BudgetForm
                        initialValues={editingBudget ? {
                            name: editingBudget.name,
                            categoryId: editingBudget.categoryId,
                            categoryType: editingBudget.categoryType,
                            amount: editingBudget.amount,
                            period: editingBudget.period,
                            startDate: editingBudget.startDate,
                            endDate: editingBudget.endDate,
                            alertThresholds: editingBudget.alertThresholds,
                            rolloverEnabled: editingBudget.rolloverEnabled,
                            description: editingBudget.description,
                        } : undefined}
                        onSubmit={onSubmit}
                        onCancel={() => setIsDialogOpen(false)}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDeleteConfirm}
                title="Delete Budget"
                description={
                    budgetToDelete
                        ? `Are you sure you want to delete "${budgetToDelete.name}"? This action cannot be undone.`
                        : ""
                }
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
                title="Delete Budgets"
                description={`Are you sure you want to delete ${selectedBudgets.length} budget(s)? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="destructive"
                isLoading={isBulkDeleting}
            />

            {/* Rollover Confirmation Dialog */}
            <ConfirmDialog
                open={showRolloverDialog}
                onOpenChange={setShowRolloverDialog}
                onConfirm={handleRolloverConfirm}
                title="Process Budget Rollover"
                description={
                    budgetToRollover
                        ? `Are you sure you want to process rollover for "${budgetToRollover.name}"? This will create a new budget for the next period with any remaining amount added.`
                        : ""
                }
                confirmText="Process Rollover"
                cancelText="Cancel"
                isLoading={isRollingOver}
            />

            {/* Budget Setup Wizard */}
            <BudgetSetupWizard
                open={showWizard}
                onOpenChange={setShowWizard}
                onSubmit={handleCreate}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}

