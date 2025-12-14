"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
    getFinancialGoals,
    createFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,
    bulkDeleteFinancialGoals,
    addAmountToGoal,
    subtractAmountFromGoal,
    type FinancialGoal,
    type FinancialGoalFilters,
    type GoalCategory,
    type CreateFinancialGoalInput,
    type UpdateFinancialGoalInput,
} from "@/lib/api/finance"
import { ApiClientError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FinancialGoalForm } from "@/components/features/finance/financial-goals/financial-goal-form"
import { FinancialGoalTable } from "@/components/features/finance/financial-goals/financial-goal-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

const GOAL_CATEGORIES: { value: GoalCategory; label: string }[] = [
    { value: "emergency_fund", label: "Emergency Fund" },
    { value: "vacation", label: "Vacation" },
    { value: "house", label: "House" },
    { value: "car", label: "Car" },
    { value: "education", label: "Education" },
    { value: "retirement", label: "Retirement" },
    { value: "debt_payoff", label: "Debt Payoff" },
    { value: "investment", label: "Investment" },
    { value: "other", label: "Other" },
]

export default function FinanceGoalsPage() {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    const [goals, setGoals] = useState<FinancialGoal[]>([])
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
    const [categoryFilter, setCategoryFilter] = useState<"all" | GoalCategory>("all")
    const [achievedFilter, setAchievedFilter] = useState<"all" | "true" | "false">("all")
    const [targetDateStart, setTargetDateStart] = useState("")
    const [targetDateEnd, setTargetDateEnd] = useState("")
    const [sortBy, setSortBy] = useState<"name" | "targetAmount" | "currentAmount" | "targetDate" | "createdAt" | "updatedAt">("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [goalToDelete, setGoalToDelete] = useState<FinancialGoal | null>(null)
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
    const [selectedGoals, setSelectedGoals] = useState<FinancialGoal[]>([])
    const [showAmountDialog, setShowAmountDialog] = useState(false)
    const [goalForAmount, setGoalForAmount] = useState<FinancialGoal | null>(null)
    const [isAddAmount, setIsAddAmount] = useState(true)
    const [amountValue, setAmountValue] = useState("")
    const [isUpdatingAmount, setIsUpdatingAmount] = useState(false)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        if (isAuthenticated) {
            void fetchGoals()
        }
    }, [isAuthenticated, page, categoryFilter, achievedFilter, targetDateStart, targetDateEnd, sortBy, sortOrder, search])

    const fetchGoals = async () => {
        setIsFetching(true)
        try {
            const filters: FinancialGoalFilters = {
                page,
                limit: pageSize,
                category: categoryFilter !== "all" ? categoryFilter : undefined,
                achieved: achievedFilter !== "all" ? achievedFilter === "true" : undefined,
                startDate: targetDateStart || undefined,
                endDate: targetDateEnd || undefined,
                search: search || undefined,
                sortBy,
                sortOrder,
            }

            const response = await getFinancialGoals(filters)
            setGoals(response.data)
            setPagination(response.pagination)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to load financial goals. Please try again."
            toast.error(message)
        } finally {
            setIsFetching(false)
        }
    }

    // Reset to first page when filters/search change
    useEffect(() => {
        setPage(1)
    }, [categoryFilter, achievedFilter, targetDateStart, targetDateEnd, sortBy, sortOrder, search])

    const total = pagination.total

    const handleCreate = async (values: CreateFinancialGoalInput) => {
        setIsSubmitting(true)
        try {
            await createFinancialGoal(values)
            toast.success("Financial goal created successfully", {
                description: "Start tracking your progress towards your goal! 🎯",
            })
            setIsDialogOpen(false)
            setEditingGoal(null)
            await fetchGoals()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to create financial goal. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (values: UpdateFinancialGoalInput) => {
        if (!editingGoal) return
        setIsSubmitting(true)
        try {
            await updateFinancialGoal(editingGoal.id, values)
            toast.success("Financial goal updated successfully")
            setIsDialogOpen(false)
            setEditingGoal(null)
            await fetchGoals()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to update financial goal. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteClick = (goal: FinancialGoal) => {
        setGoalToDelete(goal)
        setShowDeleteDialog(true)
    }

    const handleDeleteConfirm = async () => {
        if (!goalToDelete) return
        setIsDeleting(true)
        try {
            await deleteFinancialGoal(goalToDelete.id)
            toast.success("Financial goal deleted successfully")
            setGoalToDelete(null)
            await fetchGoals()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete financial goal. Please try again."
            toast.error(message)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleBulkDeleteClick = (goals: FinancialGoal[]) => {
        setSelectedGoals(goals)
        setShowBulkDeleteDialog(true)
    }

    const handleBulkDeleteConfirm = async () => {
        if (selectedGoals.length === 0) return
        setIsBulkDeleting(true)
        try {
            const ids = selectedGoals.map((g) => g.id)
            const result = await bulkDeleteFinancialGoals(ids)
            if (result.failedIds && result.failedIds.length > 0) {
                toast.warning(
                    `Deleted ${result.deletedCount} goals. ${result.failedIds.length} failed.`
                )
            } else {
                toast.success(`Successfully deleted ${result.deletedCount} goal(s)`)
            }
            setSelectedGoals([])
            await fetchGoals()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete goals. Please try again."
            toast.error(message)
        } finally {
            setIsBulkDeleting(false)
        }
    }

    const handleAddAmountClick = (goal: FinancialGoal) => {
        setGoalForAmount(goal)
        setIsAddAmount(true)
        setAmountValue("")
        setShowAmountDialog(true)
    }

    const handleSubtractAmountClick = (goal: FinancialGoal) => {
        setGoalForAmount(goal)
        setIsAddAmount(false)
        setAmountValue("")
        setShowAmountDialog(true)
    }

    const handleAmountSubmit = async () => {
        if (!goalForAmount || !amountValue) return

        const amount = parseFloat(amountValue)
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount")
            return
        }

        setIsUpdatingAmount(true)
        try {
            const previousAmount = goalForAmount.currentAmount
            const previousMilestones = goalForAmount.milestones || []
            const previousAchievedMilestones = previousMilestones.filter(m => m.achieved)

            if (isAddAmount) {
                await addAmountToGoal(goalForAmount.id, amount)
                toast.success(`Added $${amount.toLocaleString()} to goal`, {
                    description: "Great progress! Keep it up! 🎉",
                })
            } else {
                if (amount > goalForAmount.currentAmount) {
                    toast.error("Cannot subtract more than the current amount")
                    setIsUpdatingAmount(false)
                    return
                }
                await subtractAmountFromGoal(goalForAmount.id, amount)
                toast.success(`Subtracted $${amount.toLocaleString()} from goal`)
            }

            // Fetch updated goal to check for milestone/achievement changes
            const updatedGoals = await getFinancialGoals({ limit: 1000 })
            const updatedGoal = updatedGoals.data.find(g => g.id === goalForAmount.id)

            if (updatedGoal) {
                // Check for newly achieved milestones
                const newMilestones = updatedGoal.milestones || []
                const newlyAchievedMilestones = newMilestones.filter(m => {
                    const wasAchieved = previousAchievedMilestones.some(pm =>
                        pm.amount === m.amount && pm.label === m.label
                    )
                    return m.achieved && !wasAchieved
                })

                newlyAchievedMilestones.forEach((milestone) => {
                    toast.success(`🎉 Milestone Achieved!`, {
                        description: `${milestone.label} - $${milestone.amount.toLocaleString()}`,
                        duration: 5000,
                    })
                })

                // Check for goal achievement
                if (!goalForAmount.achieved && updatedGoal.achieved) {
                    toast.success(`🎊 Goal Achieved! 🎊`, {
                        description: `Congratulations! You've achieved "${updatedGoal.name}"!`,
                        duration: 7000,
                    })
                }
            }

            setShowAmountDialog(false)
            setGoalForAmount(null)
            setAmountValue("")
            await fetchGoals()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : `Failed to ${isAddAmount ? "add" : "subtract"} amount. Please try again.`
            toast.error(message)
        } finally {
            setIsUpdatingAmount(false)
        }
    }

    const openCreateDialog = () => {
        setEditingGoal(null)
        setIsDialogOpen(true)
    }

    const openEditDialog = (goal: FinancialGoal) => {
        setEditingGoal(goal)
        setIsDialogOpen(true)
    }

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            setEditingGoal(null)
        }
        setIsDialogOpen(open)
    }

    const onSubmit = async (values: CreateFinancialGoalInput | UpdateFinancialGoalInput) => {
        if (editingGoal) {
            await handleUpdate(values as UpdateFinancialGoalInput)
        } else {
            await handleCreate(values as CreateFinancialGoalInput)
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
                    <h1 className="text-2xl md:text-3xl font-bold">Financial Goals</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        Set and track your financial goals
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchGoals}
                        disabled={isFetching}
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Goal
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-4 p-4 border rounded-lg bg-card">
                <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs text-muted-foreground">Search</Label>
                    <Input
                        placeholder="Search goals..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mt-1"
                    />
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <Select
                        value={categoryFilter}
                        onValueChange={(value) => setCategoryFilter(value as any)}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {GOAL_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Select
                        value={achievedFilter}
                        onValueChange={(value) => setAchievedFilter(value as any)}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="false">In Progress</SelectItem>
                            <SelectItem value="true">Achieved</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Target Date From</Label>
                    <Input
                        type="date"
                        value={targetDateStart}
                        onChange={(e) => setTargetDateStart(e.target.value)}
                        className="h-9 mt-1"
                    />
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Target Date To</Label>
                    <Input
                        type="date"
                        value={targetDateEnd}
                        onChange={(e) => setTargetDateEnd(e.target.value)}
                        className="h-9 mt-1"
                    />
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
                            <SelectItem value="targetAmount">Target Amount</SelectItem>
                            <SelectItem value="currentAmount">Current Amount</SelectItem>
                            <SelectItem value="targetDate">Target Date</SelectItem>
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

            {/* Financial Goals Table */}
            <FinancialGoalTable
                goals={goals}
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
                onAddAmount={handleAddAmountClick}
                onSubtractAmount={handleSubtractAmountClick}
                enableRowSelection={true}
                onSelectionChange={setSelectedGoals}
                onBulkDelete={handleBulkDeleteClick}
            />

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingGoal ? "Edit Financial Goal" : "Create New Financial Goal"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingGoal
                                ? "Update your financial goal details below."
                                : "Create a new financial goal to track your savings progress."}
                        </DialogDescription>
                    </DialogHeader>
                    <FinancialGoalForm
                        initialValues={editingGoal ? {
                            name: editingGoal.name,
                            targetAmount: editingGoal.targetAmount,
                            currentAmount: editingGoal.currentAmount,
                            category: editingGoal.category,
                            targetDate: editingGoal.targetDate,
                            description: editingGoal.description,
                            milestones: editingGoal.milestones.map(m => ({
                                amount: m.amount,
                                label: m.label,
                            })),
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
                title="Delete Financial Goal"
                description={
                    goalToDelete
                        ? `Are you sure you want to delete "${goalToDelete.name}"? This action cannot be undone.`
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
                title="Delete Financial Goals"
                description={`Are you sure you want to delete ${selectedGoals.length} goal(s)? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="destructive"
                isLoading={isBulkDeleting}
            />

            {/* Add/Subtract Amount Dialog */}
            <Dialog open={showAmountDialog} onOpenChange={setShowAmountDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isAddAmount ? "Add Amount" : "Subtract Amount"}
                        </DialogTitle>
                        <DialogDescription>
                            {goalForAmount && (
                                <>
                                    {isAddAmount
                                        ? `Add money to "${goalForAmount.name}"`
                                        : `Subtract money from "${goalForAmount.name}"`}
                                    <br />
                                    <span className="text-sm text-muted-foreground mt-1 block">
                                        Current: ${goalForAmount.currentAmount.toLocaleString()} / ${goalForAmount.targetAmount.toLocaleString()}
                                    </span>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={amountValue}
                                onChange={(e) => setAmountValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        handleAmountSubmit()
                                    }
                                }}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowAmountDialog(false)
                                setGoalForAmount(null)
                                setAmountValue("")
                            }}
                            disabled={isUpdatingAmount}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAmountSubmit} disabled={isUpdatingAmount || !amountValue}>
                            {isUpdatingAmount ? "Processing..." : isAddAmount ? "Add Amount" : "Subtract Amount"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

