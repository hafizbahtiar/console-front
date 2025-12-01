"use client"

import * as React from "react"
import { useCallback, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { cn } from "@/lib/utils"
import { Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

export interface AvatarUploadProps {
    /** Current avatar URL */
    value?: string
    /** Callback when avatar is uploaded (receives the new URL) */
    onUpload: (url: string) => Promise<void>
    /** Fallback text for avatar (e.g., user initials) */
    fallback?: string
    /** Size of the avatar preview */
    size?: "sm" | "md" | "lg" | "xl"
    /** Whether to show URL input as fallback */
    showUrlInput?: boolean
    /** Additional className */
    className?: string
    /** Disabled state */
    disabled?: boolean
    /** Custom upload endpoint (defaults to /upload/avatar) */
    uploadEndpoint?: string
}

const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
}

export function AvatarUpload({
    value,
    onUpload,
    fallback = "U",
    size = "md",
    showUrlInput = true,
    className,
    disabled = false,
    uploadEndpoint = "/upload/avatar",
}: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [urlInput, setUrlInput] = useState(value || "")
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileSelect = useCallback(
        async (file: File) => {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file")
                return
            }

            // Validate file size (5MB max)
            const maxSize = 5 * 1024 * 1024 // 5MB
            if (file.size > maxSize) {
                toast.error("Image size must be less than 5MB")
                return
            }

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)

            // Upload file
            setIsUploading(true)
            try {
                const formData = new FormData()
                formData.append("file", file)

                const accessToken = localStorage.getItem("accessToken")
                if (!accessToken) {
                    throw new Error("Not authenticated")
                }

                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
                const endpoint = uploadEndpoint.startsWith('/')
                    ? `${API_URL}${uploadEndpoint}`
                    : `${API_URL}/${uploadEndpoint}`

                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: formData,
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.message || "Failed to upload avatar")
                }

                const result = await response.json()

                // Handle different response formats:
                // 1. Upload endpoint: { data: { url: string } } or { url: string }
                // 2. Profile endpoint: { data: { avatar: string, ... } } or { avatar: string, ... }
                let avatarUrl: string | undefined

                if (result.data) {
                    // SuccessResponse format
                    avatarUrl = result.data.url || result.data.avatar
                } else {
                    // Direct response format
                    avatarUrl = result.url || result.avatar
                }

                if (!avatarUrl) {
                    throw new Error("No avatar URL returned from upload")
                }

                // Call onUpload callback to update profile
                await onUpload(avatarUrl)
                setUrlInput(avatarUrl)
                setPreview(null)
            } catch (error: any) {
                console.error("Avatar upload error:", error)
                toast.error(error.message || "Failed to upload avatar")
                setPreview(null)
                throw error // Re-throw so parent can handle
            } finally {
                setIsUploading(false)
            }
        },
        [onUpload]
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
            toast.error("Please enter an avatar URL")
            return
        }

        setIsUploading(true)
        try {
            await onUpload(urlInput.trim())
            toast.success("Avatar updated successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to update avatar")
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemove = async () => {
        setIsUploading(true)
        try {
            await onUpload("")
            setUrlInput("")
            setPreview(null)
            toast.success("Avatar removed successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to remove avatar")
        } finally {
            setIsUploading(false)
        }
    }

    const displayUrl = preview || value || urlInput
    const showPreview = !!displayUrl

    return (
        <div className={cn("space-y-4", className)}>
            <Label>Avatar</Label>
            <div className="flex items-start gap-4">
                {/* Avatar Preview */}
                <div className="relative">
                    <Avatar className={cn(sizeClasses[size])}>
                        {showPreview && (
                            <AvatarImage src={displayUrl} alt="Avatar preview" />
                        )}
                        <AvatarFallback className="text-lg">
                            {fallback.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-2">
                    {/* File Upload Area */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-4 transition-colors",
                            isDragging
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Upload className="w-5 h-5 text-muted-foreground" />
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
                                    Drag and drop an image here, or click to browse
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    PNG, JPG, GIF up to 5MB
                                </p>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
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
                                    placeholder="Or enter avatar URL"
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

                    {/* Remove Button */}
                    {value && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                            disabled={disabled || isUploading}
                            className="text-destructive hover:text-destructive"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Remove Avatar
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

