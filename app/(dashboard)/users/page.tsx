'use client';

import { useState } from 'react';
import { ChevronRight, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/src/components/shadcn/button';
import { cn } from '@/src/lib/utils';
import { USER_ROLES, UserRole } from '@/src/lib';
import { AuthGuard } from '@/src/features/auth/guards';
import { useAuthStore, selectUser } from '@/src/features/auth';
import { useUsers } from '@/src/features/auth/hooks/use-users';
import {
    UserListTable,
    UserCreateDialog,
} from '@/src/features/auth/components';
import type { GetUsersParams } from '@/src/features/auth/api/auth.types';

const SELECT_CLS =
    'h-7 rounded-md border border-input bg-input/20 px-2 py-0.5 text-xs/relaxed ' +
    'outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 ' +
    'focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 ' +
    'dark:bg-input/30 text-foreground';

function Breadcrumb() {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-muted-foreground"
        >
            <span>Admin</span>
            <ChevronRight className="size-3 shrink-0" />
            <span className="font-medium text-foreground">Users</span>
        </nav>
    );
}

function UsersPageInner() {
    const currentUser = useAuthStore(selectUser);

    const [page, setPage] = useState(1);
    const [role, setRole] = useState<UserRole | ''>('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>(
        'all',
    );
    const [createOpen, setCreateOpen] = useState(false);

    const params: GetUsersParams = {
        page,
        pageSize: 20,
        role: role || undefined,
        isActive:
            activeFilter === 'all' ? undefined : activeFilter === 'active',
    };

    const { data, isLoading, isFetching, refetch } = useUsers(params);
    const hasFilters = !!role || activeFilter !== 'all';

    const pagination = data?.pagination;

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <Breadcrumb />
                    <h1 className="text-lg font-semibold text-foreground">Users</h1>
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
                    <Button size="sm" onClick={() => setCreateOpen(true)}>
                        <Plus />
                        New user
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-3 rounded-lg bg-card p-3 ring-1 ring-foreground/10">
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="users-filter-role"
                        className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                        Role
                    </label>
                    <select
                        id="users-filter-role"
                        value={role}
                        onChange={(e) => {
                            setRole(e.target.value as UserRole | '');
                            setPage(1);
                        }}
                        className={SELECT_CLS}
                    >
                        <option value="">All roles</option>
                        <option value={USER_ROLES.ADMIN}>Admin</option>
                        <option value={USER_ROLES.IT_ANALYST}>IT Analyst</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="users-filter-status"
                        className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                        Status
                    </label>
                    <select
                        id="users-filter-status"
                        value={activeFilter}
                        onChange={(e) => {
                            setActiveFilter(
                                e.target.value as 'all' | 'active' | 'inactive',
                            );
                            setPage(1);
                        }}
                        className={SELECT_CLS}
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setRole('');
                            setActiveFilter('all');
                            setPage(1);
                        }}
                    >
                        Clear filters
                    </Button>
                )}
            </div>

            <UserListTable
                rows={data?.items}
                isLoading={isLoading}
                hasFilters={hasFilters}
                currentUserId={currentUser?.id}
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

            <UserCreateDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
            />
        </div>
    );
}

export default function UsersPage() {
    return (
        <AuthGuard roles={[USER_ROLES.ADMIN]}>
            <UsersPageInner />
        </AuthGuard>
    );
}
