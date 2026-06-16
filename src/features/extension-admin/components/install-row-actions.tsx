'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Eye,
    KeyRound,
    MoreHorizontal,
    ShieldBan,
    ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/src/components/shadcn/dropdown-menu';
import { Button } from '@/src/components/shadcn/button';
import {
    useRevokeInstallTokens,
    useUnblacklistInstall,
} from '../hooks/use-install-actions';
import type { InstallResponse } from '../api/extension-admin.types';
import { BlacklistInstallDialog } from './blacklist-install-dialog';

type InstallRowActionsProps = {
    install: InstallResponse;
};

export function InstallRowActions({ install }: InstallRowActionsProps) {
    const router = useRouter();
    const [blacklistOpen, setBlacklistOpen] = useState(false);
    const [confirmRevoke, setConfirmRevoke] = useState(false);

    const unblacklist = useUnblacklistInstall();
    const revoke = useRevokeInstallTokens();

    function goToDetail() {
        router.push(`/extension/installs/${install.id}`);
    }

    function handleUnblacklist() {
        unblacklist.mutate(install.id, {
            onSuccess: () => toast.success('Install reinstated'),
            onError: (err) => toast.error(err.getMessage()),
        });
    }

    function handleRevoke() {
        if (!confirmRevoke) {
            setConfirmRevoke(true);
            return;
        }
        revoke.mutate(install.id, {
            onSuccess: (result) =>
                toast.success(
                    `${result.revoked} token${result.revoked === 1 ? '' : 's'} revoked`,
                ),
            onError: (err) => {
                toast.error(err.getMessage());
                setConfirmRevoke(false);
            },
        });
    }

    const busy =
        unblacklist.isPending || revoke.isPending;

    return (
        <>
            <DropdownMenu
                onOpenChange={(open) => {
                    if (!open) setConfirmRevoke(false);
                }}
            >
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Install actions"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onSelect={goToDetail}>
                        <Eye />
                        View detail
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {install.status === 'ACTIVE' ? (
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setBlacklistOpen(true)}
                            disabled={busy}
                        >
                            <ShieldBan />
                            Blacklist
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            onSelect={handleUnblacklist}
                            disabled={busy}
                        >
                            <ShieldCheck />
                            Reinstate
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                        onSelect={handleRevoke}
                        disabled={busy}
                    >
                        <KeyRound />
                        {confirmRevoke ? 'Confirm revoke?' : 'Revoke tokens'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <BlacklistInstallDialog
                install={install}
                open={blacklistOpen}
                onClose={() => setBlacklistOpen(false)}
            />
        </>
    );
}
