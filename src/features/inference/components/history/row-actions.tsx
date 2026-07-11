'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Eye, MoreHorizontal, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/src/components/shadcn/dropdown-menu';
import { Button } from '@/src/components/shadcn/button';
import { useReanalyze, useDeleteEmail } from '../../hooks/use-inference';
import type { EmailSummaryResponse } from '../../api/inference.types';

type RowActionsProps = {
    email: EmailSummaryResponse;
    isAdmin: boolean;
};

export function RowActions({ email, isAdmin }: RowActionsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const reanalyze = useReanalyze();
    const deleteEmail = useDeleteEmail();

    function goToDetail() {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', 'detail');
        params.set('id', email.id);
        router.push(`${pathname}?${params.toString()}`);
    }

    function handleReanalyze() {
        // body: '' — backend re-uses the stored email body
        reanalyze.mutate(
            { id: email.id, data: { body: '' } },
            {
                onSuccess: () => toast.success('Reanalysis queued'),
                onError: (err) => toast.error(err.getMessage()),
            },
        );
    }

    function handleDelete() {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        deleteEmail.mutate(email.id, {
            onSuccess: () => toast.success('Email record deleted'),
            onError: (err) => {
                toast.error(err.getMessage());
                setConfirmDelete(false);
            },
        });
    }

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
                    aria-label="Row actions"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {/* View detail */}
                <DropdownMenuItem onSelect={goToDetail}>
                    <Eye />
                    View detail
                </DropdownMenuItem>

                {/* Admin-only actions */}
                {isAdmin && (
                    <>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onSelect={handleReanalyze}
                            disabled={reanalyze.isPending}
                        >
                            <RefreshCw />
                            Reanalyze
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={handleDelete}
                            disabled={deleteEmail.isPending}
                        >
                            <Trash2 />
                            {confirmDelete ? 'Confirm delete?' : 'Delete'}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
