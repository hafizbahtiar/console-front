"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { UseFormRegister, FieldErrors, Control } from "react-hook-form"
import { Controller } from "react-hook-form"

export interface SettingsFormFieldProps {
    /** Field label */
    label: string
    /** Field description/help text */
    description?: string
    /** Field name (for form registration) */
    name: string
    /** Form register function */
    register?: UseFormRegister<any>
    /** Form errors */
    errors?: FieldErrors<any>
    /** Form control (for Controller) */
    control?: Control<any>
    /** Field type */
    type?: "text" | "email" | "password" | "url" | "textarea" | "select" | "switch"
    /** Placeholder text */
    placeholder?: string
    /** Whether field is disabled */
    disabled?: boolean
    /** Whether field is required */
    required?: boolean
    /** Additional className */
    className?: string
    /** Select options (for type="select") */
    selectOptions?: Array<{ value: string; label: string }>
    /** Switch label (for type="switch") */
    switchLabel?: string
    /** Default value for switch */
    switchDefault?: boolean
}

/**
 * SettingsFormField - A reusable form field component for settings pages
 * 
 * @example
 * ```tsx
 * <SettingsFormField
 *   label="First Name"
 *   name="firstName"
 *   register={register}
 *   errors={errors}
 *   placeholder="John"
 * />
 * ```
 */
export function SettingsFormField({
    label,
    description,
    name,
    register,
    errors,
    control,
    type = "text",
    placeholder,
    disabled = false,
    required = false,
    className,
    selectOptions = [],
    switchLabel,
    switchDefault = false,
}: SettingsFormFieldProps) {
    const error = errors?.[name]
    const hasError = !!error

    // For switch fields, use Controller
    if (type === "switch" && control) {
        return (
            <div className={cn("space-y-2", className)}>
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor={name} className={required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""}>
                            {label}
                        </Label>
                        {description && (
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    <Controller
                        name={name}
                        control={control}
                        defaultValue={switchDefault}
                        render={({ field }) => (
                            <Switch
                                id={name}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={disabled}
                            />
                        )}
                    />
                </div>
                {hasError && (
                    <p className="text-sm text-destructive">
                        {String(error.message)}
                    </p>
                )}
            </div>
        )
    }

    // For select fields, use Controller
    if (type === "select" && control) {
        return (
            <div className={cn("space-y-2", className)}>
                <Label htmlFor={name} className={required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""}>
                    {label}
                </Label>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                            <SelectTrigger id={name} className={hasError ? "border-destructive" : ""}>
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                                {selectOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {hasError && (
                    <p className="text-sm text-destructive">
                        {String(error.message)}
                    </p>
                )}
            </div>
        )
    }

    // For textarea fields
    if (type === "textarea" && register) {
        return (
            <div className={cn("space-y-2", className)}>
                <Label htmlFor={name} className={required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""}>
                    {label}
                </Label>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
                <Textarea
                    id={name}
                    {...register(name, { required: required ? `${label} is required` : false })}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={hasError ? "border-destructive" : ""}
                />
                {hasError && (
                    <p className="text-sm text-destructive">
                        {String(error.message)}
                    </p>
                )}
            </div>
        )
    }

    // For input fields (text, email, password, url)
    if (register) {
        return (
            <div className={cn("space-y-2", className)}>
                <Label htmlFor={name} className={required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""}>
                    {label}
                </Label>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
                <Input
                    id={name}
                    type={type}
                    {...register(name, { required: required ? `${label} is required` : false })}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={hasError ? "border-destructive" : ""}
                />
                {hasError && (
                    <p className="text-sm text-destructive">
                        {String(error.message)}
                    </p>
                )}
            </div>
        )
    }

    // Fallback for unregistered fields (read-only)
    return (
        <div className={cn("space-y-2", className)}>
            <Label htmlFor={name}>
                {label}
            </Label>
            {description && (
                <p className="text-sm text-muted-foreground">
                    {description}
                </p>
            )}
            <Input
                id={name}
                type={type}
                placeholder={placeholder}
                disabled={true}
                className="bg-muted"
            />
        </div>
    )
}

