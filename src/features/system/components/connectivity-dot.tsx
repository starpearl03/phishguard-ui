'use client';

import { cn } from '@/src/lib/utils';
import { useHealth } from '../hooks/use-health';

type ConnectivityDotProps = {
    /** When true, hides the version label and only renders the dot. */
    compact?: boolean;
    className?: string;
};

/**
 * Renders a small green/amber/red dot reflecting the latest /health probe
 * result. Hover reveals the application + model version. Used in the sidebar
 * footer.
 */
export function ConnectivityDot({ compact = false, className }: ConnectivityDotProps) {
    const { data, isError, isPending, isFetching } = useHealth();

    let tone: 'ok' | 'pending' | 'error';
    if (isError) tone = 'error';
    else if (isPending) tone = 'pending';
    else tone = 'ok';

    const label =
        tone === 'ok'
            ? 'Backend reachable'
            : tone === 'pending'
              ? 'Checking backend…'
              : 'Backend unreachable';

    const tooltip = data
        ? `${label}\n${data.name} v${data.version}\nmodel: ${data.model_version}`
        : label;

    return (
        <div
            className={cn(
                'flex items-center gap-2 text-[11px] text-sidebar-foreground/60',
                className,
            )}
            title={tooltip}
            role="status"
            aria-label={label}
        >
            <span className="relative flex h-2 w-2 shrink-0">
                {tone === 'ok' && (
                    <span
                        aria-hidden
                        className={cn(
                            'absolute inline-flex h-full w-full rounded-full bg-emerald-500/50',
                            isFetching && 'animate-ping',
                        )}
                    />
                )}
                <span
                    aria-hidden
                    className={cn(
                        'relative inline-flex h-2 w-2 rounded-full',
                        tone === 'ok' && 'bg-emerald-500',
                        tone === 'pending' && 'bg-amber-500',
                        tone === 'error' && 'bg-destructive',
                    )}
                />
            </span>
            {!compact && (
                <span className="truncate">
                    {data?.version ? `v${data.version}` : label}
                </span>
            )}
        </div>
    );
}
