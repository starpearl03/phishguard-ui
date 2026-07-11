'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/src/components/shadcn/button';
import { cn } from '@/src/lib/utils';
import { FilterBar } from '../filter-bar';
import { HistoryTable } from './history-table';
import { usePredictionHistory } from '../../hooks/use-inference';
import type { Classification, GetEmailsParams } from '../../api/inference.types';

const PAGE_SIZE = 20;

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb() {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-muted-foreground"
        >
            <span className="font-medium text-foreground">Inference</span>
            <ChevronRightIcon className="size-3 shrink-0" />
            <span>History</span>
        </nav>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

type PaginationProps = {
    page: number;
    totalPages: number;
    onPage: (p: number) => void;
};

function pageWindows(page: number, total: number): (number | '…')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    if (page <= 4) {
        return [1, 2, 3, 4, 5, '…', total];
    }
    if (page >= total - 3) {
        return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '…', page - 1, page, page + 1, '…', total];
}

function Pagination({ page, totalPages, onPage }: PaginationProps) {
    if (totalPages <= 1) return null;

    const windows = pageWindows(page, totalPages);

    return (
        <div className="flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onPage(1)}
                    disabled={page === 1}
                    aria-label="First page"
                >
                    <ChevronsLeft />
                </Button>
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onPage(page - 1)}
                    disabled={page === 1}
                    aria-label="Previous page"
                >
                    <ChevronLeft />
                </Button>
            </div>

            <div className="flex items-center gap-1">
                {windows.map((w, i) =>
                    w === '…' ? (
                        <span
                            key={`ellipsis-${i}`}
                            className="flex size-6 items-center justify-center text-[0.625rem] text-muted-foreground"
                        >
                            …
                        </span>
                    ) : (
                        <Button
                            key={w}
                            variant={w === page ? 'default' : 'ghost'}
                            size="icon-sm"
                            onClick={() => onPage(w as number)}
                            aria-label={`Page ${w}`}
                            aria-current={w === page ? 'page' : undefined}
                        >
                            {w}
                        </Button>
                    ),
                )}
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onPage(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Next page"
                >
                    <ChevronRight />
                </Button>
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onPage(totalPages)}
                    disabled={page === totalPages}
                    aria-label="Last page"
                >
                    <ChevronsRight />
                </Button>
            </div>
        </div>
    );
}

// ─── History page ─────────────────────────────────────────────────────────────

export function InferenceHistoryPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // ── Read all URL params ──────────────────────────────────────────────────
    const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
    const classification = searchParams.get('classification') as Classification | null;
    const search = searchParams.get('search') ?? undefined;
    const startDate = searchParams.get('startDate') ?? undefined;
    const endDate = searchParams.get('endDate') ?? undefined;
    // confidence is stored 0-100 in URL, API expects 0-1
    const rawMin = searchParams.get('minConfidence');
    const rawMax = searchParams.get('maxConfidence');
    const minConfidence = rawMin ? Number(rawMin) / 100 : undefined;
    const maxConfidence = rawMax ? Number(rawMax) / 100 : undefined;

    const hasFilters = Boolean(
        classification || search || startDate || endDate || rawMin || rawMax,
    );

    const params: GetEmailsParams = {
        page,
        pageSize: PAGE_SIZE,
        ...(classification ? { classification } : {}),
        ...(search ? { sender: search } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(minConfidence != null ? { minConfidence } : {}),
        ...(maxConfidence != null ? { maxConfidence } : {}),
    };

    const { data, isLoading } = usePredictionHistory(params);

    // ── Navigate to a page ───────────────────────────────────────────────────
    const setPage = useCallback(
        (next: number) => {
            const p = new URLSearchParams(searchParams.toString());
            if (next === 1) {
                p.delete('page');
            } else {
                p.set('page', String(next));
            }
            router.push(`${pathname}?${p.toString()}`, { scroll: false });
        },
        [router, pathname, searchParams],
    );

    const totalPages = data?.pagination?.totalPages ?? 1;
    const total = data?.pagination?.total ?? 0;

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
            {/* ── Page header ─────────────────────────────────────── */}
            <div className="flex flex-col gap-1">
                <Breadcrumb />
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-lg font-semibold text-foreground">
                        Prediction history
                    </h1>
                    {!isLoading && (
                        <span className="text-xs text-muted-foreground">
                            {total.toLocaleString()}{' '}
                            {total === 1 ? 'record' : 'records'}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Filters ─────────────────────────────────────────── */}
            <FilterBar />

            {/* ── Table ───────────────────────────────────────────── */}
            <HistoryTable
                rows={data?.items}
                isLoading={isLoading}
                hasFilters={hasFilters}
            />

            {/* ── Pagination ──────────────────────────────────────── */}
            {!isLoading && totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPage={setPage}
                />
            )}
        </div>
    );
}
