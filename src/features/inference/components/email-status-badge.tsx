import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, XCircle } from 'lucide-react';
import { Badge } from '@/src/components/shadcn/badge';
import type {
    Classification,
    EmailDetailResponse,
    EmailSummaryResponse,
    PipelineStatus,
} from '../api/inference.types';

export type EmailStatus = Classification | 'pending' | 'failed';

/**
 * Collapse the two classification columns + pipeline status into a single
 * display status the UI can badge.
 *
 * Why: finalClassification (post-aggregation) wins when present; otherwise
 * fall back to the stage-1 classification; a pipeline that hasn't finished or
 * has failed should say so rather than show a stale verdict.
 */
export function deriveEmailStatus(
    email: Pick<
        EmailSummaryResponse | EmailDetailResponse,
        'classification' | 'finalClassification' | 'pipelineStatus'
    >,
): EmailStatus {
    if (email.pipelineStatus === 'failed') return 'failed';
    const verdict = email.finalClassification ?? email.classification;
    if (verdict) return verdict;
    return 'pending';
}

const STATUS_META: Record<
    EmailStatus,
    {
        label: string;
        variant: React.ComponentProps<typeof Badge>['variant'];
        Icon: React.ComponentType<{ className?: string }>;
    }
> = {
    phishing: { label: 'Phishing', variant: 'destructive', Icon: ShieldAlert },
    suspicious: { label: 'Suspicious', variant: 'warning', Icon: AlertTriangle },
    legitimate: { label: 'Legitimate', variant: 'success', Icon: CheckCircle2 },
    pending: { label: 'Pending', variant: 'default', Icon: Clock },
    failed: { label: 'Failed', variant: 'destructive', Icon: XCircle },
};

type EmailStatusBadgeProps = {
    status?: EmailStatus;
    email?: Pick<
        EmailSummaryResponse | EmailDetailResponse,
        'classification' | 'finalClassification' | 'pipelineStatus'
    >;
    pipelineStatus?: PipelineStatus;
    className?: string;
};

export function EmailStatusBadge({
    status,
    email,
    pipelineStatus,
    className,
}: EmailStatusBadgeProps) {
    const resolved: EmailStatus =
        status ??
        (email
            ? deriveEmailStatus(email)
            : pipelineStatus === 'failed'
              ? 'failed'
              : 'pending');

    const meta = STATUS_META[resolved];
    const Icon = meta.Icon;

    return (
        <Badge variant={meta.variant} className={className}>
            <Icon />
            {meta.label}
        </Badge>
    );
}
