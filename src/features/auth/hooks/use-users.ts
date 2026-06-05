'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userManagementApi } from '../api/user-management.api';
import type {
    CreateUserRequest,
    UpdateUserRequest,
    GetUsersParams, UserDto,
} from '../api/auth.types';
import {ApiError, PaginationInfo, queryKeys} from "@/src/lib";

// ─────────────────────────────────────────────
// useUsers — paginated list
// ─────────────────────────────────────────────

export function useUsers(params?: GetUsersParams) {
    return useQuery<{ items: UserDto[]; pagination: PaginationInfo }, ApiError>({
        queryKey: queryKeys.users.all(params),
        queryFn: () => userManagementApi.getUsers(params),
    });
}

// ─────────────────────────────────────────────
// useUser — single user by ID
// ─────────────────────────────────────────────

export function useUser(id: string) {
    return useQuery<UserDto, ApiError>({
        queryKey: queryKeys.users.byId(id),
        queryFn: () => userManagementApi.getUser(id),
        enabled: !!id,
    });
}

// ─────────────────────────────────────────────
// useCreateUser
// ─────────────────────────────────────────────

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation<UserDto, ApiError, CreateUserRequest>({
        mutationFn: (data) => userManagementApi.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

// ─────────────────────────────────────────────
// useUpdateUser
// ─────────────────────────────────────────────

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation<UserDto, ApiError, { id: string; data: UpdateUserRequest }>({
        mutationFn: ({ id, data }) => userManagementApi.updateUser(id, data),
        onSuccess: (user) => {
            queryClient.setQueryData(queryKeys.users.byId(user.id), user);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

// ─────────────────────────────────────────────
// useDeleteUser
// ─────────────────────────────────────────────

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation<null, ApiError, string>({
        mutationFn: (id) => userManagementApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

// ─────────────────────────────────────────────
// useActivateUser
// ─────────────────────────────────────────────

export function useActivateUser() {
    const queryClient = useQueryClient();

    return useMutation<UserDto, ApiError, string>({
        mutationFn: (id) => userManagementApi.activateUser(id),
        onSuccess: (user) => {
            queryClient.setQueryData(queryKeys.users.byId(user.id), user);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

// ─────────────────────────────────────────────
// useDeactivateUser
// ─────────────────────────────────────────────

export function useDeactivateUser() {
    const queryClient = useQueryClient();

    return useMutation<UserDto, ApiError, string>({
        mutationFn: (id) => userManagementApi.deactivateUser(id),
        onSuccess: (user) => {
            queryClient.setQueryData(queryKeys.users.byId(user.id), user);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}