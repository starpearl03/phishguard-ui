'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronRight,
    Inbox,
    Plug,
    RefreshCw,
    ShieldBan,
} from 'lucide-react';
import { Badge } from '@/src/components/shadcn/badge';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { cn } from '@/src/lib/utils';
import { useInstalls } from '../hooks/use-installs';
import type {
    GetInstallsParams,
    InstallResponse,
    InstallStatus,
} from '../api/extension-admin.types';
import { InstallStatusBadge } from './install-status-badge';
import { InstallRowActions } from './install-row-actions';
import { DomainBlacklistDialog } from './domain-blacklist-dialog';

const SELECT_CLS =
    'h-7 rounded-md border border-input bg-input/20 px-2 py-0.5 text-xs/relaxed ' +
    'outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 ' +
    'focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 ' +
    'dark:bg-input/30 text-foreground';

const TH = 'px-3 py-2 text-left text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap';
const TD = 'px-3 py-2 text-xs align-middle';

function fmtDate(iso: string | null): string {
    if (!iso) return '—';
    try {
        return new Intl.DateTimeFormat('en', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function Breadcrumb() {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-muted-foreground"
        >
            <span>Admin</span>
            <ChevronRight className="size-3 shrink-0" />
            <span className="font-medium text-foreground">Extension installs</span>
        </nav>
    );
}

function SkeletonRows() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border/60">
                    {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className={TD}>
                            <Skeleton
                                className={cn('h-4', j === 0 ? 'w-40' : 'w-20')}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
    return (
        <tr>
            <td colSpan={7}>
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                    <Inbox className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-foreground">No installs found</p>
                    <p className="text-xs text-muted-foreground">
                        {hasFilters
                            ? 'Try adjusting or clearing your filters.'
                            : 'No Chrome extension installs have registered yet.'}
                    </p>
                </div>
            </td>
        </tr>
    );
}

type InstallsTableProps = {
    rows: InstallResponse[] | undefined;
    isLoading: boolean;
    hasFilters: boolean;
};

function InstallsTable({ rows, isLoading, hasFilters }: InstallsTableProps) {
    const router = useRouter();

    function goToDetail(id: string) {
        router.push(`/extension/installs/${id}`);
    }

    return (
        <div className="overflow-x-auto rounded-lg ring-1 ring-foreground/10">
            <table className="w-full min-w-[860px] border-collapse bg-card text-card-foreground">
                <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                        <th className={cn(TH)}>Email</th>
                        <th className={cn(TH, 'w-[110px]')}>Status</th>
                        <th className={cn(TH, 'w-[110px]')}>Version</th>
                        <th className={cn(TH, 'w-[140px]')}>Last seen</th>
                        <th className={cn(TH, 'w-[140px]')}>Created</th>
                        <th className={cn(TH)}>Reason</th>
                        <th className={cn(TH, 'w-[44px]')} />
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                    {isLoading ? (
                        <SkeletonRows />
                    ) : !rows || rows.length === 0 ? (
                        <EmptyState hasFilters={hasFilters} />
                    ) : (
                        rows.map((install) => (
                            <tr
                                key={install.id}
                                onClick={() => goToDetail(install.id)}
                                className="cursor-pointer transition-colors hover:bg-muted/30"
                            >
                                <td className={cn(TD, 'max-w-0')}>
                                    <span
                                        className="block truncate font-medium text-foreground"
                                        title={install.email}
                                    >
                                        {install.email}
                                    </span>
                                </td>
                                <td className={TD}>
                                    <InstallStatusBadge status={install.status} />
                                </td>
                                <td className={cn(TD, 'font-mono text-[0.7rem]')}>
                                    {install.extensionVersion ?? (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </td>
                                <td className={cn(TD, 'tabular-nums text-muted-foreground')}>
                                    {fmtDate(install.lastSeenAt)}
                                </td>
                                <td className={cn(TD, 'tabular-nums text-muted-foreground')}>
                                    {fmtDate(install.createdAt)}
                                </td>
                                <td className={cn(TD, 'max-w-0')}>
                                    {install.blacklistReason ? (
                                        <span
                                            className="block truncate text-muted-foreground"
                                            title={install.blacklistReason}
                                        >
                                            {install.blacklistReason}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </td>
                                <td
                                    className={cn(TD, 'text-right')}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <InstallRowActions install={install} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export function InstallsPage() {
    const [page, setPage] = useState(1);
    const [email, setEmail] = useState('');
    const [domain, setDomain] = useState('');
    const [status, setStatus] = useState<InstallStatus | ''>('');
    const [version, setVersion] = useState('');
    const [lastSeenAfter, setLastSeenAfter] = useState('');
    const [lastSeenBefore, setLastSeenBefore] = useState('');
    const [domainDialogOpen, setDomainDialogOpen] = useState(false);

    const params: GetInstallsParams = {
        page,
        pageSize: 20,
        email: email.trim() || undefined,
        domain: domain.trim() || undefined,
        status: status || undefined,
        version: version.trim() || undefined,
        lastSeenAfter: lastSeenAfter
            ? new Date(lastSeenAfter).toISOString()
            : undefined,
        lastSeenBefore: lastSeenBefore
            ? new Date(lastSeenBefore).toISOString()
            : undefined,
    };

    const { data, isLoading, isFetching, refetch } = useInstalls(params);
    const pagination = data?.pagination;

    const hasFilters =
        !!email.trim() ||
        !!domain.trim() ||
        !!status ||
        !!version.trim() ||
        !!lastSeenAfter ||
        !!lastSeenBefore;

    function clearFilters() {
        setEmail('');
        setDomain('');
        setStatus('');
        setVersion('');
        setLastSeenAfter('');
        setLastSeenBefore('');
        setPage(1);
    }

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <Breadcrumb />
                    <h1 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Plug className="size-4 text-muted-foreground" />
                        Extension installs
                        {pagination && (
                            <Badge variant="default">{pagination.total}</Badge>
                        )}
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw className={cn(isFetching && 'animate-spin')} />
                        Refresh
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDomainDialogOpen(true)}
                    >
                        <ShieldBan />
                        Blacklist domain
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-3 rounded-lg bg-card p-3 ring-1 ring-foreground/10 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="ext-filter-email"
                        className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                        Email contains
                    </label>
                    <Input
                        id="ext-filter-email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setPage(1);
                        }}
                        placeholder="user@…"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="ext-filter-domain"
                        className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                        Domain (exact)
                    </label>
                    <Input
                        id="ext-filter-domain"
                        value={domain}
                        onChange={(e) => {
                            setDomain(e.target.value);
                            setPage(1);
                        }}
                        placeholder="example.com"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="ext-filter-status"
                        className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                        Status
                    </label>
                    <select
                        id="ext-filter-status"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value as InstallStatus | '');
                            setPage(1);
                        }}
                        className={SELECT_CLS}
                    >
                        <option value="">All</option>
                        <option value="ACTIVE">Active</option>
                        <option value="BLACKLISTED">Blacklisted</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="ext-filter-version"
                        className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                        Version (exact)
                    </label>
                    <Input
                        id="ext-filter-version"
                        value={version}
                        onChange={(e) => {
                            setVersion(e.target.value);
                            setPage(1);
                        }}
                        placeholder="1.4.2"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="ext-filter-after"
                        className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                        Last seen after
                    </label>
                    <Input
                        id="ext-filter-after"
                        type="datetime-local"
                        value={lastSeenAfter}
                        onChange={(e) => {
                            setLastSeenAfter(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="ext-filter-before"
                        className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                        Last seen before
                    </label>
                    <Input
                        id="ext-filter-before"
                        type="datetime-local"
                        value={lastSeenBefore}
                        onChange={(e) => {
                            setLastSeenBefore(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                {hasFilters && (
                    <div className="sm:col-span-2 lg:col-span-3">
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear filters
                        </Button>
                    </div>
                )}
            </div>

            <InstallsTable
                rows={data?.items}
                isLoading={isLoading}
                hasFilters={hasFilters}
            />

            {/* Pagination */}
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
                                setPage((p) => Math.min(pagination.totalPages, p + 1))
                            }
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <DomainBlacklistDialog
                open={domainDialogOpen}
                onClose={() => setDomainDialogOpen(false)}
            />
        </div>
    );
}
