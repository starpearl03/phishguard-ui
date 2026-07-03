'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/src/components/shadcn/input';
import { Button } from '@/src/components/shadcn/button';
import { cn } from '@/src/lib/utils';

// ─── Shared select style — mirrors the Input component dimensions ────────────
const SELECT_CLS =
    'h-7 rounded-md border border-input bg-input/20 px-2 py-0.5 text-xs/relaxed ' +
    'outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 ' +
    'focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 ' +
    'dark:bg-input/30 text-foreground';

// ─── URL param keys (match GetEmailsParams wire names) ───────────────────────
const PARAM = {
    classification: 'classification',
    startDate: 'startDate',
    endDate: 'endDate',
    minConfidence: 'minConfidence',
    maxConfidence: 'maxConfidence',
    search: 'search',
} as const;

type Filters = {
    classification: string;
    startDate: string;
    endDate: string;
    minConf: string;
    maxConf: string;
    search: string;
};

type FilterBarProps = {
    className?: string;
};

/**
 * Reads its initial state from URL search params and writes every change back.
 * Debounces text / number inputs (400 ms); selects and date pickers update
 * the URL immediately.
 */
export function FilterBar({ className }: FilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // ── Read initial values from URL ────────────────────────────────────────
    const [filters, setFilters] = useState<Filters>({
        classification: searchParams.get(PARAM.classification) ?? '',
        startDate: searchParams.get(PARAM.startDate) ?? '',
        endDate: searchParams.get(PARAM.endDate) ?? '',
        minConf: searchParams.get(PARAM.minConfidence) ?? '',
        maxConf: searchParams.get(PARAM.maxConfidence) ?? '',
        search: searchParams.get(PARAM.search) ?? '',
    });

    // Ref always holds the latest filters so the debounce callback reads
    // current values without needing to re-capture the closure.
    const filtersRef = useRef(filters);
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function buildAndPush(overrides: Partial<Filters> = {}) {
        const f = { ...filtersRef.current, ...overrides };
        const next = new URLSearchParams(searchParams.toString());

        const mapping: [keyof typeof PARAM, string][] = [
            ['classification', f.classification],
            ['startDate', f.startDate],
            ['endDate', f.endDate],
            ['minConfidence', f.minConf],
            ['maxConfidence', f.maxConf],
            ['search', f.search],
        ];

        for (const [key, value] of mapping) {
            if (value) {
                next.set(PARAM[key], value);
            } else {
                next.delete(PARAM[key]);
            }
        }

        next.delete('page'); // always reset to page 1 on filter change
        router.push(`${pathname}?${next.toString()}`, { scroll: false });
    }

    // ── Immediate-update handlers (select, date) ─────────────────────────────
    function handleImmediate(key: keyof Filters, value: string) {
        const next = { ...filters, [key]: value };
        setFilters(next);
        filtersRef.current = next; // sync ref before push
        buildAndPush({ [key]: value });
    }

    // ── Debounced handlers (text / number) ───────────────────────────────────
    function handleDebounced(key: keyof Filters, value: string) {
        const next = { ...filters, [key]: value };
        setFilters(next);
        filtersRef.current = next; // sync ref before debounce fires

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            buildAndPush(); // reads from filtersRef.current at call time
        }, 400);
    }

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    // ── Clear all ────────────────────────────────────────────────────────────
    function handleClear() {
        const cleared: Filters = {
            classification: '',
            startDate: '',
            endDate: '',
            minConf: '',
            maxConf: '',
            search: '',
        };
        setFilters(cleared);
        filtersRef.current = cleared;

        const next = new URLSearchParams(searchParams.toString());
        for (const key of Object.values(PARAM)) next.delete(key);
        next.delete('page');
        router.push(`${pathname}?${next.toString()}`, { scroll: false });
    }

    const isActive =
        filters.classification ||
        filters.startDate ||
        filters.endDate ||
        filters.minConf ||
        filters.maxConf ||
        filters.search;

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            {/* Search -------------------------------------------------------- */}
            <div className="relative min-w-[160px] flex-1 sm:max-w-[220px]">
                <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search sender…"
                    value={filters.search}
                    onChange={(e) => handleDebounced('search', e.target.value)}
                    className="pl-6"
                />
            </div>

            {/* Classification ------------------------------------------------ */}
            <select
                value={filters.classification}
                onChange={(e) => handleImmediate('classification', e.target.value)}
                aria-label="Classification filter"
                className={SELECT_CLS}
            >
                <option value="">All classifications</option>
                <option value="phishing">Phishing</option>
                <option value="suspicious">Suspicious</option>
                <option value="legitimate">Legitimate</option>
            </select>

            {/* Date range ---------------------------------------------------- */}
            <div className="flex items-center gap-1">
                <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleImmediate('startDate', e.target.value)}
                    aria-label="From date"
                    title="From date"
                    className={cn(SELECT_CLS, 'w-[130px]')}
                />
                <span className="text-[0.625rem] text-muted-foreground">–</span>
                <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleImmediate('endDate', e.target.value)}
                    aria-label="To date"
                    title="To date"
                    className={cn(SELECT_CLS, 'w-[130px]')}
                />
            </div>

            {/* Confidence range ---------------------------------------------- */}
            <div className="flex items-center gap-1">
                <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={filters.minConf}
                    onChange={(e) => handleDebounced('minConf', e.target.value)}
                    placeholder="Min %"
                    aria-label="Minimum confidence"
                    className={cn(SELECT_CLS, 'w-[68px]')}
                />
                <span className="text-[0.625rem] text-muted-foreground">–</span>
                <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={filters.maxConf}
                    onChange={(e) => handleDebounced('maxConf', e.target.value)}
                    placeholder="Max %"
                    aria-label="Maximum confidence"
                    className={cn(SELECT_CLS, 'w-[68px]')}
                />
            </div>

            {/* Clear --------------------------------------------------------- */}
            {isActive ? (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    aria-label="Clear all filters"
                >
                    <X />
                    Clear
                </Button>
            ) : null}
        </div>
    );
}
