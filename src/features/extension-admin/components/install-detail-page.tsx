'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ChevronRight,
    KeyRound,
    Plug,
    ShieldBan,
    ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/shadcn/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/src/components/shadcn/card';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { Badge } from '@/src/components/shadcn/badge';
import { useInstall, useInstallActivity } from '../hooks/use-installs';
import {
    useRevokeInstallTokens,
    useUnblacklistInstall,
} from '../hooks/use-install-actions';
import { InstallStatusBadge } from './install-status-badge';
import { ActivityTable } from './activity-table';
import { BlacklistInstallDialog } from './blacklist-install-dialog';

const ACTIVITY_PAGE_SIZE = 20;

function fmtDate(iso: string | null): string {
    if (!iso) return '—';
    try {
        return new Intl.DateTimeFormat('en', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function Breadcrumb({ email }: { email: string }) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-muted-foreground"
        >
            <span>Admin</span>
            <ChevronRight className="size-3 shrink-0" />
            <span>Extension installs</span>
            <ChevronRight className="size-3 shrink-0" />
            <span
                className="max-w-[220px] truncate font-medium text-foreground"
                title={email}
            >
                {email}
            </span>
        </nav>
    );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[120px_1fr] items-start gap-3 py-1.5">
            <span className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
                {label}
            </span>
            <div className="text-xs text-foreground">{children}</div>
        </div>
    );
}

export function InstallDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params.id;

    const [page, setPage] = useState(1);
    const [blacklistOpen, setBlacklistOpen] = useState(false);

    const { data: install, isLoading } = useInstall(id);
    const { data: activity, isLoading: activityLoading } = useInstallActivity(id, {
        page,
        pageSize: ACTIVITY_PAGE_SIZE,
    });
    const unblacklist = useUnblacklistInstall();
    const revoke = useRevokeInstallTokens();

    function handleUnblacklist() {
        unblacklist.mutate(id, {
            onSuccess: () => toast.success('Install reinstated'),
            onError: (err) => toast.error(err.getMessage()),
        });
    }

    function handleRevoke() {
        if (!confirm('Revoke all active tokens for this install?')) return;
        revoke.mutate(id, {
            onSuccess: (result) =>
                toast.success(
                    `${result.revoked} token${result.revoked === 1 ? '' : 's'} revoked`,
                ),
            onError: (err) => toast.error(err.getMessage()),
        });
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-[280px] w-full rounded-lg" />
                <Skeleton className="h-[320px] w-full rounded-lg" />
            </div>
        );
    }

    if (!install) {
        return (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
                <p className="text-sm text-muted-foreground">Install not found.</p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.replace('/extension')}
                >
                    <ArrowLeft />
                    Back to installs
                </Button>
            </div>
        );
    }

    const pagination = activity?.pagination;
    const envEntries = install.environment
        ? Object.entries(install.environment)
        : [];

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <Breadcrumb email={install.email} />
                    <h1 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Plug className="size-4 text-muted-foreground" />
                        {install.email}
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {install.status === 'ACTIVE' ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setBlacklistOpen(true)}
                        >
                            <ShieldBan />
                            Blacklist
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUnblacklist}
                            disabled={unblacklist.isPending}
                        >
                            <ShieldCheck />
                            {unblacklist.isPending ? 'Reinstating…' : 'Reinstate'}
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRevoke}
                        disabled={revoke.isPending}
                    >
                        <KeyRound />
                        {revoke.isPending ? 'Revoking…' : 'Revoke tokens'}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Install</CardTitle>
                    <CardDescription>
                        Identity, status, and token state for this Chrome extension install.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldRow label="Status">
                        <InstallStatusBadge status={install.status} />
                    </FieldRow>
                    <FieldRow label="Active tokens">
                        <Badge variant={install.activeTokenCount > 0 ? 'success' : 'default'}>
                            {install.activeTokenCount}
                        </Badge>
                    </FieldRow>
                    <FieldRow label="Email">{install.email}</FieldRow>
                    <FieldRow label="Google sub">
                        <span className="font-mono text-[0.7rem]">{install.googleSub}</span>
                    </FieldRow>
                    <FieldRow label="Install ID">
                        <span className="font-mono text-[0.7rem]">{install.id}</span>
                    </FieldRow>
                    <FieldRow label="Version">
                        {install.extensionVersion ? (
                            <span className="font-mono text-[0.7rem]">
                                {install.extensionVersion}
                            </span>
                        ) : (
                            <span className="text-muted-foreground">—</span>
                        )}
                    </FieldRow>
                    <FieldRow label="Last seen">{fmtDate(install.lastSeenAt)}</FieldRow>
                    <FieldRow label="Created">{fmtDate(install.createdAt)}</FieldRow>
                    <FieldRow label="Updated">{fmtDate(install.updatedAt)}</FieldRow>

                    {install.status === 'BLACKLISTED' && (
                        <>
                            <FieldRow label="Blacklisted at">
                                {fmtDate(install.blacklistedAt)}
                            </FieldRow>
                            <FieldRow label="Reason">
                                {install.blacklistReason ?? (
                                    <span className="text-muted-foreground">—</span>
                                )}
                            </FieldRow>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Environment</CardTitle>
                    <CardDescription>
                        Browser fingerprint captured when the install registered.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {envEntries.length === 0 ? (
                        <p className="py-2 text-xs text-muted-foreground">
                            No environment fingerprint stored.
                        </p>
                    ) : (
                        <pre className="max-h-72 overflow-auto rounded-md bg-muted/40 p-3 text-[0.7rem] leading-relaxed">
                            {JSON.stringify(install.environment, null, 2)}
                        </pre>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Activity</CardTitle>
                    <CardDescription>
                        Recent analyse-email events submitted by this install.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <ActivityTable
                        rows={activity?.items}
                        isLoading={activityLoading}
                    />

                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                                Page {pagination.page} of {pagination.totalPages} ·{' '}
                                {pagination.total} total
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= pagination.totalPages}
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(pagination.totalPages, p + 1),
                                        )
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <BlacklistInstallDialog
                install={install}
                open={blacklistOpen}
                onClose={() => setBlacklistOpen(false)}
            />
        </div>
    );
}
