'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronRight, RefreshCw, Trash2, MessageSquare, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/shadcn/button';
import { Card, CardContent } from '@/src/components/shadcn/card';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { queryKeys } from '@/src/lib';
import { useAuthStore, selectUser } from '@/src/features/auth/stores/auth.store';
import { EmailDetailCard } from '../email-detail-card';
import { PipelineStatusIndicator } from '../pipeline-status-indicator';
import { ManualReviewModal } from './manual-review-modal';
import { ReanalyzeModal } from './reanalyze-modal';
import {
    useEmailDetail,
    useEmailStatus,
    useDeleteEmail,
} from '../../hooks/use-inference';

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb({ id }: { id: string }) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-muted-foreground"
        >
            <span className="font-medium text-foreground">Inference</span>
            <ChevronRight className="size-3 shrink-0" />
            <span>History</span>
            <ChevronRight className="size-3 shrink-0" />
            <span className="max-w-[180px] truncate font-mono" title={id}>
                {id}
            </span>
        </nav>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonDetail() {
    return (
        <div className="flex flex-col gap-4">
            {/* Action bar */}
            <div className="flex gap-2">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-7 w-20" />
            </div>
            {/* Card body */}
            <Skeleton className="h-[480px] w-full rounded-lg" />
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function InferenceDetailPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const id = searchParams.get('id') ?? '';
    const user = useAuthStore(selectUser);
    const isAdmin = user?.role === 'ADMIN';

    const [reviewOpen, setReviewOpen] = useState(false);
    const [reanalyzeOpen, setReanalyzeOpen] = useState(false);

    const { data: detail, isLoading } = useEmailDetail();
    const { data: liveStatus } = useEmailStatus();
    const deleteEmail = useDeleteEmail();

    // When the pipeline reaches a terminal state, refresh the full detail.
    useEffect(() => {
        const s = liveStatus?.pipelineStatus;
        if ((s === 'complete' || s === 'failed') && id) {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inference.emails.byId(id),
            });
        }
    }, [liveStatus?.pipelineStatus, id, queryClient]);

    function goBackToHistory() {
        const p = new URLSearchParams(searchParams.toString());
        p.set('tab', 'history');
        p.delete('id');
        router.push(`${pathname}?${p.toString()}`);
    }

    // ── No id ────────────────────────────────────────────────────────────────
    if (!id) {
        return (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
                <p className="text-sm text-muted-foreground">No email selected.</p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={goBackToHistory}
                >
                    <ArrowLeft />
                    Back to history
                </Button>
            </div>
        );
    }

    function handleDelete() {
        if (!confirm('Delete this email record? This action cannot be undone.')) return;
        deleteEmail.mutate(id, {
            onSuccess: () => {
                toast.success('Email record deleted');
                goBackToHistory();
            },
            onError: (err) => toast.error(err.getMessage()),
        });
    }

    // Is the pipeline still actively running?
    const isRunning =
        liveStatus?.pipelineStatus === 'pending' ||
        liveStatus?.pipelineStatus === 'running';

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
            {/* ── Page header ─────────────────────────────────────── */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <Breadcrumb id={id} />
                    <h1 className="text-lg font-semibold text-foreground">
                        Email detail
                    </h1>
                </div>

                {/* Actions */}
                {!isLoading && detail && (
                    <div className="flex flex-wrap items-center gap-2">
                        {isAdmin && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReanalyzeOpen(true)}
                                disabled={isRunning}
                            >
                                <RefreshCw />
                                Reanalyze
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReviewOpen(true)}
                            disabled={isRunning}
                        >
                            <MessageSquare />
                            Manual review
                        </Button>

                        {isAdmin && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                                disabled={deleteEmail.isPending}
                            >
                                <Trash2 />
                                {deleteEmail.isPending ? 'Deleting…' : 'Delete'}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Loading ─────────────────────────────────────────── */}
            {isLoading && <SkeletonDetail />}

            {/* ── Pipeline running banner ─────────────────────────── */}
            {!isLoading && detail && isRunning && liveStatus && (
                <Card>
                    <CardContent className="pt-4">
                        <PipelineStatusIndicator
                            stage={liveStatus.stage}
                            status={liveStatus.pipelineStatus}
                            error={liveStatus.error}
                        />
                    </CardContent>
                </Card>
            )}

            {/* ── Detail card ─────────────────────────────────────── */}
            {!isLoading && detail && (
                <EmailDetailCard email={detail} />
            )}

            {/* ── No data / error ─────────────────────────────────── */}
            {!isLoading && !detail && (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                    <p className="text-sm text-muted-foreground">
                        Email not found or failed to load.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goBackToHistory}
                    >
                        <ArrowLeft />
                        Back to history
                    </Button>
                </div>
            )}

            {/* ── Manual review modal ─────────────────────────────── */}
            <ManualReviewModal
                emailId={id}
                open={reviewOpen}
                onClose={() => setReviewOpen(false)}
            />

            {/* ── Reanalyze modal ─────────────────────────────────── */}
            <ReanalyzeModal
                emailId={id}
                open={reanalyzeOpen}
                onClose={() => setReanalyzeOpen(false)}
            />
        </div>
    );
}
