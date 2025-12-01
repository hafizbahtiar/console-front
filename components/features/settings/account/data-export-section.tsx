"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { exportAccountData } from "@/lib/api/settings"

export function DataExportSection() {
    const [format, setFormat] = useState<"json" | "csv">("json")
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const blob = await exportAccountData(format)

            // Create download link
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url

            // Set filename based on format
            const extension = format === "json" ? "json" : "csv"
            const filename = `account-data-${new Date().toISOString().split("T")[0]}.${extension}`
            link.download = filename

            // Trigger download
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Clean up
            URL.revokeObjectURL(url)

            toast.success(`Data exported successfully as ${format.toUpperCase()}!`)
        } catch (error) {
            console.error("Export error:", error)
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to export data. Please try again."
            )
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download Your Data
                </CardTitle>
                <CardDescription>
                    Export all your account data including profile, portfolio, sessions, and more.
                    You can download your data in JSON or CSV format.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Export Format</Label>
                    <RadioGroup value={format} onValueChange={(value) => setFormat(value as "json" | "csv")}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="json" id="json" />
                            <Label htmlFor="json" className="font-normal cursor-pointer">
                                JSON (Recommended)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="csv" id="csv" />
                            <Label htmlFor="csv" className="font-normal cursor-pointer">
                                CSV
                            </Label>
                        </div>
                    </RadioGroup>
                    <p className="text-sm text-muted-foreground">
                        {format === "json"
                            ? "JSON format preserves all data structure and nested objects."
                            : "CSV format is better for spreadsheet applications but may flatten nested data."}
                    </p>
                </div>

                <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm font-medium mb-2">What's included in your export:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Account information (email, verification status)</li>
                        <li>Profile data (name, bio, location, website)</li>
                        <li>All portfolio data (projects, companies, skills, experiences, education, certifications, blog posts, testimonials, contacts)</li>
                        <li>Portfolio profile settings</li>
                        <li>Active and inactive sessions</li>
                        <li>Account creation and update timestamps</li>
                    </ul>
                </div>

                <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full"
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" />
                            Download Your Data
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}

