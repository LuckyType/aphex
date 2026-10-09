// Default configuration
const DEFAULT_BASE_URL = '/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
// Uploads have their own transport (see ./upload), but a FormData body can
// still reach this client from elsewhere, and it needs the same deadline.
import { uploadTimeoutFor } from './upload-timeout.js';
let describeApiError;
/**
 * Rewrites the message of every ApiError the client throws, for an app that
 * shows its own wording; `detail` keeps the server's original text.
 */
export function configureApiErrorMessage(describe) {
    describeApiError = describe;
}
export class ApiError extends Error {
    status;
    response;
    constructor(status, response, message) {
        super(message || `API Error: ${status}`);
        this.status = status;
        this.response = response;
        this.name = 'ApiError';
        this.detail = this.message;
        this.message = describeApiError?.(this) ?? this.message;
    }
}
export class ApiClient {
    baseUrl;
    timeout;
    constructor(baseUrl = DEFAULT_BASE_URL, timeout = DEFAULT_TIMEOUT) {
        this.baseUrl = baseUrl;
        this.timeout = timeout;
    }
    /**
     * Make HTTP request with proper error handling
     */
    async request(endpoint, options = {}, timeoutMs) {
        const url = `${this.baseUrl}${endpoint}`;
        // Set up request with defaults
        // Don't set Content-Type for FormData (browser will set it with boundary)
        const headers = {};
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        // `options` spreads first so its own `headers` can't overwrite the merged
        // object below. The other order silently dropped the JSON Content-Type
        // for any caller that passed a header of its own.
        const requestOptions = {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        };
        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs ?? this.timeout);
        requestOptions.signal = controller.signal;
        try {
            const response = await fetch(url, requestOptions);
            clearTimeout(timeoutId);
            // Parse defensively. Not every error response is ours: a proxy, load
            // balancer or serverless platform can reject a request before it
            // reaches the app and answer with HTML or nothing at all. Parsing
            // first threw a JSON syntax error that buried the real status, so a
            // platform 413 surfaced to the user as "Unexpected token '<'" rather
            // than as "too large".
            let data = null;
            try {
                data = (await response.json());
            }
            catch {
                if (response.ok) {
                    throw new ApiError(response.status, null, 'Malformed response from server');
                }
            }
            // Handle HTTP errors
            if (!response.ok) {
                throw new ApiError(response.status, data, data?.message || data?.error || `Request failed (${response.status})`);
            }
            if (!data) {
                throw new ApiError(response.status, null, 'Malformed response from server');
            }
            // Handle API-level errors
            if (!data.success) {
                throw new ApiError(response.status, data, data.message || data.error);
            }
            return data;
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof ApiError) {
                throw error;
            }
            // Handle fetch errors (network, timeout, etc.)
            throw new ApiError(0, null, error instanceof Error ? error.message : 'Network error');
        }
    }
    /**
     * GET request
     */
    async get(endpoint, params) {
        let url = endpoint;
        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    // Handle arrays by joining with commas
                    if (Array.isArray(value)) {
                        searchParams.append(key, value.join(','));
                    }
                    else {
                        searchParams.append(key, String(value));
                    }
                }
            });
            if (searchParams.toString()) {
                url += `?${searchParams.toString()}`;
            }
        }
        return this.request(url, { method: 'GET' });
    }
    /**
     * POST request
     */
    async post(endpoint, body, headers) {
        const isUpload = body instanceof FormData;
        return this.request(endpoint, {
            method: 'POST',
            ...(headers ? { headers } : {}),
            // Don't stringify FormData - pass it directly
            body: isUpload ? body : body ? JSON.stringify(body) : undefined
        }, 
        // The default timeout is sized for a JSON round trip and aborts a
        // perfectly healthy upload: 10 seconds is not enough to push several
        // megabytes over a phone connection, and the failure looks to the user
        // like the server rejected the file rather than like a deadline.
        isUpload ? uploadTimeoutFor(body) : undefined);
    }
    /**
     * PUT request
     */
    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            // Don't stringify FormData - pass it directly
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
        });
    }
    /**
     * DELETE request
     */
    async delete(endpoint, body) {
        return this.request(endpoint, {
            method: 'DELETE',
            body: body ? JSON.stringify(body) : undefined
        });
    }
    /**
     * PATCH request
     */
    async patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            // Don't stringify FormData - pass it directly
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
        });
    }
}
// Export singleton instance
export const apiClient = new ApiClient();
