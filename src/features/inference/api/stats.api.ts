import {API_ROUTES, apiClient} from "@/src/lib";
import type {
    StatsDateRangeParams,
    GetVerdictsOverTimeParams,
    GetImpersonatedBrandsParams,
    SummaryStatsResponse,
    VerdictBucketResponse,
    TriggerCountResponse,
    ModelUsageResponse,
    BrandCountResponse,
} from './inference.types';

/**
 * Inference stats API — maps to stats_controller.py
 *
 * Every endpoint accepts an optional startDate/endDate window; the backend
 * defaults to the last 30 days (UTC) when either edge is missing.
 */
export const inferenceStatsApi = {
    /** GET /inference/stats/summary — counts, avg confidence, window */
    getSummary: (params?: StatsDateRangeParams) =>
        apiClient.get<SummaryStatsResponse>(API_ROUTES.INFERENCE.STATS.SUMMARY, {
            params: {
                startDate: params?.startDate,
                endDate: params?.endDate,
            },
        }),

    /** GET /inference/stats/verdicts-over-time — time-series bucketed by day|week */
    getVerdictsOverTime: (params?: GetVerdictsOverTimeParams) =>
        apiClient.get<VerdictBucketResponse[]>(
            API_ROUTES.INFERENCE.STATS.VERDICTS_OVER_TIME,
            {
                params: {
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                    bucket: params?.bucket,
                },
            },
        ),

    /** GET /inference/stats/override-triggers — count per aggregator override */
    getOverrideTriggers: (params?: StatsDateRangeParams) =>
        apiClient.get<TriggerCountResponse[]>(
            API_ROUTES.INFERENCE.STATS.OVERRIDE_TRIGGERS,
            {
                params: {
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                },
            },
        ),

    /** GET /inference/stats/model-usage — per-stage model usage + API calls saved */
    getModelUsage: (params?: StatsDateRangeParams) =>
        apiClient.get<ModelUsageResponse>(API_ROUTES.INFERENCE.STATS.MODEL_USAGE, {
            params: {
                startDate: params?.startDate,
                endDate: params?.endDate,
            },
        }),

    /** GET /inference/stats/impersonated-brands — top-N impersonated brands */
    getImpersonatedBrands: (params?: GetImpersonatedBrandsParams) =>
        apiClient.get<BrandCountResponse[]>(
            API_ROUTES.INFERENCE.STATS.IMPERSONATED_BRANDS,
            {
                params: {
                    startDate: params?.startDate,
                    endDate: params?.endDate,
                    limit: params?.limit,
                },
            },
        ),
};
