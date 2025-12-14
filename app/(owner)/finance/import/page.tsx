"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import {
    previewImport,
    importTransactions,
    getImportHistory,
    type ColumnMapping,
    type ImportPreview,
    type ImportResult,
    type ImportHistory,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FinanceImportPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()

    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isPreviewing, setIsPreviewing] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [preview, setPreview] = useState<ImportPreview | null>(null)
    const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
    const [availableColumns, setAvailableColumns] = useState<string[]>([])
    const [importProgress, setImportProgress] = useState(0)
    const [importResult, setImportResult] = useState<ImportResult | null>(null)
    const [showResultDialog, setShowResultDialog] = useState(false)
    const [importHistory, setImportHistory] = useState<ImportHistory[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "owner")) {
            router.push("/403")
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user?.role === "owner") {
            void fetchImportHistory()
        }
    }, [user])

    const fetchImportHistory = async () => {
        setIsLoadingHistory(true)
        try {
            const history = await getImportHistory(20)
            setImportHistory(history)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to load import history. Please try again."
            toast.error(message)
        } finally {
            setIsLoadingHistory(false)
        }
    }

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) {
            if (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
                setFile(droppedFile)
                void extractColumns(droppedFile)
            } else {
                toast.error("Please upload a CSV or Excel file (.csv, .xlsx, .xls)")
            }
        }
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            if (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
                setFile(selectedFile)
                void extractColumns(selectedFile)
            } else {
                toast.error("Please upload a CSV or Excel file (.csv, .xlsx, .xls)")
            }
        }
    }

    const extractColumns = async (file: File) => {
        // For CSV, read first line to get headers
        if (file.name.endsWith('.csv')) {
            const text = await file.text()
            const firstLine = text.split('\n')[0]
            const columns = firstLine.split(',').map((col) => col.trim().replace(/^"|"$/g, ''))
            setAvailableColumns(columns)

            // Auto-map common column names
            const autoMapping: ColumnMapping = {}
            columns.forEach((col) => {
                const lowerCol = col.toLowerCase()
                if (lowerCol.includes('date')) autoMapping.date = col
                else if (lowerCol.includes('type') || lowerCol.includes('transaction type')) autoMapping.type = col
                else if (lowerCol.includes('amount') || lowerCol.includes('value')) autoMapping.amount = col
                else if (lowerCol.includes('description') || lowerCol.includes('desc') || lowerCol.includes('memo')) autoMapping.description = col
                else if (lowerCol.includes('category') || lowerCol.includes('cat')) autoMapping.category = col
                else if (lowerCol.includes('note') || lowerCol.includes('notes')) autoMapping.notes = col
                else if (lowerCol.includes('tag') || lowerCol.includes('tags')) autoMapping.tags = col
                else if (lowerCol.includes('payment') || lowerCol.includes('method')) autoMapping.paymentMethod = col
                else if (lowerCol.includes('reference') || lowerCol.includes('ref')) autoMapping.reference = col
                else if (lowerCol.includes('currency') || lowerCol.includes('curr') || lowerCol === 'ccy') autoMapping.currency = col
            })
            setColumnMapping(autoMapping)
        } else {
            // For Excel, we'll need to preview first to get columns
            // For now, set empty columns
            setAvailableColumns([])
        }
    }

    const handlePreview = async () => {
        if (!file) {
            toast.error("Please select a file first")
            return
        }

        // Validate required mappings
        if (!columnMapping.date || !columnMapping.type || !columnMapping.amount || !columnMapping.description) {
            toast.error("Please map all required fields: Date, Type, Amount, and Description")
            return
        }

        setIsPreviewing(true)
        try {
            const previewData = await previewImport(file, columnMapping)
            setPreview(previewData)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to preview import. Please try again."
            toast.error(message)
        } finally {
            setIsPreviewing(false)
        }
    }

    const handleImport = async () => {
        if (!file || !preview) {
            toast.error("Please preview the import first")
            return
        }

        setIsImporting(true)
        setImportProgress(0)

        // Simulate progress (actual progress would come from backend via WebSocket or polling)
        const progressInterval = setInterval(() => {
            setImportProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval)
                    return 90
                }
                return prev + 10
            })
        }, 200)

        try {
            const result = await importTransactions(file, columnMapping)
            clearInterval(progressInterval)
            setImportProgress(100)
            setImportResult(result)
            setShowResultDialog(true)
            setFile(null)
            setPreview(null)
            setColumnMapping({})
            await fetchImportHistory()
        } catch (error: any) {
            clearInterval(progressInterval)
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to import transactions. Please try again."
            toast.error(message)
        } finally {
            setIsImporting(false)
            setImportProgress(0)
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
                    <h2 className="text-2xl font-semibold">Import Transactions</h2>
                    <p className="text-sm text-muted-foreground">
                        Import transactions from CSV or Excel files
                    </p>
                </div>
            </div>

            {/* File Upload Area */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload File</CardTitle>
                    <CardDescription>
                        Drag and drop a CSV or Excel file, or click to browse
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${isDragging
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-muted-foreground/50"
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {file ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                    <FileText className="h-8 w-8 text-primary shrink-0" />
                                    <div className="text-left min-w-0 flex-1">
                                        <div className="font-medium truncate">{file.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-11 w-11 shrink-0 min-w-[44px] min-h-[44px]"
                                        onClick={() => {
                                            setFile(null)
                                            setPreview(null)
                                            setColumnMapping({})
                                            setAvailableColumns([])
                                        }}
                                        aria-label="Remove file"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Upload className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground" />
                                <div>
                                    <Label
                                        htmlFor="file-upload"
                                        className="cursor-pointer inline-block"
                                    >
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="lg"
                                            className="min-h-[44px] min-w-[200px] sm:min-w-[240px] px-6"
                                            asChild
                                        >
                                            <span>
                                                <Upload className="h-5 w-5 mr-2" />
                                                Choose File
                                            </span>
                                        </Button>
                                    </Label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                    <p className="text-sm text-muted-foreground mt-3">
                                        <span className="hidden sm:inline">Drag and drop a file here, or </span>
                                        <span className="sm:hidden">Tap to select a file</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        CSV or Excel files only (.csv, .xlsx, .xls)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Column Mapping */}
            {file && availableColumns.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Column Mapping</CardTitle>
                        <CardDescription>
                            Map your file columns to transaction fields
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date-col">
                                    Date <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={columnMapping.date || ""}
                                    onValueChange={(value) =>
                                        setColumnMapping({ ...columnMapping, date: value })
                                    }
                                >
                                    <SelectTrigger id="date-col">
                                        <SelectValue placeholder="Select date column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableColumns.map((col) => (
                                            <SelectItem key={col} value={col}>
                                                {col}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type-col">
                                    Type <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={columnMapping.type || ""}
                                    onValueChange={(value) =>
                                        setColumnMapping({ ...columnMapping, type: value })
                                    }
                                >
                                    <SelectTrigger id="type-col">
                                        <SelectValue placeholder="Select type column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableColumns.map((col) => (
                                            <SelectItem key={col} value={col}>
                                                {col}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount-col">
                                    Amount <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={columnMapping.amount || ""}
                                    onValueChange={(value) =>
                                        setColumnMapping({ ...columnMapping, amount: value })
                                    }
                                >
                                    <SelectTrigger id="amount-col">
                                        <SelectValue placeholder="Select amount column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableColumns.map((col) => (
                                            <SelectItem key={col} value={col}>
                                                {col}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description-col">
                                    Description <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={columnMapping.description || ""}
                                    onValueChange={(value) =>
                                        setColumnMapping({ ...columnMapping, description: value })
                                    }
                                >
                                    <SelectTrigger id="description-col">
                                        <SelectValue placeholder="Select description column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableColumns.map((col) => (
                                            <SelectItem key={col} value={col}>
                                                {col}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category-col">Category (Optional)</Label>
                                <Select
                                    value={columnMapping.category || ""}
                                    onValueChange={(value) =>
                                        setColumnMapping({ ...columnMapping, category: value })
                                    }
                                >
                                    <SelectTrigger id="category-col">
                                        <SelectValue placeholder="Select category column (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {availableColumns.map((col) => (
                                            <SelectItem key={col} value={col}>
                                                {col}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes-col">Notes (Optional)</Label>
                                <Select
                                    value={columnMapping.notes || ""}
                                    onValueChange={(value) =>
                                        setColumnMapping({ ...columnMapping, notes: value })
                                    }
                                >
                                    <SelectTrigger id="notes-col">
                                        <SelectValue placeholder="Select notes column (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {availableColumns.map((col) => (
                                            <SelectItem key={col} value={col}>
                                                {col}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency-col">
                                    Currency <span className="text-muted-foreground text-xs">(Optional - defaults to MYR)</span>
                                </Label>
                                <Select
                                    value={columnMapping.currency || ""}
                                    onValueChange={(value) =>
                                        setColumnMapping({ ...columnMapping, currency: value })
                                    }
                                >
                                    <SelectTrigger id="currency-col">
                                        <SelectValue placeholder="Select currency column (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None (defaults to MYR)</SelectItem>
                                        {availableColumns.map((col) => (
                                            <SelectItem key={col} value={col}>
                                                {col}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Currency codes must be ISO 4217 format (e.g., MYR, USD, EUR). Invalid codes will default to MYR.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handlePreview}
                                disabled={isPreviewing || !file}
                                className="min-h-[44px]"
                                size="lg"
                            >
                                {isPreviewing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Previewing...
                                    </>
                                ) : (
                                    "Preview Import"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Import Preview */}
            {preview && (
                <Card>
                    <CardHeader>
                        <CardTitle>Import Preview</CardTitle>
                        <CardDescription>
                            Review the import preview before proceeding
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <div className="text-2xl font-bold">{preview.totalRows}</div>
                                <div className="text-sm text-muted-foreground">Total Rows</div>
                            </div>
                            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {preview.validRows}
                                </div>
                                <div className="text-sm text-muted-foreground">Valid Rows</div>
                            </div>
                            <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {preview.invalidRows}
                                </div>
                                <div className="text-sm text-muted-foreground">Invalid Rows</div>
                            </div>
                        </div>

                        {preview.errors.length > 0 && (
                            <div className="space-y-2">
                                <Label>Errors (showing first 10)</Label>
                                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                                    {preview.errors.map((error, index) => (
                                        <div key={index} className="text-sm text-destructive mb-2">
                                            <strong>Row {error.row}:</strong> {error.errors.join(", ")}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {preview.sample.length > 0 && (
                            <div className="space-y-2">
                                <Label>Sample Data (first 5 valid rows)</Label>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Description</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {preview.sample.map((row, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{row.date?.split('T')[0]}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={row.type === "income" ? "default" : "destructive"}
                                                            >
                                                                {row.type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>${row.amount?.toFixed(2)}</TableCell>
                                                        <TableCell>{row.description}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                onClick={handleImport}
                                disabled={isImporting || preview.validRows === 0}
                                className="min-h-[44px]"
                                size="lg"
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    `Import ${preview.validRows} Transaction(s)`
                                )}
                            </Button>
                        </div>

                        {isImporting && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Import Progress</span>
                                    <span>{importProgress}%</span>
                                </div>
                                <Progress value={importProgress} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Import History */}
            <Card>
                <CardHeader>
                    <CardTitle>Import History</CardTitle>
                    <CardDescription>Recent import operations</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingHistory ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : importHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No import history yet
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Filename</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Imported</TableHead>
                                        <TableHead>Failed</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {importHistory.map((history) => (
                                        <TableRow key={history.id}>
                                            <TableCell className="font-medium">
                                                {history.filename}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(history.createdAt), "MMM d, yyyy HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        history.status === "completed"
                                                            ? "default"
                                                            : history.status === "failed"
                                                                ? "destructive"
                                                                : "secondary"
                                                    }
                                                >
                                                    {history.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{history.totalRows}</TableCell>
                                            <TableCell className="text-green-600 dark:text-green-400">
                                                {history.importedCount}
                                            </TableCell>
                                            <TableCell className="text-red-600 dark:text-red-400">
                                                {history.failedCount}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Import Result Dialog */}
            <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Complete</DialogTitle>
                        <DialogDescription>
                            Transaction import has been completed
                        </DialogDescription>
                    </DialogHeader>
                    {importResult && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <span className="font-semibold">Imported</span>
                                    </div>
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {importResult.importedCount}
                                    </div>
                                </div>
                                <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        <span className="font-semibold">Failed</span>
                                    </div>
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {importResult.failedCount}
                                    </div>
                                </div>
                            </div>

                            {importResult.errors.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Errors (showing first 10)</Label>
                                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                                        {importResult.errors.map((error, index) => (
                                            <div key={index} className="text-sm text-destructive mb-2">
                                                {error}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button onClick={() => setShowResultDialog(false)}>Close</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

