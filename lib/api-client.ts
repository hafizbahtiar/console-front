/**
 * API Client - Fetch wrapper with error handling and token management
 */

import {
    SuccessResponse,
    PaginatedResponse,
    isSuccessResponse,
    isPaginatedResponse,
} from './types/api-response';
import { extractData, extractPaginatedData } from './utils/response.util';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Logger utility for API client (only errors in production)
 */
const logger = {
    log: (message: string, data?: any) => {
        // Only log in development
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            // Commented out to reduce noise - uncomment for debugging
            // console.log(`[API Client] ${message}`, data || '');
        }
    },
    error: (message: string, error?: any) => {
        if (typeof window !== 'undefined') {
            console.error(`[API Client] ❌ ${message}`, error || '');
        }
    },
    warn: (message: string, data?: any) => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            // Commented out to reduce noise - uncomment for debugging
            // console.warn(`[API Client] ⚠️ ${message}`, data || '');
        }
    },
};

export interface ApiError {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

export class ApiClientError extends Error {
    statusCode?: number;
    errors?: Record<string, string[]>;

    constructor(message: string, statusCode?: number, errors?: Record<string, string[]>) {
        super(message);
        this.name = 'ApiClientError';
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
    /**
     * If true, automatically extract data from SuccessResponse/PaginatedResponse
     * If false, return the full response object (default: false for backward compatibility)
     */
    extractData?: boolean;
}

/**
 * Get stored access token from localStorage
 */
function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
}

/**
 * Get stored refresh token from localStorage
 */
function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
}

/**
 * Store tokens in localStorage and cookies (for middleware)
 */
export function setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // Also set cookies for middleware access
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;

    logger.log('Tokens stored', {
        accessTokenLength: accessToken.length,
        refreshTokenLength: refreshToken.length,
    });
}

/**
 * Clear tokens from localStorage and cookies
 */
