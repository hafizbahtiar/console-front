import { get, del, post, patch, getData, postData, patchData } from '@/lib/api-client'

export interface Session {
    id: string
    userAgent: string
    ipAddress?: string
    deviceType?: string
    deviceName?: string
    browser?: string
    os?: string
    // Location fields
    country?: string
    region?: string
    city?: string
    latitude?: number
    longitude?: number
    timezone?: string
    isp?: string
    isActive: boolean
    lastActivityAt?: string
    createdAt: string
    updatedAt: string
}

export interface ChangePasswordDto {
    currentPassword: string
    newPassword: string
}

export interface UpdateProfileDto {
    firstName?: string
    lastName?: string
    displayName?: string
    bio?: string
    location?: string
    website?: string
}

/**
 * Get active sessions for the current user
 */
export async function getActiveSessions(): Promise<Session[]> {
    const response = await get<Session[] | { data: Session[] }>('/sessions')
    // Handle both array and SuccessResponse format
    if (Array.isArray(response)) {
        return response
    }
    return (response as any).data || []
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string): Promise<void> {
    await del<void>(`/sessions/${sessionId}`, undefined)
}

/**
 * Revoke all sessions (except current)
 */
export async function revokeAllSessions(): Promise<void> {
    await del<void>('/sessions', undefined)
}

/**
 * Change user password
 */
export async function changePassword(data: ChangePasswordDto): Promise<void> {
    await postData<{ message: string }>('/auth/change-password', data)
}

/**
 * Update user profile
 */
export async function updateProfile(data: UpdateProfileDto): Promise<any> {
    return patchData<any>('/users/profile', data)
}

/**
 * Request account deletion (sends confirmation email)
 */
export async function requestAccountDeletion(): Promise<{ message: string }> {
    return postData<{ message: string }>('/users/account/request-deletion')
}

/**
 * Delete account with confirmation token
 */
export interface DeleteAccountDto {
    confirmationToken: string
}

export async function deleteAccount(data: DeleteAccountDto): Promise<{ message: string }> {
    // DELETE request with body (confirmation token)
    const response = await del<{ message: string } | { data: { message: string } }>('/users/account', data)
    // Handle both direct response and SuccessResponse format
    if (response && typeof response === 'object' && 'data' in response) {
        return (response as any).data
    }
    return response as { message: string }
}

/**
 * Deactivate account
 */
export async function deactivateAccount(): Promise<any> {
    return postData<any>('/users/account/deactivate')
}

/**
 * Reactivate account
 */
export async function reactivateAccount(): Promise<any> {
    return postData<any>('/users/account/reactivate')
}

/**
 * Export account data
 * @param format - 'json' or 'csv'
 * @returns Blob of the exported data
 */
export async function exportAccountData(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    const endpoint = `/users/account/export?format=${format}`

    // Get access token
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

    // Use fetch directly to handle blob response
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken || ''}`,
        },
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to export data' }))
        throw new Error(error.message || 'Failed to export data')
    }

    return response.blob()
}

/**
 * App Preferences
 */
export interface Preferences {
    id: string
    userId: string
    // Appearance
    theme: 'light' | 'dark' | 'system'
    language: string
    // Date & Time
    dateFormat: string
    timeFormat: '12h' | '24h'
    timezone: string
    // Dashboard
    defaultDashboardView: 'grid' | 'list' | 'table'
    itemsPerPage: string
    showWidgets: boolean
    // Editor
    editorTheme: 'light' | 'dark' | 'monokai' | 'github'
    editorFontSize: number
    editorLineHeight: number
    editorTabSize: number
    createdAt: string
    updatedAt: string
}

export interface UpdatePreferencesDto {
    theme?: 'light' | 'dark' | 'system'
    language?: string
    dateFormat?: string
    timeFormat?: '12h' | '24h'
    timezone?: string
    defaultDashboardView?: 'grid' | 'list' | 'table'
    itemsPerPage?: string
    showWidgets?: boolean
    editorTheme?: 'light' | 'dark' | 'monokai' | 'github'
    editorFontSize?: number
    editorLineHeight?: number
    editorTabSize?: number
}

/**
 * Get user preferences
 */
export async function getPreferences(): Promise<Preferences> {
    return getData<Preferences>('/settings/preferences')
}

/**
 * Update user preferences
 */
export async function updatePreferences(data: UpdatePreferencesDto): Promise<Preferences> {
    return patchData<Preferences>('/settings/preferences', data)
}

/**
 * Reset preferences to defaults
 */
export async function resetPreferences(): Promise<Preferences> {
    return postData<Preferences>('/settings/preferences/reset')
}