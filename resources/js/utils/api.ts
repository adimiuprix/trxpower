import { telegramAuthService } from '@/services/telegramAuthService';

interface RequestOptions extends RequestInit {
    includeAuth?: boolean;
}

/**
 * Helper function untuk API calls dengan auto token attachment
 * 
 * @example
 * ```typescript
 * const data = await api('/api/some-endpoint');
 * const result = await api('/api/create', { method: 'POST', body: { name: 'John' } });
 * ```
 */
export async function api<T = any>(
    url: string,
    options: RequestOptions = {}
): Promise<T> {
    const { includeAuth = true, ...fetchOptions } = options;

    // Setup headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
    };

    // Add auth token if available and requested
    if (includeAuth) {
        const token = telegramAuthService.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    // Convert body to JSON if it's an object
    let body = fetchOptions.body;
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
        body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers,
            body: body as BodyInit,
        });

        // Handle 401 - clear token
        if (response.status === 401) {
            telegramAuthService.logout();
            window.location.reload();
        }

        // Parse response
        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.message || `HTTP error! status: ${response.status}`,
                response.status,
                data
            );
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            error instanceof Error ? error.message : 'Network error',
            0,
            null
        );
    }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Shorthand methods
 */
export const apiClient = {
    get: <T = any>(url: string, options?: RequestOptions) =>
        api<T>(url, { ...options, method: 'GET' }),

    post: <T = any>(url: string, body?: any, options?: RequestOptions) =>
        api<T>(url, { ...options, method: 'POST', body }),

    put: <T = any>(url: string, body?: any, options?: RequestOptions) =>
        api<T>(url, { ...options, method: 'PUT', body }),

    patch: <T = any>(url: string, body?: any, options?: RequestOptions) =>
        api<T>(url, { ...options, method: 'PATCH', body }),

    delete: <T = any>(url: string, options?: RequestOptions) =>
        api<T>(url, { ...options, method: 'DELETE' }),
};
