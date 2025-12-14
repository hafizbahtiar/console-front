"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { getActiveSessions, revokeSession, revokeAllSessions, type Session } from "@/lib/api/settings"
import { ApiClientError } from "@/lib/api-client"
import { Monitor, Smartphone, Tablet, Globe, MapPin, Clock, Trash2, LogOut, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function SessionsSettingsPage() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [isLoadingSessions, setIsLoadingSessions] = useState(true)
    const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null)
    const [isRevokingAll, setIsRevokingAll] = useState(false)

    // Fetch sessions on mount
    useEffect(() => {
        loadSessions()
    }, [])

    const loadSessions = async () => {
        setIsLoadingSessions(true)
        try {
            const data = await getActiveSessions()
            setSessions(data)
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to load sessions. Please try again."
            toast.error(message)
        } finally {
            setIsLoadingSessions(false)
        }
    }

    const handleRevokeSession = async (sessionId: string) => {
        setRevokingSessionId(sessionId)
        try {
            await revokeSession(sessionId)
            toast.success("Session revoked successfully")
            await loadSessions()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to revoke session. Please try again."
            toast.error(message)
        } finally {
            setRevokingSessionId(null)
        }
    }

    const handleRevokeAllSessions = async () => {
        setIsRevokingAll(true)
        try {
            await revokeAllSessions()
            toast.success("All sessions revoked successfully")
            await loadSessions()
        } catch (error: any) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Failed to revoke all sessions. Please try again."
            toast.error(message)
        } finally {
            setIsRevokingAll(false)
        }
    }

    const getDeviceIcon = (deviceType?: string) => {
        switch (deviceType?.toLowerCase()) {
            case "mobile":
                return <Smartphone className="h-4 w-4" />
            case "tablet":
                return <Tablet className="h-4 w-4" />
            case "desktop":
                return <Monitor className="h-4 w-4" />
            default:
                return <Globe className="h-4 w-4" />
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Never"
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
        return date.toLocaleDateString()
    }

    // Identify current session by matching userAgent
    const currentUserAgent = typeof window !== 'undefined' ? navigator.userAgent : ''
    const currentSessionId = useMemo(() => {
        if (!currentUserAgent || sessions.length === 0) return null

        // Find session with matching userAgent (most recent active one if multiple)
        const matchingSessions = sessions.filter(s =>
            s.isActive && s.userAgent === currentUserAgent
        )

        if (matchingSessions.length > 0) {
            // Return the most recently active session
            return matchingSessions.sort((a, b) => {
                const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
                const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
                return bTime - aTime
            })[0].id
        }

        return null
    }, [sessions, currentUserAgent])

    const activeSessions = sessions.filter((s) => s.isActive)
    const inactiveSessions = sessions.filter((s) => !s.isActive)

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">Active Sessions</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your active sessions across different devices
                    </p>
                </div>
                {activeSessions.length > 1 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={isRevokingAll}>
                                {isRevokingAll ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Signing Out...
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sign Out All
                                    </>
                                )}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Sign out from all devices?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will sign you out from all devices except this one. You'll need to sign in again on other devices.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isRevokingAll}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleRevokeAllSessions} disabled={isRevokingAll}>
                                    {isRevokingAll ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Signing Out...
                                        </>
                                    ) : (
                                        "Sign Out All"
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {isLoadingSessions ? (
                <div className="rounded-lg border p-8 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading sessions...</span>
                </div>
            ) : activeSessions.length === 0 && inactiveSessions.length === 0 ? (
                <div className="rounded-lg border p-8 text-center">
                    <p className="text-sm text-muted-foreground">No sessions found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Active Sessions */}
                    {activeSessions.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Active Sessions ({activeSessions.length})
                            </h3>
                            {activeSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="rounded-lg border p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                                            {getDeviceIcon(session.deviceType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-medium text-sm">
                                                    {session.deviceName ||
                                                        (session.browser && session.os ? `${session.browser} on ${session.os}` : null) ||
                                                        session.browser ||
                                                        session.os ||
                                                        (session.userAgent ? session.userAgent.substring(0, 50) + (session.userAgent.length > 50 ? '...' : '') : null) ||
                                                        "Unknown Device"}
                                                </p>
                                                {currentSessionId === session.id && (
                                                    <Badge variant="default" className="text-xs">
                                                        Current Device
                                                    </Badge>
                                                )}
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    Active
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                                                {session.browser && (
                                                    <span className="flex items-center gap-1">
                                                        <Globe className="h-3 w-3" />
                                                        {session.browser}
                                                    </span>
                                                )}
                                                {session.os && <span>{session.os}</span>}
                                                {session.city && session.country && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {session.city}, {session.region || session.country}
                                                    </span>
                                                )}
                                                {!session.city && session.country && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {session.country}
                                                    </span>
                                                )}
                                                {session.ipAddress && !session.city && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {session.ipAddress}
                                                    </span>
                                                )}
                                                {session.lastActivityAt && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(session.lastActivityAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {currentSessionId === session.id ? (
                                        <Badge variant="outline" className="text-xs">
                                            Current
                                        </Badge>
                                    ) : (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={revokingSessionId === session.id}
                                                >
                                                    {revokingSessionId === session.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will sign you out from this device. You'll need to sign in again.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleRevokeSession(session.id)}
                                                    >
                                                        Revoke
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Inactive Sessions */}
                    {inactiveSessions.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Inactive Sessions ({inactiveSessions.length})
                            </h3>
                            {inactiveSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="rounded-lg border p-4 flex items-center justify-between opacity-60"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                                            {getDeviceIcon(session.deviceType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm">
                                                    {session.deviceName ||
                                                        (session.browser && session.os ? `${session.browser} on ${session.os}` : null) ||
                                                        session.browser ||
                                                        session.os ||
                                                        (session.userAgent ? session.userAgent.substring(0, 50) + (session.userAgent.length > 50 ? '...' : '') : null) ||
                                                        "Unknown Device"}
                                                </p>
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                                                    Inactive
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                {session.browser && (
                                                    <span className="flex items-center gap-1">
                                                        <Globe className="h-3 w-3" />
                                                        {session.browser}
                                                    </span>
                                                )}
                                                {session.os && <span>{session.os}</span>}
                                                {session.ipAddress && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {session.ipAddress}
                                                    </span>
                                                )}
                                                {session.lastActivityAt && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(session.lastActivityAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

