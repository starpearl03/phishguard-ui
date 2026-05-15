import { QueryClient, QueryCache, DefaultOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from './types';

const defaultOptions: DefaultOptions = {
    queries: {
        // How long data is considered fresh (5 min)
        staleTime: 5 * 60 * 1000,

        // How long inactive data stays cached (10 min)
        gcTime: 10 * 60 * 1000,

        // Retry policy — skip 4xx, retry network/5xx up to 3x
        retry: (failureCount, error) => {
            if (error instanceof ApiError) {
                if (error.statusCode >= 400 && error.statusCode < 500) {
                    return false;
                }
            }
            return failureCount < 3;
        },

        // Exponential backoff, capped at 30s
        retryDelay: (attemptIndex: number) =>
            Math.min(1000 * 2 ** attemptIndex, 30000),

        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
    },
    mutations: {
        retry: 1,
        retryDelay: 1000,
    },
};

/**
 * Global query cache — auto-toasts errors for background queries.
 * Mutations are NOT auto-toasted (each component decides whether to show
 * inline errors or its own toast).
 */
const queryCache = new QueryCache({
    onError: (error, query) => {
        // Skip 401s — these trigger the refresh flow / redirect, not a toast.
        if (error instanceof ApiError && error.statusCode === 401) {
            return;
        }

        // Skip if the query opted out via meta.silentError
        if (query.meta?.silentError === true) {
            return;
        }

        const message =
            error instanceof ApiError
                ? error.getMessage()
                : 'Something went wrong while loading data';

        toast.error(message);
    },
});

export const queryClient = new QueryClient({
    queryCache,
    defaultOptions,
});

// Shared query param shape
interface QueryParams {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    [key: string]: string | number | boolean | undefined;
}

/**
 * Query keys factory — keep keys consistent across the app
 */
export const queryKeys = {
    auth: {
        me: ['auth', 'me'] as const,
    },
    users: {
        all: (params?: object) => ['users', params] as const,
        byId: (id: string) => ['users', id] as const,
    },
    inference: {
        emails: {
            all: (params?: object) => ['inference', 'emails', params] as const,
            byId: (id: string) => ['inference', 'emails', id] as const,
            status: (id: string) => ['inference', 'emails', id, 'status'] as const,
        },
        stats: {
            summary: (params?: object) => ['inference', 'stats', 'summary', params] as const,
            verdictsOverTime: (params?: object) =>
                ['inference', 'stats', 'verdicts-over-time', params] as const,
            overrideTriggers: (params?: object) =>
                ['inference', 'stats', 'override-triggers', params] as const,
            modelUsage: (params?: object) =>
                ['inference', 'stats', 'model-usage', params] as const,
            impersonatedBrands: (params?: object) =>
                ['inference', 'stats', 'impersonated-brands', params] as const,
        },
    },
    extensionInstalls: {
        all: (params?: object) => ['extension-installs', params] as const,
        byId: (id: string) => ['extension-installs', id] as const,
        activity: (id: string, params?: object) =>
            ['extension-installs', id, 'activity', params] as const,
    },
    system: {
        health: ['system', 'health'] as const,
    },
} as const;