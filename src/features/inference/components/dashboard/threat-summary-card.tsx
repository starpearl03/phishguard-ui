'use client';

import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/src/components/shadcn/card';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import {
    useImpersonatedBrands,
    useVerdictsOverTime,
} from '../../hooks/use-stats';
import { usePredictionHistory } from '../../hooks/use-inference';
import type {
    EmailSummaryResponse,
    VerdictBucketResponse,
} from '../../api/inference.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatHour(h: number): string {
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12} ${suffix}`;
}

function todayIsoDate(): string {
    // Local ISO date: "2026-04-17"
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function getTodayBucket(
    buckets: VerdictBucketResponse[] | undefined,
): VerdictBucketResponse | null {
    if (!buckets || buckets.length === 0) return null;
    const today = todayIsoDate();
    return buckets.find((b) => b.bucket.startsWith(today)) ?? null;
}

function computePeakHour(emails: EmailSummaryResponse[]): number | null {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayStart.getDate() + 1);

    const byHour = new Map<number, number>();
    for (const e of emails) {
        const d = new Date(e.receivedAt);
        if (isNaN(d.getTime())) continue;
        if (d < todayStart || d >= todayEnd) continue;
        byHour.set(d.getHours(), (byHour.get(d.getHours()) ?? 0) + 1);
    }

    if (byHour.size === 0) return null;

    let peak = -1;
    let peakCount = 0;
    for (const [h, c] of byHour) {
        if (c > peakCount) {
            peak = h;
            peakCount = c;
        }
    }

    // Require at least two events before calling it a "peak" — otherwise
    // the single timestamp is just "the only activity", not a peak.
    if (peakCount < 2) return null;
    return peak;
}

function buildSummary(params: {
    todayPhishing: number;
    todaySuspicious: number;
    todayLegitimate: number;
    topBrand: string | null;
    peakHour: number | null;
}): string {
    const {
        todayPhishing,
        todaySuspicious,
        todayLegitimate,
        topBrand,
        peakHour,
    } = params;
    const sentences: string[] = [];

    const hasAnyToday =
        todayPhishing + todaySuspicious + todayLegitimate > 0;

    if (todayPhishing > 0) {
        sentences.push(
            `${todayPhishing} phishing ${todayPhishing === 1 ? 'threat' : 'threats'} detected today.`,
        );
    } else if (todaySuspicious > 0) {
        sentences.push(
            `${todaySuspicious} suspicious ${todaySuspicious === 1 ? 'email' : 'emails'} flagged today — no confirmed phishing.`,
        );
    } else if (hasAnyToday) {
        sentences.push(
            `${todayLegitimate} legitimate ${todayLegitimate === 1 ? 'email' : 'emails'} processed today — no threats.`,
        );
    } else {
        sentences.push('No emails processed today yet.');
    }

    if (topBrand) {
        sentences.push(`Most impersonated brand: ${topBrand}.`);
    }

    if (peakHour != null) {
        sentences.push(`Activity peaked around ${formatHour(peakHour)}.`);
    }

    return sentences.join(' ');
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function ThreatSummaryCard() {
    const verdicts = useVerdictsOverTime({ bucket: 'day' });
    const brands = useImpersonatedBrands({ limit: 10 });
    const history = usePredictionHistory({ page: 1, pageSize: 10 });

    const isLoading =
        verdicts.isLoading || brands.isLoading || history.isLoading;

    const todayBucket = getTodayBucket(verdicts.data);
    const topBrand = brands.data?.[0]?.brand ?? null;
    const peakHour = history.data ? computePeakHour(history.data.items) : null;

    const summary = buildSummary({
        todayPhishing: todayBucket?.phishing ?? 0,
        todaySuspicious: todayBucket?.suspicious ?? 0,
        todayLegitimate: todayBucket?.legitimate ?? 0,
        topBrand,
        peakHour,
    });

    const hasThreats = (todayBucket?.phishing ?? 0) > 0;
    const accentClass = hasThreats
        ? 'bg-destructive/10 text-destructive'
        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';

    return (
        <Card>
            <CardContent className="flex items-start gap-4 py-4">
                <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accentClass}`}
                >
                    <ShieldAlert className="size-5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
                        Today&apos;s snapshot
                    </p>
                    {isLoading ? (
                        <Skeleton className="h-4 w-3/4" />
                    ) : (
                        <p className="text-sm/relaxed text-foreground">{summary}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
