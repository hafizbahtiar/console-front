"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FilterPresetDialog } from "./filter-preset-dialog"
import { 
    getFilterPresets, 
    deleteFilterPreset, 
    setDefaultFilterPreset,
    type FilterPreset 
} from "@/lib/api/finance/finance-filter-presets"
import { toast } from "sonner"
import { Bookmark, BookmarkCheck, MoreVertical, Pencil, Trash2, Star } from "lucide-react"
import type { FinanceFilterState } from "@/lib/utils/finance-filters"

interface FilterPresetMenuProps {
    currentFilters: FinanceFilterState
    onLoadPreset: (filters: FinanceFilterState) => void
}

export function FilterPresetMenu({ currentFilters, onLoadPreset }: FilterPresetMenuProps) {
    const [presets, setPresets] = useState<FilterPreset[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showSaveDialog, setShowSaveDialog] = useState(false)
    const [presetToEdit, setPresetToEdit] = useState<FilterPreset | undefined>()
    const [presetToDelete, setPresetToDelete] = useState<FilterPreset | undefined>()

    useEffect(() => {
        void loadPresets()
    }, [])

    const loadPresets = async () => {
        setIsLoading(true)
        try {
            const data = await getFilterPresets()
            setPresets(data)
        } catch (error: any) {
            toast.error(error.message || "Failed to load filter presets")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSavePreset = async (preset: FilterPreset) => {
        await loadPresets()
        if (preset.isDefault) {
            toast.success("Default preset updated")
        }
    }

    const handleLoadPreset = (preset: FilterPreset) => {
        onLoadPreset(preset.filters)
        toast.success(`Loaded preset: ${preset.name}`)
    }

    const handleSetDefault = async (preset: FilterPreset) => {
        try {
            await setDefaultFilterPreset(preset.id)
            await loadPresets()
            toast.success("Default preset updated")
        } catch (error: any) {
            toast.error(error.message || "Failed to set default preset")
        }
    }

    const handleDeletePreset = async () => {
        if (!presetToDelete) return

        try {
            await deleteFilterPreset(presetToDelete.id)
            await loadPresets()
            toast.success("Filter preset deleted")
            setPresetToDelete(undefined)
        } catch (error: any) {
            toast.error(error.message || "Failed to delete filter preset")
            setPresetToDelete(undefined)
        }
    }

    const handleEditPreset = (preset: FilterPreset) => {
        setPresetToEdit(preset)
        setShowSaveDialog(true)
    }

    const defaultPreset = presets.find((p) => p.isDefault)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isLoading}>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Presets
                        {presets.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-muted rounded">
                                {presets.length}
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Filter Presets</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {isLoading ? (
                        <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                    ) : presets.length === 0 ? (
                        <DropdownMenuItem disabled>No presets saved</DropdownMenuItem>
                    ) : (
                        presets.map((preset) => (
                            <div key={preset.id} className="flex items-center group">
                                <DropdownMenuItem
                                    className="flex-1 cursor-pointer"
                                    onClick={() => handleLoadPreset(preset)}
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        {preset.isDefault ? (
                                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        ) : (
                                            <BookmarkCheck className="h-3 w-3 text-muted-foreground" />
                                        )}
                                        <span className="flex-1 truncate">{preset.name}</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditPreset(preset)}>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        {!preset.isDefault && (
                                            <DropdownMenuItem onClick={() => handleSetDefault(preset)}>
                                                <Star className="h-4 w-4 mr-2" />
                                                Set as Default
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => setPresetToDelete(preset)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                        setPresetToEdit(undefined)
                        setShowSaveDialog(true)
                    }}>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save Current Filters
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <FilterPresetDialog
                open={showSaveDialog}
                onOpenChange={setShowSaveDialog}
                preset={presetToEdit}
                filters={currentFilters}
                onSave={handleSavePreset}
            />

            <ConfirmDialog
                open={!!presetToDelete}
                onOpenChange={(open) => !open && setPresetToDelete(undefined)}
                onConfirm={handleDeletePreset}
                title="Delete Filter Preset"
                description={`Are you sure you want to delete "${presetToDelete?.name}"? This action cannot be undone.`}
            />
        </>
    )
}

