import {API_ROUTES, apiClient} from "@/src/lib";
import type {
    SubmitEmailRequest,
    SubmitEmailBatchRequest,
    SubmitEmailResponse,
    SubmitEmailBatchResponse,
    EmailSummaryResponse,
    EmailDetailResponse,
    EmailStatusResponse,
    ReanalyzeRequest,
    ManualReviewRequest,
    GetEmailsParams,
} from './inference.types';

/**
 * Inference API — maps to email_controller.py
 *
 * All endpoints are prefixed with `/api/v1` via the Axios baseURL.
 * Admin-only endpoints are flagged in comments; the backend enforces the role.
 */
export const inferenceApi = {
    /** POST /inference/emails — submit a single email for analysis (202) */
    submitEmail: (data: SubmitEmailRequest) =>
        apiClient.post<SubmitEmailResponse>(API_ROUTES.INFERENCE.EMAILS, data),

    /** POST /inference/emails/batch — submit a batch of emails (202) */
    submitEmailBatch: (data: SubmitEmailBatchRequest) =>
        apiClient.post<SubmitEmailBatchResponse>(
            API_ROUTES.INFERENCE.EMAILS_BATCH,
            data,
        ),

    /** GET /inference/emails — paginated, filterable history list */
    getEmails: (params?: GetEmailsParams) =>
        apiClient.getPaginated<EmailSummaryResponse>(API_ROUTES.INFERENCE.EMAILS, {
            params: {
                page: params?.page,
                pageSize: params?.pageSize,
                classification: params?.classification,
                minConfidence: params?.minConfidence,
                maxConfidence: params?.maxConfidence,
                startDate: params?.startDate,
                endDate: params?.endDate,
                pipelineStatus: params?.pipelineStatus,
                overrideTrigger: params?.overrideTrigger,
                sender: params?.sender,
            },
        }),

    /** GET /inference/emails/:id — full detail (with links + page analyses) */
    getEmail: (id: string) =>
        apiClient.get<EmailDetailResponse>(API_ROUTES.INFERENCE.EMAIL_BY_ID(id)),

    /** GET /inference/emails/:id/status — lightweight pipeline-status poll */
    getEmailStatus: (id: string) =>
        apiClient.get<EmailStatusResponse>(API_ROUTES.INFERENCE.EMAIL_STATUS(id)),

    // GET /inference/emails/:id/links and GET /inference/links/:id are
    // intentionally not surfaced — EmailDetailResponse.links already embeds
    // LinkWithPageResponse[] with full page analyses, and the dashboard has no
    // single-link deep-link UX. Reintroduce if a shareable link route ships.

    /** POST /inference/emails/:id/reanalyze — admin-only (202) */
    reanalyzeEmail: (id: string, data: ReanalyzeRequest) =>
        apiClient.post<SubmitEmailResponse>(
            API_ROUTES.INFERENCE.EMAIL_REANALYZE(id),
            data,
        ),

    /** POST /inference/emails/:id/manual-review — note + optional override */
    manualReviewEmail: (id: string, data: ManualReviewRequest) =>
        apiClient.post<EmailDetailResponse>(
            API_ROUTES.INFERENCE.EMAIL_MANUAL_REVIEW(id),
            data,
        ),

    /** DELETE /inference/emails/:id — admin-only */
    deleteEmail: (id: string) =>
        apiClient.delete<null>(API_ROUTES.INFERENCE.EMAIL_BY_ID(id)),
};
