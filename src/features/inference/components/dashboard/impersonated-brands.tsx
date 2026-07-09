'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/shadcn/card';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { cn } from '@/src/lib/utils';
import { useImpersonatedBrands } from '../../hooks/use-stats';

export function ImpersonatedBrands() {
    const { data, isLoading } = useImpersonatedBrands({ limit: 10 });

    const max = data && data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top impersonated brands</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex flex-col gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-6 w-full" />
                        ))}
                    </div>
                ) : !data || data.length === 0 ? (
                    <div className="flex h-[180px] items-center justify-center text-xs text-muted-foreground">
                        No impersonation data
                    </div>
                ) : (
                    <ol className="flex flex-col divide-y divide-border/60">
                        {data.map((item, i) => {
                            const pct = Math.round((item.count / max) * 100);
                            return (
                                <li
                                    key={item.brand}
                                    className="flex items-center gap-3 py-1.5 first:pt-0 last:pb-0"
                                >
                                    {/* Rank */}
                                    <span className="w-4 shrink-0 text-right text-[0.625rem] tabular-nums text-muted-foreground">
                                        {i + 1}
                                    </span>

                                    {/* Bar + label */}
                                    <div className="relative min-w-0 flex-1">
                                        {/* background track */}
                                        <div className="h-5 w-full overflow-hidden rounded-sm bg-muted/60">
                                            {/* fill */}
                                            <div
                                                className="h-full rounded-sm bg-destructive/20 transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        {/* label overlay */}
                                        <span
                                            className={cn(
                                                'pointer-events-none absolute inset-0 flex items-center px-2',
                                                'text-[0.625rem] font-medium text-foreground',
                                            )}
                                        >
                                            {item.brand}
                                        </span>
                                    </div>

                                    {/* Count */}
                                    <span className="w-8 shrink-0 text-right text-[0.625rem] tabular-nums text-muted-foreground">
                                        {item.count}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                )}
            </CardContent>
        </Card>
    );
}
