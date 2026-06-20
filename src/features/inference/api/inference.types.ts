// ─────────────────────────────────────────────
// Enums (values match backend exactly — see frontend_integration.md)
// ─────────────────────────────────────────────

export type Classification = 'phishing' | 'suspicious' | 'legitimate';

export type OverrideTrigger =
    | 'page_high_risk'
    | 'page_medium_risk'
    | 'all_low'
    | 'all_failed'
    | 'early_exit';

export type PipelineStatus = 'pending' | 'running' | 'complete' | 'failed';

export type PipelineStage =
    | 'queued'
    | 'classification'
    | 'link_resolution'
    | 'page_analysis'
    | 'aggregation'
    | 'done';

export type ResolveStatus = 'success' | 'failed' | 'timeout' | 'blocked';

export type ScrapeStatus = 'success' | 'blocked' | 'timeout' | 'js_required';

export type RiskLevel = 'high' | 'medium' | 'low';

export type VerdictBucketGranularity = 'day' | 'week';

// ─────────────────────────────────────────────
// Request DTOs (mostly snake_case; `receivedAt` and `overrideClassification`
// are camelCase aliases on the backend)
// ─────────────────────────────────────────────

export interface SubmitEmailRequest {
    sender: string;
    subject: string;
    body: string;
    /** ISO datetime — camelCase alias on the backend */
    receivedAt?: string;
}

export interface SubmitEmailBatchRequest {
    emails: SubmitEmailRequest[];
}

export interface ReanalyzeRequest {
    body: string;
}

export interface ManualReviewRequest {
    note: string;
    /** camelCase alias on the backend */
    overrideClassification?: Classification;
}

// ─────────────────────────────────────────────
// Response DTOs — emails / links / pages (camelCase)
// ─────────────────────────────────────────────

export interface SubmitEmailResponse {
    emailId: string;
    pipelineStatus: PipelineStatus;
    receivedAt: string;
    submittedAt: string;
}

export interface BatchSubmittedItem {
    emailId: string;
    pipelineStatus: PipelineStatus;
}

export interface BatchRejectedItem {
    index: number;
    reason: string;
}

export interface SubmitEmailBatchResponse {
    submitted: BatchSubmittedItem[];
    rejected: BatchRejectedItem[];
}

export interface EmailSummaryResponse {
    id: string;
    sender: string;
    subject: string;
    receivedAt: string;
    classification: Classification | null;
    confidence: number | null;
    finalClassification: Classification | null;
    finalConfidence: number | null;
    overrideTrigger: OverrideTrigger | null;
    linkCount: number;
    pipelineStatus: PipelineStatus;
    finalisedAt: string | null;
    /** UUID of extension install that submitted this email; null when submitted via dashboard */
    submittedByInstall: string | null;
}

export interface EmailDetailResponse {
    id: string;
    sender: string;
    subject: string;
    bodyHash: string;
    receivedAt: string;
    processedAt: string | null;
    finalisedAt: string | null;
    classification: Classification | null;
    confidence: number | null;
    reasoning: string | null;
    riskFactors: string[] | null;
    llmModel: string | null;
    linkCount: number;
    finalClassification: Classification | null;
    finalConfidence: number | null;
    overrideTrigger: OverrideTrigger | null;
    aggregationNote: string | null;
    pipelineStatus: PipelineStatus;
    pipelineStage: PipelineStage;
    pipelineError: string | null;
    manualReviewFlag: boolean;
    manualReviewNote: string | null;
    manualReviewBy: string | null;
    manualReviewAt: string | null;
    manualOverrideClassification: Classification | null;
    submittedBy: string | null;
    /** UUID of extension install that submitted this email; null when submitted via dashboard */
    submittedByInstall: string | null;
    createdAt: string;
    updatedAt: string;
    links: LinkWithPageResponse[];
}

export interface EmailStatusResponse {
    emailId: string;
    pipelineStatus: PipelineStatus;
    stage: PipelineStage;
    startedAt: string | null;
    finalisedAt: string | null;
    error: string | null;
}

export interface LinkResponse {
    id: string;
    emailId: string;
    originalUrl: string;
    isShortened: boolean;
    shortener: string | null;
    anchorContext: string | null;
    resolvedUrl: string | null;
    resolveStatus: ResolveStatus | null;
    redirectHops: number;
    intermediateDomains: string[] | null;
    httpStatus: number | null;
    resolvedAt: string | null;
    createdAt: string;
}

export interface PageAnalysisResponse {
    id: string;
    pageTitle: string | null;
    metaDescription: string | null;
    hasLoginForm: boolean;
    hasPaymentForm: boolean;
    externalDomains: string[] | null;
    faviconMatchesDomain: boolean | null;
    pagePurpose: string | null;
    impersonatesBrand: string | null;
    requestsCredentials: boolean;
    requestsPayment: boolean;
    riskLevel: RiskLevel | null;
    riskConfidence: number | null;
    riskReasons: string[] | null;
    summary: string | null;
    scrapeStatus: ScrapeStatus | null;
    llmModel: string | null;
    analysedAt: string | null;
    createdAt: string;
}

export interface LinkWithPageResponse extends LinkResponse {
    pageAnalysis: PageAnalysisResponse | null;
}

// ─────────────────────────────────────────────
// Response DTOs — stats (camelCase)
// ─────────────────────────────────────────────

export interface ClassificationCountsResponse {
    phishing: number;
    suspicious: number;
    legitimate: number;
    pending: number;
}

export interface PipelineStatusCountsResponse {
    pending: number;
    running: number;
    complete: number;
    failed: number;
}

export interface SummaryStatsResponse {
    total: number;
    byClassification: ClassificationCountsResponse;
    byPipelineStatus: PipelineStatusCountsResponse;
    earlyExitCount: number;
    escalationCount: number;
    averageConfidence: number | null;
    windowStart: string | null;
    windowEnd: string | null;
}

export interface VerdictBucketResponse {
    bucket: string;
    phishing: number;
    suspicious: number;
    legitimate: number;
}

export interface TriggerCountResponse {
    trigger: OverrideTrigger;
    count: number;
}

export interface ModelCountResponse {
    model: string;
    count: number;
}

export interface ApiCallsEstimatedResponse {
    groq: number;
    gemini: number;
    totalSaved: number;
}

export interface ModelUsageResponse {
    stage1: ModelCountResponse[];
    stage3: ModelCountResponse[];
    apiCallsEstimated: ApiCallsEstimatedResponse;
}

export interface BrandCountResponse {
    brand: string;
    count: number;
}

// ─────────────────────────────────────────────
// Query / filter params (camelCase — wire params use backend aliases)
// ─────────────────────────────────────────────

export interface GetEmailsParams {
    page?: number;
    pageSize?: number;
    classification?: Classification;
    minConfidence?: number;
    maxConfidence?: number;
    /** ISO datetime */
    startDate?: string;
    /** ISO datetime */
    endDate?: string;
    pipelineStatus?: PipelineStatus;
    overrideTrigger?: OverrideTrigger;
    sender?: string;
}

export interface StatsDateRangeParams {
    /** ISO datetime */
    startDate?: string;
    /** ISO datetime */
    endDate?: string;
}

export interface GetVerdictsOverTimeParams extends StatsDateRangeParams {
    bucket?: VerdictBucketGranularity;
}

export interface GetImpersonatedBrandsParams extends StatsDateRangeParams {
    /** Top-N (1–50). Default 10. */
    limit?: number;
}
