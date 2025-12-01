"use client"

import { useState } from "react"
import "../public.css"
import "./pricing.css"
import { PublicHeader } from "@/components/layout/public/public-header"
import { PublicFooter } from "@/components/layout/public/public-footer"

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

    const plans = [
        {
            name: "Starter",
            description: "Perfect for small businesses getting started",
            monthlyPrice: 29,
            yearlyPrice: 290,
            features: [
                "Up to 100 customers",
                "50 invoices per month",
                "100 orders per month",
                "Basic customer management",
                "Email support",
                "Standard templates",
            ],
            popular: false,
        },
        {
            name: "Professional",
            description: "Ideal for growing businesses",
            monthlyPrice: 79,
            yearlyPrice: 790,
            features: [
                "Unlimited customers",
                "Unlimited invoices",
                "Unlimited orders",
                "Advanced customer management",
                "Priority email support",
                "Custom invoice templates",
                "Export & reporting",
                "API access",
            ],
            popular: true,
        },
        {
            name: "Enterprise",
            description: "For large organizations with advanced needs",
            monthlyPrice: 199,
            yearlyPrice: 1990,
            features: [
                "Everything in Professional",
                "Dedicated account manager",
                "24/7 phone support",
                "Custom integrations",
                "Advanced analytics",
                "Role-based access control",
                "White-label options",
                "SLA guarantee",
            ],
            popular: false,
        },
    ]

    return (
        <div className="pricing-page">
            {/* Navigation */}
            <PublicHeader />

            {/* Hero Section */}
            <section className="pricing-hero">
                <div className="pricing-hero-content">
                    <div className="pricing-badge">Simple, Transparent Pricing</div>
                    <h1 className="pricing-hero-title">
                        Choose the Right Plan
                        <span className="public-gradient-text"> for Your Business</span>
                    </h1>
                    <p className="pricing-hero-description">
                        Start with our Starter plan and upgrade as you grow. All plans
                        include customer management, invoicing, and order tracking.
                    </p>

                    {/* Billing Toggle */}
                    <div className="pricing-toggle">
                        <span className={billingCycle === "monthly" ? "active" : ""}>
                            Monthly
                        </span>
                        <button
                            className="toggle-switch"
                            onClick={() =>
                                setBillingCycle(
                                    billingCycle === "monthly" ? "yearly" : "monthly"
                                )
                            }
                            aria-label="Toggle billing cycle"
                        >
                            <span className={`toggle-slider ${billingCycle === "yearly" ? "yearly" : ""}`}></span>
                        </button>
                        <span className={billingCycle === "yearly" ? "active" : ""}>
                            Yearly
                            <span className="discount-badge">Save 17%</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pricing-section">
                <div className="public-section-container">
                    <div className="pricing-grid">
                        {plans.map((plan, index) => (
                            <div
                                key={plan.name}
                                className={`pricing-card ${plan.popular ? "popular" : ""}`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {plan.popular && (
                                    <div className="popular-badge">Most Popular</div>
                                )}
                                <div className="pricing-card-header">
                                    <h3 className="pricing-plan-name">{plan.name}</h3>
                                    <p className="pricing-plan-description">
                                        {plan.description}
                                    </p>
                                </div>
                                <div className="pricing-card-price" key={`${plan.name}-${billingCycle}`}>
                                    <span className="price-currency">$</span>
                                    <span className="price-amount" key={`price-${plan.name}-${billingCycle}`}>
                                        {billingCycle === "monthly"
                                            ? plan.monthlyPrice
                                            : Math.floor(plan.yearlyPrice / 12)}
                                    </span>
                                    <span className="price-period">
                                        /{billingCycle === "monthly" ? "month" : "month"}
                                    </span>
                                </div>
                                {billingCycle === "yearly" && (
                                    <div className="yearly-note">
                                        Billed annually (${plan.yearlyPrice}/year)
                                    </div>
                                )}
                                <a
                                    href="/signup"
                                    className={`pricing-button ${plan.popular ? "primary" : "secondary"
                                        }`}
                                >
                                    Get Started
                                </a>
                                <div className="pricing-features">
                                    <ul>
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex}>
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="pricing-faq-section">
                <div className="public-section-container">
                    <div className="public-section-header">
                        <h2 className="public-section-title">Frequently Asked Questions</h2>
                        <p className="public-section-description">
                            Everything you need to know about our pricing
                        </p>
                    </div>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h3 className="faq-question">
                                Can I change plans later?
                            </h3>
                            <p className="faq-answer">
                                Yes, you can upgrade or downgrade your plan at any time.
                                Changes will be reflected in your next billing cycle.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h3 className="faq-question">
                                What payment methods do you accept?
                            </h3>
                            <p className="faq-answer">
                                We accept all major credit cards, debit cards, and PayPal.
                                Enterprise customers can also pay via invoice.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h3 className="faq-question">
                                Is there a free trial?
                            </h3>
                            <p className="faq-answer">
                                Yes, all plans come with a 14-day free trial. No credit
                                card required to start.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h3 className="faq-question">
                                What happens if I exceed my plan limits?
                            </h3>
                            <p className="faq-answer">
                                We'll notify you when you're approaching your limits. You
                                can upgrade your plan or purchase additional capacity.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h3 className="faq-question">
                                Can I cancel anytime?
                            </h3>
                            <p className="faq-answer">
                                Yes, you can cancel your subscription at any time. You'll
                                continue to have access until the end of your billing period.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h3 className="faq-question">
                                Do you offer discounts for annual plans?
                            </h3>
                            <p className="faq-answer">
                                Yes, annual plans save you 17% compared to monthly billing.
                                You'll see the savings reflected in the pricing above.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="pricing-cta-section">
                <div className="public-section-container">
                    <div className="pricing-cta-content">
                        <h2 className="pricing-cta-title">
                            Ready to Get Started?
                        </h2>
                        <p className="pricing-cta-description">
                            Start your 14-day free trial today. No credit card required.
                        </p>
                        <div className="pricing-cta-actions">
                            <a href="/signup" className="public-btn public-btn-primary public-btn-large">
                                Start Free Trial
                            </a>
                            <a href="/login" className="public-btn public-btn-outline public-btn-large">
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

