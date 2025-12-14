"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw, List, Table2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
    getExpenseCategories,
    createExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    bulkDeleteExpenseCategories,
    reorderExpenseCategories,
    type ExpenseCategory,
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
import { ExpenseCategoryForm } from "@/components/features/finance/expense-categories/expense-category-form"
import { ExpenseCategoryTable } from "@/components/features/finance/expense-categories/expense-category-table"
import { DragDropList } from "@/components/ui/drag-drop-list"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function ExpenseCategoriesPage() {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    const [categories, setCategories] = useState<ExpenseCategory[]>([])
    const [isFetching, setIsFetching] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<ExpenseCategory | null>(null)
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
    const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>([])
    const [viewMode, setViewMode] = useState<"table" | "reorder">("table")
    const [isReordering, setIsReordering] = useState(false)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        if (isAuthenticated) {
            void fetchCategories()
        }
    }, [isAuthenticated])

    const fetchCategories = async () => {
        setIsFetching(true)
        try {
            const data = await getExpenseCategories()
            setCategories(data.sort((a, b) => a.order - b.order))
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to load expense categories. Please try again."
            toast.error(message)
        } finally {
            setIsFetching(false)
        }
    }

    const filteredCategories = useMemo(() => {
        let result = categories

        // Search
        if (search.trim()) {
            const term = search.toLowerCase()
            result = result.filter((category) => {
                return (
                    category.name.toLowerCase().includes(term) ||
                    (category.description && category.description.toLowerCase().includes(term)) ||
                    (category.icon && category.icon.toLowerCase().includes(term))
                )
            })
        }

        return result
    }, [categories, search])

    const pagedCategories = useMemo(() => {
        const start = (page - 1) * pageSize
        return filteredCategories.slice(start, start + pageSize)
    }, [filteredCategories, page, pageSize])

    const total = filteredCategories.length

    const handleCreate = async (values: any) => {
        setIsSubmitting(true)
        try {
            const created = await createExpenseCategory(values)
            setCategories((prev) => [...prev, created].sort((a, b) => a.order - b.order))
            toast.success("Expense category created successfully")
            setIsDialogOpen(false)
            setEditingCategory(null)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to create expense category. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (values: any) => {
        if (!editingCategory) return

        setIsSubmitting(true)
        try {
            const updated = await updateExpenseCategory(editingCategory.id, values)
            setCategories((prev) =>
                prev
                    .map((cat) => (cat.id === updated.id ? updated : cat))
                    .sort((a, b) => a.order - b.order)
            )
            toast.success("Expense category updated successfully")
            setIsDialogOpen(false)
            setEditingCategory(null)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to update expense category. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!categoryToDelete) return

        setIsDeleting(true)
        try {
            await deleteExpenseCategory(categoryToDelete.id)
            setCategories((prev) => prev.filter((cat) => cat.id !== categoryToDelete.id))
            toast.success("Expense category deleted successfully")
            setShowDeleteDialog(false)
            setCategoryToDelete(null)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete expense category. Please try again."
            toast.error(message)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleBulkDelete = async () => {
        if (selectedCategories.length === 0) return

        setIsBulkDeleting(true)
        try {
            const ids = selectedCategories.map((cat) => cat.id)
            await bulkDeleteExpenseCategories(ids)
            setCategories((prev) => prev.filter((cat) => !ids.includes(cat.id)))
            toast.success(`Successfully deleted ${selectedCategories.length} expense category(ies)`)
            setShowBulkDeleteDialog(false)
            setSelectedCategories([])
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete expense categories. Please try again."
            toast.error(message)
        } finally {
            setIsBulkDeleting(false)
        }
    }

    const handleReorder = async (reorderedItems: ExpenseCategory[]) => {
        setIsReordering(true)
        try {
            const categoryIds = reorderedItems.map((cat) => cat.id)
            await reorderExpenseCategories(categoryIds)
            setCategories(reorderedItems)
            toast.success("Categories reordered successfully")
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to reorder categories. Please try again."
            toast.error(message)
        } finally {
            setIsReordering(false)
        }
    }

    const openCreateDialog = () => {
        setEditingCategory(null)
        setIsDialogOpen(true)
    }

    const openEditDialog = (category: ExpenseCategory) => {
        setEditingCategory(category)
        setIsDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Expense Categories</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Manage your expense categories for better organization
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode(viewMode === "table" ? "reorder" : "table")}
                    >
                        {viewMode === "table" ? (
                            <>
                                <List className="mr-2 h-4 w-4" />
                                Reorder View
                            </>
                        ) : (
                            <>
                                <Table2 className="mr-2 h-4 w-4" />
                                Table View
                            </>
                        )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchCategories} disabled={isFetching}>
                        <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </div>
            </div>

            {viewMode === "reorder" ? (
                <div>
                    <DragDropList
                        items={categories}
                        getItemKey={(category) => category.id}
                        onReorder={handleReorder}
                        disabled={isReordering}
                        direction="vertical"
                        className="space-y-2"
                        renderItem={(category) => (
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {category.icon && (
                                                <span className="text-2xl" aria-hidden="true">
                                                    {category.icon}
                                                </span>
                                            )}
                                            {category.color && (
                                                <div
                                                    className="w-6 h-6 rounded-full border"
                                                    style={{ backgroundColor: category.color }}
                                                    aria-hidden="true"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{category.name}</div>
                                                {category.description && (
                                                    <div className="text-sm text-muted-foreground">{category.description}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Order: {category.order}</Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setViewMode("table")
                                                    openEditDialog(category)
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    />
                    {isReordering && (
                        <p className="text-sm text-muted-foreground text-center mt-4">
                            Saving new order...
                        </p>
                    )}
                </div>
            ) : (
                <ExpenseCategoryTable
                    categories={pagedCategories}
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPage}
                    search={search}
                    onSearchChange={setSearch}
                    isLoading={isFetching}
                    onEdit={openEditDialog}
                    onDelete={(category) => {
                        setCategoryToDelete(category)
                        setShowDeleteDialog(true)
                    }}
                    enableRowSelection
                    onSelectionChange={setSelectedCategories}
                    onBulkDelete={(selected) => {
                        setSelectedCategories(selected)
                        setShowBulkDeleteDialog(true)
                    }}
                />
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? "Edit Expense Category" : "Create Expense Category"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory
                                ? "Update the expense category details below."
                                : "Add a new expense category to organize your transactions."}
                        </DialogDescription>
                    </DialogHeader>
                    <ExpenseCategoryForm
                        initialValues={editingCategory || undefined}
                        onSubmit={editingCategory ? handleUpdate : handleCreate}
                        onCancel={() => {
                            setIsDialogOpen(false)
                            setEditingCategory(null)
                        }}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Delete Expense Category"
                description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
                isLoading={isDeleting}
                confirmVariant="destructive"
            />

            {/* Bulk Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showBulkDeleteDialog}
                onOpenChange={setShowBulkDeleteDialog}
                title="Delete Expense Categories"
                description={`Are you sure you want to delete ${selectedCategories.length} expense category(ies)? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleBulkDelete}
                isLoading={isBulkDeleting}
                confirmVariant="destructive"
            />
        </div>
    )
}

