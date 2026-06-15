'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, queryKeys } from '@/src/lib';
import { extensionAdminApi } from '../api/extension-admin.api';
import type {
    BlacklistDomainRequest,
    BlacklistDomainResultResponse,
    BlacklistInstallRequest,
    InstallResponse,
    RevokeTokensResultResponse,
} from '../api/extension-admin.types';

const LIST_KEY = ['extension-installs'] as const;

// ─────────────────────────────────────────────
// useBlacklistInstall — POST /extension/installs/:id/blacklist
// ─────────────────────────────────────────────

export function useBlacklistInstall() {
    const queryClient = useQueryClient();

    return useMutation<
        InstallResponse,
        ApiError,
        { id: string; data: BlacklistInstallRequest }
    >({
        mutationFn: ({ id, data }) => extensionAdminApi.blacklistInstall(id, data),
        onSuccess: (install) => {
            queryClient.invalidateQueries({ queryKey: LIST_KEY });
            queryClient.invalidateQueries({
                queryKey: queryKeys.extensionInstalls.byId(install.id),
            });
        },
    });
}

// ─────────────────────────────────────────────
// useUnblacklistInstall — POST /extension/installs/:id/unblacklist
// ─────────────────────────────────────────────

export function useUnblacklistInstall() {
    const queryClient = useQueryClient();

    return useMutation<InstallResponse, ApiError, string>({
        mutationFn: (id) => extensionAdminApi.unblacklistInstall(id),
        onSuccess: (install) => {
            queryClient.invalidateQueries({ queryKey: LIST_KEY });
            queryClient.invalidateQueries({
                queryKey: queryKeys.extensionInstalls.byId(install.id),
            });
        },
    });
}

// ─────────────────────────────────────────────
// useRevokeInstallTokens — POST /extension/installs/:id/revoke-tokens
// ─────────────────────────────────────────────

export function useRevokeInstallTokens() {
    const queryClient = useQueryClient();

    return useMutation<RevokeTokensResultResponse, ApiError, string>({
        mutationFn: (id) => extensionAdminApi.revokeInstallTokens(id),
        onSuccess: (_data, id) => {
            // Active token count is part of the detail; refresh it.
            queryClient.invalidateQueries({
                queryKey: queryKeys.extensionInstalls.byId(id),
            });
            // Activity isn't directly affected, but the list shows lastSeen which
            // may shift in some flows — invalidate broadly to be safe.
            queryClient.invalidateQueries({ queryKey: LIST_KEY });
        },
    });
}

// ─────────────────────────────────────────────
// useBlacklistDomain — POST /extension/installs/domains/blacklist (bulk)
// ─────────────────────────────────────────────

export function useBlacklistDomain() {
    const queryClient = useQueryClient();

    return useMutation<
        BlacklistDomainResultResponse,
        ApiError,
        BlacklistDomainRequest
    >({
        mutationFn: (data) => extensionAdminApi.blacklistDomain(data),
        onSuccess: () => {
            // Bulk action — invalidate the entire installs cache.
            queryClient.invalidateQueries({ queryKey: LIST_KEY });
        },
    });
}
