'use client';

import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inferenceApi } from '../api/inference.api';
import type {
    SubmitEmailRequest,
    SubmitEmailResponse,
    SubmitEmailBatchRequest,
    SubmitEmailBatchResponse,
    EmailSummaryResponse,
    EmailDetailResponse,
    EmailStatusResponse,
    GetEmailsParams,
    ReanalyzeRequest,
    ManualReviewRequest,
} from '../api/inference.types';
import { ApiError, PaginationInfo, queryKeys } from '@/src/lib';

// ─────────────────────────────────────────────
// useSubmitEmail — POST /inference/emails
// ─────────────────────────────────────────────

export function useSubmitEmail() {
    const queryClient = useQueryClient();

    return useMutation<SubmitEmailResponse, ApiError, SubmitEmailRequest>({
        mutationFn: (data) => inferenceApi.submitEmail(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inference', 'emails'] });
            queryClient.invalidateQueries({ queryKey: ['inference', 'stats'] });
        },
    });
}

// ─────────────────────────────────────────────
// useSubmitBatch — POST /inference/emails/batch
// ─────────────────────────────────────────────

export function useSubmitBatch() {
    const queryClient = useQueryClient();

    return useMutation<SubmitEmailBatchResponse, ApiError, SubmitEmailBatchRequest>({
        mutationFn: (data) => inferenceApi.submitEmailBatch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inference', 'emails'] });
            queryClient.invalidateQueries({ queryKey: ['inference', 'stats'] });
        },
    });
}

// ─────────────────────────────────────────────
// usePredictionHistory — GET /inference/emails (paginated, filterable)
// ─────────────────────────────────────────────

export function usePredictionHistory(params?: GetEmailsParams) {
    return useQuery<
        { items: EmailSummaryResponse[]; pagination: PaginationInfo },
        ApiError
    >({
        queryKey: queryKeys.inference.emails.all(params),
        queryFn: () => inferenceApi.getEmails(params),
    });
}

// ─────────────────────────────────────────────
// useEmailDetail — GET /inference/emails/:id
// Reads the email id from the `?id=` URL query parameter.
// ─────────────────────────────────────────────

export function useEmailDetail() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') ?? '';

    return useQuery<EmailDetailResponse, ApiError>({
        queryKey: queryKeys.inference.emails.byId(id),
        queryFn: () => inferenceApi.getEmail(id),
        enabled: !!id,
    });
}

// ─────────────────────────────────────────────
// useEmailStatus — GET /inference/emails/:id/status
// Reads the email id from the `?id=` URL query parameter.
// Polls every 2s until pipelineStatus is 'complete' or 'failed'.
// ─────────────────────────────────────────────

const STATUS_POLL_MS = 2000;

export function useEmailStatus() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') ?? '';

    return useQuery<EmailStatusResponse, ApiError>({
        queryKey: queryKeys.inference.emails.status(id),
        queryFn: () => inferenceApi.getEmailStatus(id),
        enabled: !!id,
        // Always consider status stale so remounts/refreshes re-poll immediately.
        staleTime: 0,
        refetchInterval: (query) => {
            if (query.state.error) return false;
            const status = query.state.data?.pipelineStatus;
            if (status === 'complete' || status === 'failed') return false;
            return STATUS_POLL_MS;
        },
    });
}

// ─────────────────────────────────────────────
// useReanalyze — POST /inference/emails/:id/reanalyze  (admin)
// ─────────────────────────────────────────────

export function useReanalyze() {
    const queryClient = useQueryClient();

    return useMutation<
        SubmitEmailResponse,
        ApiError,
        { id: string; data: ReanalyzeRequest }
    >({
        mutationFn: ({ id, data }) => inferenceApi.reanalyzeEmail(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inference', 'emails'] });
            queryClient.invalidateQueries({ queryKey: ['inference', 'stats'] });
        },
    });
}

// ─────────────────────────────────────────────
// useManualReview — POST /inference/emails/:id/manual-review
// ─────────────────────────────────────────────

export function useManualReview() {
    const queryClient = useQueryClient();

    return useMutation<
        EmailDetailResponse,
        ApiError,
        { id: string; data: ManualReviewRequest }
    >({
        mutationFn: ({ id, data }) => inferenceApi.manualReviewEmail(id, data),
        onSuccess: (email) => {
            queryClient.setQueryData(queryKeys.inference.emails.byId(email.id), email);
            queryClient.invalidateQueries({ queryKey: ['inference', 'emails'] });
            queryClient.invalidateQueries({ queryKey: ['inference', 'stats'] });
        },
    });
}

// ─────────────────────────────────────────────
// useDeleteEmail — DELETE /inference/emails/:id  (admin)
// ─────────────────────────────────────────────

export function useDeleteEmail() {
    const queryClient = useQueryClient();

    return useMutation<null, ApiError, string>({
        mutationFn: (id) => inferenceApi.deleteEmail(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inference', 'emails'] });
            queryClient.invalidateQueries({ queryKey: ['inference', 'stats'] });
        },
    });
}
