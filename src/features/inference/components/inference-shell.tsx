'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { InferenceDashboardPage } from './dashboard/dashboard-page';
import { InferenceHistoryPage } from './history/history-page';
import { InferenceDetailPage } from './detail/detail-page';
import { InferenceSubmitPage } from './submit/submit-page';
import { InferenceBatchPage } from './submit/batch-page';

// Tabs that appear in the navigation bar (excludes 'detail' — it's accessed
// via row navigation and has no persistent tab button).
type NavTab = 'dashboard' | 'history' | 'submit' | 'batch';
type AnyTab = NavTab | 'detail';

const NAV_TABS: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'history',   label: 'History' },
    { id: 'submit',    label: 'Submit' },
    { id: 'batch',     label: 'Batch Submit' },
];

function parseTab(raw: string | null): AnyTab {
    switch (raw) {
        case 'history': return 'history';
        case 'detail':  return 'detail';
        case 'submit':  return 'submit';
        case 'batch':   return 'batch';
        default:        return 'dashboard';
    }
}

export function InferenceShell() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const activeTab = parseTab(searchParams.get('tab'));

    function setTab(tab: NavTab) {
        const next = new URLSearchParams();
        next.set('tab', tab);
        router.push(`${pathname}?${next.toString()}`, { scroll: false });
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            {/* ── Tab bar ─────────────────────────────────────────── */}
            <div className="border-b border-border/60 bg-card px-4 sm:px-6">
                <nav
                    role="tablist"
                    aria-label="Inference sections"
                    className="-mb-px flex gap-0"
                >
                    {NAV_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            type="button"
                            aria-selected={activeTab === tab.id}
                            onClick={() => setTab(tab.id)}
                            className={cn(
                                'px-4 py-2.5 text-xs font-medium transition-colors',
                                'border-b-2 whitespace-nowrap',
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* ── Tab panels ──────────────────────────────────────── */}
            <div role="tabpanel" className="flex-1 overflow-auto">
                {activeTab === 'dashboard' && <InferenceDashboardPage />}
                {activeTab === 'history'   && <InferenceHistoryPage />}
                {activeTab === 'detail'    && <InferenceDetailPage />}
                {activeTab === 'submit'    && <InferenceSubmitPage />}
                {activeTab === 'batch'     && <InferenceBatchPage />}
            </div>
        </div>
    );
}
