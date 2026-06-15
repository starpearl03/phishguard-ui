// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────
export { extensionAdminApi } from './api/extension-admin.api';

// ─────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────
export {
    useInstalls,
    useInstall,
    useInstallActivity,
} from './hooks/use-installs';
export {
    useBlacklistInstall,
    useUnblacklistInstall,
    useRevokeInstallTokens,
    useBlacklistDomain,
} from './hooks/use-install-actions';

// ─────────────────────────────────────────────
// Types — enums
// ─────────────────────────────────────────────
export type {
    InstallStatus,
    ExtensionPredictedLabel,
} from './api/extension-admin.types';

// ─────────────────────────────────────────────
// Types — request DTOs
// ─────────────────────────────────────────────
export type {
    BlacklistDomainRequest,
    BlacklistInstallRequest,
} from './api/extension-admin.types';

// ─────────────────────────────────────────────
// Types — response DTOs
// ─────────────────────────────────────────────
export type {
    InstallResponse,
    InstallDetailResponse,
    AnalyseEventResponse,
    BlacklistDomainResultResponse,
    RevokeTokensResultResponse,
} from './api/extension-admin.types';

// ─────────────────────────────────────────────
// Types — query / filter params
// ─────────────────────────────────────────────
export type {
    GetInstallsParams,
    GetInstallActivityParams,
} from './api/extension-admin.types';

// ─────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────
export {
    InstallStatusBadge,
    InstallRowActions,
    ActivityTable,
    BlacklistInstallDialog,
    DomainBlacklistDialog,
    InstallsPage,
    InstallDetailPage,
} from './components';
