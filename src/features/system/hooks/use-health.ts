'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiError, queryKeys } from '@/src/lib';
import { systemApi } from '../api/health.api';
import type { HealthResponse } from '../api/health.types';

const REFETCH_MS = 60_000;

/**
 * Polls the /health endpoint every 60 s. Errors are silenced — the dot's red
 * state already communicates failure, so a global toast on every miss would
 * be noisy.
 */
export function useHealth() {
    return useQuery<HealthResponse, ApiError>({
        queryKey: queryKeys.system.health,
        queryFn: () => systemApi.getHealth(),
        refetchInterval: REFETCH_MS,
        refetchOnWindowFocus: true,
        staleTime: REFETCH_MS,
        retry: false,
        meta: { silentError: true },
    });
}
