import {
    LoginRequest,
    UpdateProfileRequest,
    AuthResponse,
} from './auth.types';
import {API_ROUTES, apiClient, AuthTokens, UserDto} from "@/src/lib";

/**
 * Auth API — maps to auth_controller.py
 *
 * Note: registration is admin-only. Use `userManagementApi.createUser`
 * (via `useCreateUser`) instead of POST /auth/register.
 */
export const authApi = {
    /** POST /auth/login */
    login: (data: LoginRequest) =>
        apiClient.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, data),

    /** POST /auth/refresh */
    refresh: (refreshToken: string) =>
        apiClient.post<AuthTokens>(API_ROUTES.AUTH.REFRESH, {
            refresh_token: refreshToken,
        }),

    /** POST /auth/logout */
    logout: () =>
        apiClient.post<null>(API_ROUTES.AUTH.LOGOUT),

    /** GET /auth/me */
    getProfile: () =>
        apiClient.get<UserDto>(API_ROUTES.AUTH.ME),

    /** PATCH /auth/me */
    updateProfile: (data: UpdateProfileRequest) =>
        apiClient.patch<UserDto>(API_ROUTES.AUTH.ME, data),
};