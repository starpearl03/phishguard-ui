'use client';

import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Label } from '@/src/components/shadcn/label';
import { cn } from '@/src/lib/utils';
import { useBlacklistDomain } from '../hooks/use-install-actions';

const TEXTAREA_CLS =
    'w-full rounded-md border border-input bg-input/20 px-2 py-1.5 text-xs/relaxed ' +
    'transition-colors outline-none resize-none placeholder:text-muted-foreground ' +
    'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 ' +
    'disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30';

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;

type DomainBlacklistDialogProps = {
    open: boolean;
    onClose: () => void;
};

export function DomainBlacklistDialog({ open, onClose }: DomainBlacklistDialogProps) {
    const [domain, setDomain] = useState('');
    const [reason, setReason] = useState('');
    const [errors, setErrors] = useState<{ domain?: string; reason?: string }>({});
    const blacklistDomain = useBlacklistDomain();

    function resetForm() {
        setDomain('');
        setReason('');
        setErrors({});
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const next: typeof errors = {};
        const trimmedDomain = domain.trim().toLowerCase();
        if (!trimmedDomain) {
            next.domain = 'Domain is required';
        } else if (trimmedDomain.length > 320) {
            next.domain = 'Domain must be 320 characters or fewer';
        } else if (!DOMAIN_RE.test(trimmedDomain)) {
            next.domain = 'Enter a valid domain (e.g. example.com)';
        }

        const trimmedReason = reason.trim();
        if (trimmedReason.length > 500) {
            next.reason = 'Reason must be 500 characters or fewer';
        }

        if (Object.keys(next).length > 0) {
            setErrors(next);
            return;
        }
        setErrors({});

        blacklistDomain.mutate(
            {
                domain: trimmedDomain,
                ...(trimmedReason ? { reason: trimmedReason } : {}),
            },
            {
                onSuccess: (result) => {
                    toast.success(
                        `Blacklisted ${result.installsUpdated} install${result.installsUpdated === 1 ? '' : 's'} · ${result.tokensRevoked} token${result.tokensRevoked === 1 ? '' : 's'} revoked`,
                    );
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
                if (!o && !blacklistDomain.isPending) {
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
                    aria-describedby="dbd-help"
                >
                    <div className="flex items-center justify-between gap-3">
                        <Dialog.Title className="text-sm font-semibold text-foreground">
                            Blacklist domain
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Close"
                                disabled={blacklistDomain.isPending}
                            >
                                <X />
                            </Button>
                        </Dialog.Close>
                    </div>

                    <p id="dbd-help" className="mt-2 text-xs text-muted-foreground">
                        Blacklists every install whose email matches this domain and
                        revokes their tokens. This action cannot be undone in bulk —
                        each install must be reinstated individually.
                    </p>

                    <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="dbd-domain">
                                Domain<span className="ml-1 text-destructive">*</span>
                            </Label>
                            <Input
                                id="dbd-domain"
                                value={domain}
                                onChange={(e) => {
                                    setDomain(e.target.value);
                                    if (errors.domain) {
                                        setErrors((prev) => ({ ...prev, domain: undefined }));
                                    }
                                }}
                                placeholder="malicious.io"
                                autoComplete="off"
                                disabled={blacklistDomain.isPending}
                                aria-invalid={!!errors.domain}
                            />
                            {errors.domain && (
                                <p className="text-xs text-destructive">{errors.domain}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="dbd-reason">
                                Reason
                                <span className="ml-2 text-[0.625rem] font-normal text-muted-foreground">
                                    optional
                                </span>
                            </Label>
                            <textarea
                                id="dbd-reason"
                                rows={3}
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    if (errors.reason) {
                                        setErrors((prev) => ({ ...prev, reason: undefined }));
                                    }
                                }}
                                placeholder="e.g. Disposable-email provider"
                                disabled={blacklistDomain.isPending}
                                aria-invalid={!!errors.reason}
                                className={cn(
                                    TEXTAREA_CLS,
                                    errors.reason &&
                                        'border-destructive ring-2 ring-destructive/20',
                                )}
                            />
                            {errors.reason && (
                                <p className="text-xs text-destructive">{errors.reason}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <Dialog.Close asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={blacklistDomain.isPending}
                                >
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button
                                type="submit"
                                variant="destructive"
                                size="sm"
                                disabled={blacklistDomain.isPending}
                            >
                                {blacklistDomain.isPending ? 'Blacklisting…' : 'Blacklist domain'}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
