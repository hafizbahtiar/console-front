"use client"

import * as React from "react"
import { useCallback, useState } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { cn } from "@/lib/utils"
import { Upload, X, Loader2, File, FileText, Download } from "lucide-react"
import { toast } from "sonner"
import { uploadDocument, type UploadResponseDto } from "@/lib/api/upload"

export interface FileUploadProps {
    /** Current file URL */
    value?: string
    /** Callback when file is uploaded (receives the URL) */
    onUpload: (url: string) => Promise<void>
    /** Accepted file types (e.g., "application/pdf,.doc,.docx") */
    accept?: string
    /** Maximum file size in bytes (default: 10MB) */
    maxSize?: number
    /** Whether to show URL input as fallback */
    showUrlInput?: boolean
    /** Additional className */
    className?: string
    /** Disabled state */
    disabled?: boolean
    /** Label text */
    label?: string
    /** File name display */
    fileName?: string
    /** Description text */
    description?: string
}

const getFileIcon = (mimetype?: string, filename?: string) => {
    if (mimetype?.includes("pdf") || filename?.endsWith(".pdf")) {
        return FileText
    }
    return File
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

export function FileUpload({
    value,
    onUpload,
    accept = ".pdf,.doc,.docx,.txt",
    maxSize = 10 * 1024 * 1024, // 10MB default
    showUrlInput = true,
    className,
    disabled = false,
    label = "File",
    fileName,
    description,
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [urlInput, setUrlInput] = useState(value || "")
    const [uploadedFile, setUploadedFile] = useState<UploadResponseDto | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        setUrlInput(value || "")
    }, [value])

    const validateFile = useCallback((file: File): boolean => {
        // Validate file size
        if (file.size > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
            toast.error(`File size must be less than ${maxSizeMB}MB`)
            return false
        }

        // Validate file type if accept is specified
        if (accept) {
            const acceptedTypes = accept.split(",").map((t) => t.trim())
            const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
            const fileType = file.type

            const isAccepted = acceptedTypes.some((accepted) => {
                if (accepted.startsWith(".")) {
                    return fileExtension === accepted.toLowerCase()
                }
                return fileType === accepted || fileType.startsWith(accepted.split("/")[0] + "/")
            })

            if (!isAccepted) {
                toast.error(`File type not allowed. Accepted: ${accept}`)
                return false
            }
        }

        return true
    }, [maxSize, accept])

    const handleFileSelect = useCallback(
        async (file: File) => {
            if (!validateFile(file)) {
                return
            }

            // Upload file
            setIsUploading(true)
            try {
                const response = await uploadDocument(file)
                setUploadedFile(response)
                
                // Call onUpload callback
                await onUpload(response.url)
                setUrlInput(response.url)
                toast.success("File uploaded successfully")
            } catch (error: any) {
                console.error("File upload error:", error)
                toast.error(error.message || "Failed to upload file")
                throw error
            } finally {
                setIsUploading(false)
            }
        },
        [onUpload, validateFile]
    )

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileSelect(file)
        }
        // Reset input to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)

            if (disabled) return

            const file = e.dataTransfer.files[0]
            if (file) {
                handleFileSelect(file)
            }
        },
        [handleFileSelect, disabled]
    )

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        if (!disabled) {
            setIsDragging(true)
        }
    }, [disabled])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleUrlSubmit = async () => {
        if (!urlInput.trim()) {
            toast.error("Please enter a file URL")
            return
        }

        setIsUploading(true)
        try {
            await onUpload(urlInput.trim())
            toast.success("File URL updated successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to update file URL")
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemove = async () => {
        setIsUploading(true)
        try {
            await onUpload("")
            setUrlInput("")
            setUploadedFile(null)
            toast.success("File removed successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to remove file")
        } finally {
            setIsUploading(false)
        }
    }

    const displayFile = uploadedFile || (value ? { url: value, originalName: fileName || "File", size: 0, mimetype: "" } : null)
    const FileIcon = displayFile ? getFileIcon(displayFile.mimetype, displayFile.originalName) : File

    return (
        <div className={cn("space-y-4", className)}>
            {label && <Label>{label}</Label>}

            {/* File Preview/Info */}
            {displayFile && (
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-background border flex items-center justify-center">
                            <FileIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{displayFile.originalName || fileName || "File"}</p>
                        {displayFile.size > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {formatFileSize(displayFile.size)}
                            </p>
                        )}
                        {displayFile.url && (
                            <a
                                href={displayFile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                                <Download className="w-3 h-3" />
                                View file
                            </a>
                        )}
                    </div>
                    {!disabled && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemove}
                            disabled={isUploading}
                            className="text-destructive hover:text-destructive"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            )}

            {/* Upload Area */}
            {!displayFile && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-6 transition-colors",
                        isDragging
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <div className="flex flex-col items-center justify-center gap-2">
                        <FileIcon className="w-8 h-8 text-muted-foreground" />
                        <div className="text-center">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={disabled || isUploading}
                                className="mb-2"
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
                                {description || "Drag and drop a file here, or click to browse"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {accept} up to {(maxSize / (1024 * 1024)).toFixed(1)}MB
                            </p>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileInputChange}
                        disabled={disabled || isUploading}
                        className="hidden"
                    />
                </div>
            )}

            {/* URL Input (Optional) */}
            {showUrlInput && (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            type="url"
                            placeholder="Or enter file URL"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            disabled={disabled || isUploading}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    handleUrlSubmit()
                                }
                            }}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleUrlSubmit}
                            disabled={disabled || isUploading || !urlInput.trim()}
                        >
                            {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Use URL"
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

