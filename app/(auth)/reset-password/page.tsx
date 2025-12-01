"use client"

import { useState, useEffect, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth"
import { resetPassword } from "@/lib/api/auth"
import { toast } from "sonner"
import { ApiClientError } from "@/lib/api-client"

function ResetPasswordContent() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [token, setToken] = useState<string | null>(null)
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const tokenParam = searchParams.get("token")
        if (!tokenParam) {
            toast.error("Invalid reset link. Please request a new one.")
            router.push("/forgot-password")
        } else {
            setToken(tokenParam)
        }
    }, [searchParams, router])

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    })

    // Update form when token is available
    useEffect(() => {
        if (token) {
            setValue("token", token)
        }
    }, [token, setValue])

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            toast.error("Invalid reset token. Please request a new password reset.")
            return
        }

        setIsSubmitting(true)
        try {
            await resetPassword({
                token,
                password: data.password,
            })
            toast.success("Password reset successfully! Redirecting to login...")
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (error) {
            if (error instanceof ApiClientError) {
                if (error.statusCode === 404) {
                    toast.error("Invalid or expired reset token. Please request a new password reset.")
                    setTimeout(() => {
                        router.push("/forgot-password")
                    }, 2000)
                } else {
                    toast.error(error.message || "Failed to reset password. Please try again.")
                }
            } else {
                toast.error("An unexpected error occurred. Please try again.")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-form-section">
                    <div className="auth-form-container">
                        <div className="auth-form-header">
                            <h1 className="auth-form-title">Invalid Reset Link</h1>
                        </div>
                        <div className="auth-form-error-state">
                            <div className="auth-form-error-icon">✗</div>
                            <p className="auth-form-subtitle" style={{ marginTop: "1rem", marginBottom: "2rem" }}>
                                The reset link is invalid or has expired. Please request a new one.
                            </p>
                            <Link href="/forgot-password">
                                <Button className="auth-form-button" size="lg">
                                    Request New Reset Link
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-container">
            {/* Left Side - Branding with Testimonial */}
            <div className="auth-branding">
                <div className="auth-brand-top">
                    <div className="auth-brand-logo">
                        <div className="auth-brand-logo-icon">C</div>
                        <span>Console</span>
                    </div>
                </div>

                <div className="auth-brand-content">
                    <div className="auth-testimonial">
                        <p className="auth-testimonial-text">
                            "Console has streamlined our business operations. Managing
                            customers, invoices, and orders has never been easier."
                        </p>
                        <div className="auth-testimonial-author">
                            <div className="auth-testimonial-avatar">SM</div>
                            <div className="auth-testimonial-info">
                                <div className="auth-testimonial-name">Sarah Miller</div>
                                <div className="auth-testimonial-role">CEO at BusinessPro</div>
                            </div>
                        </div>
                    </div>

                    <div className="auth-brand-stats">
                        <p className="auth-brand-stat">
                            <strong>BusinessPro</strong> managed thousands of orders using Console
                        </p>
                        <p className="auth-brand-stat">
                            Join thousands of businesses managing operations with Console
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="auth-form-section">
                <div className="auth-form-container">
                    <div className="auth-form-header">
                        <h1 className="auth-form-title">Reset password</h1>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                        <div className="auth-form-group">
                            <Label htmlFor="password" className="auth-form-label">
                                New Password
                            </Label>
                            <div className="auth-form-input-wrapper">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Your new password"
                                    className="auth-form-input"
                                    {...register("password")}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="auth-form-error">{errors.password.message}</p>
                            )}
                            <div className="auth-password-requirement">
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4M12 8h.01" />
                                </svg>
                                <span>Password must be at least 8 characters with uppercase, lowercase, and number</span>
                            </div>
                        </div>

                        <div className="auth-form-group">
                            <Label htmlFor="confirmPassword" className="auth-form-label">
                                Confirm Password
                            </Label>
                            <div className="auth-form-input-wrapper">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your new password"
                                    className="auth-form-input"
                                    {...register("confirmPassword")}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? (
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="auth-form-error">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="auth-form-button"
                            size="lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="auth-button-loading">Resetting...</span>
                            ) : (
                                "Reset password"
                            )}
                        </Button>
                    </form>

                    <div className="auth-form-footer">
                        <p>
                            Remember your password?{" "}
                            <Link href="/login" className="auth-form-link">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="auth-container">
                <div className="auth-form-section">
                    <div className="auth-form-container">
                        <div className="auth-form-header">
                            <h1 className="auth-form-title">Reset password</h1>
                        </div>
                        <div className="auth-form-loading">
                            <div className="auth-form-loading-spinner"></div>
                            <p className="auth-form-loading-message">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    )
}

