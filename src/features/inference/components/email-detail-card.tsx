'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ExternalLink, Mail, User, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/src/components/shadcn/card';
import { Badge } from '@/src/components/shadcn/badge';
import { cn } from '@/src/lib/utils';
import type { EmailDetailResponse, OverrideTrigger } from '../api/inference.types';
import { EmailStatusBadge, deriveEmailStatus } from './email-status-badge';
import { ConfidenceBar } from './confidence-bar';
import { PipelineStatusIndicator } from './pipeline-status-indicator';
import { PageAnalysisRow } from './page-analysis-row';
import { AggregationNoteBlock } from './aggregation-note-block';

const TRIGGER_LABEL: Record<OverrideTrigger, string> = {
    page_high_risk: 'Page • High risk',
    page_medium_risk: 'Page • Medium risk',
    all_low: 'All pages low',
    all_failed: 'All pages failed',
    early_exit: 'Early exit',
};

function fmtDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    try {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="text-[0.625rem] uppercase tracking-wider text-muted-foreground">
            {children}
        </span>
    );
}

function Metric({
    label,
    value,
    mono,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex flex-col gap-0.5">
            <SectionLabel>{label}</SectionLabel>
            <span className={cn('truncate text-xs text-foreground', mono && 'font-mono')}>
                {value}
            </span>
        </div>
    );
}

type ExpandToggleProps = {
    open: boolean;
    onToggle: () => void;
    label: string;
};

function ExpandToggle({ open, onToggle, label }: ExpandToggleProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="flex items-center gap-1.5 text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
            <ChevronDown
                className={cn('size-3 transition-transform', open && 'rotate-180')}
            />
            {label}
        </button>
    );
}

type EmailDetailCardProps = {
    email: EmailDetailResponse;
    className?: string;
};

