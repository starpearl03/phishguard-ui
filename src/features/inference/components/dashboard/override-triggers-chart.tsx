'use client';

import {
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/shadcn/card';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { useOverrideTriggers } from '../../hooks/use-stats';
import type { OverrideTrigger } from '../../api/inference.types';

const TRIGGER_LABEL: Record<OverrideTrigger, string> = {
    page_high_risk:   'Page high risk',
    page_medium_risk: 'Page medium risk',
    all_low:          'All pages low',
    all_failed:       'All pages failed',
    early_exit:       'Early exit',
};

const TRIGGER_COLOR: Record<OverrideTrigger, string> = {
    page_high_risk:   '#ef4444',
    page_medium_risk: '#f59e0b',
    all_low:          '#10b981',
    all_failed:       '#6b7280',
    early_exit:       '#6366f1',
};

const AXIS = 'hsl(215 13% 60%)';

export function OverrideTriggersChart() {
    const { data, isLoading } = useOverrideTriggers();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Override triggers</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-[180px] w-full" />
                ) : !data || data.length === 0 ? (
                    <div className="flex h-[180px] items-center justify-center text-xs text-muted-foreground">
                        No override trigger data
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart
                            layout="vertical"
                            data={data.map((d) => ({
                                label: TRIGGER_LABEL[d.trigger] ?? d.trigger,
                                count: d.count,
                                trigger: d.trigger,
                            }))}
                            margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                            barCategoryGap="30%"
                        >
                            <XAxis
                                type="number"
                                tick={{ fontSize: 10, fill: AXIS }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="label"
                                tick={{ fontSize: 10, fill: AXIS }}
                                axisLine={false}
                                tickLine={false}
                                width={110}
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
                                cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                                formatter={(value) => [value, 'Count']}
                            />
                            <Bar dataKey="count" name="Count" radius={[0, 3, 3, 0]}>
                                {data.map((d) => (
                                    <Cell
                                        key={d.trigger}
                                        fill={TRIGGER_COLOR[d.trigger] ?? '#94a3b8'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
