"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

export function DataPrivacySection() {
    const [isExporting, setIsExporting] = useState(false)

    const handleExportData = async () => {
        setIsExporting(true)
        try {
            // TODO: Call API to export user data
            // const data = await exportUserData()
            // Create download link
            const dataStr = JSON.stringify({ exportedAt: new Date().toISOString() }, null, 2)
            const dataBlob = new Blob([dataStr], { type: "application/json" })
            const url = URL.createObjectURL(dataBlob)
            const link = document.createElement("a")
            link.href = url
            link.download = `user-data-${new Date().toISOString().split("T")[0]}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast.success("Data exported successfully!")
        } catch (error) {
            toast.error("Failed to export data. Please try again.")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-medium">Data & Privacy</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your data and privacy settings
                </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                    <Label>Export Data</Label>
                    <p className="text-sm text-muted-foreground">
                        Download a copy of your account data
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleExportData}
                    disabled={isExporting}
                >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export Data"}
                </Button>
            </div>
        </div>
    )
}

