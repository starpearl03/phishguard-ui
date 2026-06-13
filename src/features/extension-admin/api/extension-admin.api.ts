import { API_ROUTES, apiClient } from '@/src/lib';
import type {
    BlacklistDomainRequest,
    BlacklistDomainResultResponse,
    BlacklistInstallRequest,
    GetInstallActivityParams,
    GetInstallsParams,
    InstallDetailResponse,
    InstallResponse,
    AnalyseEventResponse,
    RevokeTokensResultResponse,
} from './extension-admin.types';

/**
 * Extension Admin API — maps to extension_install_controller.py (admin-only).
 *
 * All endpoints require an authenticated dashboard user with role ADMIN.
 * The backend enforces the role; the frontend gates the UI via AuthGuard.
 */
export const extensionAdminApi = {
    /** GET /extension/installs — paginated, filterable list */
    getInstalls: (params?: GetInstallsParams) =>
        apiClient.getPaginated<InstallResponse>(API_ROUTES.EXTENSION.INSTALLS, {
            params: {
                page: params?.page,
                pageSize: params?.pageSize,
                email: params?.email,
                domain: params?.domain,
                status: params?.status,
                version: params?.version,
                lastSeenAfter: params?.lastSeenAfter,
                lastSeenBefore: params?.lastSeenBefore,
            },
        }),

    /** GET /extension/installs/:id — full detail with token count + environment */
    getInstall: (id: string) =>
        apiClient.get<InstallDetailResponse>(API_ROUTES.EXTENSION.INSTALL_BY_ID(id)),

    /** GET /extension/installs/:id/activity — paginated analyse-event log */
    getInstallActivity: (id: string, params?: GetInstallActivityParams) =>
        apiClient.getPaginated<AnalyseEventResponse>(
            API_ROUTES.EXTENSION.INSTALL_ACTIVITY(id),
            {
                params: {
                    page: params?.page,
                    pageSize: params?.pageSize,
                },
            },
        ),

    /** POST /extension/installs/:id/blacklist */
    blacklistInstall: (id: string, data: BlacklistInstallRequest) =>
        apiClient.post<InstallResponse>(
            API_ROUTES.EXTENSION.INSTALL_BLACKLIST(id),
            data,
        ),

    /** POST /extension/installs/:id/unblacklist */
    unblacklistInstall: (id: string) =>
        apiClient.post<InstallResponse>(
            API_ROUTES.EXTENSION.INSTALL_UNBLACKLIST(id),
        ),

    /** POST /extension/installs/:id/revoke-tokens */
    revokeInstallTokens: (id: string) =>
        apiClient.post<RevokeTokensResultResponse>(
            API_ROUTES.EXTENSION.INSTALL_REVOKE_TOKENS(id),
        ),

    /** POST /extension/installs/domains/blacklist — bulk by domain */
    blacklistDomain: (data: BlacklistDomainRequest) =>
        apiClient.post<BlacklistDomainResultResponse>(
            API_ROUTES.EXTENSION.DOMAIN_BLACKLIST,
            data,
        ),
};
