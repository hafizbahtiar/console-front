/**
 * Response utility functions for handling standardized API responses
 */

import {
    SuccessResponse,
    PaginatedResponse,
    PaginationMeta,
    isSuccessResponse,
    isPaginatedResponse,
} from '../types/api-response';

/**
 * Extract data from a SuccessResponse
 * If the response is already the data, return it as-is (backward compatibility)
 */
export function extractData<T>(response: SuccessResponse<T> | T): T {
    if (isSuccessResponse(response)) {
        return response.data;
    }
    // Backward compatibility: if response is already the data, return it
    return response as T;
}

/**
 * Extract data and pagination from a PaginatedResponse
 * Returns both the data array and pagination metadata
 */
export function extractPaginatedData<T>(
    response: PaginatedResponse<T> | { data: T[]; pagination: PaginationMeta } | T[],
): { data: T[]; pagination: PaginationMeta } {
    if (isPaginatedResponse(response)) {
        return {
            data: response.data,
            pagination: response.pagination,
        };
    }
    // Handle legacy format: { data: T[], pagination: PaginationMeta }
    if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
        return {
            data: (response as any).data,
            pagination: (response as any).pagination,
        };
    }
    // Backward compatibility: if response is already an array, treat as data with no pagination
    if (Array.isArray(response)) {
        return {
            data: response,
            pagination: {
                page: 1,
                limit: response.length,
                total: response.length,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            },
        };
    }
    // Fallback: return empty data
    return {
        data: [],
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
        },
    };
}

/**
 * Extract pagination metadata from a PaginatedResponse
 */
export function extractPagination(response: PaginatedResponse | { pagination: PaginationMeta }): PaginationMeta {
    if (isPaginatedResponse(response)) {
        return response.pagination;
    }
    if (response && typeof response === 'object' && 'pagination' in response) {
        return (response as any).pagination;
    }
    // Fallback: return default pagination
    return {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    };
}

