'use client';

import Link from 'next/link';
import { ArrowRight, Inbox } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/src/components/shadcn/card';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { usePredictionHistory } from '../../hooks/use-inference';
import { EmailStatusBadge, deriveEmailStatus } from '../email-status-badge';

const PANEL_LIMIT = 7;

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

export function RecentHistoryPanel() {
    const { data, isLoading } = usePredictionHistory({
        page: 1,
        pageSize: PANEL_LIMIT,
    });
    const items = data?.items ?? [];

    return (
        <Card className="gap-0 py-0">
            <CardHeader className="border-b border-border/60 py-3">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Recent activity
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col p-0">
                {isLoading ? (
                    <ul className="flex flex-col divide-y divide-border/60">
                        {Array.from({ length: PANEL_LIMIT }).map((_, i) => (
                            <li key={i} className="flex flex-col gap-1.5 px-3 py-2.5">
                                <div className="flex items-center justify-between gap-2">
                                    <Skeleton className="h-3 w-32" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-4 w-20" />
                            </li>
                        ))}
                    </ul>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
                        <Inbox className="size-7 text-muted-foreground/40" />
                        <p className="text-xs text-muted-foreground">
                            No emails yet
                        </p>
                    </div>
                ) : (
                    <ul className="flex flex-col divide-y divide-border/60">
                        {items.map((email) => (
                            <li
                                key={email.id}
                                className="flex flex-col gap-1 px-3 py-2.5"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span
                                        className="min-w-0 flex-1 truncate text-xs font-medium text-foreground"
                                        title={email.sender}
                                    >
                                        {email.sender}
                                    </span>
                                    <span className="shrink-0 text-[0.625rem] tabular-nums text-muted-foreground">
                                        {fmtDate(email.receivedAt)}
                                    </span>
                                </div>
                                <p
                                    className="truncate text-xs text-muted-foreground"
                                    title={email.subject}
                                >
                                    {email.subject}
                                </p>
                                <div className="flex">
                                    <EmailStatusBadge
                                        status={deriveEmailStatus(email)}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>

            <div className="border-t border-border/60 px-3 py-2.5">
                <Link
                    href="/inference?tab=history"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                    View all history
                    <ArrowRight className="size-3" />
                </Link>
            </div>
        </Card>
    );
}
