"use client"

import "@/app/(public)/public.css"

export function PublicFooter() {
    return (
        <footer className="public-footer">
            <div className="public-footer-container">
                <div className="public-footer-content">
                    <div className="footer-brand">
                        <div className="public-footer-logo">Console</div>
                        <p className="public-footer-tagline">
                            Streamline your business operations with powerful management tools
                        </p>
                    </div>
                    <div className="public-footer-links">
                        <div className="public-footer-column">
                            <h4 className="public-footer-heading">Features</h4>
                            <a href="/#features">Customer Management</a>
                            <a href="/#features">Invoicing</a>
                            <a href="/#features">Order Tracking</a>
                        </div>
                        <div className="public-footer-column">
                            <h4 className="public-footer-heading">Access</h4>
                            <a href="/signup">Sign Up</a>
                            <a href="/login">Sign In</a>
                            <a href="/pricing">Pricing</a>
                        </div>
                        <div className="public-footer-column">
                            <h4 className="public-footer-heading">Support</h4>
                            <a href="#help">Help Center</a>
                            <a href="#contact">Contact</a>
                            <a href="#about">About</a>
                        </div>
                    </div>
                </div>
                <div className="public-footer-bottom">
                    <p>&copy; 2025 Console. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

