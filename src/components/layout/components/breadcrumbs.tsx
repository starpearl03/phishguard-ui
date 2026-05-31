'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, Menu } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

interface BreadcrumbsProps {
    onMobileMenuToggle: () => void;
}

const TAB_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    history: 'History',
    submit: 'Submit',
    batch: 'Batch Submit',
    detail: 'Detail',
};

const ROUTE_LABELS: Record<string, string> = {
    '/inference': 'Inference',
    '/account': 'Account',
    '/users': 'Users',
    '/extension': 'Extension installs',
    '/unauthorized': 'Unauthorized',
};

export function Breadcrumbs({ onMobileMenuToggle }: BreadcrumbsProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const crumbs: { label: string; href?: string }[] = [];

    // Route-level crumb
    const routeLabel = ROUTE_LABELS[pathname];
    if (routeLabel) {
        crumbs.push({ label: routeLabel, href: pathname });
    }

    // Tab-level crumb (inference sub-tabs)
    if (pathname === '/inference') {
        const tab = searchParams.get('tab') || 'dashboard';
        const tabLabel = TAB_LABELS[tab];
        if (tabLabel) {
            crumbs.push({ label: tabLabel });
        }
    }

    return (
        <div className="flex h-12 items-center gap-3 border-b border-border/60 bg-card px-4">
            {/* Mobile menu button */}
            <button
                onClick={onMobileMenuToggle}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
            >
                <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb trail */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
                <Link
                    href="/inference"
                    className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                    <Home className="h-3.5 w-3.5" />
                </Link>

                {crumbs.map((crumb, i) => {
                    const isLast = i === crumbs.length - 1;
                    return (
                        <span key={i} className="flex items-center gap-1.5">
                            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                            {crumb.href && !isLast ? (
                                <Link
                                    href={crumb.href}
                                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-xs font-medium text-foreground">
                                    {crumb.label}
                                </span>
                            )}
                        </span>
                    );
                })}
            </nav>

            {/* Right-side actions */}
            <div className="ml-auto flex items-center gap-1">
                <ThemeToggle />
            </div>
        </div>
    );
}
