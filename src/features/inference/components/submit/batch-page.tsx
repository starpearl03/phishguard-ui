'use client';

import { useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
    ChevronRight,
    Plus,
    Trash2,
    CheckCircle2,
    XCircle,
    ExternalLink,
} from 'lucide-react';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Label } from '@/src/components/shadcn/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/shadcn/card';
import { Badge } from '@/src/components/shadcn/badge';
import { cn } from '@/src/lib/utils';
import { useSubmitBatch } from '../../hooks/use-inference';
import type { SubmitEmailBatchResponse } from '../../api/inference.types';
import { RecentHistoryPanel } from './recent-history-panel';

const MAX_EMAILS = 50;

const TEXTAREA_CLS =
    'w-full rounded-md border border-input bg-input/20 px-2 py-1.5 text-xs/relaxed ' +
    'transition-colors outline-none resize-none placeholder:text-muted-foreground ' +
    'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 ' +
    'disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30 ' +
    'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Types ────────────────────────────────────────────────────────────────────

type BatchEntry = {
    _key: string;
    sender: string;
    subject: string;
    body: string;
};

type EntryErrors = {
    sender?: string;
    subject?: string;
    body?: string;
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validateEntry(e: BatchEntry): EntryErrors {
    const err: EntryErrors = {};
    if (!e.sender.trim()) err.sender = 'Required';
    else if (!EMAIL_RE.test(e.sender.trim())) err.sender = 'Invalid email';
    if (!e.subject.trim()) err.subject = 'Required';
    if (!e.body.trim()) err.body = 'Required';
    return err;
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb() {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-muted-foreground"
        >
            <span className="font-medium text-foreground">Inference</span>
            <ChevronRight className="size-3 shrink-0" />
            <span>Batch Submit</span>
        </nav>
    );
}

// ─── Individual email row ─────────────────────────────────────────────────────

type EmailRowProps = {
    index: number;
    entry: BatchEntry;
    errors: EntryErrors;
    onChange: (patch: Partial<BatchEntry>) => void;
    onRemove: () => void;
    canRemove: boolean;
    disabled: boolean;
};

function EmailRow({
    index,
    entry,
    errors,
    onChange,
    onRemove,
    canRemove,
    disabled,
}: EmailRowProps) {
    return (
        <Card size="sm" className="gap-0 py-0">
            <CardHeader className="border-b border-border/60 py-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
                        Email {index + 1}
                    </span>
                    {canRemove && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={onRemove}
                            disabled={disabled}
                            aria-label={`Remove email ${index + 1}`}
                        >
                            <Trash2 />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 py-3">
                {/* Sender + Subject row */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor={`sender-${entry._key}`}>
                            Sender<span className="ml-1 text-destructive">*</span>
                        </Label>
                        <Input
                            id={`sender-${entry._key}`}
                            type="email"
                            placeholder="sender@domain.com"
                            value={entry.sender}
                            onChange={(e) => onChange({ sender: e.target.value })}
                            disabled={disabled}
                            aria-invalid={!!errors.sender}
                        />
                        {errors.sender && (
                            <p className="text-xs text-destructive">{errors.sender}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor={`subject-${entry._key}`}>
                            Subject<span className="ml-1 text-destructive">*</span>
                        </Label>
                        <Input
                            id={`subject-${entry._key}`}
                            type="text"
                            placeholder="Email subject"
                            value={entry.subject}
                            onChange={(e) => onChange({ subject: e.target.value })}
                            disabled={disabled}
                            aria-invalid={!!errors.subject}
                        />
                        {errors.subject && (
                            <p className="text-xs text-destructive">{errors.subject}</p>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-1">
                    <Label htmlFor={`body-${entry._key}`}>
                        Body<span className="ml-1 text-destructive">*</span>
                    </Label>
                    <textarea
                        id={`body-${entry._key}`}
                        rows={3}
                        placeholder="Email body text…"
                        value={entry.body}
                        onChange={(e) => onChange({ body: e.target.value })}
                        disabled={disabled}
                        aria-invalid={!!errors.body}
                        className={cn(
                            TEXTAREA_CLS,
                            errors.body &&
                                'border-destructive ring-2 ring-destructive/20',
                        )}
                    />
                    {errors.body && (
                        <p className="text-xs text-destructive">{errors.body}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Results panel ────────────────────────────────────────────────────────────

function ResultsPanel({
    result,
    onReset,
    onViewDetail,
}: {
    result: SubmitEmailBatchResponse;
    onReset: () => void;
    onViewDetail: (id: string) => void;
}) {
    return (
        <div className="flex flex-col gap-4">
            {/* Summary badges */}
            <div className="flex flex-wrap gap-2">
                <Badge variant="success">
                    <CheckCircle2 />
                    {result.submitted.length} submitted
                </Badge>
                {result.rejected.length > 0 && (
                    <Badge variant="destructive">
                        <XCircle />
                        {result.rejected.length} rejected
                    </Badge>
                )}
            </div>

            {/* Submitted list */}
            {result.submitted.length > 0 && (
                <div className="flex flex-col gap-1">
                    <p className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
                        Submitted emails
                    </p>
                    <div className="flex flex-col divide-y divide-border/60 rounded-lg ring-1 ring-foreground/10 bg-card overflow-hidden">
                        {result.submitted.map((item, i) => (
                            <div
                                key={item.emailId}
                                className="flex items-center justify-between gap-3 px-3 py-2"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-[0.625rem] tabular-nums text-muted-foreground w-5 shrink-0">
                                        {i + 1}
                                    </span>
                                    <span
                                        className="font-mono text-xs text-foreground/90 truncate"
                                        title={item.emailId}
                                    >
                                        {item.emailId}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onViewDetail(item.emailId)}
                                    className="shrink-0 inline-flex items-center gap-1 text-[0.625rem] uppercase tracking-wider text-primary hover:underline"
                                >
                                    View
                                    <ExternalLink className="size-2.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rejected list */}
            {result.rejected.length > 0 && (
                <div className="flex flex-col gap-1">
                    <p className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
                        Rejected
                    </p>
                    <div className="flex flex-col divide-y divide-border/60 rounded-lg ring-1 ring-foreground/10 bg-card overflow-hidden">
                        {result.rejected.map((item) => (
                            <div
                                key={item.index}
                                className="flex items-center gap-3 px-3 py-2"
                            >
                                <span className="text-[0.625rem] tabular-nums text-muted-foreground w-5 shrink-0">
                                    #{item.index + 1}
                                </span>
                                <span className="text-xs text-destructive">{item.reason}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Button variant="outline" size="sm" onClick={onReset} className="self-start">
                Submit another batch
            </Button>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function makeEntry(): BatchEntry {
    return { _key: crypto.randomUUID(), sender: '', subject: '', body: '' };
}

export function InferenceBatchPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [entries, setEntries] = useState<BatchEntry[]>(() => [makeEntry()]);
    const [fieldErrors, setFieldErrors] = useState<Record<string, EntryErrors>>({});
    const [result, setResult] = useState<SubmitEmailBatchResponse | null>(null);

    const submitBatch = useSubmitBatch();

    function updateEntry(key: string, patch: Partial<BatchEntry>) {
        setEntries((prev) =>
            prev.map((e) => (e._key === key ? { ...e, ...patch } : e)),
        );
        // Clear errors for the changed field
        if (fieldErrors[key]) {
            const cleared = { ...fieldErrors[key] } as EntryErrors;
            for (const f of Object.keys(patch) as (keyof EntryErrors)[]) {
                delete cleared[f];
            }
            setFieldErrors((prev) => ({ ...prev, [key]: cleared }));
        }
    }

    function addEntry() {
        if (entries.length >= MAX_EMAILS) return;
        setEntries((prev) => [...prev, makeEntry()]);
    }

    function removeEntry(key: string) {
        setEntries((prev) => prev.filter((e) => e._key !== key));
        setFieldErrors((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Validate all entries
        const allErrors: Record<string, EntryErrors> = {};
        let hasErrors = false;
        for (const entry of entries) {
            const errs = validateEntry(entry);
            if (Object.keys(errs).length > 0) {
                allErrors[entry._key] = errs;
                hasErrors = true;
            }
        }
        setFieldErrors(allErrors);
        if (hasErrors) return;

        submitBatch.mutate(
            {
                emails: entries.map((e) => ({
                    sender: e.sender.trim(),
                    subject: e.subject.trim(),
                    body: e.body.trim(),
                })),
            },
            {
                onSuccess: (res) => setResult(res),
                onError: (err) => {
                    setFieldErrors({ _global: { body: err.getMessage() } });
                },
            },
        );
    }

    function goToDetail(id: string) {
        const p = new URLSearchParams(searchParams.toString());
        p.set('tab', 'detail');
        p.set('id', id);
        router.push(`${pathname}?${p.toString()}`);
    }

    function handleReset() {
        setEntries([makeEntry()]);
        setFieldErrors({});
        setResult(null);
    }

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-1">
                <Breadcrumb />
                <h1 className="text-lg font-semibold text-foreground">
                    Batch submit
                </h1>
            </div>

            {/* ── Two-column layout ───────────────────────────────── */}
            <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                {/* Form / results column */}
                <div className="mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-none">
                    {result ? (
                        <ResultsPanel
                            result={result}
                            onReset={handleReset}
                            onViewDetail={goToDetail}
                        />
                    ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                    {/* Email entries */}
                    <div className="flex flex-col gap-3">
                        {entries.map((entry, i) => (
                            <EmailRow
                                key={entry._key}
                                index={i}
                                entry={entry}
                                errors={fieldErrors[entry._key] ?? {}}
                                onChange={(patch) => updateEntry(entry._key, patch)}
                                onRemove={() => removeEntry(entry._key)}
                                canRemove={entries.length > 1}
                                disabled={submitBatch.isPending}
                            />
                        ))}
                    </div>

                    {/* Add + Submit row */}
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addEntry}
                            disabled={entries.length >= MAX_EMAILS || submitBatch.isPending}
                        >
                            <Plus />
                            Add email
                            {entries.length >= MAX_EMAILS && (
                                <span className="ml-1 text-muted-foreground">
                                    (max {MAX_EMAILS})
                                </span>
                            )}
                        </Button>

                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                                {entries.length} / {MAX_EMAILS}
                            </span>
                            <Button
                                type="submit"
                                disabled={submitBatch.isPending}
                            >
                                {submitBatch.isPending
                                    ? 'Submitting…'
                                    : `Submit ${entries.length} email${entries.length !== 1 ? 's' : ''}`}
                            </Button>
                        </div>
                    </div>

                    {/* Global error */}
                    {fieldErrors['_global']?.body && (
                        <p className="text-xs text-destructive">
                            {fieldErrors['_global'].body}
                        </p>
                    )}
                </form>
                    )}
                </div>

                {/* Recent history panel */}
                <div className="mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-none">
                    <RecentHistoryPanel />
                </div>
            </div>
        </div>
    );
}
