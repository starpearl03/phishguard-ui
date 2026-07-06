'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/src/components/shadcn/card';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { useSummaryStats } from '../../hooks/use-stats';

type SliceKey = 'phishing' | 'suspicious' | 'legitimate' | 'pending';

const SLICE_COLORS: Record<SliceKey, string> = {
    phishing: '#ef4444',
    suspicious: '#f59e0b',
    legitimate: '#10b981',
    pending: '#94a3b8',
};

const SLICE_LABELS: Record<SliceKey, string> = {
    phishing: 'Phishing',
    suspicious: 'Suspicious',
    legitimate: 'Legitimate',
    pending: 'Pending',
};

const ORDER: SliceKey[] = ['phishing', 'suspicious', 'legitimate', 'pending'];

export function ClassificationDonut() {
    const { data, isLoading } = useSummaryStats();

    const counts = data?.byClassification;
    const slices = counts
        ? ORDER.map((key) => ({
              key,
              name: SLICE_LABELS[key],
              value: counts[key],
          })).filter((s) => s.value > 0)
        : [];

    const total = slices.reduce((acc, s) => acc + s.value, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Classification breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-[220px] w-full" />
                ) : total === 0 ? (
                    <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">
                        No classifications yet
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--card)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            padding: '6px 10px',
                                            color: 'var(--card-foreground)',
                                        }}
                                        formatter={(value, name) => {
                                            const n = Number(value);
                                            return [
                                                `${n.toLocaleString()} (${Math.round((n / total) * 100)}%)`,
                                                name,
                                            ];
                                        }}
                                    />
                                    <Pie
                                        data={slices}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="62%"
                                        outerRadius="90%"
                                        paddingAngle={2}
                                        strokeWidth={0}
                                    >
                                        {slices.map((s) => (
                                            <Cell
                                                key={s.key}
                                                fill={SLICE_COLORS[s.key]}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-semibold tabular-nums text-foreground">
                                    {total.toLocaleString()}
                                </span>
                                <span className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
                                    Total
                                </span>
                            </div>
                        </div>

                        <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
                            {slices.map((s) => (
                                <li
                                    key={s.key}
                                    className="flex items-center gap-1.5 text-[0.625rem]"
                                >
                                    <span
                                        className="size-2 shrink-0 rounded-full"
                                        style={{ background: SLICE_COLORS[s.key] }}
                                    />
                                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                                        {s.name}
                                    </span>
                                    <span className="tabular-nums font-medium text-foreground">
                                        {Math.round((s.value / total) * 100)}%
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
