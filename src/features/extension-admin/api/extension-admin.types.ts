// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export type InstallStatus = 'ACTIVE' | 'BLACKLISTED';

/**
 * Per-event prediction label echoed by AnalyseEventResponse. Not a server-side
 * enum — backend returns a free string, but values are constrained in practice.
 */
export type ExtensionPredictedLabel = 'SPAM' | 'NOT_SPAM' | 'REVIEW';

// ─────────────────────────────────────────────
// Request DTOs (camelCase via aliases on the backend)
// ─────────────────────────────────────────────

export interface BlacklistDomainRequest {
    /** min 1, max 320 chars (e.g. "malicious.io") */
    domain: string;
    /** optional, max 500 chars */
    reason?: string;
}

export interface BlacklistInstallRequest {
    /** optional, max 500 chars */
    reason?: string;
}

// ─────────────────────────────────────────────
// Response DTOs (camelCase)
// ─────────────────────────────────────────────

export interface InstallResponse {
    id: string;
    email: string;
    googleSub: string;
    status: InstallStatus;
    extensionVersion: string | null;
    lastSeenAt: string | null;
    blacklistedAt: string | null;
    blacklistReason: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface InstallDetailResponse extends InstallResponse {
    activeTokenCount: number;
    /** Raw environment_json captured at register time. Shape is deliberately loose. */
    environment: Record<string, unknown> | null;
}

export interface AnalyseEventResponse {
    id: string;
    installId: string;
    predictedLabel: string;
    confidenceScore: number;
    modelVersion: string;
    latencyMs: number;
    requestId: string | null;
    createdAt: string;
}

export interface BlacklistDomainResultResponse {
    installsUpdated: number;
    tokensRevoked: number;
}

export interface RevokeTokensResultResponse {
    revoked: number;
}

// ─────────────────────────────────────────────
// Query / filter params
// ─────────────────────────────────────────────

export interface GetInstallsParams {
    page?: number;
    pageSize?: number;
    /** Substring match on email */
    email?: string;
    /** Exact domain match (e.g. "example.com") */
    domain?: string;
    status?: InstallStatus;
    /** Exact extension version match */
    version?: string;
    /** ISO 8601 datetime lower bound */
    lastSeenAfter?: string;
    /** ISO 8601 datetime upper bound */
    lastSeenBefore?: string;
}

export interface GetInstallActivityParams {
    page?: number;
    pageSize?: number;
}