export function EmailDetailCard({ email, className }: EmailDetailCardProps) {
    const [linksOpen, setLinksOpen] = useState(false);
    const [metaOpen, setMetaOpen] = useState(false);

    const status = deriveEmailStatus(email);

    return (
        <Card className={cn('gap-0 py-0', className)}>
            {/* ── Header ─────────────────────────────────────────── */}
            <CardHeader className="border-b border-border/60 py-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate text-sm font-medium">{email.subject}</span>
                        </div>
                        <span className="flex items-center gap-1.5 text-[0.625rem] text-muted-foreground">
                            <User className="size-3" />
                            {email.sender}
                        </span>
                    </div>
                    <EmailStatusBadge status={status} className="shrink-0" />
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 py-4">
                {/* ── Pipeline indicator ─────────────────────────── */}
                <PipelineStatusIndicator
                    stage={email.pipelineStage}
                    status={email.pipelineStatus}
                    error={email.pipelineError}
                />

                {/* ── Timestamps ─────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                    <Metric label="Received" value={fmtDate(email.receivedAt)} />
                    <Metric label="Processed" value={fmtDate(email.processedAt)} />
                    <Metric label="Finalised" value={fmtDate(email.finalisedAt)} />
                </div>

                {/* ── Confidence ─────────────────────────────────── */}
                {(email.confidence != null || email.finalConfidence != null) && (
                    <div className="flex flex-col gap-2">
                        {email.confidence != null && (
                            <ConfidenceBar
                                value={email.confidence}
                                classification={email.classification}
                                label="Stage-1 confidence"
                            />
                        )}
                        {email.finalConfidence != null && (
                            <ConfidenceBar
                                value={email.finalConfidence}
                                classification={email.finalClassification}
                                label="Final confidence"
                            />
                        )}
                        {email.overrideTrigger && (
                            <div className="flex items-center gap-1.5">
                                <SectionLabel>Override trigger</SectionLabel>
                                <Badge variant="info">
                                    {TRIGGER_LABEL[email.overrideTrigger]}
                                </Badge>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Risk factors ───────────────────────────────── */}
                {email.riskFactors && email.riskFactors.length > 0 && (
                    <div className="flex flex-col gap-1">
                        <SectionLabel>Risk factors</SectionLabel>
                        <ul className="flex flex-col gap-1 text-xs/relaxed text-foreground/90">
                            {email.riskFactors.map((r, i) => (
                                <li
                                    key={i}
                                    className="before:mr-1.5 before:text-muted-foreground before:content-['•']"
                                >
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ── LLM reasoning ──────────────────────────────── */}
                {email.reasoning && (
                    <div className="flex flex-col gap-1">
                        <SectionLabel>LLM reasoning</SectionLabel>
                        <p className="whitespace-pre-wrap text-xs/relaxed text-foreground/90">
                            {email.reasoning}
                        </p>
                    </div>
                )}

                {/* ── Aggregation note ───────────────────────────── */}
                <AggregationNoteBlock
                    note={email.aggregationNote}
                    overrideTrigger={email.overrideTrigger}
                />

                {/* ── Manual review ──────────────────────────────── */}
                {email.manualReviewFlag && (
                    <div className="flex flex-col gap-2 rounded-md bg-blue-500/5 p-3 ring-1 ring-blue-500/20">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-[0.625rem] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                <UserCheck className="size-3" />
                                Manual review
                            </div>
                            {email.manualOverrideClassification && (
                                <EmailStatusBadge
                                    status={email.manualOverrideClassification}
                                />
                            )}
                        </div>
                        {email.manualReviewNote && (
                            <p className="text-xs/relaxed text-foreground/90">
                                {email.manualReviewNote}
                            </p>
                        )}
                        {(email.manualReviewBy || email.manualReviewAt) && (
                            <div className="flex items-center gap-3 text-[0.625rem] text-muted-foreground">
                                {email.manualReviewBy && (
                                    <span>By {email.manualReviewBy}</span>
                                )}
                                {email.manualReviewAt && (
                                    <span>{fmtDate(email.manualReviewAt)}</span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Links & page analysis ──────────────────────── */}
                {email.links.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                        <ExpandToggle
                            open={linksOpen}
                            onToggle={() => setLinksOpen((v) => !v)}
                            label={`Links & page analysis (${email.links.length})`}
                        />
                        {linksOpen && (
                            <div className="flex flex-col gap-1.5">
                                {email.links.map((link) => (
                                    <PageAnalysisRow key={link.id} link={link} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Technical metadata ─────────────────────────── */}
                <div className="flex flex-col gap-1.5 border-t border-border/60 pt-3">
                    <ExpandToggle
                        open={metaOpen}
                        onToggle={() => setMetaOpen((v) => !v)}
                        label="Technical metadata"
                    />
                    {metaOpen && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                            <Metric label="Email ID" value={email.id} mono />
                            <Metric
                                label="Body hash"
                                value={`${email.bodyHash.slice(0, 16)}…`}
                                mono
                            />
                            <Metric label="LLM model" value={email.llmModel ?? '—'} />
                            <Metric label="Submitted by" value={email.submittedBy ?? '—'} />
                            {email.submittedByInstall ? (
                                <div className="flex flex-col gap-0.5">
                                    <SectionLabel>Submitted via install</SectionLabel>
                                    <Link
                                        href={`/extension/installs/${email.submittedByInstall}`}
                                        className="inline-flex items-center gap-1 truncate font-mono text-xs text-primary transition-colors hover:underline"
                                    >
                                        <span className="truncate">{email.submittedByInstall}</span>
                                        <ExternalLink className="size-3 shrink-0" />
                                    </Link>
                                </div>
                            ) : (
                                <Metric label="Submitted via install" value="—" />
                            )}
                            <Metric label="Link count" value={String(email.linkCount)} />
                            <Metric label="Created" value={fmtDate(email.createdAt)} />
                            <Metric label="Updated" value={fmtDate(email.updatedAt)} />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
