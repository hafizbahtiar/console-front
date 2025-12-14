"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import type { FilterPreset, CreateFilterPresetInput, UpdateFilterPresetInput } from "@/lib/api/finance/finance-filter-presets"
import type { FinanceFilterState } from "@/lib/utils/finance-filters"

const filterPresetSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    isDefault: z.boolean().optional(),
})

interface FilterPresetDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    preset?: FilterPreset
    filters: FinanceFilterState
    onSave: (preset: FilterPreset) => void
}

export function FilterPresetDialog({
    open,
    onOpenChange,
    preset,
    filters,
    onSave,
}: FilterPresetDialogProps) {
    const [isSaving, setIsSaving] = useState(false)
    const isEditing = !!preset

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<z.infer<typeof filterPresetSchema>>({
        resolver: zodResolver(filterPresetSchema),
        defaultValues: {
            name: preset?.name || "",
            description: preset?.description || "",
            isDefault: preset?.isDefault || false,
        },
    })

    const isDefault = watch("isDefault")

    useEffect(() => {
        if (open) {
            reset({
                name: preset?.name || "",
                description: preset?.description || "",
                isDefault: preset?.isDefault || false,
            })
        }
    }, [open, preset, reset])

    const onSubmit = async (data: z.infer<typeof filterPresetSchema>) => {
        setIsSaving(true)
        try {
            if (isEditing && preset) {
                const { updateFilterPreset } = await import("@/lib/api/finance/finance-filter-presets")
                const input: UpdateFilterPresetInput = {
                    name: data.name,
                    description: data.description || undefined,
                    filters,
                    isDefault: data.isDefault,
                }
                const updated = await updateFilterPreset(preset.id, input)
                toast.success("Filter preset updated successfully")
                onSave(updated)
            } else {
                const { createFilterPreset } = await import("@/lib/api/finance/finance-filter-presets")
                const input: CreateFilterPresetInput = {
                    name: data.name,
                    description: data.description || undefined,
                    filters,
                    isDefault: data.isDefault,
                }
                const created = await createFilterPreset(input)
                toast.success("Filter preset created successfully")
                onSave(created)
            }
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error.message || "Failed to save filter preset")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Filter Preset" : "Save Filter Preset"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update your filter preset name and settings."
                            : "Save your current filter settings as a preset for quick access."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            {...register("name")}
                            placeholder="e.g., Monthly Expenses"
                            disabled={isSaving}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Optional description..."
                            rows={3}
                            disabled={isSaving}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isDefault"
                            checked={isDefault}
                            onCheckedChange={(checked) => setValue("isDefault", checked)}
                            disabled={isSaving}
                        />
                        <Label htmlFor="isDefault" className="cursor-pointer">
                            Set as default preset
                        </Label>
                    </div>

                    <div className="rounded-md bg-muted p-3 text-sm">
                        <p className="font-medium mb-1">Current Filters:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {Object.keys(filters).length === 0 ? (
                                <li>No filters applied</li>
                            ) : (
                                <>
                                    {filters.type && <li>Type: {filters.type}</li>}
                                    {filters.categoryId && <li>Category: {filters.categoryId}</li>}
                                    {filters.startDate && <li>Start Date: {filters.startDate}</li>}
                                    {filters.endDate && <li>End Date: {filters.endDate}</li>}
                                    {filters.search && <li>Search: {filters.search}</li>}
                                    {filters.paymentMethod && <li>Payment Method: {filters.paymentMethod}</li>}
                                </>
                            )}
                        </ul>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Saving..." : isEditing ? "Update" : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

