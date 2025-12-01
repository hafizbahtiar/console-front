"use client"

import { UseFormRegister, FieldErrors } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface BasicInfoSectionProps {
    register: UseFormRegister<any>
    errors: FieldErrors<any>
    username?: string
    email?: string
}

export function BasicInfoSection({ register, errors, username, email }: BasicInfoSectionProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Basic Information</h3>
                <p className="text-sm text-muted-foreground">
                    Your account's basic information
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                        id="firstName"
                        {...register("firstName")}
                        placeholder="John"
                    />
                    {errors.firstName?.message && (
                        <p className="text-sm text-destructive">
                            {String(errors.firstName.message)}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                        id="lastName"
                        {...register("lastName")}
                        placeholder="Doe"
                    />
                    {errors.lastName?.message && (
                        <p className="text-sm text-destructive">
                            {String(errors.lastName.message)}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                    id="displayName"
                    {...register("displayName")}
                    placeholder="John Doe"
                />
                {errors.displayName?.message && (
                    <p className="text-sm text-destructive">
                        {String(errors.displayName.message)}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    value={username || ""}
                    disabled
                    className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                    Username cannot be changed
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    value={email || ""}
                    disabled
                    className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                    Email cannot be changed here
                </p>
            </div>
        </div>
    )
}

