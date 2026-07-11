'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Inbox } from 'lucide-react';
import { Badge } from '@/src/components/shadcn/badge';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { cn } from '@/src/lib/utils';
import { useAuthStore, selectUser } from '@/src/features/auth/stores/auth.store';
import type { EmailSummaryResponse, OverrideTrigger } from '../../api/inference.types';
import { EmailStatusBadge, deriveEmailStatus } from '../email-status-badge';
import { RowActions } from './row-actions';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
    try {
        return new Intl.DateTimeFormat('en', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function fmtConfidence(v: number | null): string {
    if (v == null) return '—';
    return `${Math.round(v * 100)}%`;
}

const TRIGGER_SHORT: Record<OverrideTrigger, string> = {
    page_high_risk:   'High risk',
    page_medium_risk: 'Med risk',
    all_low:          'All low',
    all_failed:       'All failed',
    early_exit:       'Early exit',
};

// ─── Header / cell shared classes ────────────────────────────────────────────

const TH = 'px-3 py-2 text-left text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap';
const TD = 'px-3 py-2 text-xs align-middle';

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRows() {
    return (
        <>
            {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-border/60">
                    {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className={TD}>
                            <Skeleton
                                className={cn(
                                    'h-4',
                                    j === 2 ? 'w-40' : j === 1 ? 'w-32' : 'w-16',
                                )}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
    return (
        <tr>
            <td colSpan={9}>
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                    <Inbox className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-foreground">No emails found</p>
                    <p className="text-xs text-muted-foreground">
                        {hasFilters
                            ? 'Try adjusting or clearing your filters.'
                            : 'No emails have been submitted yet.'}
                    </p>
                </div>
            </td>
        </tr>
    );
}

// ─── Main table ───────────────────────────────────────────────────────────────

type HistoryTableProps = {
    rows: EmailSummaryResponse[] | undefined;
    isLoading: boolean;
    hasFilters: boolean;
};

export function HistoryTable({ rows, isLoading, hasFilters }: HistoryTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const user = useAuthStore(selectUser);
    const isAdmin = user?.role === 'ADMIN';

    function goToDetail(id: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', 'detail');
        params.set('id', id);
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="overflow-x-auto rounded-lg ring-1 ring-foreground/10">
            <table className="w-full min-w-[860px] border-collapse bg-card text-card-foreground">
                <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                        <th className={cn(TH, 'w-[120px]')}>Received</th>
                        <th className={cn(TH, 'w-[160px]')}>Sender</th>
                        <th className={cn(TH)}>Subject</th>
                        <th className={cn(TH, 'w-[100px]')}>Initial</th>
                        <th className={cn(TH, 'w-[100px]')}>Final</th>
                        <th className={cn(TH, 'w-[56px] text-right')}>Conf</th>
                        <th className={cn(TH, 'w-[96px]')}>Trigger</th>
                        <th className={cn(TH, 'w-[96px]')}>Status</th>
                        <th className={cn(TH, 'w-[44px]')} />
                    </tr>
                </thead>

                <tbody className="divide-y divide-border/60">
                    {isLoading ? (
                        <SkeletonRows />
                    ) : !rows || rows.length === 0 ? (
                        <EmptyState hasFilters={hasFilters} />
                    ) : (
                        rows.map((email) => {
                            const derivedStatus = deriveEmailStatus(email);
                            const confidence = fmtConfidence(
                                email.finalConfidence ?? email.confidence,
                            );

                            return (
                                <tr
                                    key={email.id}
                                    onClick={() => goToDetail(email.id)}
                                    className="cursor-pointer transition-colors hover:bg-muted/30"
                                >
                                    {/* Received */}
                                    <td className={cn(TD, 'tabular-nums text-muted-foreground')}>
                                        {fmtDate(email.receivedAt)}
                                    </td>

                                    {/* Sender */}
                                    <td className={cn(TD, 'max-w-[160px]')}>
                                        <span className="block truncate" title={email.sender}>
                                            {email.sender}
                                        </span>
                                    </td>

                                    {/* Subject */}
                                    <td className={cn(TD, 'max-w-0')}>
                                        <span
                                            className="block truncate"
                                            title={email.subject}
                                        >
                                            {email.subject}
                                        </span>
                                    </td>

                                    {/* Initial classification */}
                                    <td className={TD}>
                                        {email.classification ? (
                                            <EmailStatusBadge status={email.classification} />
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>

                                    {/* Final classification */}
                                    <td className={TD}>
                                        {email.finalClassification ? (
                                            <EmailStatusBadge
                                                status={email.finalClassification}
                                            />
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>

                                    {/* Confidence */}
                                    <td
                                        className={cn(
                                            TD,
                                            'text-right tabular-nums',
                                            email.finalConfidence == null && email.confidence == null
                                                ? 'text-muted-foreground'
                                                : 'text-foreground',
                                        )}
                                    >
                                        {confidence}
                                    </td>

                                    {/* Override trigger */}
                                    <td className={TD}>
                                        {email.overrideTrigger ? (
                                            <Badge variant="info">
                                                {TRIGGER_SHORT[email.overrideTrigger]}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>

                                    {/* Pipeline status */}
                                    <td className={TD}>
                                        <EmailStatusBadge status={derivedStatus} />
                                    </td>

                                    {/* Actions */}
                                    <td
                                        className={cn(TD, 'text-right')}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <RowActions email={email} isAdmin={isAdmin} />
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
