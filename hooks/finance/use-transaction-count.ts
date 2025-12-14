"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getTransactionStatistics } from "@/lib/api/finance"
import { useAuth } from "@/contexts/auth-context"

/**
 * Custom event name for transaction updates
 */
export const TRANSACTION_UPDATE_EVENT = "transaction-updated"

/**
 * Hook to fetch and manage transaction count
 * Updates automatically when user is authenticated and when transactions change
 */
export function useTransactionCount() {
    const { isAuthenticated, isLoading } = useAuth()
    const pathname = usePathname()
    const [transactionCount, setTransactionCount] = useState<number | null>(null)
    const [isLoadingCount, setIsLoadingCount] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchCount = async () => {
        if (!isAuthenticated) return

        setIsLoadingCount(true)
        setError(null)
        try {
            const stats = await getTransactionStatistics()
            setTransactionCount(stats.transactionCount)
        } catch (err) {
            console.error("Failed to fetch transaction count:", err)
            setError(err instanceof Error ? err : new Error("Failed to fetch transaction count"))
            // Don't set count to null on error, keep previous value
        } finally {
            setIsLoadingCount(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated || isLoading) {
            setTransactionCount(null)
            return
        }

        void fetchCount()
    }, [isAuthenticated, isLoading])

    // Listen for transaction update events
    useEffect(() => {
        if (!isAuthenticated) return

        const handleTransactionUpdate = () => {
            void fetchCount()
        }

        window.addEventListener(TRANSACTION_UPDATE_EVENT, handleTransactionUpdate)

        return () => {
            window.removeEventListener(TRANSACTION_UPDATE_EVENT, handleTransactionUpdate)
        }
    }, [isAuthenticated])

    // Refresh count when navigating to/from finance pages
    useEffect(() => {
        if (!isAuthenticated) return

        // Refresh when navigating to finance pages or away from them
        if (pathname.startsWith("/finance")) {
            // Small delay to ensure transactions are loaded
            const timer = setTimeout(() => {
                void fetchCount()
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [pathname, isAuthenticated])

    // Function to manually refresh the count
    const refreshCount = async () => {
        if (!isAuthenticated) return

        setIsLoadingCount(true)
        setError(null)
        try {
            const stats = await getTransactionStatistics()
            setTransactionCount(stats.transactionCount)
        } catch (err) {
            console.error("Failed to refresh transaction count:", err)
            setError(err instanceof Error ? err : new Error("Failed to refresh transaction count"))
        } finally {
            setIsLoadingCount(false)
        }
    }

    return {
        transactionCount,
        isLoadingCount,
        error,
        refreshCount,
    }
}

