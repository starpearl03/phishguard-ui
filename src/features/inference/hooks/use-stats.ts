import { useQuery } from '@tanstack/react-query';
import { inferenceStatsApi } from '../api/stats.api';
import type {
    SummaryStatsResponse,
    VerdictBucketResponse,
    TriggerCountResponse,
    ModelUsageResponse,
    BrandCountResponse,
    StatsDateRangeParams,
    GetVerdictsOverTimeParams,
    GetImpersonatedBrandsParams,
} from '../api/inference.types';
import { ApiError, queryKeys } from '@/src/lib';

// ─────────────────────────────────────────────
// useSummaryStats — GET /inference/stats/summary
// ─────────────────────────────────────────────

export function useSummaryStats(params?: StatsDateRangeParams) {
    return useQuery<SummaryStatsResponse, ApiError>({
        queryKey: queryKeys.inference.stats.summary(params),
        queryFn: () => inferenceStatsApi.getSummary(params),
    });
}

// ─────────────────────────────────────────────
// useVerdictsOverTime — GET /inference/stats/verdicts-over-time
// ─────────────────────────────────────────────

export function useVerdictsOverTime(params?: GetVerdictsOverTimeParams) {
    return useQuery<VerdictBucketResponse[], ApiError>({
        queryKey: queryKeys.inference.stats.verdictsOverTime(params),
        queryFn: () => inferenceStatsApi.getVerdictsOverTime(params),
    });
}

// ─────────────────────────────────────────────
// useOverrideTriggers — GET /inference/stats/override-triggers
// ─────────────────────────────────────────────

export function useOverrideTriggers(params?: StatsDateRangeParams) {
    return useQuery<TriggerCountResponse[], ApiError>({
        queryKey: queryKeys.inference.stats.overrideTriggers(params),
        queryFn: () => inferenceStatsApi.getOverrideTriggers(params),
    });
}

// ─────────────────────────────────────────────
// useModelUsage — GET /inference/stats/model-usage
// ─────────────────────────────────────────────

export function useModelUsage(params?: StatsDateRangeParams) {
    return useQuery<ModelUsageResponse, ApiError>({
        queryKey: queryKeys.inference.stats.modelUsage(params),
        queryFn: () => inferenceStatsApi.getModelUsage(params),
    });
}

// ─────────────────────────────────────────────
// useImpersonatedBrands — GET /inference/stats/impersonated-brands
// ─────────────────────────────────────────────

export function useImpersonatedBrands(params?: GetImpersonatedBrandsParams) {
    return useQuery<BrandCountResponse[], ApiError>({
        queryKey: queryKeys.inference.stats.impersonatedBrands(params),
        queryFn: () => inferenceStatsApi.getImpersonatedBrands(params),
    });
}
