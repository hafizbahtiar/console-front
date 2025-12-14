"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { z } from "zod"
import { getPreferences, updatePreferences, resetPreferences, type UpdatePreferencesDto } from "@/lib/api/settings"
import { ApiClientError } from "@/lib/api-client"
import { AppearanceSection } from "@/components/features/settings/preferences/appearance-section"
import { DateTimeSection } from "@/components/features/settings/preferences/datetime-section"
import { DashboardSection } from "@/components/features/settings/preferences/dashboard-section"
import { EditorSection } from "@/components/features/settings/preferences/editor-section"
import { DataPrivacySection } from "@/components/features/settings/preferences/data-privacy-section"
import { CurrencySection } from "@/components/features/settings/preferences/currency-section"
import { Loader2 } from "lucide-react"

const preferencesSchema = z.object({
    // Appearance
    theme: z.enum(["light", "dark", "system"]),
    language: z.string().min(2),
    dateFormat: z.string(),
    timeFormat: z.enum(["12h", "24h"]),
    timezone: z.string(),
    // Dashboard
    defaultDashboardView: z.enum(["grid", "list", "table"]),
    itemsPerPage: z.string(),
    showWidgets: z.boolean(),
    // Editor
    editorTheme: z.enum(["light", "dark", "monokai", "github"]),
    editorFontSize: z.number().min(10).max(24),
    editorLineHeight: z.number().min(1).max(3).step(0.1),
    editorTabSize: z.number().min(2).max(8),
})

type PreferencesFormData = z.infer<typeof preferencesSchema>

const defaultPreferences: PreferencesFormData = {
    theme: "system",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    timezone: "UTC",
    defaultDashboardView: "grid",
    itemsPerPage: "20",
    showWidgets: true,
    editorTheme: "dark",
    editorFontSize: 14,
    editorLineHeight: 1.5,
    editorTabSize: 4,
}

export default function PreferencesSettingsPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isResetting, setIsResetting] = useState(false)

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch,
    } = useForm<PreferencesFormData>({
        resolver: zodResolver(preferencesSchema),
        defaultValues: defaultPreferences,
    })

    // Load preferences from backend on mount
    useEffect(() => {
        loadPreferencesFromBackend()
    }, [])

    const loadPreferencesFromBackend = async () => {
        setIsLoading(true)
        try {
            const preferences = await getPreferences()

            // Map backend preferences to form data
            const formData: PreferencesFormData = {
                theme: preferences.theme as "light" | "dark" | "system",
                language: preferences.language,
                dateFormat: preferences.dateFormat,
                timeFormat: preferences.timeFormat as "12h" | "24h",
                timezone: preferences.timezone,
                defaultDashboardView: preferences.defaultDashboardView as "grid" | "list" | "table",
                itemsPerPage: preferences.itemsPerPage,
                showWidgets: preferences.showWidgets,
                editorTheme: preferences.editorTheme as "light" | "dark" | "monokai" | "github",
                editorFontSize: preferences.editorFontSize,
                editorLineHeight: preferences.editorLineHeight,
                editorTabSize: preferences.editorTabSize,
            }

            reset(formData)

            // Also save to localStorage for client-side access
            if (typeof window !== "undefined") {
                localStorage.setItem("userPreferences", JSON.stringify(formData))
            }
        } catch (error: any) {
            console.error("Failed to load preferences:", error)
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to load preferences. Using defaults."
            toast.error(message)
            // Fallback to localStorage if backend fails
            const stored = typeof window !== "undefined" ? localStorage.getItem("userPreferences") : null
            if (stored) {
                try {
                    const parsed = JSON.parse(stored)
                    reset({ ...defaultPreferences, ...parsed })
                } catch {
                    // Use defaults
                }
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Watch theme to apply immediately (client-side only)
    const theme = watch("theme")

    useEffect(() => {
        if (theme && typeof window !== "undefined") {
            // Apply theme immediately (if using next-themes or similar)
            document.documentElement.setAttribute("data-theme", theme)
            // Also save to localStorage for immediate access
            const current = localStorage.getItem("userPreferences")
            if (current) {
                try {
                    const parsed = JSON.parse(current)
                    localStorage.setItem("userPreferences", JSON.stringify({ ...parsed, theme }))
                } catch {
                    // Ignore
                }
            }
        }
    }, [theme])

    const onSubmit = async (data: PreferencesFormData) => {
        setIsSubmitting(true)
        try {
            // Update backend preferences
            const updateData: UpdatePreferencesDto = {
                theme: data.theme,
                language: data.language,
                dateFormat: data.dateFormat,
                timeFormat: data.timeFormat,
                timezone: data.timezone,
                defaultDashboardView: data.defaultDashboardView,
                itemsPerPage: data.itemsPerPage,
                showWidgets: data.showWidgets,
                editorTheme: data.editorTheme,
                editorFontSize: data.editorFontSize,
                editorLineHeight: data.editorLineHeight,
                editorTabSize: data.editorTabSize,
            }

            await updatePreferences(updateData)

            // Also save to localStorage for client-side access
            if (typeof window !== "undefined") {
                localStorage.setItem("userPreferences", JSON.stringify(data))
            }

            toast.success("Preferences updated successfully!")
        } catch (error: any) {
            console.error("Failed to update preferences:", error)
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to update preferences. Please try again."
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = async () => {
        setIsResetting(true)
        try {
            const resetPrefs = await resetPreferences()

            // Map reset preferences to form data
            const formData: PreferencesFormData = {
                theme: resetPrefs.theme as "light" | "dark" | "system",
                language: resetPrefs.language,
                dateFormat: resetPrefs.dateFormat,
                timeFormat: resetPrefs.timeFormat as "12h" | "24h",
                timezone: resetPrefs.timezone,
                defaultDashboardView: resetPrefs.defaultDashboardView as "grid" | "list" | "table",
                itemsPerPage: resetPrefs.itemsPerPage,
                showWidgets: resetPrefs.showWidgets,
                editorTheme: resetPrefs.editorTheme as "light" | "dark" | "monokai" | "github",
                editorFontSize: resetPrefs.editorFontSize,
                editorLineHeight: resetPrefs.editorLineHeight,
                editorTabSize: resetPrefs.editorTabSize,
            }

            reset(formData)

            // Also save to localStorage
            if (typeof window !== "undefined") {
                localStorage.setItem("userPreferences", JSON.stringify(formData))
            }

            toast.success("Preferences reset to defaults!")
        } catch (error: any) {
            console.error("Failed to reset preferences:", error)
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to reset preferences. Please try again."
            toast.error(message)
        } finally {
            setIsResetting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold">Preferences</h2>
                    <p className="text-muted-foreground mt-1">
                        Customize your application preferences
                    </p>
                </div>
                <div className="rounded-lg border p-8 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading preferences...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold">Preferences</h2>
                <p className="text-muted-foreground mt-1">
                    Customize your application preferences
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <AppearanceSection control={control} />
                <DateTimeSection control={control} />
                <DashboardSection control={control} />
                <EditorSection control={control} register={register} errors={errors} />
                <DataPrivacySection />

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={isSubmitting || isResetting}
                    >
                        {isResetting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resetting...
                            </>
                        ) : (
                            "Reset to Defaults"
                        )}
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isResetting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </form>

            {/* Currency Preferences Section (separate from main form) */}
            <div className="mt-8 pt-8 border-t">
                <CurrencySection control={control} />
            </div>
        </div>
    )
}
