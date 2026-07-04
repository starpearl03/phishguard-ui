'use client';

import { AlertTriangle, CheckCircle2, Clock, Mail, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/src/components/shadcn/card';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { useSummaryStats } from '../../hooks/use-stats';

type StatMeta = {
    key: 'total' | 'phishing' | 'suspicious' | 'legitimate' | 'pending';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
};

const STATS: StatMeta[] = [
    { key: 'total',      label: 'Total',      icon: Mail,         iconClass: 'text-foreground/60' },
    { key: 'phishing',   label: 'Phishing',   icon: ShieldAlert,  iconClass: 'text-destructive' },
    { key: 'suspicious', label: 'Suspicious', icon: AlertTriangle, iconClass: 'text-amber-500' },
    { key: 'legitimate', label: 'Legitimate', icon: CheckCircle2, iconClass: 'text-emerald-500' },
    { key: 'pending',    label: 'Pending',    icon: Clock,        iconClass: 'text-muted-foreground' },
];

export function StatCards() {
    const { data, isLoading, isError } = useSummaryStats();

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-[72px]" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} size="sm">
                        <CardContent className="flex h-[72px] items-center justify-center text-xs text-muted-foreground">
                            —
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const counts = {
        total:      data?.total ?? 0,
        phishing:   data?.byClassification.phishing ?? 0,
        suspicious: data?.byClassification.suspicious ?? 0,
        legitimate: data?.byClassification.legitimate ?? 0,
        pending:    data?.byClassification.pending ?? 0,
    };

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {STATS.map(({ key, label, icon: Icon, iconClass }) => (
                <Card key={key} size="sm">
                    <CardContent className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
                            <Icon className={`size-3 shrink-0 ${iconClass}`} />
                            {label}
                        </div>
                        <span className="text-2xl font-semibold tabular-nums text-foreground">
                            {counts[key].toLocaleString()}
                        </span>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
