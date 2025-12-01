"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { z } from "zod"
import { changePassword } from "@/lib/api/settings"

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export default function SecuritySettingsPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
    })


    const onSubmit = async (data: ChangePasswordFormData) => {
        setIsSubmitting(true)
        try {
            await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            })
            toast.success("Password changed successfully!")
            reset()
        } catch (error) {
            toast.error("Failed to change password. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold">Security Settings</h2>
                <p className="text-muted-foreground mt-1">
                    Manage your account security and password
                </p>
            </div>

            <div className="space-y-8">
                {/* Change Password */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium">Change Password</h3>
                        <p className="text-sm text-muted-foreground">
                            Update your password to keep your account secure
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="currentPassword"
                                    type={showCurrentPassword ? "text" : "password"}
                                    {...register("currentPassword")}
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <p className="text-sm text-destructive">
                                    {errors.currentPassword.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    {...register("newPassword")}
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="text-sm text-destructive">
                                    {errors.newPassword.message}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Password must be at least 8 characters with uppercase, lowercase, and number
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    {...register("confirmPassword")}
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-destructive">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Changing..." : "Change Password"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

