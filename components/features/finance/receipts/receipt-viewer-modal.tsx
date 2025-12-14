"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    X,
    Download,
    Trash2,
    Maximize2,
    Minimize2,
    ZoomIn,
    ZoomOut,
    RotateCw,
    FileText,
    Image as ImageIcon,
    Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { deleteReceipt, getReceiptUrl } from "@/lib/api/finance/finance-receipts"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export interface ReceiptViewerModalProps {
    /** Transaction ID */
    transactionId: string
    /** Receipt URL */
    receiptUrl?: string
    /** Receipt filename */
    receiptFilename?: string
    /** Receipt mimetype */
    receiptMimetype?: string
    /** Receipt size in bytes */
    receiptSize?: number
    /** Whether modal is open */
    open: boolean
    /** Callback when modal is closed */
    onClose: () => void
    /** Callback when receipt is deleted */
    onDelete?: () => Promise<void>
    /** Whether to show delete button */
    showDelete?: boolean
}

const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return "Unknown size"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

const isImage = (mimetype?: string, url?: string): boolean => {
    if (mimetype?.startsWith("image/")) return true
    if (url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return true
    return false
}

const isPDF = (mimetype?: string, url?: string): boolean => {
    if (mimetype === "application/pdf") return true
    if (url?.endsWith(".pdf")) return true
    return false
}

export function ReceiptViewerModal({
    transactionId,
    receiptUrl,
    receiptFilename,
    receiptMimetype,
    receiptSize,
    open,
    onClose,
    onDelete,
    showDelete = true,
}: ReceiptViewerModalProps) {
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)

    const isImageFile = isImage(receiptMimetype, receiptUrl)
    const isPdfFile = isPDF(receiptMimetype, receiptUrl)

    // Load PDF URL if needed
    useEffect(() => {
        if (open && isPdfFile && receiptUrl && !pdfUrl) {
            // For PDFs, we'll use an iframe or embed
            setPdfUrl(receiptUrl)
        }
    }, [open, isPdfFile, receiptUrl, pdfUrl])

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setZoom(1)
            setRotation(0)
            setImageError(false)
            setIsFullscreen(false)
            setPdfUrl(null)
        }
    }, [open])

    // Keyboard navigation
    useEffect(() => {
        if (!open) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (isFullscreen) {
                    setIsFullscreen(false)
                } else {
                    onClose()
                }
            }
            if (e.key === "+" || e.key === "=") {
                e.preventDefault()
                handleZoomIn()
            }
            if (e.key === "-") {
                e.preventDefault()
                handleZoomOut()
            }
            if (e.key === "r" || e.key === "R") {
                e.preventDefault()
                handleRotate()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [open, isFullscreen, onClose])

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.25, 3))
    }

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.25, 0.5))
    }

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360)
    }

    const handleResetZoom = () => {
        setZoom(1)
        setRotation(0)
    }

    const handleDownload = async () => {
        if (!receiptUrl) return

        try {
            // Get the receipt URL (in case we need to fetch it)
            const url = receiptUrl.startsWith("http") ? receiptUrl : await getReceiptUrl(transactionId)

            // Create a temporary link and trigger download
            const link = document.createElement("a")
            link.href = url
            link.download = receiptFilename || "receipt"
            link.target = "_blank"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success("Receipt download started")
        } catch (error: any) {
            console.error("Download error:", error)
            toast.error(error.message || "Failed to download receipt")
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteReceipt(transactionId)
            if (onDelete) {
                await onDelete()
            }
            toast.success("Receipt deleted successfully")
            setShowDeleteConfirm(false)
            onClose()
        } catch (error: any) {
            console.error("Delete error:", error)
            toast.error(error.message || "Failed to delete receipt")
        } finally {
            setIsDeleting(false)
        }
    }

    if (!receiptUrl) {
        return null
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent
                    className={cn(
                        "max-w-6xl max-h-[90vh] p-0 overflow-hidden",
                        isFullscreen && "max-w-full max-h-full w-full h-full rounded-none"
                    )}
                >
                    <DialogHeader className="px-6 pt-6 pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <DialogTitle className="flex items-center gap-2">
                                    {isImageFile ? (
                                        <ImageIcon className="w-5 h-5" />
                                    ) : (
                                        <FileText className="w-5 h-5" />
                                    )}
                                    <span className="truncate">
                                        {receiptFilename || "Receipt"}
                                    </span>
                                </DialogTitle>
                                <DialogDescription className="mt-1">
                                    {receiptSize && (
                                        <span className="text-xs text-muted-foreground">
                                            {formatFileSize(receiptSize)}
                                        </span>
                                    )}
                                    {receiptMimetype && (
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                            {receiptMimetype.split("/")[1]?.toUpperCase() || "File"}
                                        </Badge>
                                    )}
                                </DialogDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {isImageFile && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleZoomOut}
                                            disabled={zoom <= 0.5}
                                            title="Zoom out (-)"
                                        >
                                            <ZoomOut className="w-4 h-4" />
                                        </Button>
                                        <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
                                            {Math.round(zoom * 100)}%
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleZoomIn}
                                            disabled={zoom >= 3}
                                            title="Zoom in (+)"
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleRotate}
                                            title="Rotate (R)"
                                        >
                                            <RotateCw className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDownload}
                                    title="Download"
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                                {showDelete && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="text-destructive hover:text-destructive"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    title={isFullscreen ? "Exit fullscreen" : "Fullscreen (F11)"}
                                >
                                    {isFullscreen ? (
                                        <Minimize2 className="w-4 h-4" />
                                    ) : (
                                        <Maximize2 className="w-4 h-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    title="Close (Esc)"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto p-6 bg-muted/30">
                        {isImageFile ? (
                            <div className="flex items-center justify-center min-h-[400px]">
                                {imageError ? (
                                    <div className="text-center text-muted-foreground">
                                        <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>Failed to load image</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setImageError(false)
                                            }}
                                            className="mt-4"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                ) : (
                                    <img
                                        src={receiptUrl}
                                        alt={receiptFilename || "Receipt"}
                                        className={cn(
                                            "max-w-full max-h-[70vh] object-contain transition-transform",
                                            isFullscreen && "max-h-[85vh]"
                                        )}
                                        style={{
                                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                        }}
                                        onError={() => setImageError(true)}
                                        draggable={false}
                                    />
                                )}
                            </div>
                        ) : isPdfFile ? (
                            <div className="flex items-center justify-center min-h-[600px] bg-white rounded-lg">
                                {pdfUrl ? (
                                    <iframe
                                        src={pdfUrl}
                                        className="w-full h-[70vh] border-0 rounded-lg"
                                        title={receiptFilename || "Receipt PDF"}
                                    />
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin opacity-50" />
                                        <p>Loading PDF...</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center min-h-[400px] text-center text-muted-foreground">
                                <div>
                                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Preview not available for this file type</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownload}
                                        className="mt-4"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download to view
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Keyboard shortcuts hint */}
                    {isImageFile && (
                        <div className="px-6 py-2 border-t bg-muted/50 text-xs text-muted-foreground">
                            <div className="flex items-center justify-center gap-4">
                                <span>Zoom: +/-</span>
                                <span>Rotate: R</span>
                                <span>Fullscreen: F11</span>
                                <span>Close: Esc</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title="Delete Receipt"
                description="Are you sure you want to delete this receipt? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="destructive"
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    )
}

