"use client"

import "./landing.css"
import { PublicHeader } from "@/components/layout/public/public-header"
import { PublicFooter } from "@/components/layout/public/public-footer"

export default function LandingPage() {
    return (
        <div className="landing-page">
            {/* Navigation */}
            <PublicHeader />

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="hero-background">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                </div>
                <div className="hero-content">
                    <div className="hero-badge">Business Management Console</div>
                    <h1 className="hero-title">
                        Manage Your Business
                        <span className="gradient-text"> Efficiently</span>
                        <br />
                        Customers, Invoices & Orders
                    </h1>
                    <p className="hero-description">
                        A powerful console for managing your business operations. Store
                        customers, create invoices, track orders, and control everything
                        with role-based access control.
                    </p>
                    <div className="hero-actions">
                        <a href="/signup" className="btn btn-primary">
                            Get Started
                        </a>
                        <a href="#features" className="btn btn-secondary">
                            Learn More
                        </a>
                    </div>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <div className="stat-number">Users</div>
                            <div className="stat-label">Business Tools</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Available</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">Secure</div>
                            <div className="stat-label">Data Protection</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="landing-section features-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">Powerful Features</h2>
                        <p className="section-description">
                            Everything you need to manage your business operations efficiently
                        </p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3 className="feature-title">Customer Management</h3>
                            <p className="feature-description">
                                Store and manage all your customer information in one place.
                                Keep track of contacts, details, and history effortlessly.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <h3 className="feature-title">Invoice Creation</h3>
                            <p className="feature-description">
                                Create professional invoices quickly and easily. Generate,
                                send, and track invoices with automated numbering and templates.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                                    <path d="M9 14l2 2 4-4" />
                                </svg>
                            </div>
                            <h3 className="feature-title">Order Management</h3>
                            <p className="feature-description">
                                Create and track orders from start to finish. Monitor order
                                status, update details, and manage fulfillment seamlessly.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="M9 12l2 2 4-4" />
                                </svg>
                            </div>
                            <h3 className="feature-title">Role-Based Access</h3>
                            <p className="feature-description">
                                Flexible permission system that allows you to control access
                                levels. Manage users, settings, and business operations securely.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <path d="M20 8v6M23 11h-6" />
                                </svg>
                            </div>
                            <h3 className="feature-title">User Permissions</h3>
                            <p className="feature-description">
                                Users can manage customers, create invoices, and handle orders.
                                Role-based access ensures secure and organized operations.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <h3 className="feature-title">Secure & Reliable</h3>
                            <p className="feature-description">
                                Your business data is protected with enterprise-grade security.
                                Regular backups and secure access controls keep everything safe.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="landing-section cta-section">
                <div className="section-container">
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to Manage Your Business?</h2>
                        <p className="cta-description">
                            Start managing your customers, invoices, and orders today.
                            Get started in minutes.
                        </p>
                        <div className="cta-actions">
                            <a href="/signup" className="btn btn-primary btn-large">
                                Start Free Trial
                            </a>
                            <a href="/login" className="btn btn-outline btn-large">
                                Sign In
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <PublicFooter />
        </div>
    )
}

