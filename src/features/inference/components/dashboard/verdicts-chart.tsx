'use client';

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/src/components/shadcn/card';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { cn } from '@/src/lib/utils';
import { useVerdictsOverTime } from '../../hooks/use-stats';
import type { VerdictBucketGranularity } from '../../api/inference.types';

// Chart palette — explicit colours that hold in both light and dark
const C = {
    phishing: '#ef4444',
    suspicious: '#f59e0b',
    legitimate: '#10b981',
    axis: 'hsl(215 13% 60%)',
    grid: 'hsl(215 13% 88% / 0.4)',
} as const;

function fmtBucket(bucket: string, period: VerdictBucketGranularity): string {
    // Weekly: "2024-W03" → "W03"
    if (period === 'week' && bucket.includes('-W')) {
        return `W${bucket.split('-W')[1]}`;
    }
    // Daily / fallback: "2024-01-05" → "Jan 5"
    try {
        const d = new Date(bucket);
        if (!isNaN(d.getTime())) {
            return new Intl.DateTimeFormat('en', {
                month: 'short',
                day: 'numeric',
            }).format(d);
        }
    } catch {
        // pass
    }
    return bucket;
}

function numFmt(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// ─── Period toggle ────────────────────────────────────────────────────────────

type PeriodToggleProps = {
    value: VerdictBucketGranularity;
    onChange: (p: VerdictBucketGranularity) => void;
};

function PeriodToggle({ value, onChange }: PeriodToggleProps) {
    const options: { label: string; value: VerdictBucketGranularity }[] = [
        { label: 'Daily', value: 'day' },
        { label: 'Weekly', value: 'week' },
    ];

    return (
        <div
            role="group"
            aria-label="Chart period"
            className="inline-flex items-center rounded-md border border-border bg-muted/40 p-0.5"
        >
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    aria-pressed={value === opt.value}
                    className={cn(
                        'rounded-sm px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-wider transition-colors',
                        value === opt.value
                            ? 'bg-card text-foreground shadow-sm ring-1 ring-border/60'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

// ─── Inline legend ────────────────────────────────────────────────────────────

function Legend() {
    const items = [
        { label: 'Phishing', color: C.phishing },
        { label: 'Suspicious', color: C.suspicious },
        { label: 'Legitimate', color: C.legitimate },
    ];
    return (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            {items.map((l) => (
                <div
                    key={l.label}
                    className="flex items-center gap-1.5 text-[0.625rem] text-muted-foreground"
                >
                    <span
                        className="size-2 rounded-full"
                        style={{ background: l.color }}
                    />
                    {l.label}
                </div>
            ))}
        </div>
    );
}

// ─── Chart ────────────────────────────────────────────────────────────────────

type VerdictsChartProps = {
    period: VerdictBucketGranularity;
    onPeriodChange: (p: VerdictBucketGranularity) => void;
};

export function VerdictsChart({ period, onPeriodChange }: VerdictsChartProps) {
    const { data, isLoading } = useVerdictsOverTime({ bucket: period });

    const chartData = (data ?? []).map((d) => ({
        ...d,
        label: fmtBucket(d.bucket, period),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Verdicts over time</CardTitle>
                <CardAction>
                    <PeriodToggle value={period} onChange={onPeriodChange} />
                </CardAction>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-[240px] w-full" />
                ) : chartData.length === 0 ? (
                    <div className="flex h-[240px] items-center justify-center text-xs text-muted-foreground">
                        No data for this period
                    </div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart
                                data={chartData}
                                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke={C.grid}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 10, fill: C.axis }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: C.axis }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={numFmt}
                                    width={32}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--card)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        padding: '6px 10px',
                                        color: 'var(--card-foreground)',
                                    }}
                                    cursor={{
                                        stroke: 'var(--border)',
                                        strokeWidth: 1,
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="phishing"
                                    name="Phishing"
                                    stroke={C.phishing}
                                    strokeWidth={2}
                                    dot={{ r: 3, strokeWidth: 0, fill: C.phishing }}
                                    activeDot={{ r: 5 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="suspicious"
                                    name="Suspicious"
                                    stroke={C.suspicious}
                                    strokeWidth={2}
                                    dot={{ r: 3, strokeWidth: 0, fill: C.suspicious }}
                                    activeDot={{ r: 5 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="legitimate"
                                    name="Legitimate"
                                    stroke={C.legitimate}
                                    strokeWidth={2}
                                    dot={{ r: 3, strokeWidth: 0, fill: C.legitimate }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        <Legend />
                    </>
                )}
            </CardContent>
        </Card>
    );
}
