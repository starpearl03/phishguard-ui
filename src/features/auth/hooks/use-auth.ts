'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import type {
    LoginRequest,
    UpdateProfileRequest,
    AuthResponse,
    UserDto,
} from '../api/auth.types';
import { useAuthStore } from '../stores/auth.store';
import {ApiError, queryKeys} from "@/src/lib";
import {useEffect} from "react";

// ─────────────────────────────────────────────
// useLogin
// ─────────────────────────────────────────────

export function useLogin() {
    const setAuth = useAuthStore((s) => s.setAuth);

    return useMutation<AuthResponse, ApiError, LoginRequest>({
        mutationFn: (data) => authApi.login(data),
        onSuccess: ({ user, tokens }) => {
            setAuth(user, tokens);
        },
    });
}

// ─────────────────────────────────────────────
// useLogout
// ─────────────────────────────────────────────

export function useLogout() {
    const logout = useAuthStore((s) => s.logout);
    const queryClient = useQueryClient();

    return useMutation<null, ApiError>({
        mutationFn: () => authApi.logout(),
        onSettled: () => {
            // Clear all cached queries on logout
            queryClient.clear();
            logout();
        },
    });
}

// ─────────────────────────────────────────────
// useProfile — fetches /auth/me, hydrates store
// ─────────────────────────────────────────────

export function useProfile() {
    const setUser = useAuthStore((s) => s.setUser);
    const setHydrated = useAuthStore((s) => s.setHydrated);

    const query = useQuery<UserDto, ApiError>({
        queryKey: queryKeys.auth.me,
        queryFn: () => authApi.getProfile(),
        retry: false,
        staleTime: 10 * 60 * 1000,
    });

    useEffect(() => {
        if (query.data) {
            setUser(query.data);
            setHydrated();
        } else if (query.isError) {
            setHydrated();
        }
    }, [query.data, query.isError, setUser, setHydrated]);

    return query;
}

// ─────────────────────────────────────────────
// useUpdateProfile
// ─────────────────────────────────────────────

export function useUpdateProfile() {
    const setUser = useAuthStore((s) => s.setUser);
    const queryClient = useQueryClient();

    return useMutation<UserDto, ApiError, UpdateProfileRequest>({
        mutationFn: (data) => authApi.updateProfile(data),
        onSuccess: (user) => {
            setUser(user);
            queryClient.setQueryData(queryKeys.auth.me, user);
        },
    });
}