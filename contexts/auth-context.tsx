"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, getCurrentUser } from '@/lib/api/auth'
import { setTokens, clearTokens, ApiClientError } from '@/lib/api-client'

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    register: (firstName: string, lastName: string, username: string, email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Check if user is authenticated on mount
    useEffect(() => {
        // Only check auth if we have a token
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (token) {
            checkAuth();
        } else {
            // No token, skip auth check
            setIsLoading(false);
        }
    }, [])

    const checkAuth = useCallback(async () => {
        try {
            const currentUser = await getCurrentUser()
            setUser(currentUser)
        } catch (error) {
            // Not authenticated or token expired
            setUser(null)
            clearTokens()
        } finally {
            setIsLoading(false)
        }
    }, [])

    const login = useCallback(async (email: string, password: string) => {
        try {
            const { login: loginApi } = await import('@/lib/api/auth')
            const response = await loginApi({ email, password })

            setTokens(response.accessToken, response.refreshToken)
            setUser(response.user)

            router.push('/dashboard')
        } catch (error) {
            if (error instanceof ApiClientError) {
                throw error
            }
            throw new Error('Login failed. Please try again.')
        }
    }, [router])

    const register = useCallback(async (firstName: string, lastName: string, username: string, email: string, password: string) => {
        try {
            const { register: registerApi } = await import('@/lib/api/auth')
            const response = await registerApi({ firstName, lastName, username, email, password })

            setTokens(response.accessToken, response.refreshToken)
            setUser(response.user)

            router.push('/dashboard')
        } catch (error) {
            if (error instanceof ApiClientError) {
                throw error
            }
            throw new Error('Registration failed. Please try again.')
        }
    }, [router])

    const logout = useCallback(async () => {
        try {
            const { logout: logoutApi } = await import('@/lib/api/auth')
            await logoutApi()
        } catch (error) {
            // Ignore errors
        } finally {
            clearTokens()
            setUser(null)
            router.push('/login')
        }
    }, [router])

    const refreshUser = useCallback(async () => {
        try {
            const currentUser = await getCurrentUser()
            setUser(currentUser)
        } catch (error) {
            setUser(null)
            clearTokens()
        }
    }, [])

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

