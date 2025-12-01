/**
 * Standard API response types matching backend response format
 */

export interface SuccessResponse<T = any> {
    success: true;
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
}

export interface PaginatedResponse<T = any> {
    success: true;
    statusCode: number;
    message: string;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
    timestamp: string;
}

export interface ErrorResponse {
    success: false;
    statusCode: number;
    message: string;
    error?: string;
    errors?: Record<string, string[]> | string[];
    timestamp: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * Type guard to check if response is a success response
 */
export function isSuccessResponse<T>(response: any): response is SuccessResponse<T> {
    return response && response.success === true && 'data' in response && !('pagination' in response);
}

/**
 * Type guard to check if response is a paginated response
 */
export function isPaginatedResponse<T>(response: any): response is PaginatedResponse<T> {
    return response && response.success === true && 'data' in response && 'pagination' in response;
}

/**
 * Type guard to check if response is an error response
 */
export function isErrorResponse(response: any): response is ErrorResponse {
    return response && response.success === false;
}

