// ─────────────────────────────────────────────
// API Client
// ─────────────────────────────────────────────
export { apiClient, axiosInstance, setAuthCookies, clearAuthAndRedirect } from './api-clients';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type {
    ErrorDetail,
    ApiResponse,
    PaginationInfo,
    PaginatedResponse,
    ApiErrorMessages,
    AuthTokens,
    UserDto,
    AuthResponseDto,
} from './types';
export { ApiError } from './types';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
export {
    API_CONFIG,
    getApiBaseUrl,
    USER_ROLES,
    API_ROUTES,
    COOKIE_NAMES,
    COOKIE_OPTIONS,
    TOKEN_LIFETIMES,
    HTTP_STATUS,
} from './constants';
export type { UserRole } from './constants';

// ─────────────────────────────────────────────
// React Query
// ─────────────────────────────────────────────
export { queryClient, queryKeys } from './query-client';