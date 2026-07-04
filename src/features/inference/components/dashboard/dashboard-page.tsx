'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import type { VerdictBucketGranularity } from '../../api/inference.types';
import { StatCards } from './stat-cards';
import { ThreatSummaryCard } from './threat-summary-card';
import { VerdictsChart } from './verdicts-chart';
import { ClassificationDonut } from './classification-donut';
import { ImpersonatedBrands } from './impersonated-brands';
import { OverrideTriggersChart } from './override-triggers-chart';
import { LatestEmailsTable } from './latest-emails-table';

// ─── Breadcrumb ──────────────────────────────────────────────────────────────

function Breadcrumb() {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-muted-foreground"
        >
            <span className="font-medium text-foreground">Inference</span>
            <ChevronRight className="size-3 shrink-0" />
            <span>Dashboard</span>
        </nav>
    );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

export function InferenceDashboardPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const period: VerdictBucketGranularity =
        (searchParams.get('period') as VerdictBucketGranularity | null) === 'week'
            ? 'week'
            : 'day';

    function setPeriod(next: VerdictBucketGranularity) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('period', next);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }

    return (
        <div className="flex flex-col gap-4 p-4 sm:p-6">
            {/* ── Page header ─────────────────────────────────────── */}
            <div className="flex flex-col gap-1">
                <Breadcrumb />
                <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            </div>

            {/* ── Stats strip ─────────────────────────────────────── */}
            <StatCards />

            {/* ── Narrative snapshot ──────────────────────────────── */}
            <ThreatSummaryCard />

            {/* ── Verdicts trend (hero chart) ─────────────────────── */}
            <VerdictsChart period={period} onPeriodChange={setPeriod} />

            {/* ── Analytical row ──────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <ClassificationDonut />
                <ImpersonatedBrands />
                <OverrideTriggersChart />
            </div>

            {/* ── Latest activity ─────────────────────────────────── */}
            <LatestEmailsTable />
        </div>
    );
}
