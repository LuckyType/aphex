import type { ApiResponse } from './types.js';
/**
 * Rewrites the message of every ApiError the client throws, for an app that
 * shows its own wording; `detail` keeps the server's original text.
 */
export declare function configureApiErrorMessage(describe: ((error: ApiError) => string | undefined) | undefined): void;
export declare class ApiError extends Error {
    status: number;
    response: any;
    /** The message as the server or transport gave it, before configureApiErrorMessage. */
    detail: string;
    constructor(status: number, response: any, message?: string);
}
export declare class ApiClient {
    private baseUrl;
    private timeout;
    constructor(baseUrl?: string, timeout?: number);
    /**
     * Make HTTP request with proper error handling
     */
    private request;
    /**
     * GET request
     */
    get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
    /**
     * POST request
     */
    post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>>;
    /**
     * PUT request
     */
    put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>>;
    /**
     * DELETE request
     */
    delete<T>(endpoint: string, body?: any): Promise<ApiResponse<T>>;
    /**
     * PATCH request
     */
    patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>>;
}
export declare const apiClient: ApiClient;
//# sourceMappingURL=client.d.ts.map