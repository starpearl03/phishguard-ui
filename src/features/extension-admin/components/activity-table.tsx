'use client';

import { Activity as ActivityIcon } from 'lucide-react';
import { Badge } from '@/src/components/shadcn/badge';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { cn } from '@/src/lib/utils';
import type { AnalyseEventResponse } from '../api/extension-admin.types';

const TH = 'px-3 py-2 text-left text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap';
const TD = 'px-3 py-2 text-xs align-middle';

function fmtDate(iso: string): string {
    try {
        return new Intl.DateTimeFormat('en', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function fmtConfidence(v: number): string {
    return `${Math.round(v * 100)}%`;
}

function labelVariant(label: string): 'destructive' | 'success' | 'warning' | 'default' {
    switch (label) {
        case 'SPAM':
            return 'destructive';
        case 'NOT_SPAM':
            return 'success';
        case 'REVIEW':
            return 'warning';
        default:
            return 'default';
    }
}

function SkeletonRows() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border/60">
                    {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className={TD}>
                            <Skeleton className={cn('h-4', j === 0 ? 'w-32' : 'w-20')} />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

function EmptyState() {
    return (
        <tr>
            <td colSpan={5}>
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <ActivityIcon className="size-7 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-foreground">No activity yet</p>
                    <p className="text-xs text-muted-foreground">
                        This install has not made any analysis requests.
                    </p>
                </div>
            </td>
        </tr>
    );
}

type ActivityTableProps = {
    rows: AnalyseEventResponse[] | undefined;
    isLoading: boolean;
};

export function ActivityTable({ rows, isLoading }: ActivityTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg ring-1 ring-foreground/10">
            <table className="w-full min-w-[640px] border-collapse bg-card text-card-foreground">
                <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                        <th className={cn(TH, 'w-[160px]')}>When</th>
                        <th className={cn(TH, 'w-[100px]')}>Label</th>
                        <th className={cn(TH, 'w-[80px] text-right')}>Conf</th>
                        <th className={cn(TH, 'w-[80px] text-right')}>Latency</th>
                        <th className={cn(TH)}>Model</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                    {isLoading ? (
                        <SkeletonRows />
                    ) : !rows || rows.length === 0 ? (
                        <EmptyState />
                    ) : (
                        rows.map((event) => (
                            <tr key={event.id} className="transition-colors hover:bg-muted/30">
                                <td className={cn(TD, 'tabular-nums text-muted-foreground')}>
                                    {fmtDate(event.createdAt)}
                                </td>
                                <td className={TD}>
                                    <Badge variant={labelVariant(event.predictedLabel)}>
                                        {event.predictedLabel}
                                    </Badge>
                                </td>
                                <td className={cn(TD, 'text-right tabular-nums')}>
                                    {fmtConfidence(event.confidenceScore)}
                                </td>
                                <td
                                    className={cn(
                                        TD,
                                        'text-right tabular-nums text-muted-foreground',
                                    )}
                                >
                                    {event.latencyMs}ms
                                </td>
                                <td className={cn(TD, 'font-mono text-[0.7rem]')}>
                                    {event.modelVersion}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
