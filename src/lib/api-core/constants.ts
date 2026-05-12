// API Configuration
export const API_CONFIG = {
    DEV_BASE_URL: 'http://127.0.0.1:8000/api/v1',
    PROD_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    TIMEOUT: 30000, // 30 seconds
} as const;

/** Get the appropriate base URL based on environment */
export const getApiBaseUrl = (): string => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    return isDevelopment ? API_CONFIG.DEV_BASE_URL : API_CONFIG.PROD_BASE_URL;
};

// User Roles (match backend enum)
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    IT_ANALYST: 'IT_ANALYST',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// API Routes
export const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
    },
    SYSTEM: {
        HEALTH: '/health',
    },
    USERS: {
        BASE: '/users',
        BY_ID: (id: string) => `/users/${id}`,
        ACTIVATE: (id: string) => `/users/${id}/activate`,
        DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    },
    INFERENCE: {
        EMAILS: '/inference/emails',
        EMAILS_BATCH: '/inference/emails/batch',
        EMAIL_BY_ID: (id: string) => `/inference/emails/${id}`,
        EMAIL_STATUS: (id: string) => `/inference/emails/${id}/status`,
        EMAIL_REANALYZE: (id: string) => `/inference/emails/${id}/reanalyze`,
        EMAIL_MANUAL_REVIEW: (id: string) => `/inference/emails/${id}/manual-review`,
        STATS: {
            SUMMARY: '/inference/stats/summary',
            VERDICTS_OVER_TIME: '/inference/stats/verdicts-over-time',
            OVERRIDE_TRIGGERS: '/inference/stats/override-triggers',
            MODEL_USAGE: '/inference/stats/model-usage',
            IMPERSONATED_BRANDS: '/inference/stats/impersonated-brands',
        },
    },
    EXTENSION: {
        INSTALLS: '/extension/installs',
        INSTALL_BY_ID: (id: string) => `/extension/installs/${id}`,
        INSTALL_ACTIVITY: (id: string) => `/extension/installs/${id}/activity`,
        INSTALL_BLACKLIST: (id: string) => `/extension/installs/${id}/blacklist`,
        INSTALL_UNBLACKLIST: (id: string) => `/extension/installs/${id}/unblacklist`,
        INSTALL_REVOKE_TOKENS: (id: string) => `/extension/installs/${id}/revoke-tokens`,
        DOMAIN_BLACKLIST: '/extension/installs/domains/blacklist',
    },
} as const;

// Cookie Names
export const COOKIE_NAMES = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
} as const;

// Cookie Options
export const COOKIE_OPTIONS = {
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
} as const;

// Token lifetimes — backend doesn't return expires_at, so cookie expiry mirrors
// the JWT's server-side lifetime (see backend_contract.md § Quick Start).
export const TOKEN_LIFETIMES = {
    ACCESS_TOKEN_MINUTES: 30,
    REFRESH_TOKEN_DAYS: 7,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;