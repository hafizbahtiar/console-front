/**
 * Auth API functions
 */

import { post, get, postData, getData, ApiClientError } from '../api-client';

export interface RegisterDto {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RefreshTokenDto {
    refreshToken: string;
}

export interface ForgotPasswordDto {
    email: string;
}

export interface ResetPasswordDto {
    token: string;
    password: string;
}

export interface VerifyEmailDto {
    token: string;
}

export interface User {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    email: string;
    role: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

/**
 * Register a new user
 */
export async function register(data: RegisterDto): Promise<AuthResponse> {
    return postData<AuthResponse>('/auth/register', data, { skipAuth: true });
}

/**
 * Login user
 */
export async function login(data: LoginDto): Promise<AuthResponse> {
    return postData<AuthResponse>('/auth/login', data, { skipAuth: true });
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
    try {
        await post('/auth/logout');
    } catch (error) {
        // Ignore errors on logout
    }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User> {
    return getData<User>('/auth/me');
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
    return postData<AuthResponse>('/auth/refresh', { refreshToken }, { skipAuth: true });
}

/**
 * Request password reset
 */
export async function forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    return postData<{ message: string }>('/auth/forgot-password', data, { skipAuth: true });
}

/**
 * Reset password with token
 */
export async function resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    return postData<{ message: string }>('/auth/reset-password', data, { skipAuth: true });
}

/**
 * Verify email with token
 */
export async function verifyEmail(data: VerifyEmailDto): Promise<{ message: string }> {
    return postData<{ message: string }>('/auth/verify-email', data, { skipAuth: true });
}

