import { Sparkles } from 'lucide-react';
import { Badge } from '@/src/components/shadcn/badge';
import { cn } from '@/src/lib/utils';
import type { OverrideTrigger } from '../api/inference.types';

const TRIGGER_LABEL: Record<OverrideTrigger, string> = {
    page_high_risk: 'Page • High risk',
    page_medium_risk: 'Page • Medium risk',
    all_low: 'All pages low',
    all_failed: 'All pages failed',
    early_exit: 'Early exit',
};

type AggregationNoteBlockProps = {
    note: string | null;
    overrideTrigger?: OverrideTrigger | null;
    className?: string;
};

export function AggregationNoteBlock({
    note,
    overrideTrigger,
    className,
}: AggregationNoteBlockProps) {
    if (!note) {
        return (
            <div
                className={cn(
                    'rounded-md border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground',
                    className,
                )}
            >
                No aggregation note yet — either the pipeline is still running or
                stage-1 was conclusive.
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex flex-col gap-2 rounded-md bg-muted/40 p-3 ring-1 ring-foreground/10',
                className,
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="size-3" />
                    Aggregation note
                </div>
                {overrideTrigger ? (
                    <Badge variant="info">{TRIGGER_LABEL[overrideTrigger]}</Badge>
                ) : null}
            </div>
            <p className="text-xs/relaxed whitespace-pre-wrap text-foreground/90">
                {note}
            </p>
        </div>
    );
}
