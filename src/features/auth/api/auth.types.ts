
// ─────────────────────────────────────────────
// Request types (snake_case — backend has no aliases on request DTOs)
// ─────────────────────────────────────────────

import {UserDto, UserRole, AuthTokens } from "@/src/lib";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UpdateProfileRequest {
    first_name?: string;
    last_name?: string;
    username?: string;
}

export interface CreateUserRequest {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    role: UserRole;
}

export interface UpdateUserRequest {
    first_name?: string;
    last_name?: string;
    username?: string;
    role?: UserRole;
    is_active?: boolean;
}

// ─────────────────────────────────────────────
// Response types (camelCase — backend serializes with by_alias=True)
// ─────────────────────────────────────────────

export interface AuthResponse {
    user: UserDto;
    tokens: AuthTokens;
}

// Re-export for convenience
export type { UserDto, AuthTokens };

// ─────────────────────────────────────────────
// Query/filter params for user listing
// ─────────────────────────────────────────────

export interface GetUsersParams {
    page?: number;
    pageSize?: number;
    role?: UserRole;
    isActive?: boolean;
}