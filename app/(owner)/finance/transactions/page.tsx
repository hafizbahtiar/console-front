"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, RefreshCcw, Table2, List, Calendar as CalendarIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    saveTransactionAsTemplate,
    duplicateTransaction,
    bulkDuplicateTransactions,
    type Transaction,
    type TransactionFilters,
    type TransactionType,
    type CreateTransactionInput,
} from "@/lib/api/finance"
import { deleteReceipt } from "@/lib/api/finance/finance-receipts"
import { getExpenseCategories, getIncomeCategories, type ExpenseCategory, type IncomeCategory } from "@/lib/api/finance"
import { RecurringTransactionForm } from "@/components/features/finance/recurring-transactions/recurring-transaction-form"
import { createRecurringTransaction } from "@/lib/api/finance"
import { ApiClientError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { TransactionForm } from "@/components/features/finance/transactions/transaction-form"
import { TransactionTable } from "@/components/features/finance/transactions/transaction-table"
import { TransactionCardView } from "@/components/features/finance/transactions/transaction-card-view"
import { TransactionTimeline } from "@/components/features/finance/transactions/transaction-timeline"
import { TransactionCalendar } from "@/components/features/finance/transactions/transaction-calendar"
import { ReceiptViewerModal } from "@/components/features/finance/receipts/receipt-viewer-modal"
import { useIsMobile } from "@/hooks/use-mobile"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { QuickAddTransactionForm } from "@/components/features/finance/transactions/quick-add-transaction-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { FilterChips } from "@/components/features/finance/filter-chips"
import { BreadcrumbNavigation } from "@/components/features/finance/breadcrumb-navigation"
import { FilterPresetMenu } from "@/components/features/finance/filter-presets/filter-preset-menu"
import { SearchAutocomplete } from "@/components/features/finance/search/search-autocomplete"
import { QuickFilterButtons, type QuickFilterType } from "@/components/features/finance/transactions/quick-filter-buttons"
import {
    queryParamsToFilters,
    filtersToQueryParams,
    generateFilterChips,
    removeFilter,
    type FinanceFilterState,
} from "@/lib/utils/finance-filters"
import { getCurrencySymbol, getCurrencyName } from "@/lib/utils/currency"
import { TRANSACTION_UPDATE_EVENT } from "@/hooks/finance/use-transaction-count"
import { CurrencyDisplay } from "@/components/features/finance/currency/currency-display"

export default function FinanceTransactionsPage() {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const isMobile = useIsMobile()

    const [transactions, setTransactions] = useState<Transaction[]>([])
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
    const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [dateRangeFilter, setDateRangeFilter] = useState<"all" | "month" | "year" | "custom">("all")
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all")
    const [currencyFilter, setCurrencyFilter] = useState<string>("all")
    const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterType | null>(null)
    const [minAmountFilter, setMinAmountFilter] = useState<number | undefined>(undefined)
    const [sortBy, setSortBy] = useState<"date" | "amount" | "createdAt" | "updatedAt">("date")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
    const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([])
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
    const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([])
    const [showRecurringDialog, setShowRecurringDialog] = useState(false)
    const [transactionForRecurring, setTransactionForRecurring] = useState<CreateTransactionInput | null>(null)
    const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false)
    const [transactionForTemplate, setTransactionForTemplate] = useState<{ data: CreateTransactionInput; id?: string } | null>(null)
    const [showQuickAddDialog, setShowQuickAddDialog] = useState(false)
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
    const [transactionToDuplicate, setTransactionToDuplicate] = useState<Transaction | null>(null)
    const [showBulkDuplicateDialog, setShowBulkDuplicateDialog] = useState(false)
    const [isDuplicating, setIsDuplicating] = useState(false)
    const [isBulkDuplicating, setIsBulkDuplicating] = useState(false)
    const [viewMode, setViewMode] = useState<"table" | "timeline" | "calendar">("table")
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]) // For timeline view
    const [viewingReceipt, setViewingReceipt] = useState<Transaction | null>(null) // For card view receipt modal

    // Read filters from URL on mount
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
            return
        }

        // Read URL params and set initial filter state
        const urlFilters = queryParamsToFilters(searchParams)

        if (urlFilters.type) {
            setTypeFilter(urlFilters.type)
        }
        if (urlFilters.categoryId) {
            setCategoryFilter(urlFilters.categoryId)
        }
        if (urlFilters.startDate || urlFilters.endDate) {
            setDateRangeFilter("custom")
            if (urlFilters.startDate) setStartDate(urlFilters.startDate)
            if (urlFilters.endDate) setEndDate(urlFilters.endDate)
        }
        if (urlFilters.search) {
            setSearch(urlFilters.search)
        }
        if (urlFilters.paymentMethod) {
            setPaymentMethodFilter(urlFilters.paymentMethod)
        }
    }, [isLoading, isAuthenticated, router, searchParams])

    // Keyboard shortcut: Cmd/Ctrl + N for quick add
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "n" && !e.shiftKey) {
                e.preventDefault()
                if (!showQuickAddDialog && !isDialogOpen) {
                    setShowQuickAddDialog(true)
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [showQuickAddDialog, isDialogOpen])

    useEffect(() => {
        if (isAuthenticated) {
            void fetchTransactions()
            void fetchCategories()
        }
    }, [isAuthenticated, page, typeFilter, categoryFilter, dateRangeFilter, startDate, endDate, paymentMethodFilter, currencyFilter, sortBy, sortOrder, search, minAmountFilter])

    const fetchCategories = async () => {
        try {
            const [expenses, income] = await Promise.all([
                getExpenseCategories(),
                getIncomeCategories(),
            ])
            setExpenseCategories(expenses)
            setIncomeCategories(income)
        } catch (error: any) {
            // Silently fail - categories are optional
            console.error("Failed to load categories:", error)
        }
    }

    const getDateRangeParams = () => {
        let start: string | undefined
        let end: string | undefined

        if (dateRangeFilter === "month") {
            start = format(startOfMonth(new Date()), "yyyy-MM-dd")
            end = format(endOfMonth(new Date()), "yyyy-MM-dd")
        } else if (dateRangeFilter === "year") {
            start = format(startOfYear(new Date()), "yyyy-MM-dd")
            end = format(endOfYear(new Date()), "yyyy-MM-dd")
        } else if (dateRangeFilter === "custom") {
            start = startDate || undefined
            end = endDate || undefined
        }

        return { startDate: start, endDate: end }
    }

    const fetchTransactions = async () => {
        setIsFetching(true)
        try {
            const { startDate: start, endDate: end } = getDateRangeParams()

            const filters: TransactionFilters = {
                page,
                limit: pageSize,
                type: typeFilter !== "all" ? typeFilter : undefined,
                categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
                startDate: start,
                endDate: end,
                search: search.trim() || undefined,
                paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
                currency: currencyFilter !== "all" ? currencyFilter : undefined,
                sortBy,
                sortOrder,
            }

            // Fetch transactions
            const response = await getTransactions(filters)
            
            // Filter by amount if minAmountFilter is set (for "Large Expenses")
            let filteredTransactions = response.data
            if (minAmountFilter !== undefined) {
                filteredTransactions = filteredTransactions.filter(
                    (t) => Math.abs(t.amount) >= minAmountFilter
                )
            }

            setTransactions(filteredTransactions)
            setPagination(response.pagination)

            // For timeline and calendar views, fetch all transactions (no pagination)
            if (viewMode === "timeline" || viewMode === "calendar") {
                const allFilters: TransactionFilters = {
                    ...filters,
                    page: 1,
                    limit: 10000, // Large limit to get all transactions
                }
                const allResponse = await getTransactions(allFilters)
                // Apply amount filter to all transactions too
                let filteredAllTransactions = allResponse.data
                if (minAmountFilter !== undefined) {
                    filteredAllTransactions = filteredAllTransactions.filter(
                        (t) => Math.abs(t.amount) >= minAmountFilter
                    )
                }
                setAllTransactions(filteredAllTransactions)
            }
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to load transactions. Please try again."
            toast.error(message)
        } finally {
            setIsFetching(false)
        }
    }

    const paymentMethods = useMemo(() => {
        const set = new Set<string>()
        transactions.forEach((transaction) => {
            if (transaction.paymentMethod) {
                set.add(transaction.paymentMethod)
            }
        })
        return Array.from(set).sort()
    }, [transactions])

    const allCategories = useMemo(() => {
        return [
            ...expenseCategories.map(cat => ({ ...cat, type: 'expense' as const })),
            ...incomeCategories.map(cat => ({ ...cat, type: 'income' as const })),
        ]
    }, [expenseCategories, incomeCategories])

    const currencies = useMemo(() => {
        const set = new Set<string>()
        transactions.forEach((transaction) => {
            if (transaction.currency) {
                set.add(transaction.currency)
            } else {
                set.add("MYR") // Default currency
            }
        })
        return Array.from(set).sort()
    }, [transactions])

    // Reset to first page when filters/search change
    useEffect(() => {
        setPage(1)
    }, [typeFilter, categoryFilter, dateRangeFilter, startDate, endDate, paymentMethodFilter, sortBy, sortOrder, search])

    // Fetch all transactions when switching to timeline or calendar view
    useEffect(() => {
        if ((viewMode === "timeline" || viewMode === "calendar") && !isFetching) {
            void fetchTransactions()
        }
    }, [viewMode])

    // Update URL query params when filters change
    useEffect(() => {
        if (!isAuthenticated) return

        const { startDate: start, endDate: end } = getDateRangeParams()
        const filters: FinanceFilterState = {
            type: typeFilter !== "all" ? typeFilter : undefined,
            categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
            startDate: start,
            endDate: end,
            search: search.trim() || undefined,
            paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
        }

        const params = filtersToQueryParams(filters)
        const queryString = new URLSearchParams(params).toString()
        const newUrl = `/finance/transactions${queryString ? `?${queryString}` : ''}`

        // Only update URL if it's different (avoid infinite loop)
        if (window.location.pathname + window.location.search !== newUrl) {
            router.replace(newUrl, { scroll: false })
        }
    }, [typeFilter, categoryFilter, dateRangeFilter, startDate, endDate, paymentMethodFilter, search, isAuthenticated, router])

    // Generate filter chips
    const filterChips = useMemo(() => {
        const { startDate: start, endDate: end } = getDateRangeParams()
        const filters: FinanceFilterState = {
            type: typeFilter !== "all" ? typeFilter : undefined,
            categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
            startDate: start,
            endDate: end,
            search: search.trim() || undefined,
            paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
        }

        const categoryMap = new Map<string, string>()
        allCategories.forEach(cat => {
            categoryMap.set(cat.id, cat.name)
        })

        return generateFilterChips(filters, categoryMap)
    }, [typeFilter, categoryFilter, dateRangeFilter, startDate, endDate, paymentMethodFilter, search, allCategories])

    // Handle quick filter click
    const handleQuickFilterClick = (
        filterType: QuickFilterType,
        dateRange?: { startDate: string; endDate: string },
        typeFilterValue?: "expense",
        amountFilter?: number
    ) => {
        setActiveQuickFilter(filterType)
        
        if (dateRange) {
            setStartDate(dateRange.startDate)
            setEndDate(dateRange.endDate)
            setDateRangeFilter("custom")
        }
        
        if (typeFilterValue) {
            setTypeFilter(typeFilterValue)
        }
        
        if (amountFilter !== undefined) {
            setMinAmountFilter(amountFilter)
        } else {
            setMinAmountFilter(undefined)
        }
        
        // Reset page to 1 when applying filter
        setPage(1)
        
        // Trigger fetch
        setTimeout(() => {
            void fetchTransactions()
        }, 100)
    }

    // Handle clear quick filter
    const handleClearQuickFilter = () => {
        setActiveQuickFilter(null)
        setMinAmountFilter(undefined)
        // Don't clear other filters, just the quick filter state
    }

    // Handle filter removal
    const handleRemoveFilter = (filterType: 'type' | 'category' | 'date' | 'search' | 'paymentMethod' | 'currency') => {
        switch (filterType) {
            case 'type':
                setTypeFilter("all")
                // Clear quick filter if it was a type-based filter
                if (activeQuickFilter === "large-expenses") {
                    setActiveQuickFilter(null)
                    setMinAmountFilter(undefined)
                }
                break
            case 'category':
                setCategoryFilter("all")
                break
            case 'date':
                setDateRangeFilter("all")
                setStartDate("")
                setEndDate("")
                // Clear quick filter if it was a date-based filter
                if (activeQuickFilter && activeQuickFilter !== "large-expenses") {
                    setActiveQuickFilter(null)
                }
                break
            case 'search':
                setSearch("")
                break
            case 'paymentMethod':
                setPaymentMethodFilter("all")
                break
            case 'currency':
                setCurrencyFilter("all")
                break
        }
    }

    const handleClearAllFilters = () => {
        setTypeFilter("all")
        setCategoryFilter("all")
        setDateRangeFilter("all")
        setStartDate("")
        setEndDate("")
        setSearch("")
        setPaymentMethodFilter("all")
        setCurrencyFilter("all")
        setActiveQuickFilter(null)
        setMinAmountFilter(undefined)
        setPage(1)
    }

    const total = pagination.total
    
    // Calculate actual displayed count (accounting for client-side filtering like "Large Expenses")
    const displayedCount = transactions.length
    const totalFilteredCount = minAmountFilter !== undefined 
        ? transactions.length // When client-side filtering is active, we can't know the true total without fetching all
        : pagination.total

    // Calculate totals from filtered transactions
    // Use allTransactions for timeline/calendar views, transactions for table view
    const transactionsForTotals = viewMode === "table" ? transactions : allTransactions
    
    const totals = useMemo(() => {
        let totalIncome = 0
        let totalExpenses = 0
        const currencies = new Set<string>()

        transactionsForTotals.forEach((transaction) => {
            // Use baseAmount if available (for multi-currency), otherwise use amount
            const amount = transaction.baseAmount !== undefined ? transaction.baseAmount : transaction.amount
            
            if (transaction.type === "income") {
                totalIncome += amount
            } else {
                totalExpenses += amount
            }

            // Track currencies
            const currency = transaction.currency || transaction.baseCurrency || "MYR"
            currencies.add(currency)
        })

        const netAmount = totalIncome - totalExpenses
        const hasMultipleCurrencies = currencies.size > 1
        const primaryCurrency = Array.from(currencies)[0] || "MYR"

        return {
            totalIncome,
            totalExpenses,
            netAmount,
            currencies: Array.from(currencies),
            hasMultipleCurrencies,
            primaryCurrency,
        }
    }, [transactionsForTotals, viewMode])

    const handleCreate = async (values: any) => {
        setIsSubmitting(true)
        try {
            const created = await createTransaction(values)
            toast.success("Transaction created successfully")
            setIsDialogOpen(false)
            setEditingTransaction(null)
            await fetchTransactions()
            // Dispatch event to update sidebar count
            window.dispatchEvent(new CustomEvent(TRANSACTION_UPDATE_EVENT))
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to create transaction. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (values: any) => {
        if (!editingTransaction) return
        setIsSubmitting(true)
        try {
            const updated = await updateTransaction(editingTransaction.id, values)
            toast.success("Transaction updated successfully")
            setIsDialogOpen(false)
            setEditingTransaction(null)
            await fetchTransactions()
            // Dispatch event to update sidebar count
            window.dispatchEvent(new CustomEvent(TRANSACTION_UPDATE_EVENT))
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to update transaction. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteClick = (transaction: Transaction) => {
        setTransactionToDelete(transaction)
        setShowDeleteDialog(true)
    }

    const handleDeleteConfirm = async () => {
        if (!transactionToDelete) return
        setIsDeleting(true)
        try {
            await deleteTransaction(transactionToDelete.id)
            toast.success("Transaction deleted successfully")
            setTransactionToDelete(null)
            await fetchTransactions()
            // Dispatch event to update sidebar count
            window.dispatchEvent(new CustomEvent(TRANSACTION_UPDATE_EVENT))
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete transaction. Please try again."
            toast.error(message)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleBulkDeleteClick = (transactions: Transaction[]) => {
        setSelectedTransactions(transactions)
        setShowBulkDeleteDialog(true)
    }

    const handleBulkDeleteConfirm = async () => {
        if (selectedTransactions.length === 0) return
        setIsBulkDeleting(true)
        try {
            const ids = selectedTransactions.map((t) => t.id)
            const result = await bulkDeleteTransactions(ids)
            if (result.failedIds.length > 0) {
                toast.warning(
                    `Deleted ${result.deletedCount} transactions. ${result.failedIds.length} failed.`
                )
            } else {
                toast.success(`Successfully deleted ${result.deletedCount} transaction(s)`)
            }
            setSelectedTransactions([])
            await fetchTransactions()
            // Dispatch event to update sidebar count
            window.dispatchEvent(new CustomEvent(TRANSACTION_UPDATE_EVENT))
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to delete transactions. Please try again."
            toast.error(message)
        } finally {
            setIsBulkDeleting(false)
        }
    }

    const openCreateDialog = () => {
        setEditingTransaction(null)
        setIsDialogOpen(true)
    }

    const openEditDialog = (transaction: Transaction) => {
        setEditingTransaction(transaction)
        setIsDialogOpen(true)
    }

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            setEditingTransaction(null)
        }
        setIsDialogOpen(open)
    }

    const onSubmit = async (values: any) => {
        if (editingTransaction) {
            await handleUpdate(values)
        } else {
            await handleCreate(values)
        }
    }

    const handleSaveAsRecurring = (data: CreateTransactionInput) => {
        setTransactionForRecurring(data)
        setIsDialogOpen(false)
        setShowRecurringDialog(true)
    }

    const handleSaveAsTemplate = (data: CreateTransactionInput) => {
        setTransactionForTemplate({ data, id: editingTransaction?.id })
        setIsDialogOpen(false)
        setShowSaveTemplateDialog(true)
    }

    const handleCreateTemplate = async (name: string, category?: string) => {
        if (!transactionForTemplate) return

        setIsSubmitting(true)
        try {
            if (transactionForTemplate.id) {
                // Save existing transaction as template
                await saveTransactionAsTemplate(transactionForTemplate.id, name, category)
                toast.success("Transaction template created successfully")
            } else {
                // This would require creating a template API that accepts transaction data
                // For now, we'll just show an error
                toast.error("Please save the transaction first before creating a template")
            }
            setShowSaveTemplateDialog(false)
            setTransactionForTemplate(null)
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

    const handleCreateRecurring = async (values: any) => {
        setIsSubmitting(true)
        try {
            await createRecurringTransaction({
                template: {
                    amount: transactionForRecurring!.amount,
                    description: transactionForRecurring!.description,
                    type: transactionForRecurring!.type,
                    categoryId: transactionForRecurring!.categoryId || null,
                    notes: transactionForRecurring!.notes,
                    tags: transactionForRecurring!.tags,
                    paymentMethod: transactionForRecurring!.paymentMethod,
                    reference: transactionForRecurring!.reference,
                },
                frequency: values.frequency,
                interval: values.frequency === "custom" ? values.interval : undefined,
                startDate: values.startDate,
                endDate: values.endDate || undefined,
                isActive: values.isActive,
            })
            toast.success("Recurring transaction created successfully")
            setShowRecurringDialog(false)
            setTransactionForRecurring(null)
            await fetchTransactions()
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

    const handleQuickAdd = async (data: CreateTransactionInput) => {
        setIsSubmitting(true)
        try {
            await createTransaction(data)
            toast.success("Transaction added successfully")
            setShowQuickAddDialog(false)
            await fetchTransactions()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to add transaction. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDuplicate = async (transaction: Transaction, dateAdjustment?: number) => {
        setIsDuplicating(true)
        try {
            await duplicateTransaction(transaction.id, dateAdjustment)
            toast.success("Transaction duplicated successfully")
            setShowDuplicateDialog(false)
            setTransactionToDuplicate(null)
            await fetchTransactions()
            // Dispatch event to update sidebar count
            window.dispatchEvent(new CustomEvent(TRANSACTION_UPDATE_EVENT))
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to duplicate transaction. Please try again."
            toast.error(message)
        } finally {
            setIsDuplicating(false)
        }
    }

    const handleBulkDuplicate = async (transactions: Transaction[], dateAdjustment?: number) => {
        if (transactions.length === 0) return

        setIsBulkDuplicating(true)
        try {
            const ids = transactions.map((t) => t.id)
            const result = await bulkDuplicateTransactions(ids, dateAdjustment)
            if (result.failedIds.length > 0) {
                toast.warning(
                    `Duplicated ${result.duplicatedCount} transaction(s). ${result.failedIds.length} failed.`
                )
            } else {
                toast.success(`Successfully duplicated ${result.duplicatedCount} transaction(s)`)
            }
            setShowBulkDuplicateDialog(false)
            setSelectedTransactions([])
            await fetchTransactions()
            // Dispatch event to update sidebar count
            window.dispatchEvent(new CustomEvent(TRANSACTION_UPDATE_EVENT))
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to duplicate transactions. Please try again."
            toast.error(message)
        } finally {
            setIsBulkDuplicating(false)
        }
    }

    if (!isAuthenticated && !isLoading) {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-semibold">Transactions</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your income and expense transactions.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View Toggle - Touch-friendly on mobile */}
                    <div className="flex items-center gap-1 border rounded-lg p-1">
                        <Button
                            type="button"
                            variant={viewMode === "table" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("table")}
                            className="h-9 sm:h-8 min-w-[44px] sm:min-w-0"
                            title="Table view"
                        >
                            <Table2 className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Table</span>
                        </Button>
                        <Button
                            type="button"
                            variant={viewMode === "timeline" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("timeline")}
                            className="h-9 sm:h-8 min-w-[44px] sm:min-w-0"
                            title="Timeline view"
                        >
                            <List className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Timeline</span>
                        </Button>
                        <Button
                            type="button"
                            variant={viewMode === "calendar" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("calendar")}
                            className="h-9 sm:h-8 min-w-[44px] sm:min-w-0"
                            title="Calendar view"
                        >
                            <CalendarIcon className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Calendar</span>
                        </Button>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => void fetchTransactions()}
                        disabled={isFetching}
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </Button>
                    <Button type="button" onClick={openCreateDialog}>
                        <Plus className="w-4 h-4 mr-1" />
                        New Transaction
                    </Button>
                </div>
            </div>

            {/* Quick Filter Buttons */}
            <QuickFilterButtons
                activeFilter={activeQuickFilter}
                onFilterClick={handleQuickFilterClick}
                onClearFilter={handleClearQuickFilter}
                largeExpenseThreshold={100}
            />

            {/* Search Bar and Filter Presets */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <SearchAutocomplete
                        value={search}
                        onChange={setSearch}
                        onSearch={(query) => {
                            setSearch(query)
                            void fetchTransactions()
                        }}
                        placeholder="Search transactions by description, notes, or reference..."
                    />
                </div>
                <FilterPresetMenu
                    currentFilters={{
                        type: typeFilter !== "all" ? typeFilter : undefined,
                        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
                        startDate,
                        endDate,
                        search: search.trim() || undefined,
                        paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
                        currency: currencyFilter !== "all" ? currencyFilter : undefined,
                    }}
                    onLoadPreset={(filters) => {
                        // Apply preset filters
                        if (filters.type) {
                            setTypeFilter(filters.type)
                        } else {
                            setTypeFilter("all")
                        }
                        if (filters.categoryId) {
                            setCategoryFilter(filters.categoryId)
                        } else {
                            setCategoryFilter("all")
                        }
                        if (filters.startDate) {
                            setStartDate(filters.startDate)
                            setDateRangeFilter("custom")
                        }
                        if (filters.endDate) {
                            setEndDate(filters.endDate)
                            setDateRangeFilter("custom")
                        }
                        if (filters.search) {
                            setSearch(filters.search)
                        } else {
                            setSearch("")
                        }
                        if (filters.paymentMethod) {
                            setPaymentMethodFilter(filters.paymentMethod)
                        } else {
                            setPaymentMethodFilter("all")
                        }
                        if (filters.currency) {
                            setCurrencyFilter(filters.currency)
                        } else {
                            setCurrencyFilter("all")
                        }
                        // Trigger fetch
                        setTimeout(() => {
                            void fetchTransactions()
                        }, 100)
                    }}
                />
            </div>

            {/* Filter Chips and Transaction Count */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {filterChips.length > 0 && (
                    <FilterChips
                        chips={filterChips}
                        onRemove={handleRemoveFilter}
                        onClearAll={handleClearAllFilters}
                    />
                )}
                <div className="flex items-center gap-2 ml-auto">
                    {filterChips.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {filterChips.length} filter{filterChips.length !== 1 ? "s" : ""} active
                        </Badge>
                    )}
                    {/* Transaction Count Badge */}
                    {totalFilteredCount > 0 && (
                        <Badge variant="outline" className="text-xs font-medium">
                            {totalFilteredCount === displayedCount
                                ? `${displayedCount} transaction${displayedCount !== 1 ? "s" : ""}`
                                : `Showing ${displayedCount} of ${totalFilteredCount} transaction${totalFilteredCount !== 1 ? "s" : ""}`}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Total Amount Summary */}
            {transactionsForTotals.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-card">
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground font-medium">Total Income</div>
                        <div className="flex items-center gap-2">
                            <CurrencyDisplay
                                amount={totals.totalIncome}
                                currency={totals.primaryCurrency}
                                variant="income"
                                className="text-lg font-semibold"
                            />
                            {totals.hasMultipleCurrencies && (
                                <Badge variant="outline" className="text-xs">
                                    {totals.currencies.length} currencies
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground font-medium">Total Expenses</div>
                        <div className="flex items-center gap-2">
                            <CurrencyDisplay
                                amount={totals.totalExpenses}
                                currency={totals.primaryCurrency}
                                variant="expense"
                                className="text-lg font-semibold"
                            />
                            {totals.hasMultipleCurrencies && (
                                <Badge variant="outline" className="text-xs">
                                    {totals.currencies.length} currencies
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground font-medium">Net Amount</div>
                        <div className="flex items-center gap-2">
                            <CurrencyDisplay
                                amount={totals.netAmount}
                                currency={totals.primaryCurrency}
                                variant={totals.netAmount >= 0 ? "income" : "expense"}
                                className="text-lg font-semibold"
                            />
                            {totals.hasMultipleCurrencies && (
                                <Badge variant="outline" className="text-xs">
                                    {totals.currencies.length} currencies
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters - Stack vertically on mobile */}
            <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Type</Label>
                        <Select
                            value={typeFilter}
                            onValueChange={(value) => setTypeFilter(value as "all" | TransactionType)}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Category</Label>
                        <Select
                            value={categoryFilter}
                            onValueChange={(value) => setCategoryFilter(value)}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                {allCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name} ({category.type})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Date Range</Label>
                        <Select
                            value={dateRangeFilter}
                            onValueChange={(value) => setDateRangeFilter(value as any)}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {dateRangeFilter === "custom" && (
                        <>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Start Date</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">End Date</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Payment Method</Label>
                        <Select
                            value={paymentMethodFilter}
                            onValueChange={(value) => setPaymentMethodFilter(value)}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="All methods" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All methods</SelectItem>
                                {paymentMethods.map((method) => (
                                    <SelectItem key={method} value={method}>
                                        {method}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Currency</Label>
                        <Select
                            value={currencyFilter}
                            onValueChange={(value) => setCurrencyFilter(value)}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="All currencies" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All currencies</SelectItem>
                                {currencies.map((currency) => (
                                    <SelectItem key={currency} value={currency}>
                                        {getCurrencySymbol(currency)} {currency} - {getCurrencyName(currency)}
                                    </SelectItem>
                                ))}
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
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="amount">Amount</SelectItem>
                                <SelectItem value="createdAt">Created At</SelectItem>
                                <SelectItem value="updatedAt">Updated At</SelectItem>
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
            </div>

            {/* Transaction View */}
            {viewMode === "table" ? (
                // Show card view on mobile, table view on desktop
                isMobile ? (
                    <>
                        <TransactionCardView
                            transactions={transactions}
                            onEdit={openEditDialog}
                            onDelete={handleDeleteClick}
                            onDuplicate={(transaction) => {
                                setTransactionToDuplicate(transaction)
                                setShowDuplicateDialog(true)
                            }}
                            onReceiptView={setViewingReceipt}
                        />
                        {/* Pagination for card view */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Page {pagination.page} of {pagination.totalPages}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(page - 1)}
                                        disabled={!pagination.hasPreviousPage || isFetching}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(page + 1)}
                                        disabled={!pagination.hasNextPage || isFetching}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                        {/* Receipt Viewer Modal for card view */}
                        {viewingReceipt && (
                            <ReceiptViewerModal
                                transactionId={viewingReceipt.id}
                                receiptUrl={viewingReceipt.receiptUrl}
                                receiptFilename={viewingReceipt.receiptFilename}
                                receiptMimetype={viewingReceipt.receiptMimetype}
                                receiptSize={viewingReceipt.receiptSize}
                                open={!!viewingReceipt}
                                onClose={() => setViewingReceipt(null)}
                                onDelete={async () => {
                                    if (viewingReceipt) {
                                        await deleteReceipt(viewingReceipt.id)
                                        await fetchTransactions()
                                    }
                                    setViewingReceipt(null)
                                }}
                                showDelete={true}
                            />
                        )}
                    </>
                ) : (
                <TransactionTable
                    transactions={transactions}
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
                    onDuplicate={(transaction) => {
                        setTransactionToDuplicate(transaction)
                        setShowDuplicateDialog(true)
                    }}
                    onReceiptDelete={async () => {
                        // Refresh transaction list after receipt deletion
                        await fetchTransactions()
                    }}
                    enableRowSelection={true}
                    onSelectionChange={setSelectedTransactions}
                    onBulkDelete={handleBulkDeleteClick}
                    onBulkDuplicate={(transactions) => {
                        setSelectedTransactions(transactions)
                        setShowBulkDuplicateDialog(true)
                    }}
                />
                )
            ) : viewMode === "timeline" ? (
                <TransactionTimeline
                    transactions={allTransactions}
                    onTransactionClick={(transaction) => {
                        openEditDialog(transaction)
                    }}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteClick}
                    isLoading={isFetching}
                />
            ) : (
                <TransactionCalendar
                    transactions={allTransactions}
                    onTransactionClick={(transaction) => {
                        openEditDialog(transaction)
                    }}
                    isLoading={isFetching}
                />
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTransaction ? "Edit Transaction" : "Create Transaction"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTransaction
                                ? "Update the transaction details below."
                                : "Fill in the details to create a new transaction."}
                        </DialogDescription>
                    </DialogHeader>
                    <TransactionForm
                        initialValues={editingTransaction ? {
                            amount: editingTransaction.amount,
                            date: editingTransaction.date.split("T")[0],
                            description: editingTransaction.description,
                            type: editingTransaction.type,
                            categoryId: editingTransaction.categoryId,
                            notes: editingTransaction.notes,
                            tags: editingTransaction.tags,
                            paymentMethod: editingTransaction.paymentMethod,
                            reference: editingTransaction.reference,
                            currency: editingTransaction.currency,
                            receiptUrl: editingTransaction.receiptUrl,
                            receiptFilename: editingTransaction.receiptFilename,
                            receiptMimetype: editingTransaction.receiptMimetype,
                            receiptSize: editingTransaction.receiptSize,
                        } : undefined}
                        onSubmit={onSubmit}
                        onCancel={() => handleDialogClose(false)}
                        isSubmitting={isSubmitting}
                        onSaveAsRecurring={handleSaveAsRecurring}
                        transactionId={editingTransaction?.id}
                        transaction={editingTransaction || undefined}
                        onReceiptChange={async () => {
                            // Refresh transaction list after receipt change
                            await fetchTransactions()
                            // Refresh editing transaction if dialog is still open
                            if (editingTransaction) {
                                const updated = await getTransaction(editingTransaction.id)
                                setEditingTransaction(updated)
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDeleteConfirm}
                title="Delete Transaction"
                description={`Are you sure you want to delete this transaction? This action cannot be undone.`}
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
                title="Delete Transactions"
                description={`Are you sure you want to delete ${selectedTransactions.length} transaction(s)? This action cannot be undone.`}
                confirmText="Delete All"
                cancelText="Cancel"
                confirmVariant="destructive"
                isLoading={isBulkDeleting}
            />

            {/* Save as Recurring Dialog */}
            {transactionForRecurring && (
                <Dialog open={showRecurringDialog} onOpenChange={setShowRecurringDialog}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Recurring Transaction</DialogTitle>
                            <DialogDescription>
                                Create a recurring transaction based on this transaction. The transaction details have been pre-filled.
                            </DialogDescription>
                        </DialogHeader>
                        <RecurringTransactionForm
                            initialValues={{
                                template: {
                                    amount: transactionForRecurring.amount,
                                    description: transactionForRecurring.description,
                                    type: transactionForRecurring.type,
                                    categoryId: transactionForRecurring.categoryId || null,
                                    notes: transactionForRecurring.notes,
                                    tags: transactionForRecurring.tags,
                                    paymentMethod: transactionForRecurring.paymentMethod,
                                    reference: transactionForRecurring.reference,
                                },
                                frequency: "monthly",
                                interval: 1,
                                startDate: transactionForRecurring.date,
                                endDate: undefined,
                                isActive: true,
                            }}
                            onSubmit={handleCreateRecurring}
                            onCancel={() => {
                                setShowRecurringDialog(false)
                                setTransactionForRecurring(null)
                            }}
                            isSubmitting={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>
            )}

            {/* Save as Template Dialog */}
            <Dialog open={showSaveTemplateDialog} onOpenChange={setShowSaveTemplateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save as Template</DialogTitle>
                        <DialogDescription>
                            Enter a name for this transaction template
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="template-name">Template Name</Label>
                            <Input
                                id="template-name"
                                placeholder="e.g., Monthly Rent"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                        handleCreateTemplate(e.currentTarget.value.trim())
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="template-category">Category (Optional)</Label>
                            <Input
                                id="template-category"
                                placeholder="e.g., Bills, Subscriptions"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                        const nameInput = document.getElementById("template-name") as HTMLInputElement
                                        if (nameInput?.value.trim()) {
                                            handleCreateTemplate(nameInput.value.trim(), e.currentTarget.value.trim())
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowSaveTemplateDialog(false)
                                    setTransactionForTemplate(null)
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    const nameInput = document.getElementById("template-name") as HTMLInputElement
                                    const categoryInput = document.getElementById("template-category") as HTMLInputElement
                                    if (nameInput?.value.trim()) {
                                        handleCreateTemplate(nameInput.value.trim(), categoryInput?.value.trim() || undefined)
                                    } else {
                                        toast.error("Template name is required")
                                    }
                                }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : "Create Template"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Quick Add Dialog */}
            <Dialog open={showQuickAddDialog} onOpenChange={setShowQuickAddDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Quick Add Transaction</DialogTitle>
                        <DialogDescription>
                            Quickly add a transaction with minimal fields
                        </DialogDescription>
                    </DialogHeader>
                    <QuickAddTransactionForm
                        onSubmit={handleQuickAdd}
                        onCancel={() => setShowQuickAddDialog(false)}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>

            {/* Duplicate Dialog */}
            <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Duplicate Transaction</DialogTitle>
                        <DialogDescription>
                            Duplicate this transaction with optional date adjustment
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {transactionToDuplicate && (
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="text-sm font-medium">{transactionToDuplicate.description}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    ${transactionToDuplicate.amount.toFixed(2)} • {format(new Date(transactionToDuplicate.date), "MMM d, yyyy")}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="date-adjustment">Date Adjustment (days)</Label>
                            <Input
                                id="date-adjustment"
                                type="number"
                                placeholder="0 (same date)"
                                defaultValue={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && transactionToDuplicate) {
                                        const adjustment = parseInt(e.currentTarget.value) || 0
                                        handleDuplicate(transactionToDuplicate, adjustment)
                                    }
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Positive number = add days, Negative = subtract days, 0 = same date
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDuplicateDialog(false)
                                    setTransactionToDuplicate(null)
                                }}
                                disabled={isDuplicating}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (transactionToDuplicate) {
                                        const adjustmentInput = document.getElementById("date-adjustment") as HTMLInputElement
                                        const adjustment = parseInt(adjustmentInput?.value) || 0
                                        handleDuplicate(transactionToDuplicate, adjustment)
                                    }
                                }}
                                disabled={isDuplicating}
                            >
                                {isDuplicating ? "Duplicating..." : "Duplicate"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bulk Duplicate Dialog */}
            <Dialog open={showBulkDuplicateDialog} onOpenChange={setShowBulkDuplicateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Duplicate Transactions</DialogTitle>
                        <DialogDescription>
                            Duplicate {selectedTransactions.length} selected transaction(s) with optional date adjustment
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bulk-date-adjustment">Date Adjustment (days)</Label>
                            <Input
                                id="bulk-date-adjustment"
                                type="number"
                                placeholder="0 (same date)"
                                defaultValue={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        const adjustment = parseInt(e.currentTarget.value) || 0
                                        handleBulkDuplicate(selectedTransactions, adjustment)
                                    }
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Positive number = add days, Negative = subtract days, 0 = same date
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowBulkDuplicateDialog(false)
                                }}
                                disabled={isBulkDuplicating}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    const adjustmentInput = document.getElementById("bulk-date-adjustment") as HTMLInputElement
                                    const adjustment = parseInt(adjustmentInput?.value) || 0
                                    handleBulkDuplicate(selectedTransactions, adjustment)
                                }}
                                disabled={isBulkDuplicating}
                            >
                                {isBulkDuplicating ? "Duplicating..." : `Duplicate ${selectedTransactions.length} Transaction(s)`}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Floating Action Button */}
            <FloatingActionButton
                onClick={() => setShowQuickAddDialog(true)}
                label="Quick Add"
            />
        </div>
    )
}

