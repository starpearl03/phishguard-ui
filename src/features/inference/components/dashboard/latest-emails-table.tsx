'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Inbox } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/src/components/shadcn/card';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { cn } from '@/src/lib/utils';
import { usePredictionHistory } from '../../hooks/use-inference';
import { EmailStatusBadge, deriveEmailStatus } from '../email-status-badge';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const TH =
    'px-3 py-2 text-left text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap';
const TD = 'px-3 py-2 text-xs align-middle';

// ─── Table ────────────────────────────────────────────────────────────────────

export function LatestEmailsTable() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { data, isLoading } = usePredictionHistory({
        page: 1,
        pageSize: 10,
    });
    const rows = data?.items ?? [];

    function goToDetail(id: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', 'detail');
        params.set('id', id);
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <Card className="gap-0 py-0">
            <CardHeader className="border-b border-border/60 py-3">
                <CardTitle>Latest activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] border-collapse">
                        <thead>
                            <tr className="border-b border-border/60 bg-muted/30">
                                <th className={cn(TH, 'w-[200px]')}>Sender</th>
                                <th className={cn(TH)}>Subject</th>
                                <th className={cn(TH, 'w-[120px]')}>
                                    Classification
                                </th>
                                <th className={cn(TH, 'w-[90px] text-right')}>
                                    Confidence
                                </th>
                                <th className={cn(TH, 'w-[120px]')}>Received</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <td key={j} className={TD}>
                                                <Skeleton
                                                    className={cn(
                                                        'h-4',
                                                        j === 1
                                                            ? 'w-full'
                                                            : j === 0
                                                              ? 'w-40'
                                                              : 'w-16',
                                                    )}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="flex flex-col items-center gap-2 py-12 text-center">
                                            <Inbox className="size-8 text-muted-foreground/40" />
                                            <p className="text-xs text-muted-foreground">
                                                No emails yet
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                rows.map((email) => {
                                    const confidence = fmtConfidence(
                                        email.finalConfidence ?? email.confidence,
                                    );
                                    const hasConfidence =
                                        (email.finalConfidence ?? email.confidence) != null;
                                    return (
                                        <tr
                                            key={email.id}
                                            onClick={() => goToDetail(email.id)}
                                            className="cursor-pointer transition-colors hover:bg-muted/30"
                                        >
                                            <td className={cn(TD, 'max-w-[200px]')}>
                                                <span
                                                    className="block truncate"
                                                    title={email.sender}
                                                >
                                                    {email.sender}
                                                </span>
                                            </td>
                                            <td className={cn(TD, 'max-w-0')}>
                                                <span
                                                    className="block truncate"
                                                    title={email.subject}
                                                >
                                                    {email.subject}
                                                </span>
                                            </td>
                                            <td className={TD}>
                                                <EmailStatusBadge
                                                    status={deriveEmailStatus(email)}
                                                />
                                            </td>
                                            <td
                                                className={cn(
                                                    TD,
                                                    'text-right tabular-nums',
                                                    hasConfidence
                                                        ? 'text-foreground'
                                                        : 'text-muted-foreground',
                                                )}
                                            >
                                                {confidence}
                                            </td>
                                            <td
                                                className={cn(
                                                    TD,
                                                    'tabular-nums text-muted-foreground',
                                                )}
                                            >
                                                {fmtDate(email.receivedAt)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
