import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Badge } from '@/src/components/shadcn/badge';
import type { RiskLevel } from '../api/inference.types';

const RISK_META: Record<
    RiskLevel,
    {
        label: string;
        variant: React.ComponentProps<typeof Badge>['variant'];
        Icon: React.ComponentType<{ className?: string }>;
    }
> = {
    high: { label: 'High', variant: 'destructive', Icon: ShieldAlert },
    medium: { label: 'Medium', variant: 'warning', Icon: AlertTriangle },
    low: { label: 'Low', variant: 'success', Icon: ShieldCheck },
};

type RiskLevelBadgeProps = {
    level: RiskLevel | null;
    className?: string;
};

export function RiskLevelBadge({ level, className }: RiskLevelBadgeProps) {
    if (!level) {
        return (
            <Badge variant="outline" className={className}>
                Unknown
            </Badge>
        );
    }

    const meta = RISK_META[level];
    const Icon = meta.Icon;

    return (
        <Badge variant={meta.variant} className={className}>
            <Icon />
            {meta.label}
        </Badge>
    );
}
