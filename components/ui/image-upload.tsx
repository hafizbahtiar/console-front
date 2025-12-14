"use client"

import * as React from "react"
import { useCallback, useState } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { cn } from "@/lib/utils"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { uploadImage, uploadImages, type UploadResponseDto } from "@/lib/api/upload"

export interface ImageUploadProps {
    /** Current image URL(s) */
    value?: string | string[]
    /** Callback when image(s) is uploaded (receives the URL(s)) */
    onUpload: (url: string | string[]) => Promise<void>
    /** Whether to allow multiple images */
    multiple?: boolean
    /** Maximum number of images (when multiple is true) */
    maxImages?: number
    /** Maximum file size in bytes (default: 5MB) */
    maxSize?: number
    /** Whether to show URL input as fallback */
    showUrlInput?: boolean
    /** Additional className */
    className?: string
    /** Disabled state */
    disabled?: boolean
    /** Label text */
    label?: string
    /** Preview size */
    previewSize?: "sm" | "md" | "lg"
    /** Aspect ratio for preview (e.g., "16/9", "1/1") */
    aspectRatio?: string
}

const previewSizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-48 h-48",
}

export function ImageUpload({
    value,
    onUpload,
    multiple = false,
    maxImages = 10,
    maxSize = 5 * 1024 * 1024, // 5MB default
    showUrlInput = true,
    className,
    disabled = false,
    label = "Image",
    previewSize = "md",
    aspectRatio,
}: ImageUploadProps) {
    const [previews, setPreviews] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [urlInput, setUrlInput] = useState("")
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Initialize previews from value
    React.useEffect(() => {
        if (value) {
            const urls = Array.isArray(value) ? value : [value]
            setPreviews(urls.filter(Boolean))
        } else {
            setPreviews([])
        }
    }, [value])

    const validateFile = useCallback((file: File): boolean => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file")
            return false
        }

        // Validate file size
        if (file.size > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
            toast.error(`Image size must be less than ${maxSizeMB}MB`)
            return false
        }

        return true
    }, [maxSize])

    const handleFileSelect = useCallback(
        async (files: FileList | File[]) => {
            const fileArray = Array.from(files)
            
            // Validate all files
            for (const file of fileArray) {
                if (!validateFile(file)) {
                    return
                }
            }

            // Check max images limit
            const currentCount = previews.length
            const newCount = multiple ? fileArray.length : 1
            if (multiple && currentCount + newCount > maxImages) {
                toast.error(`Maximum ${maxImages} images allowed`)
                return
            }

            // Create previews
            const newPreviews: string[] = []
            for (const file of fileArray) {
                const reader = new FileReader()
                await new Promise<void>((resolve) => {
                    reader.onloadend = () => {
                        newPreviews.push(reader.result as string)
                        resolve()
                    }
                    reader.readAsDataURL(file)
                })
            }

            if (multiple) {
                setPreviews((prev) => [...prev, ...newPreviews])
            } else {
                setPreviews(newPreviews)
            }

            // Upload files
            setIsUploading(true)
            try {
                let uploadedUrls: string[]

                if (multiple && fileArray.length > 1) {
                    // Upload multiple images
                    const responses = await uploadImages(fileArray)
                    uploadedUrls = responses.map((r) => r.url)
                } else {
                    // Upload single image
                    const response = await uploadImage(fileArray[0])
                    uploadedUrls = [response.url]
                }

                // Call onUpload callback
                const result = multiple ? uploadedUrls : uploadedUrls[0]
                await onUpload(result)
                
                if (multiple) {
                    setPreviews((prev) => {
                        const existing = prev.slice(0, prev.length - newPreviews.length)
                        return [...existing, ...uploadedUrls]
                    })
                } else {
                    setPreviews(uploadedUrls)
                }
            } catch (error: any) {
                console.error("Image upload error:", error)
                toast.error(error.message || "Failed to upload image(s)")
                // Remove failed previews
                if (multiple) {
                    setPreviews((prev) => prev.slice(0, prev.length - newPreviews.length))
                } else {
                    setPreviews([])
                }
                throw error
            } finally {
                setIsUploading(false)
            }
        },
        [multiple, maxImages, previews.length, onUpload, validateFile]
    )

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFileSelect(files)
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

            const files = e.dataTransfer.files
            if (files.length > 0) {
                handleFileSelect(files)
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
            toast.error("Please enter an image URL")
            return
        }

        setIsUploading(true)
        try {
            const result = multiple ? [...previews, urlInput.trim()] : urlInput.trim()
            await onUpload(result)
            setUrlInput("")
            toast.success("Image URL added successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to add image URL")
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemove = async (index: number) => {
        if (multiple) {
            const newPreviews = previews.filter((_, i) => i !== index)
            await onUpload(newPreviews)
        } else {
            await onUpload("")
        }
    }

    const displayPreviews = previews.length > 0 ? previews : []

    return (
        <div className={cn("space-y-4", className)}>
            {label && <Label>{label}</Label>}
            
            {/* Image Previews */}
            {displayPreviews.length > 0 && (
                <div className={cn(
                    "grid gap-4",
                    multiple ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1"
                )}>
                    {displayPreviews.map((preview, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative group rounded-lg border overflow-hidden bg-muted",
                                aspectRatio ? "aspect-[var(--aspect-ratio)]" : previewSizeClasses[previewSize]
                            )}
                            style={aspectRatio ? { "--aspect-ratio": aspectRatio } as React.CSSProperties : undefined}
                        >
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {!disabled && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemove(index)}
                                    disabled={isUploading}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Area */}
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
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
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
                                    Choose {multiple ? "Images" : "Image"}
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            Drag and drop {multiple ? "images" : "an image"} here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, GIF up to {(maxSize / (1024 * 1024)).toFixed(1)}MB
                            {multiple && ` (max ${maxImages} images)`}
                        </p>
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple={multiple}
                    onChange={handleFileInputChange}
                    disabled={disabled || isUploading}
                    className="hidden"
                />
            </div>

            {/* URL Input (Optional) */}
            {showUrlInput && (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            type="url"
                            placeholder={`Or enter ${multiple ? "image URLs" : "an image URL"}`}
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
                                "Add URL"
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

