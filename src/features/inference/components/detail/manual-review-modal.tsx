'use client';

import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/shadcn/button';
import { Label } from '@/src/components/shadcn/label';
import { cn } from '@/src/lib/utils';
import { useManualReview } from '../../hooks/use-inference';
import type { Classification } from '../../api/inference.types';

const SELECT_CLS =
    'h-7 w-full rounded-md border border-input bg-input/20 px-2 py-0.5 text-xs/relaxed ' +
    'outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 ' +
    'focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 ' +
    'dark:bg-input/30 text-foreground';

const TEXTAREA_CLS =
    'w-full rounded-md border border-input bg-input/20 px-2 py-1.5 text-xs/relaxed ' +
    'transition-colors outline-none resize-none placeholder:text-muted-foreground ' +
    'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 ' +
    'disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30';

type ManualReviewModalProps = {
    emailId: string;
    open: boolean;
    onClose: () => void;
};

export function ManualReviewModal({ emailId, open, onClose }: ManualReviewModalProps) {
    const [note, setNote] = useState('');
    const [overrideClass, setOverrideClass] = useState<Classification | ''>('');
    const [noteError, setNoteError] = useState('');
    const manualReview = useManualReview();

    function resetForm() {
        setNote('');
        setOverrideClass('');
        setNoteError('');
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!note.trim()) {
            setNoteError('Note is required');
            return;
        }
        setNoteError('');
        manualReview.mutate(
            {
                id: emailId,
                data: {
                    note: note.trim(),
                    ...(overrideClass ? { overrideClassification: overrideClass } : {}),
                },
            },
            {
                onSuccess: () => {
                    toast.success('Manual review saved');
                    resetForm();
                    onClose();
                },
                onError: (err) => toast.error(err.getMessage()),
            },
        );
    }

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(o) => {
                if (!o && !manualReview.isPending) {
                    resetForm();
                    onClose();
                }
            }}
        >
            <Dialog.Portal>
                {/* Overlay */}
                <Dialog.Overlay
                    className={cn(
                        'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm',
                        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
                        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
                    )}
                />

                {/* Panel */}
                <Dialog.Content
                    className={cn(
                        'fixed left-1/2 top-1/2 z-50 w-full max-w-md',
                        '-translate-x-1/2 -translate-y-1/2',
                        'rounded-lg bg-card p-5 shadow-xl ring-1 ring-foreground/10',
                        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                    )}
                    aria-describedby={undefined}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3">
                        <Dialog.Title className="text-sm font-semibold text-foreground">
                            Manual review
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Close"
                                disabled={manualReview.isPending}
                            >
                                <X />
                            </Button>
                        </Dialog.Close>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                        {/* Note */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="review-note">
                                Review note
                                <span className="ml-1 text-destructive">*</span>
                            </Label>
                            <textarea
                                id="review-note"
                                rows={4}
                                value={note}
                                onChange={(e) => {
                                    setNote(e.target.value);
                                    if (noteError) setNoteError('');
                                }}
                                placeholder="Describe the outcome of this review…"
                                disabled={manualReview.isPending}
                                aria-invalid={!!noteError}
                                className={cn(
                                    TEXTAREA_CLS,
                                    noteError &&
                                        'border-destructive ring-2 ring-destructive/20',
                                )}
                            />
                            {noteError && (
                                <p className="text-xs text-destructive">{noteError}</p>
                            )}
                        </div>

                        {/* Override classification */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="review-override">
                                Override classification
                                <span className="ml-2 text-[0.625rem] font-normal text-muted-foreground">
                                    optional
                                </span>
                            </Label>
                            <select
                                id="review-override"
                                value={overrideClass}
                                onChange={(e) =>
                                    setOverrideClass(e.target.value as Classification | '')
                                }
                                disabled={manualReview.isPending}
                                className={SELECT_CLS}
                            >
                                <option value="">— No override —</option>
                                <option value="phishing">Phishing</option>
                                <option value="suspicious">Suspicious</option>
                                <option value="legitimate">Legitimate</option>
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-1">
                            <Dialog.Close asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={manualReview.isPending}
                                >
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={manualReview.isPending}
                            >
                                {manualReview.isPending ? 'Saving…' : 'Save review'}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
