// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────
export { inferenceApi } from './api/inference.api';
export { inferenceStatsApi } from './api/stats.api';

// ─────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────
export {
    useSubmitEmail,
    useSubmitBatch,
    usePredictionHistory,
    useEmailDetail,
    useEmailStatus,
    useReanalyze,
    useManualReview,
    useDeleteEmail,
} from './hooks/use-inference';
export {
    useSummaryStats,
    useVerdictsOverTime,
    useOverrideTriggers,
    useModelUsage,
    useImpersonatedBrands,
} from './hooks/use-stats';

// ─────────────────────────────────────────────
// Types — enums
// ─────────────────────────────────────────────
export type {
    Classification,
    OverrideTrigger,
    PipelineStatus,
    PipelineStage,
    ResolveStatus,
    ScrapeStatus,
    RiskLevel,
    VerdictBucketGranularity,
} from './api/inference.types';

// ─────────────────────────────────────────────
// Types — request DTOs
// ─────────────────────────────────────────────
export type {
    SubmitEmailRequest,
    SubmitEmailBatchRequest,
    ReanalyzeRequest,
    ManualReviewRequest,
} from './api/inference.types';

// ─────────────────────────────────────────────
// Types — response DTOs (emails / links / pages)
// ─────────────────────────────────────────────
export type {
    SubmitEmailResponse,
    BatchSubmittedItem,
    BatchRejectedItem,
    SubmitEmailBatchResponse,
    EmailSummaryResponse,
    EmailDetailResponse,
    EmailStatusResponse,
    LinkResponse,
    LinkWithPageResponse,
    PageAnalysisResponse,
} from './api/inference.types';

// ─────────────────────────────────────────────
// Types — response DTOs (stats)
// ─────────────────────────────────────────────
export type {
    SummaryStatsResponse,
    ClassificationCountsResponse,
    PipelineStatusCountsResponse,
    VerdictBucketResponse,
    TriggerCountResponse,
    ModelCountResponse,
    ApiCallsEstimatedResponse,
    ModelUsageResponse,
    BrandCountResponse,
} from './api/inference.types';

// ─────────────────────────────────────────────
// Types — query / filter params
// ─────────────────────────────────────────────
export type {
    GetEmailsParams,
    StatsDateRangeParams,
    GetVerdictsOverTimeParams,
    GetImpersonatedBrandsParams,
} from './api/inference.types';

// ─────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────
export {
    EmailStatusBadge,
    deriveEmailStatus,
    RiskLevelBadge,
    ConfidenceBar,
    PipelineStatusIndicator,
    EmailDetailCard,
    PageAnalysisRow,
    AggregationNoteBlock,
    FilterBar,
} from './components';
export type { EmailStatus } from './components';
