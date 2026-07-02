import { cn } from '@/src/lib/utils';

type Tone = 'destructive' | 'warning' | 'success' | 'muted';

type ConfidenceBarProps = {
    /** Confidence 0–1 (nullable — renders empty bar with "—"). */
    value: number | null;
    /**
     * Optional override. Defaults to `auto`, which colours the bar by the
     * classification it represents — callers can force a neutral tone instead.
     */
    tone?: Tone | 'auto';
    /** Classification the confidence refers to, when `tone="auto"`. */
    classification?: 'phishing' | 'suspicious' | 'legitimate' | null;
    label?: string;
    className?: string;
};

const TONE_CLASS: Record<Tone, string> = {
    destructive: 'bg-destructive',
    warning: 'bg-amber-500',
    success: 'bg-emerald-500',
    muted: 'bg-muted-foreground/40',
};

function resolveTone(tone: ConfidenceBarProps['tone'], classification: ConfidenceBarProps['classification']): Tone {
    if (tone && tone !== 'auto') return tone;
    switch (classification) {
        case 'phishing':
            return 'destructive';
        case 'suspicious':
            return 'warning';
        case 'legitimate':
            return 'success';
        default:
            return 'muted';
    }
}

export function ConfidenceBar({
    value,
    tone = 'auto',
    classification,
    label,
    className,
}: ConfidenceBarProps) {
    const resolved = resolveTone(tone, classification);
    const pct = value == null ? 0 : Math.max(0, Math.min(1, value)) * 100;
    const display = value == null ? '—' : `${Math.round(pct)}%`;

    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <div className="flex items-baseline justify-between text-[0.625rem] uppercase tracking-wider text-muted-foreground">
                <span>{label ?? 'Confidence'}</span>
                <span className="tabular-nums text-foreground">{display}</span>
            </div>
            <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={value == null ? undefined : pct}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className={cn('h-full rounded-full transition-all', TONE_CLASS[resolved])}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
