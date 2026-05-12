import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig,
} from 'axios';
import Cookies from 'js-cookie';
import {
    getApiBaseUrl,
    API_CONFIG,
    COOKIE_NAMES,
    COOKIE_OPTIONS,
    HTTP_STATUS,
    API_ROUTES,
    TOKEN_LIFETIMES,
} from './constants';
import {
    ApiResponse,
    ApiError,
    PaginatedResponse,
    PaginationInfo,
    AuthTokens,
} from './types';

/**
 * Custom Axios config with retry flags
 */
interface CustomAxiosConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRetry?: boolean;
}

// ─────────────────────────────────────────────
// Refresh queue state
// ─────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// ─────────────────────────────────────────────
// Cookie helpers
// ─────────────────────────────────────────────

function setAuthCookies(tokens: AuthTokens) {
    // js-cookie accepts a fractional day count for `expires`.
    const accessTokenDays = TOKEN_LIFETIMES.ACCESS_TOKEN_MINUTES / (24 * 60);
    Cookies.set(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
        ...COOKIE_OPTIONS,
        expires: accessTokenDays,
    });
    Cookies.set(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        expires: TOKEN_LIFETIMES.REFRESH_TOKEN_DAYS,
    });
}

function clearAuthAndRedirect() {
    if (typeof window !== 'undefined') {
        Cookies.remove(COOKIE_NAMES.ACCESS_TOKEN, { path: '/' });
        Cookies.remove(COOKIE_NAMES.REFRESH_TOKEN, { path: '/' });
        // Avoid a reload loop when the 401 comes from /auth/me on the login page itself.
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }
}

// ─────────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────────

const axiosInstance: AxiosInstance = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach Bearer token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get(COOKIE_NAMES.ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor — error transformation + token refresh
axiosInstance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
        console.log('[API] Response:', {
            url: response.config.url,
            method: response.config.method,
            status: response.status,
            data: response.data,
        });

        // Backend returned success:false inside a 200 (defensive)
        if (response.data && response.data.success === false && response.data.error) {
            console.log('[API] success:false in 200 response:', response.data);
            const apiError = new ApiError(response.data.error, response.data.message);
            return Promise.reject(apiError);
        }

        return response;
    },
    async (error: AxiosError<ApiResponse<unknown>>) => {
        const originalRequest = error.config as CustomAxiosConfig;

        console.log('[API] Error intercepted:', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            status: error.response?.status,
            responseData: error.response?.data,
            message: error.message,
        });

        // Structured backend error
        if (error.response?.data && typeof error.response.data === 'object') {
            const data = error.response.data;

            if (data.success === false && data.error) {
                const apiError = new ApiError(data.error, data.message);

                console.log('[API] Structured backend error:', {
                    url: originalRequest?.url,
                    statusCode: apiError.statusCode,
                    code: apiError.code,
                    message: data.message,
                });

                // Refresh endpoint itself failed — bail
                if (originalRequest.url?.includes(API_ROUTES.AUTH.REFRESH)) {
                    clearAuthAndRedirect();
                    return Promise.reject(apiError);
                }

                if (originalRequest._skipAuthRetry) {
                    return Promise.reject(apiError);
                }

                // 401 → try token refresh
                if (
                    apiError.statusCode === HTTP_STATUS.UNAUTHORIZED &&
                    !originalRequest._retry
                ) {
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        })
                            .then(() => axiosInstance(originalRequest))
                            .catch(err => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    isRefreshing = true;

                    const refreshToken = Cookies.get(COOKIE_NAMES.REFRESH_TOKEN);

                    if (!refreshToken) {
                        isRefreshing = false;
                        processQueue(apiError, null);
                        clearAuthAndRedirect();
                        return Promise.reject(apiError);
                    }

                    try {
                        // Backend expects snake_case field: refresh_token
                        const response = await axios.post<ApiResponse<AuthTokens>>(
                            `${getApiBaseUrl()}${API_ROUTES.AUTH.REFRESH}`,
                            { refresh_token: refreshToken },
                            { headers: { 'Content-Type': 'application/json' } },
                        );

                        if (response.data.success && response.data.value) {
                            const tokens = response.data.value;

                            setAuthCookies(tokens);

                            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;

                            isRefreshing = false;
                            processQueue(null, tokens.accessToken);

                            return axiosInstance(originalRequest);
                        }

                        throw new Error('Token refresh failed');
                    } catch (refreshError) {
                        isRefreshing = false;
                        processQueue(refreshError, null);
                        clearAuthAndRedirect();
                        return Promise.reject(apiError);
                    }
                }

                return Promise.reject(apiError);
            }
        }

        // Network error (no response)
        if (!error.response) {
            console.log('[API] Network error:', {
                url: originalRequest?.url,
                message: error.message,
            });

            const networkError = new ApiError(
                {
                    title: 'Network Error',
                    code: 'NETWORK_ERROR',
                    status: 0,
                    details: ['Unable to connect to the server. Please check your internet connection.'],
                },
                'Network error occurred',
            );
            return Promise.reject(networkError);
        }

        // Unhandled HTTP error (backend returned a non-envelope response)
        const statusCode = error.response?.status || 500;
        console.log('[API] Unhandled HTTP error:', {
            url: originalRequest?.url,
            statusCode,
            responseData: error.response?.data,
        });

        const genericError = new ApiError(
            {
                title: 'Request Failed',
                code: 'REQUEST_FAILED',
                status: statusCode,
                details: [error.message],
            },
            `Request failed with status ${statusCode}`,
        );

        return Promise.reject(genericError);
    },
);

// ─────────────────────────────────────────────
// ApiClient — verbs auto-unwrap `value`
// ─────────────────────────────────────────────

class ApiClient {
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        console.log('[ApiClient] GET', url);
        const response = await axiosInstance.get<ApiResponse<T>>(url, config);
        return response.data.value as T;
    }

    async getPaginated<T>(
        url: string,
        config?: AxiosRequestConfig,
    ): Promise<{ items: T[]; pagination: PaginationInfo }> {
        console.log('[ApiClient] GET paginated', url);
        const response = await axiosInstance.get<PaginatedResponse<T>>(url, config);

        return {
            items: response.data.value || [],
            pagination: response.data.pagination || {
                page: 1,
                pageSize: 20,
                total: 0,
                totalPages: 0,
            },
        };
    }

    async post<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig,
    ): Promise<T> {
        console.log('[ApiClient] POST', url);
        const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
        return response.data.value as T;
    }

    async put<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig,
    ): Promise<T> {
        console.log('[ApiClient] PUT', url);
        const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
        return response.data.value as T;
    }

    async patch<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig,
    ): Promise<T> {
        console.log('[ApiClient] PATCH', url);
        const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config);
        return response.data.value as T;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        console.log('[ApiClient] DELETE', url);
        const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
        return response.data.value as T;
    }

    /** Returns the full envelope (useful when `message` is needed) */
    async getFullResponse<T>(
        url: string,
        config?: AxiosRequestConfig,
    ): Promise<ApiResponse<T>> {
        const response = await axiosInstance.get<ApiResponse<T>>(url, config);
        return response.data;
    }

    async postFullResponse<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig,
    ): Promise<ApiResponse<T>> {
        const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
        return response.data;
    }

    get instance(): AxiosInstance {
        return axiosInstance;
    }
}

export const apiClient = new ApiClient();
export { axiosInstance, setAuthCookies, clearAuthAndRedirect };