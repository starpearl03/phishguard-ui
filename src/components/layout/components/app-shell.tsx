'use client';

import { useState, useEffect, Suspense } from 'react';
import { cn } from '@/src/lib/utils';
import { Sidebar } from './sidebar';
import { Breadcrumbs } from './breadcrumbs';

interface AppShellProps {
    children: React.ReactNode;
}

const COLLAPSED_KEY = 'sentry-sidebar-collapsed';

export function AppShell({ children }: AppShellProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Hydrate collapsed preference from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(COLLAPSED_KEY);
        if (stored === 'true') setCollapsed(true);
    }, []);

    function toggleCollapse() {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(COLLAPSED_KEY, String(next));
            return next;
        });
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Suspense fallback={<div className={cn('fixed top-0 left-0 z-50 h-full border-r border-sidebar-border bg-sidebar transition-all duration-300', collapsed ? 'w-16' : 'w-64')} />}>
                <Sidebar
                    collapsed={collapsed}
                    onToggleCollapse={toggleCollapse}
                    mobileOpen={mobileOpen}
                    onMobileClose={() => setMobileOpen(false)}
                />
            </Suspense>

            <div
                className={cn(
                    'flex flex-1 flex-col overflow-hidden transition-all duration-300',
                    collapsed ? 'lg:ml-16' : 'lg:ml-64',
                )}
            >
                <Suspense fallback={<div className="h-12 border-b border-border/60 bg-card" />}>
                    <Breadcrumbs onMobileMenuToggle={() => setMobileOpen((v) => !v)} />
                </Suspense>

                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