export function clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Clear cookies
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'refreshToken=; path=/; max-age=0';

    logger.log('Tokens cleared');
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        logger.warn('No refresh token available');
        return null;
    }

    logger.log('Refreshing access token...', {
        refreshTokenLength: refreshToken.length,
        refreshTokenPreview: `${refreshToken.substring(0, 20)}...`,
    });

    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
            credentials: 'include',
        });

        logger.log(`Token refresh response status: ${response.status}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            logger.error('Token refresh failed', {
                status: response.status,
                error: errorData,
            });
            clearTokens();
            return null;
        }

        const data = await response.json();
        if (!data.accessToken || !data.refreshToken) {
            logger.error('Token refresh response missing tokens', data);
            clearTokens();
            return null;
        }

        setTokens(data.accessToken, data.refreshToken);
        logger.log('Token refreshed successfully', {
            accessTokenLength: data.accessToken.length,
            refreshTokenLength: data.refreshToken.length,
        });
        return data.accessToken;
    } catch (error) {
        logger.error('Token refresh error', error);
        clearTokens();
        return null;
    }
}

/**
 * Make API request with automatic token handling and refresh
 */
export async function apiClient<T = any>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { skipAuth = false, extractData: shouldExtractData = false, headers = {}, ...fetchOptions } = options;
    const fullUrl = `${API_URL}${endpoint}`;
    const method = fetchOptions.method || 'GET';

    logger.log(`🚀 ${method} ${fullUrl}`, {
        skipAuth,
        hasBody: !!fetchOptions.body,
    });

    // Build headers
    // Don't set Content-Type for FormData - browser will set it with boundary
    const isFormData = fetchOptions.body instanceof FormData;
    const requestHeaders: Record<string, string> = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(headers as Record<string, string>),
    };

    // Add auth token if not skipped
    if (!skipAuth) {
        const token = getAccessToken();
        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
            logger.log('Added auth token to request', {
                tokenLength: token.length,
                tokenPreview: `${token.substring(0, 20)}...`,
            });
        } else {
            logger.warn('No auth token available (skipAuth=false)');
        }
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        logger.error(`Request timeout after 30s: ${method} ${fullUrl}`);
        controller.abort();
    }, 30000); // 30 second timeout

    const startTime = Date.now();

    try {
        logger.log(`Making request to ${fullUrl}...`, {
            method,
            headers: Object.keys(requestHeaders),
            hasBody: !!fetchOptions.body,
            bodySize: fetchOptions.body ? String(fetchOptions.body).length : 0,
        });

        // Log before fetch
        logger.log('Calling fetch...');
        const fetchStartTime = Date.now();

        // Make request
        // For FormData, don't include headers (browser sets Content-Type with boundary)
        const fetchHeaders = isFormData
            ? Object.fromEntries(
                Object.entries(requestHeaders).filter(([key]) => key.toLowerCase() !== 'content-type')
            )
            : requestHeaders;

        let response = await fetch(fullUrl, {
            ...fetchOptions,
            headers: fetchHeaders as HeadersInit,
            credentials: 'include',
            signal: controller.signal,
        });

        const fetchDuration = Date.now() - fetchStartTime;
        const duration = Date.now() - startTime;
        clearTimeout(timeoutId);

        logger.log(`✅ Fetch completed (${fetchDuration}ms, total: ${duration}ms)`, {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
        });

        // Handle 401 - try to refresh token
        if (response.status === 401 && !skipAuth) {
            logger.warn('Received 401, attempting token refresh...');
            const newToken = await refreshAccessToken();
            if (newToken) {
                logger.log('Retrying request with new token...');
                // Retry request with new token
                const retryController = new AbortController();
                const retryTimeoutId = setTimeout(() => {
                    logger.error('Retry request timeout after 30s');
                    retryController.abort();
                }, 30000);
                const retryStartTime = Date.now();
                try {
                    const retryHeaders = isFormData
                        ? Object.fromEntries(
                            Object.entries({ ...requestHeaders, 'Authorization': `Bearer ${newToken}` })
                                .filter(([key]) => key.toLowerCase() !== 'content-type')
                        )
                        : { ...requestHeaders, 'Authorization': `Bearer ${newToken}` };

                    response = await fetch(fullUrl, {
                        ...fetchOptions,
                        headers: retryHeaders as HeadersInit,
                        credentials: 'include',
                        signal: retryController.signal,
                    });
                    const retryDuration = Date.now() - retryStartTime;
                    clearTimeout(retryTimeoutId);
                    logger.log(`✅ Retry successful (${retryDuration}ms)`, {
                        status: response.status,
                    });
                } catch (retryError) {
                    clearTimeout(retryTimeoutId);
                    logger.error('Retry request failed', retryError);
                    if (retryError instanceof Error && retryError.name === 'AbortError') {
                        throw new ApiClientError('Request timeout. Please try again.', 408);
                    }
                    throw retryError;
                }
            } else {
                logger.error('Token refresh failed, redirecting to login');
                // Refresh failed, clear tokens and redirect to login
                clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                throw new ApiClientError('Session expired. Please login again.', 401);
            }
        }

        // Parse response
        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('application/json');
        logger.log('Parsing response', { contentType, isJson });

        const data = isJson ? await response.json() : await response.text();

        // Handle errors
        if (!response.ok) {
            // Handle standardized ErrorResponse format
            // { success: false, statusCode: number, message: string, error?: string, errors?: object }
            let errorMessage: string;
            let rawErrors: Record<string, string[]> | string[] | undefined;

            if (typeof data === 'object' && data !== null) {
                // Standardized error response format
                if ('success' in data && data.success === false) {
                    errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
                    rawErrors = data.errors;
                } else {
                    // Legacy format or non-standard error
                    errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
                    rawErrors = data.errors;
                }
            } else {
                // Non-JSON error response
                errorMessage = typeof data === 'string' ? data : `Request failed with status ${response.status}`;
            }

            // Normalize errors: convert string[] to Record<string, string[]>
            let normalizedErrors: Record<string, string[]> | undefined;
            if (Array.isArray(rawErrors)) {
                // Convert string[] to Record format with _general key
                normalizedErrors = { _general: rawErrors };
            } else if (rawErrors && typeof rawErrors === 'object') {
                normalizedErrors = rawErrors;
            }

            logger.error('Request failed', {
                status: response.status,
                message: errorMessage,
                errors: normalizedErrors,
            });

            throw new ApiClientError(errorMessage, response.status, normalizedErrors);
        }

        logger.log('✅ Request successful', { dataSize: JSON.stringify(data).length });

        // Handle standardized response format
        // If extractData option is true, automatically extract data from response
        if (shouldExtractData) {
            if (isPaginatedResponse(data)) {
                // Return paginated data structure
                return extractPaginatedData(data) as T;
            } else if (isSuccessResponse(data)) {
                // Return just the data
                return extractData(data) as T;
            }
        }

        // Return raw response (for backward compatibility or when extractData is false)
        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        logger.error(`❌ Request failed after ${duration}ms`, {
            errorName: error instanceof Error ? error.name : typeof error,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
        });

        if (error instanceof ApiClientError) {
            logger.error(`ApiClientError: ${error.message}`, {
                statusCode: error.statusCode,
            });
            throw error;
        }
        if (error instanceof Error && error.name === 'AbortError') {
            logger.error(`Request aborted (timeout) after ${duration}ms - Server did not respond`);
            throw new ApiClientError('Request timeout. The server took too long to respond. Please check if the backend is running.', 408);
        }
        if (error instanceof TypeError) {
            logger.error('TypeError - Network/CORS issue', {
                message: error.message,
                url: fullUrl,
                stack: error.stack,
            });
            if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                throw new ApiClientError('Network error. Please check if the backend server is running at ' + API_URL + ' and CORS is configured correctly.', 0);
            }
            throw new ApiClientError(`Network error: ${error.message}`, 0);
        }
        logger.error('Unknown error type', {
            error,
            type: typeof error,
        });
        throw error;
    }
}

/**
 * GET request
 */
export function get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request
 */
export function post<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
): Promise<T> {
    return apiClient<T>(endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
    });
}

/**
 * PUT request
 */
export function put<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
): Promise<T> {
    return apiClient<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

/**
 * PATCH request
 */
export function patch<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
): Promise<T> {
    return apiClient<T>(endpoint, {
        ...options,
        method: 'PATCH',
        body: JSON.stringify(body),
    });
}

/**
 * DELETE request
 */
export function del<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return apiClient<T>(endpoint, {
        ...options,
        method: 'DELETE',
        body: body ? JSON.stringify(body) : undefined,
    });
}

/**
 * Type-safe helper functions for extracting data from standardized responses
 */

/**
 * Get data from a SuccessResponse or return the value as-is
 */
export async function getData<T>(
    endpoint: string,
    options?: RequestOptions
): Promise<T> {
    const response = await apiClient<SuccessResponse<T> | T>(endpoint, options);
    return extractData(response);
}

/**
 * Get paginated data from a PaginatedResponse
 * Returns both data array and pagination metadata
 */
export async function getPaginatedData<T>(
    endpoint: string,
    options?: RequestOptions
): Promise<{ data: T[]; pagination: import('./types/api-response').PaginationMeta }> {
    const response = await apiClient<PaginatedResponse<T> | { data: T[]; pagination: any } | T[]>(
        endpoint,
        options
    );
    return extractPaginatedData(response);
}

/**
 * POST request and extract data
 */
export async function postData<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
): Promise<T> {
    const response = await apiClient<SuccessResponse<T> | T>(
        endpoint,
        {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        }
    );
    return extractData(response);
}

/**
 * PATCH request and extract data
 */
export async function patchData<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
): Promise<T> {
    const response = await apiClient<SuccessResponse<T> | T>(
        endpoint,
        {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
        }
    );
    return extractData(response);
}

/**
 * PUT request and extract data
 */
export async function putData<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
): Promise<T> {
    const response = await apiClient<SuccessResponse<T> | T>(
        endpoint,
        {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        }
    );
    return extractData(response);
}

