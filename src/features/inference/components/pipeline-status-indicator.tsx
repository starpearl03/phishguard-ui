import { Check, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { PipelineStage, PipelineStatus } from '../api/inference.types';

type StageMeta = { key: PipelineStage; label: string };

const STAGES: StageMeta[] = [
    { key: 'queued', label: 'Queued' },
    { key: 'classification', label: 'Classify' },
    { key: 'link_resolution', label: 'Links' },
    { key: 'page_analysis', label: 'Pages' },
    { key: 'aggregation', label: 'Aggregate' },
    { key: 'done', label: 'Done' },
];

type StepState = 'complete' | 'active' | 'pending' | 'failed';

type PipelineStatusIndicatorProps = {
    stage: PipelineStage;
    status: PipelineStatus;
    error?: string | null;
    className?: string;
};

function resolveStepState(
    index: number,
    activeIndex: number,
    status: PipelineStatus,
): StepState {
    if (status === 'failed' && index === activeIndex) return 'failed';
    if (status === 'complete') return 'complete';
    if (index < activeIndex) return 'complete';
    if (index === activeIndex) return 'active';
    return 'pending';
}

const STEP_DOT: Record<StepState, string> = {
    complete: 'bg-emerald-500 text-white',
    active: 'bg-primary text-primary-foreground ring-4 ring-primary/15',
    pending: 'bg-muted text-muted-foreground',
    failed: 'bg-destructive text-destructive-foreground',
};

const STEP_LABEL: Record<StepState, string> = {
    complete: 'text-foreground/70',
    active: 'text-foreground font-medium',
    pending: 'text-muted-foreground',
    failed: 'text-destructive font-medium',
};

const CONNECTOR: Record<StepState, string> = {
    complete: 'bg-emerald-500',
    active: 'bg-muted',
    pending: 'bg-muted',
    failed: 'bg-muted',
};

export function PipelineStatusIndicator({
    stage,
    status,
    error,
    className,
}: PipelineStatusIndicatorProps) {
    const activeIndex = Math.max(
        0,
        STAGES.findIndex((s) => s.key === stage),
    );

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <div className="flex items-center">
                {STAGES.map((s, i) => {
                    const state = resolveStepState(i, activeIndex, status);
                    const isLast = i === STAGES.length - 1;

                    return (
                        <div key={s.key} className="flex flex-1 items-center last:flex-none">
                            <div className="flex flex-col items-center gap-1.5">
                                <div
                                    className={cn(
                                        'flex size-5 items-center justify-center rounded-full text-[0.625rem] font-medium transition-colors',
                                        STEP_DOT[state],
                                    )}
                                    aria-current={state === 'active' ? 'step' : undefined}
                                >
                                    {state === 'complete' ? (
                                        <Check className="size-3" />
                                    ) : state === 'failed' ? (
                                        <X className="size-3" />
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        'whitespace-nowrap text-[0.625rem] uppercase tracking-wider',
                                        STEP_LABEL[state],
                                    )}
                                >
                                    {s.label}
                                </span>
                            </div>
                            {!isLast && (
                                <div
                                    className={cn(
                                        '-mt-5 h-0.5 flex-1 transition-colors',
                                        CONNECTOR[state],
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            {status === 'failed' && error ? (
                <p className="text-xs text-destructive">{error}</p>
            ) : null}
        </div>
    );
}
