'use client';

import { useState } from 'react';
import {
    ChevronDown,
    ExternalLink,
    KeyRound,
    Link2,
    Link2Off,
    CreditCard,
} from 'lucide-react';
import { Badge } from '@/src/components/shadcn/badge';
import { cn } from '@/src/lib/utils';
import type {
    LinkWithPageResponse,
    ResolveStatus,
    ScrapeStatus,
} from '../api/inference.types';
import { RiskLevelBadge } from './risk-level-badge';
import { ConfidenceBar } from './confidence-bar';

const RESOLVE_VARIANT: Record<ResolveStatus, React.ComponentProps<typeof Badge>['variant']> = {
    success: 'success',
    failed: 'destructive',
    timeout: 'warning',
    blocked: 'destructive',
};

const SCRAPE_VARIANT: Record<ScrapeStatus, React.ComponentProps<typeof Badge>['variant']> = {
    success: 'success',
    blocked: 'destructive',
    timeout: 'warning',
    js_required: 'warning',
};

function hostname(url: string | null | undefined) {
    if (!url) return '';
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

type PageAnalysisRowProps = {
    link: LinkWithPageResponse;
    defaultOpen?: boolean;
    className?: string;
};

export function PageAnalysisRow({ link, defaultOpen = false, className }: PageAnalysisRowProps) {
    const [open, setOpen] = useState(defaultOpen);
    const page = link.pageAnalysis;
    const displayUrl = link.resolvedUrl ?? link.originalUrl;

    return (
        <div
            className={cn(
                'overflow-hidden rounded-md bg-card ring-1 ring-foreground/10',
                className,
            )}
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted/40"
            >
                <ChevronDown
                    className={cn(
                        'size-3.5 shrink-0 text-muted-foreground transition-transform',
                        open && 'rotate-180',
                    )}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="truncate">{hostname(displayUrl)}</span>
                        {link.isShortened ? (
                            <Badge variant="outline">Shortened</Badge>
                        ) : null}
                    </div>
                    <span className="truncate text-[0.625rem] text-muted-foreground">
                        {displayUrl}
                    </span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                    {link.resolveStatus ? (
                        <Badge variant={RESOLVE_VARIANT[link.resolveStatus]}>
                            {link.resolveStatus === 'success' ? (
                                <Link2 />
                            ) : (
                                <Link2Off />
                            )}
                            {link.resolveStatus}
                        </Badge>
                    ) : (
                        <Badge variant="outline">unresolved</Badge>
                    )}
                    <RiskLevelBadge level={page?.riskLevel ?? null} />
                </div>
            </button>

            {open ? (
                <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 px-3 py-3 text-xs">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                        <Metric label="Redirect hops" value={String(link.redirectHops)} />
                        <Metric
                            label="HTTP"
                            value={link.httpStatus != null ? String(link.httpStatus) : '—'}
                        />
                        <Metric
                            label="Shortener"
                            value={link.shortener ?? '—'}
                        />
                    </div>

                    {link.intermediateDomains && link.intermediateDomains.length > 0 ? (
                        <div className="flex flex-col gap-1">
                            <Label>Redirect chain</Label>
                            <div className="flex flex-wrap gap-1">
                                {link.intermediateDomains.map((d, i) => (
                                    <Badge key={`${d}-${i}`} variant="outline">
                                        {d}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {page ? (
                        <>
                            <div className="border-t border-border/60" />

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                                <Metric label="Page title" value={page.pageTitle ?? '—'} />
                                <Metric
                                    label="Purpose"
                                    value={page.pagePurpose ?? '—'}
                                />
                                <Metric
                                    label="Impersonates"
                                    value={page.impersonatesBrand ?? '—'}
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                                {page.hasLoginForm || page.requestsCredentials ? (
                                    <Badge variant="destructive">
                                        <KeyRound />
                                        Credentials
                                    </Badge>
                                ) : null}
                                {page.hasPaymentForm || page.requestsPayment ? (
                                    <Badge variant="destructive">
                                        <CreditCard />
                                        Payment
                                    </Badge>
                                ) : null}
                                {page.faviconMatchesDomain === false ? (
                                    <Badge variant="warning">Favicon mismatch</Badge>
                                ) : null}
                                {page.scrapeStatus ? (
                                    <Badge variant={SCRAPE_VARIANT[page.scrapeStatus]}>
                                        scrape: {page.scrapeStatus}
                                    </Badge>
                                ) : null}
                            </div>

                            {page.riskConfidence != null ? (
                                <ConfidenceBar
                                    value={page.riskConfidence}
                                    label="Risk confidence"
                                    tone={
                                        page.riskLevel === 'high'
                                            ? 'destructive'
                                            : page.riskLevel === 'medium'
                                              ? 'warning'
                                              : page.riskLevel === 'low'
                                                ? 'success'
                                                : 'muted'
                                    }
                                />
                            ) : null}

                            {page.riskReasons && page.riskReasons.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                    <Label>Risk reasons</Label>
                                    <ul className="flex flex-col gap-1 text-xs/relaxed text-foreground/90">
                                        {page.riskReasons.map((r, i) => (
                                            <li
                                                key={i}
                                                className="before:mr-1.5 before:text-muted-foreground before:content-['•']"
                                            >
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}

                            {page.summary ? (
                                <div className="flex flex-col gap-1">
                                    <Label>Summary</Label>
                                    <p className="text-xs/relaxed text-foreground/90 whitespace-pre-wrap">
                                        {page.summary}
                                    </p>
                                </div>
                            ) : null}

                            {page.externalDomains && page.externalDomains.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                    <Label>External domains</Label>
                                    <div className="flex flex-wrap gap-1">
                                        {page.externalDomains.map((d, i) => (
                                            <Badge key={`${d}-${i}`} variant="outline">
                                                {d}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            No page analysis available.
                        </p>
                    )}

                    <div className="flex justify-end">
                        <a
                            href={displayUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="inline-flex items-center gap-1 text-[0.625rem] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                        >
                            Open in new tab
                            <ExternalLink className="size-2.5" />
                        </a>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return (
        <span className="text-[0.625rem] uppercase tracking-wider text-muted-foreground">
            {children}
        </span>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <Label>{label}</Label>
            <span className="truncate text-xs text-foreground">{value}</span>
        </div>
    );
}
