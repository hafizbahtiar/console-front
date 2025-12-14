"use client"

import * as React from "react"
import { useCallback, useState } from "react"
import Cropper from "react-easy-crop"
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog"
import { cn } from "@/lib/utils"
import { Upload, X, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import type { Area } from "react-easy-crop"

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
    /** Whether to enable image cropping (optional) */
    enableCrop?: boolean
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
    enableCrop = true,
    className,
    disabled = false,
    uploadEndpoint = "/upload/avatar",
}: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [urlInput, setUrlInput] = useState(value || "")
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Cropping state
    const [showCropDialog, setShowCropDialog] = useState(false)
    const [imageToCrop, setImageToCrop] = useState<string | null>(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

    // Create cropped image blob
    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener("load", () => resolve(image))
            image.addEventListener("error", (error) => reject(error))
            image.src = url
        })

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area
    ): Promise<Blob> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
            throw new Error("No 2d context")
        }

        // Set canvas size to match crop area
        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        // Draw the cropped portion of the image
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Failed to create blob"))
                    return
                }
                resolve(blob)
            }, "image/jpeg", 0.95)
        })
    }

    const uploadFile = useCallback(
        async (file: File) => {
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
            setPreview(avatarUrl)
        },
        [onUpload, uploadEndpoint]
    )

    const handleCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleCropConfirm = useCallback(async () => {
        if (!imageToCrop || !croppedAreaPixels) {
            return
        }

        setIsUploading(true)
        try {
            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels)
            const croppedFile = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" })

            await uploadFile(croppedFile)

            toast.success("Avatar uploaded successfully!")
            setShowCropDialog(false)
            setImageToCrop(null)
            setCrop({ x: 0, y: 0 })
            setZoom(1)
            setCroppedAreaPixels(null)
        } catch (error: any) {
            console.error("Crop error:", error)
            toast.error(error.message || "Failed to crop image")
        } finally {
            setIsUploading(false)
        }
    }, [imageToCrop, croppedAreaPixels, uploadFile])

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
                const imageUrl = reader.result as string
                setPreview(imageUrl)

                // If cropping is enabled, show crop dialog
                if (enableCrop) {
                    setImageToCrop(imageUrl)
                    setShowCropDialog(true)
                } else {
                    // Upload directly without cropping
                    setIsUploading(true)
                    uploadFile(file).catch((error: any) => {
                        console.error("Avatar upload error:", error)
                        toast.error(error.message || "Failed to upload avatar")
                        setPreview(null)
                    }).finally(() => {
                        setIsUploading(false)
                    })
                }
            }
            reader.readAsDataURL(file)
        },
        [enableCrop, uploadFile]
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
        <>
            {/* Crop Dialog */}
            <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Crop Image</DialogTitle>
                        <DialogDescription>
                            Adjust the image to your liking. Drag to move, scroll to zoom.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden">
                        {imageToCrop && (
                            <Cropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={handleCropComplete}
                                cropShape="round"
                                showGrid={false}
                            />
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Zoom</Label>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowCropDialog(false)
                                setImageToCrop(null)
                                setPreview(null)
                            }}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCropConfirm}
                            disabled={isUploading || !croppedAreaPixels}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Confirm
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
        </>
    )
}

