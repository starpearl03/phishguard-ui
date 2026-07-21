'use client';

import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, Trash2, ShieldOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/shadcn/card';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { USER_ROLES } from '@/src/lib';
import { AuthGuard } from '@/src/features/auth/guards';
import { useAuthStore, selectUser } from '@/src/features/auth';
import {
    useUser,
    useActivateUser,
    useDeactivateUser,
    useDeleteUser,
} from '@/src/features/auth/hooks/use-users';
import { UserEditForm } from '@/src/features/auth/components';

function Breadcrumb({ name }: { name: string }) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-muted-foreground"
        >
            <span>Admin</span>
            <ChevronRight className="size-3 shrink-0" />
            <span>Users</span>
            <ChevronRight className="size-3 shrink-0" />
            <span className="font-medium text-foreground">{name}</span>
        </nav>
    );
}

function UserDetailInner() {
    const params = useParams<{ userId: string }>();
    const router = useRouter();
    const userId = params.userId;
    const currentUser = useAuthStore(selectUser);

    const { data: user, isLoading } = useUser(userId);
    const activate = useActivateUser();
    const deactivate = useDeactivateUser();
    const deleteUser = useDeleteUser();

    const isSelf = currentUser?.id === userId;

    function handleToggleActive() {
        if (!user) return;
        const mutation = user.isActive ? deactivate : activate;
        const verb = user.isActive ? 'deactivated' : 'activated';
        mutation.mutate(user.id, {
            onSuccess: () => toast.success(`User ${verb}`),
            onError: (err) => toast.error(err.getMessage()),
        });
    }

    function handleDelete() {
        if (!user) return;
        if (!confirm(`Delete ${user.email}? This cannot be undone.`)) return;
        deleteUser.mutate(user.id, {
            onSuccess: () => {
                toast.success('User deleted');
                router.replace('/users');
            },
            onError: (err) => toast.error(err.getMessage()),
        });
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-[480px] w-full max-w-3xl rounded-lg" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
                <p className="text-sm text-muted-foreground">User not found.</p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.replace('/users')}
                >
                    <ArrowLeft />
                    Back to users
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <Breadcrumb name={`${user.firstName} ${user.lastName}`} />
                    <h1 className="text-lg font-semibold text-foreground">
                        {user.firstName} {user.lastName}
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleActive}
                        disabled={
                            isSelf || activate.isPending || deactivate.isPending
                        }
                    >
                        {user.isActive ? (
                            <>
                                <ShieldOff />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <ShieldCheck />
                                Activate
                            </>
                        )}
                    </Button>

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isSelf || deleteUser.isPending}
                    >
                        <Trash2 />
                        {deleteUser.isPending ? 'Deleting…' : 'Delete'}
                    </Button>
                </div>
            </div>

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            Update name, username, role, or active status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserEditForm user={user} isSelf={isSelf} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function UserDetailPage() {
    return (
        <AuthGuard roles={[USER_ROLES.ADMIN]}>
            <UserDetailInner />
        </AuthGuard>
    );
}
