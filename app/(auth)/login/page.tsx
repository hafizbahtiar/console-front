"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"
import { toast } from "sonner"
import { ApiClientError } from "@/lib/api-client"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      await login(data.email, data.password)
      toast.success("Welcome back!")
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(error.message || "Login failed. Please check your credentials.")
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
            <h1 className="auth-form-title">Sign in</h1>
          </div>

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

            <div className="auth-form-group">
              <Label htmlFor="password" className="auth-form-label">
                Password
              </Label>
              <div className="auth-form-input-wrapper">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  {...register("password")}
                  className="auth-form-input"
                  autoComplete="current-password"
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
            </div>

            <div className="auth-form-footer-link">
              <Link href="/forgot-password" className="auth-form-link">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="auth-form-button"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="auth-button-loading">Signing in...</span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="auth-divider">
            <span className="auth-divider-text">OR</span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="auth-social-button"
            size="lg"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Sign in with GitHub
          </Button>

          <div className="auth-form-footer">
            <p>
              Already got an account?{" "}
              <Link href="/signup" className="auth-form-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
