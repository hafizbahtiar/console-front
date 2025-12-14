"use client"

import { Control } from "react-hook-form"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Controller } from "react-hook-form"

interface DashboardSectionProps {
    control: Control<any>
}

export function DashboardSection({ control }: DashboardSectionProps) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-medium">Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                    Configure dashboard display options
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="default-dashboard-view">Default Dashboard View</Label>
                    <Controller
                        name="defaultDashboardView"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id="default-dashboard-view" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="grid">Grid</SelectItem>
                                    <SelectItem value="list">List</SelectItem>
                                    <SelectItem value="table">Table</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="items-per-page">Items Per Page</Label>
                    <Controller
                        name="itemsPerPage"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id="items-per-page" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                    <Label htmlFor="show-widgets">Show Widgets</Label>
                    <p className="text-sm text-muted-foreground">
                        Display dashboard widgets and quick stats
                    </p>
                </div>
                <Controller
                    name="showWidgets"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="show-widgets"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    )}
                />
            </div>
        </div>
    )
}

