"use client"

import * as React from "react"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Upload, X, Loader2, FileText, Image as ImageIcon, Check } from "lucide-react"
import { toast } from "sonner"
import { uploadReceipt, extractReceiptOcr } from "@/lib/api/finance/finance-receipts"
import { Progress } from "@/components/ui/progress"

export interface ReceiptUploadProps {
    /** Transaction ID */
    transactionId: string
    /** Current receipt URL (if exists) */
    value?: string
    /** Callback when receipt is uploaded (receives the receipt URL) */
    onUpload: (url: string) => Promise<void>
    /** Callback when receipt is removed */
    onRemove?: () => Promise<void>
    /** Callback when OCR extraction is requested */
    onExtractOcr?: () => Promise<void>
    /** Whether to auto-extract OCR after upload */
    autoExtractOcr?: boolean
    /** Additional className */
    className?: string
    /** Disabled state */
    disabled?: boolean
    /** Show label */
    showLabel?: boolean
    /** Label text */
    label?: string
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_PDF_TYPE = 'application/pdf'
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ALLOWED_PDF_TYPE]
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

const getFileIcon = (mimetype?: string, filename?: string) => {
    if (mimetype?.includes("pdf") || filename?.endsWith(".pdf")) {
        return FileText
    }
    if (mimetype?.startsWith("image/") || filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return ImageIcon
    }
    return FileText
}

export function ReceiptUpload({
    transactionId,
    value,
    onUpload,
    onRemove,
    className,
    disabled = false,
    showLabel = true,
    label = "Receipt",
}: ReceiptUploadProps) {
    const [preview, setPreview] = useState<string | null>(value || null)
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        setPreview(value || null)
    }, [value])

    const validateFile = useCallback((file: File): boolean => {
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error(
                'Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed.'
            )
            return false
        }

        // Validate file size
        if (file.size > MAX_SIZE) {
            const maxSizeMB = (MAX_SIZE / (1024 * 1024)).toFixed(0)
            toast.error(`File size must be less than ${maxSizeMB}MB`)
            return false
        }

        return true
    }, [])

    const handleFileSelect = useCallback(
        async (file: File) => {
            if (!validateFile(file)) {
                return
            }

            setSelectedFile(file)

            // Create preview for images
            if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setPreview(reader.result as string)
                }
                reader.readAsDataURL(file)
            } else {
                // For PDFs, just show file info
                setPreview(null)
            }

            // Upload file
            setIsUploading(true)
            setUploadProgress(0)

            try {
                // Simulate progress (since fetch doesn't support progress events easily)
                const progressInterval = setInterval(() => {
                    setUploadProgress((prev) => {
                        if (prev >= 90) {
                            clearInterval(progressInterval)
                            return 90
                        }
                        return prev + 10
                    })
                }, 200)

                const result = await uploadReceipt(transactionId, file)
                clearInterval(progressInterval)
                setUploadProgress(100)

                // Call onUpload callback
                await onUpload(result.receiptUrl)
                toast.success("Receipt uploaded successfully")
                setSelectedFile(null)
            } catch (error: any) {
                console.error("Receipt upload error:", error)
                toast.error(error.message || "Failed to upload receipt")
                setPreview(value || null)
                setSelectedFile(null)
            } finally {
                setIsUploading(false)
                setUploadProgress(0)
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
            }
        },
        [transactionId, onUpload, validateFile, value]
    )

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)

            if (disabled || isUploading) return

            const file = e.dataTransfer.files[0]
            if (file) {
                handleFileSelect(file)
            }
        },
        [handleFileSelect, disabled, isUploading]
    )

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        if (!disabled && !isUploading) {
            setIsDragging(true)
        }
    }, [disabled, isUploading])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleRemove = async () => {
        if (!onRemove) {
            toast.error("Remove handler not provided")
            return
        }

        setIsUploading(true)
        try {
            await onRemove()
            setPreview(null)
            setSelectedFile(null)
            toast.success("Receipt removed successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to remove receipt")
        } finally {
            setIsUploading(false)
        }
    }

    const FileIcon = preview && !ALLOWED_IMAGE_TYPES.some(type => preview.startsWith('data:image') || preview.includes('image'))
        ? getFileIcon('application/pdf', 'receipt.pdf')
        : ImageIcon

    const hasReceipt = !!preview || !!value
    const isImage = preview && (preview.startsWith('data:image') || preview.includes('image') || preview.match(/\.(jpg|jpeg|png|gif|webp)$/i))

    return (
        <div className={cn("space-y-4", className)}>
            {showLabel && <Label>{label}</Label>}

            {/* Receipt Preview */}
            {hasReceipt && (
                <div className="space-y-2">
                    {isImage ? (
                        <div className="relative border rounded-lg overflow-hidden bg-muted/50">
                            <img
                                src={preview || value}
                                alt="Receipt preview"
                                className="w-full h-auto max-h-64 object-contain"
                            />
                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-lg bg-background border flex items-center justify-center">
                                    <FileIcon className="w-6 h-6 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">Receipt (PDF)</p>
                                <p className="text-xs text-muted-foreground">PDF document</p>
                            </div>
                        </div>
                    )}

                    {/* Remove Button */}
                    {!disabled && onRemove && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                            disabled={isUploading}
                            className="text-destructive hover:text-destructive min-h-[44px] min-w-[44px]"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Remove Receipt
                        </Button>
                    )}
                </div>
            )}

            {/* Upload Area */}
            {!hasReceipt && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-6 sm:p-6 transition-colors",
                        isDragging
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25",
                        disabled && "opacity-50 cursor-not-allowed",
                        isUploading && "opacity-50"
                    )}
                >
                    <div className="flex flex-col items-center justify-center gap-3 sm:gap-2">
                        <Upload className="w-10 h-10 sm:w-8 sm:h-8 text-muted-foreground" />
                        <div className="text-center">
                            <Button
                                type="button"
                                variant="default"
                                size="lg"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={disabled || isUploading}
                                className="mb-2 min-h-[44px] min-w-[200px] sm:min-w-[180px]"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Choose File
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                <span className="hidden sm:inline">Drag and drop a receipt here, or </span>
                                <span className="sm:hidden">Tap to select a file</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Images (JPEG, PNG, GIF, WebP) or PDF up to 10MB
                            </p>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_TYPES.join(',')}
                        onChange={handleFileInputChange}
                        disabled={disabled || isUploading}
                        className="hidden"
                    />
                </div>
            )}

            {/* Replace Receipt Button (if receipt exists) */}
            {hasReceipt && !disabled && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-4 sm:p-4 transition-colors",
                        isDragging
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25",
                        disabled && "opacity-50 cursor-not-allowed",
                        isUploading && "opacity-50"
                    )}
                >
                    <div className="flex flex-col items-center justify-center gap-3 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled || isUploading}
                            className="min-h-[44px] min-w-[180px] sm:min-w-[160px]"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Replace Receipt
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            <span className="hidden sm:inline">Drag and drop to replace, or </span>
                            <span className="sm:hidden">Tap to replace</span>
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_TYPES.join(',')}
                        onChange={handleFileInputChange}
                        disabled={disabled || isUploading}
                        className="hidden"
                    />
                </div>
            )}

            {/* Upload Progress */}
            {isUploading && uploadProgress > 0 && (
                <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-xs text-center text-muted-foreground">
                        Uploading... {uploadProgress}%
                    </p>
                </div>
            )}
        </div>
    )
}

