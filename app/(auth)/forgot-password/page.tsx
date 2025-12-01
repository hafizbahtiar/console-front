"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth"
import { forgotPassword } from "@/lib/api/auth"
import { toast } from "sonner"
import { ApiClientError } from "@/lib/api-client"

export default function ForgotPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsSubmitting(true)
        try {
            await forgotPassword({ email: data.email })
            setIsSuccess(true)
            toast.success("Password reset link sent! Check your email.")
        } catch (error) {
            if (error instanceof ApiClientError) {
                toast.error(error.message || "Failed to send reset link. Please try again.")
            } else {
                toast.error("An unexpected error occurred. Please try again.")
            }
        } finally {
            setIsSubmitting(false)
        }
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
                        <h1 className="auth-form-title">Forgot password</h1>
                    </div>

                    {isSuccess ? (
                        <div className="auth-form-success">
                            <div className="auth-form-success-icon">✓</div>
                            <h2 className="auth-form-title" style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
                                Check your email
                            </h2>
                            <p className="auth-form-subtitle" style={{ marginBottom: "2rem" }}>
                                We've sent a password reset link to your email address. The link will expire in 1 hour.
                            </p>
                            <Link href="/login">
                                <Button className="auth-form-button" size="lg">
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                                <div className="auth-form-group">
                                    <Label htmlFor="email" className="auth-form-label">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Your email"
                                        {...register("email")}
                                        className="auth-form-input"
                                        autoComplete="email"
                                    />
                                    {errors.email && (
                                        <p className="auth-form-error">{errors.email.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="auth-form-button"
                                    size="lg"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="auth-button-loading">Sending...</span>
                                    ) : (
                                        "Send reset link"
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
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

