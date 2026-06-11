'use client';

import { useRouter } from 'next/navigation';
import { Inbox } from 'lucide-react';
import { Badge } from '@/src/components/shadcn/badge';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { cn } from '@/src/lib/utils';
import type { UserDto } from '@/src/lib';
import { UserRowActions } from './user-row-actions';

const TH = 'px-3 py-2 text-left text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap';
const TD = 'px-3 py-2 text-xs align-middle';

function fmtDate(iso: string): string {
    try {
        return new Intl.DateTimeFormat('en', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function SkeletonRows() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border/60">
                    {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className={TD}>
                            <Skeleton
                                className={cn('h-4', j === 0 ? 'w-40' : j === 1 ? 'w-32' : 'w-20')}
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
            <td colSpan={6}>
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                    <Inbox className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-foreground">No users found</p>
                    <p className="text-xs text-muted-foreground">
                        {hasFilters
                            ? 'Try adjusting or clearing your filters.'
                            : 'No users have been created yet.'}
                    </p>
                </div>
            </td>
        </tr>
    );
}

type UserListTableProps = {
    rows: UserDto[] | undefined;
    isLoading: boolean;
    hasFilters: boolean;
    currentUserId?: string;
};

export function UserListTable({
    rows,
    isLoading,
    hasFilters,
    currentUserId,
}: UserListTableProps) {
    const router = useRouter();

    function goToDetail(id: string) {
        router.push(`/users/${id}`);
    }

    return (
        <div className="overflow-x-auto rounded-lg ring-1 ring-foreground/10">
            <table className="w-full min-w-[760px] border-collapse bg-card text-card-foreground">
                <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                        <th className={cn(TH)}>Name</th>
                        <th className={cn(TH)}>Email</th>
                        <th className={cn(TH, 'w-[120px]')}>Username</th>
                        <th className={cn(TH, 'w-[100px]')}>Role</th>
                        <th className={cn(TH, 'w-[100px]')}>Status</th>
                        <th className={cn(TH, 'w-[120px]')}>Created</th>
                        <th className={cn(TH, 'w-[44px]')} />
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                    {isLoading ? (
                        <SkeletonRows />
                    ) : !rows || rows.length === 0 ? (
                        <EmptyState hasFilters={hasFilters} />
                    ) : (
                        rows.map((user) => (
                            <tr
                                key={user.id}
                                onClick={() => goToDetail(user.id)}
                                className="cursor-pointer transition-colors hover:bg-muted/30"
                            >
                                <td className={TD}>
                                    <span className="font-medium text-foreground">
                                        {user.firstName} {user.lastName}
                                    </span>
                                </td>
                                <td className={cn(TD, 'max-w-0')}>
                                    <span className="block truncate" title={user.email}>
                                        {user.email}
                                    </span>
                                </td>
                                <td className={cn(TD, 'font-mono text-[0.7rem]')}>
                                    {user.username}
                                </td>
                                <td className={TD}>
                                    <Badge variant={user.role === 'ADMIN' ? 'info' : 'outline'}>
                                        {user.role}
                                    </Badge>
                                </td>
                                <td className={TD}>
                                    {user.isActive ? (
                                        <Badge variant="success">Active</Badge>
                                    ) : (
                                        <Badge variant="outline">Inactive</Badge>
                                    )}
                                </td>
                                <td className={cn(TD, 'tabular-nums text-muted-foreground')}>
                                    {fmtDate(user.createdAt)}
                                </td>
                                <td
                                    className={cn(TD, 'text-right')}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <UserRowActions
                                        user={user}
                                        isSelf={user.id === currentUserId}
                                    />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
