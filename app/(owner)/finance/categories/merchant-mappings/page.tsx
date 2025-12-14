"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
    getMerchantCategories,
    createMerchantCategory,
    updateMerchantCategory,
    deleteMerchantCategory,
    type MerchantCategory,
    type CreateMerchantCategoryInput,
    type UpdateMerchantCategoryInput,
} from "@/lib/api/finance/finance-merchant-categories"
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
import { MerchantCategoryForm } from "@/components/features/finance/merchant-categories/merchant-category-form"
import { MerchantCategoryTable } from "@/components/features/finance/merchant-categories/merchant-category-table"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function MerchantMappingsPage() {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    const [mappings, setMappings] = useState<MerchantCategory[]>([])
    const [isFetching, setIsFetching] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingMapping, setEditingMapping] = useState<MerchantCategory | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [mappingToDelete, setMappingToDelete] = useState<MerchantCategory | null>(null)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {
        if (isAuthenticated) {
            void fetchMappings()
        }
    }, [isAuthenticated])

    const fetchMappings = async () => {
        setIsFetching(true)
        try {
            const data = await getMerchantCategories()
            // Sort by confidence (descending) and lastUsedAt (descending)
            setMappings(
                data.sort((a, b) => {
                    if (b.confidence !== a.confidence) {
                        return b.confidence - a.confidence
                    }
                    const aDate = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0
                    const bDate = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0
                    return bDate - aDate
                })
            )
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to load merchant category mappings. Please try again."
            toast.error(message)
        } finally {
            setIsFetching(false)
        }
    }

    const filteredMappings = useMemo(() => {
        let result = mappings

        // Search
        if (search.trim()) {
            const term = search.toLowerCase()
            result = result.filter((mapping) => {
                return (
                    mapping.merchantName.toLowerCase().includes(term) ||
                    mapping.categoryName.toLowerCase().includes(term)
                )
            })
        }

        return result
    }, [mappings, search])

    const pagedMappings = useMemo(() => {
        const start = (page - 1) * pageSize
        const end = start + pageSize
        return filteredMappings.slice(start, end)
    }, [filteredMappings, page, pageSize])

    const handleCreate = () => {
        setEditingMapping(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (mapping: MerchantCategory) => {
        setEditingMapping(mapping)
        setIsDialogOpen(true)
    }

    const handleDelete = (mapping: MerchantCategory) => {
        setMappingToDelete(mapping)
        setShowDeleteDialog(true)
    }

    const handleSubmit = async (data: CreateMerchantCategoryInput | UpdateMerchantCategoryInput) => {
        setIsSubmitting(true)
        try {
            if (editingMapping) {
                await updateMerchantCategory(editingMapping.id, data as UpdateMerchantCategoryInput)
                toast.success("Merchant category mapping updated successfully")
            } else {
                await createMerchantCategory(data as CreateMerchantCategoryInput)
                toast.success("Merchant category mapping created successfully")
            }
            setIsDialogOpen(false)
            setEditingMapping(null)
            await fetchMappings()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : editingMapping
                        ? "Failed to update merchant category mapping. Please try again."
                        : "Failed to create merchant category mapping. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleConfirmDelete = async () => {
        if (!mappingToDelete) return

        setIsDeleting(true)
        try {
            await deleteMerchantCategory(mappingToDelete.id)
            toast.success("Merchant category mapping deleted successfully")
            setShowDeleteDialog(false)
            setMappingToDelete(null)
            await fetchMappings()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete merchant category mapping. Please try again."
            toast.error(message)
        } finally {
            setIsDeleting(false)
        }
    }

    if (isLoading || isFetching) {
        return (
            <div className="container mx-auto py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Merchant Category Mappings</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                        Manage automatic category suggestions based on merchant names
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchMappings}
                        disabled={isFetching}
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Mapping
                    </Button>
                </div>
            </div>

            <MerchantCategoryTable
                mappings={pagedMappings}
                page={page}
                pageSize={pageSize}
                total={filteredMappings.length}
                onPageChange={setPage}
                search={search}
                onSearchChange={setSearch}
                isLoading={isFetching}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingMapping ? "Edit Merchant Category Mapping" : "Create Merchant Category Mapping"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingMapping
                                ? "Update the merchant name or category for this mapping."
                                : "Create a new mapping to automatically categorize transactions from this merchant."}
                        </DialogDescription>
                    </DialogHeader>
                    <MerchantCategoryForm
                        initialValues={editingMapping || undefined}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setIsDialogOpen(false)
                            setEditingMapping(null)
                        }}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Delete Merchant Category Mapping"
                description={`Are you sure you want to delete the mapping for "${mappingToDelete?.merchantName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="destructive"
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />
        </div>
    )
}

