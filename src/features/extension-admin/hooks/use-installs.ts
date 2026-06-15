'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiError, PaginationInfo, queryKeys } from '@/src/lib';
import { extensionAdminApi } from '../api/extension-admin.api';
import type {
    AnalyseEventResponse,
    GetInstallActivityParams,
    GetInstallsParams,
    InstallDetailResponse,
    InstallResponse,
} from '../api/extension-admin.types';

// ─────────────────────────────────────────────
// useInstalls — GET /extension/installs (paginated, filterable)
// ─────────────────────────────────────────────

export function useInstalls(params?: GetInstallsParams) {
    return useQuery<
        { items: InstallResponse[]; pagination: PaginationInfo },
        ApiError
    >({
        queryKey: queryKeys.extensionInstalls.all(params),
        queryFn: () => extensionAdminApi.getInstalls(params),
    });
}

// ─────────────────────────────────────────────
// useInstall — GET /extension/installs/:id
// ─────────────────────────────────────────────

export function useInstall(id: string) {
    return useQuery<InstallDetailResponse, ApiError>({
        queryKey: queryKeys.extensionInstalls.byId(id),
        queryFn: () => extensionAdminApi.getInstall(id),
        enabled: !!id,
    });
}

// ─────────────────────────────────────────────
// useInstallActivity — GET /extension/installs/:id/activity
// ─────────────────────────────────────────────

export function useInstallActivity(id: string, params?: GetInstallActivityParams) {
    return useQuery<
        { items: AnalyseEventResponse[]; pagination: PaginationInfo },
        ApiError
    >({
        queryKey: queryKeys.extensionInstalls.activity(id, params),
        queryFn: () => extensionAdminApi.getInstallActivity(id, params),
        enabled: !!id,
    });
}
