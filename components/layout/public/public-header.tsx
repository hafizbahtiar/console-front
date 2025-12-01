"use client"

import { useState, useEffect } from "react"
import "@/app/(public)/public.css"

interface PublicHeaderProps {
    currentPath?: string
}

export function PublicHeader({ currentPath = "/" }: PublicHeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <nav className={`public-nav ${isScrolled ? "scrolled" : ""}`}>
            <div className="public-nav-container">
                <a href="/" className="public-nav-logo">
                    Console
                </a>
                <div className="public-nav-links">
                    <a href="/#features">Features</a>
                    <a href="/pricing">Pricing</a>
                    <a href="/#contact">Contact</a>
                    <a href="/login" className="public-nav-button">
                        Sign In
                    </a>
                </div>
            </div>
        </nav>
    )
}

