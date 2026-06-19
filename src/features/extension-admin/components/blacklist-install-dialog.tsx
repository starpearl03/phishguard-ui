'use client';

import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/shadcn/button';
import { Label } from '@/src/components/shadcn/label';
import { cn } from '@/src/lib/utils';
import { useBlacklistInstall } from '../hooks/use-install-actions';
import type { InstallResponse } from '../api/extension-admin.types';

const TEXTAREA_CLS =
    'w-full rounded-md border border-input bg-input/20 px-2 py-1.5 text-xs/relaxed ' +
    'transition-colors outline-none resize-none placeholder:text-muted-foreground ' +
    'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 ' +
    'disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30';

type BlacklistInstallDialogProps = {
    install: InstallResponse;
    open: boolean;
    onClose: () => void;
};

export function BlacklistInstallDialog({
    install,
    open,
    onClose,
}: BlacklistInstallDialogProps) {
    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState('');
    const blacklist = useBlacklistInstall();

    function resetForm() {
        setReason('');
        setReasonError('');
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = reason.trim();
        if (trimmed.length > 500) {
            setReasonError('Reason must be 500 characters or fewer');
            return;
        }
        setReasonError('');

        blacklist.mutate(
            { id: install.id, data: trimmed ? { reason: trimmed } : {} },
            {
                onSuccess: () => {
                    toast.success('Install blacklisted');
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
                if (!o && !blacklist.isPending) {
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
                    aria-describedby="bli-help"
                >
                    <div className="flex items-center justify-between gap-3">
                        <Dialog.Title className="text-sm font-semibold text-foreground">
                            Blacklist install
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Close"
                                disabled={blacklist.isPending}
                            >
                                <X />
                            </Button>
                        </Dialog.Close>
                    </div>

                    <p id="bli-help" className="mt-2 text-xs text-muted-foreground">
                        This will revoke all tokens for{' '}
                        <span className="font-medium text-foreground">{install.email}</span>{' '}
                        and prevent the install from contacting the API.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="bli-reason">
                                Reason
                                <span className="ml-2 text-[0.625rem] font-normal text-muted-foreground">
                                    optional
                                </span>
                            </Label>
                            <textarea
                                id="bli-reason"
                                rows={3}
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    if (reasonError) setReasonError('');
                                }}
                                placeholder="e.g. Suspicious activity reported on 2026-04-25"
                                disabled={blacklist.isPending}
                                aria-invalid={!!reasonError}
                                className={cn(
                                    TEXTAREA_CLS,
                                    reasonError &&
                                        'border-destructive ring-2 ring-destructive/20',
                                )}
                            />
                            {reasonError && (
                                <p className="text-xs text-destructive">{reasonError}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <Dialog.Close asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={blacklist.isPending}
                                >
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button
                                type="submit"
                                variant="destructive"
                                size="sm"
                                disabled={blacklist.isPending}
                            >
                                {blacklist.isPending ? 'Blacklisting…' : 'Blacklist'}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
