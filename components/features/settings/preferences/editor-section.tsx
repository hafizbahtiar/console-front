"use client"

import { Control, UseFormRegister, FieldErrors } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Controller } from "react-hook-form"

interface EditorSectionProps {
    control: Control<any>
    register: UseFormRegister<any>
    errors: FieldErrors<any>
}

export function EditorSection({ control, register, errors }: EditorSectionProps) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-medium">Editor</h3>
                <p className="text-sm text-muted-foreground">
                    Customize code editor appearance and behavior
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="editor-theme">Editor Theme</Label>
                    <Controller
                        name="editorTheme"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id="editor-theme">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="monokai">Monokai</SelectItem>
                                    <SelectItem value="github">GitHub</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="editor-font-size">Font Size</Label>
                    <Input
                        id="editor-font-size"
                        type="number"
                        min="10"
                        max="24"
                        {...register("editorFontSize", { valueAsNumber: true })}
                    />
                    {errors.editorFontSize?.message && (
                        <p className="text-sm text-destructive">
                            {String(errors.editorFontSize.message)}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="editor-line-height">Line Height</Label>
                    <Input
                        id="editor-line-height"
                        type="number"
                        min="1"
                        max="3"
                        step="0.1"
                        {...register("editorLineHeight", { valueAsNumber: true })}
                    />
                    {errors.editorLineHeight?.message && (
                        <p className="text-sm text-destructive">
                            {String(errors.editorLineHeight.message)}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="editor-tab-size">Tab Size</Label>
                    <Input
                        id="editor-tab-size"
                        type="number"
                        min="2"
                        max="8"
                        {...register("editorTabSize", { valueAsNumber: true })}
                    />
                    {errors.editorTabSize?.message && (
                        <p className="text-sm text-destructive">
                            {String(errors.editorTabSize.message)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

