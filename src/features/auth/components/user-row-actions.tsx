'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, MoreHorizontal, Trash2, ShieldOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/src/components/shadcn/dropdown-menu';
import { Button } from '@/src/components/shadcn/button';
import type { UserDto } from '@/src/lib';
import {
    useActivateUser,
    useDeactivateUser,
    useDeleteUser,
} from '../hooks/use-users';

type UserRowActionsProps = {
    user: UserDto;
    /** Disable destructive actions if this is the signed-in user */
    isSelf: boolean;
};

export function UserRowActions({ user, isSelf }: UserRowActionsProps) {
    const router = useRouter();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const activate = useActivateUser();
    const deactivate = useDeactivateUser();
    const deleteUser = useDeleteUser();

    function handleEdit() {
        router.push(`/users/${user.id}`);
    }

    function handleToggleActive() {
        const mutation = user.isActive ? deactivate : activate;
        const verb = user.isActive ? 'deactivated' : 'activated';
        mutation.mutate(user.id, {
            onSuccess: () => toast.success(`User ${verb}`),
            onError: (err) => toast.error(err.getMessage()),
        });
    }

    function handleDelete() {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        deleteUser.mutate(user.id, {
            onSuccess: () => toast.success('User deleted'),
            onError: (err) => {
                toast.error(err.getMessage());
                setConfirmDelete(false);
            },
        });
    }

    const busy =
        activate.isPending || deactivate.isPending || deleteUser.isPending;

    return (
        <DropdownMenu
            onOpenChange={(open) => {
                if (!open) setConfirmDelete(false);
            }}
        >
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="User actions"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onSelect={handleEdit}>
                    <Pencil />
                    Edit
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onSelect={handleToggleActive}
                    disabled={busy || isSelf}
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
                </DropdownMenuItem>

                <DropdownMenuItem
                    variant="destructive"
                    onSelect={handleDelete}
                    disabled={busy || isSelf}
                >
                    <Trash2 />
                    {confirmDelete ? 'Confirm delete?' : 'Delete'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
