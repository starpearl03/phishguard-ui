'use client';

import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/src/components/shadcn/button';
import { Label } from '@/src/components/shadcn/label';
import { cn } from '@/src/lib/utils';
import { queryKeys } from '@/src/lib';
import { useReanalyze } from '../../hooks/use-inference';

const TEXTAREA_CLS =
    'w-full rounded-md border border-input bg-input/20 px-2 py-1.5 text-xs/relaxed ' +
    'transition-colors outline-none resize-none placeholder:text-muted-foreground ' +
    'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 ' +
    'disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30';

type ReanalyzeModalProps = {
    emailId: string;
    open: boolean;
    onClose: () => void;
};

// Backend hashes the stored body on submit and compares it on reanalyze.
// We can't recover the original body from `bodyHash`, so the admin must
// paste it back before re-queueing the pipeline.
export function ReanalyzeModal({ emailId, open, onClose }: ReanalyzeModalProps) {
    const [body, setBody] = useState('');
    const [bodyError, setBodyError] = useState('');
    const reanalyze = useReanalyze();
    const queryClient = useQueryClient();

    function resetForm() {
        setBody('');
        setBodyError('');
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!body.trim()) {
            setBodyError('Body is required');
            return;
        }
        setBodyError('');
        reanalyze.mutate(
            { id: emailId, data: { body } },
            {
                onSuccess: () => {
                    toast.success('Reanalysis queued');
                    queryClient.invalidateQueries({
                        queryKey: queryKeys.inference.emails.byId(emailId),
                    });
                    resetForm();
                    onClose();
                },
                onError: (err) => {
                    const msg = err.getMessage();
                    // Common case: pasted body doesn't match the stored hash.
                    setBodyError(msg);
                    toast.error(msg);
                },
            },
        );
    }

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(o) => {
                if (!o && !reanalyze.isPending) {
                    resetForm();
                    onClose();
                }
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay
                    className={cn(
                        'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm',
                        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
                        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
                    )}
                />

                <Dialog.Content
                    className={cn(
                        'fixed left-1/2 top-1/2 z-50 w-full max-w-md',
                        '-translate-x-1/2 -translate-y-1/2',
                        'rounded-lg bg-card p-5 shadow-xl ring-1 ring-foreground/10',
                        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                    )}
                    aria-describedby="reanalyze-help"
                >
                    <div className="flex items-center justify-between gap-3">
                        <Dialog.Title className="text-sm font-semibold text-foreground">
                            Reanalyze email
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Close"
                                disabled={reanalyze.isPending}
                            >
                                <X />
                            </Button>
                        </Dialog.Close>
                    </div>

                    <p
                        id="reanalyze-help"
                        className="mt-2 text-xs text-muted-foreground"
                    >
                        Paste the original email body. It is verified against the
                        stored hash before the pipeline is re-queued.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="reanalyze-body">
                                Email body
                                <span className="ml-1 text-destructive">*</span>
                            </Label>
                            <textarea
                                id="reanalyze-body"
                                rows={10}
                                value={body}
                                onChange={(e) => {
                                    setBody(e.target.value);
                                    if (bodyError) setBodyError('');
                                }}
                                placeholder="Paste the original email body here…"
                                disabled={reanalyze.isPending}
                                aria-invalid={!!bodyError}
                                className={cn(
                                    TEXTAREA_CLS,
                                    bodyError &&
                                        'border-destructive ring-2 ring-destructive/20',
                                )}
                            />
                            {bodyError && (
                                <p className="text-xs text-destructive">{bodyError}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <Dialog.Close asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={reanalyze.isPending}
                                >
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={reanalyze.isPending}
                            >
                                {reanalyze.isPending ? 'Queuing…' : 'Reanalyze'}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
