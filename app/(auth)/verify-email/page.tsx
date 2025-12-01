"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { verifyEmail } from "@/lib/api/auth"
import { toast } from "sonner"
import { ApiClientError } from "@/lib/api-client"

function VerifyEmailContent() {
    const [isVerifying, setIsVerifying] = useState(true)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isError, setIsError] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const token = searchParams.get("token")
        if (!token) {
            setIsError(true)
            setErrorMessage("Invalid verification link. Please check your email for the correct link.")
            setIsVerifying(false)
            return
        }

        const verify = async () => {
            try {
                await verifyEmail({ token })
                setIsSuccess(true)
                toast.success("Email verified successfully!")
            } catch (error) {
                setIsError(true)
                if (error instanceof ApiClientError) {
                    if (error.statusCode === 404) {
                        setErrorMessage("Invalid or expired verification token. Please request a new verification email.")
                    } else {
                        setErrorMessage(error.message || "Failed to verify email. Please try again.")
                    }
                } else {
                    setErrorMessage("An unexpected error occurred. Please try again.")
                }
                toast.error("Email verification failed")
            } finally {
                setIsVerifying(false)
            }
        }

        verify()
    }, [searchParams])

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

            {/* Right Side - Status */}
            <div className="auth-form-section">
                <div className="auth-form-container">
                    <div className="auth-form-header">
                        <h1 className="auth-form-title">
                            {isVerifying
                                ? "Verifying email"
                                : isSuccess
                                    ? "Email verified"
                                    : "Verification failed"}
                        </h1>
                    </div>
                    {isVerifying ? (
                        <div className="auth-form-loading">
                            <div className="auth-form-loading-spinner"></div>
                            <p className="auth-form-loading-message">Verifying your email address...</p>
                        </div>
                    ) : isSuccess ? (
                        <div className="auth-form-success">
                            <div className="auth-form-success-icon">✓</div>
                            <p className="auth-form-subtitle" style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
                                Your email address has been successfully verified. You can now use all features of Console.
                            </p>
                            <Link href="/login">
                                <Button className="auth-form-button" size="lg">
                                    Go to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="auth-form-error-state">
                            <div className="auth-form-error-icon">✗</div>
                            <p className="auth-form-subtitle" style={{ marginTop: "1rem", marginBottom: "2rem" }}>
                                {errorMessage}
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <Link href="/login">
                                    <Button className="auth-form-button" size="lg" variant="outline">
                                        Go to Login
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button className="auth-form-button" size="lg" variant="outline">
                                        Sign Up Again
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="auth-container">
                <div className="auth-form-section">
                    <div className="auth-form-container">
                        <div className="auth-form-header">
                            <h1 className="auth-form-title">Verifying email</h1>
                        </div>
                        <div className="auth-form-loading">
                            <div className="auth-form-loading-spinner"></div>
                            <p className="auth-form-loading-message">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    )
}

