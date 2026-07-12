'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronRight, Send } from 'lucide-react';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Label } from '@/src/components/shadcn/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/shadcn/card';
import { cn } from '@/src/lib/utils';
import { useSubmitEmail } from '../../hooks/use-inference';
import { RecentHistoryPanel } from './recent-history-panel';

// ─── Shared styles ────────────────────────────────────────────────────────────

const TEXTAREA_CLS =
    'w-full rounded-md border border-input bg-input/20 px-2 py-1.5 text-xs/relaxed ' +
    'transition-colors outline-none resize-none placeholder:text-muted-foreground ' +
    'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 ' +
    'disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30 ' +
    'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20';

// ─── Validation ───────────────────────────────────────────────────────────────

type FormErrors = {
    sender?: string;
    subject?: string;
    body?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f: {
    sender: string;
    subject: string;
    body: string;
}): FormErrors {
    const e: FormErrors = {};
    if (!f.sender.trim()) e.sender = 'Sender is required';
    else if (!EMAIL_RE.test(f.sender.trim()))
        e.sender = 'Enter a valid email address';
    if (!f.subject.trim()) e.subject = 'Subject is required';
    if (!f.body.trim()) e.body = 'Body is required';
    return e;
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
            <span>Submit</span>
        </nav>
    );
}

// ─── Field ───────────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return <p className="text-xs text-destructive">{msg}</p>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function InferenceSubmitPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const submit = useSubmitEmail();

    const [sender, setSender] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    function touch(field: string) {
        setTouched((prev) => ({ ...prev, [field]: true }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate({ sender, subject, body });
        setErrors(errs);
        setTouched({ sender: true, subject: true, body: true });
        if (Object.keys(errs).length > 0) return;

        submit.mutate(
            {
                sender: sender.trim(),
                subject: subject.trim(),
                body: body.trim(),
            },
            {
                onSuccess: (res) => {
                    const p = new URLSearchParams(searchParams.toString());
                    p.set('tab', 'detail');
                    p.set('id', res.emailId);
                    router.push(`${pathname}?${p.toString()}`);
                },
                onError: (err) => {
                    setErrors({ body: err.getMessage() });
                },
            },
        );
    }

    const liveErrors = touched.sender || touched.subject || touched.body
        ? validate({ sender, subject, body })
        : {};

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-1">
                <Breadcrumb />
                <h1 className="text-lg font-semibold text-foreground">
                    Submit email
                </h1>
            </div>

            {/* ── Two-column layout ───────────────────────────────── */}
            <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                {/* Form card */}
                <div className="mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-none">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>New email analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                        {/* Sender */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="sender">
                                Sender
                                <span className="ml-1 text-destructive">*</span>
                            </Label>
                            <Input
                                id="sender"
                                type="email"
                                placeholder="attacker@example.com"
                                value={sender}
                                onChange={(e) => setSender(e.target.value)}
                                onBlur={() => touch('sender')}
                                disabled={submit.isPending}
                                aria-invalid={!!(touched.sender && liveErrors.sender)}
                            />
                            <FieldError
                                msg={touched.sender ? liveErrors.sender : undefined}
                            />
                        </div>

                        {/* Subject */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="subject">
                                Subject
                                <span className="ml-1 text-destructive">*</span>
                            </Label>
                            <Input
                                id="subject"
                                type="text"
                                placeholder="Urgent: verify your account"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                onBlur={() => touch('subject')}
                                disabled={submit.isPending}
                                aria-invalid={!!(touched.subject && liveErrors.subject)}
                            />
                            <FieldError
                                msg={touched.subject ? liveErrors.subject : undefined}
                            />
                        </div>

                        {/* Body */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="body">
                                Email body
                                <span className="ml-1 text-destructive">*</span>
                            </Label>
                            <textarea
                                id="body"
                                rows={10}
                                placeholder="Paste the full email body here…"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                onBlur={() => touch('body')}
                                disabled={submit.isPending}
                                aria-invalid={!!(touched.body && liveErrors.body)}
                                className={cn(
                                    TEXTAREA_CLS,
                                    touched.body &&
                                        liveErrors.body &&
                                        'border-destructive ring-2 ring-destructive/20',
                                )}
                            />
                            <FieldError
                                msg={touched.body ? liveErrors.body : undefined}
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end pt-1">
                            <Button
                                type="submit"
                                disabled={submit.isPending}
                                className="gap-2"
                            >
                                <Send />
                                {submit.isPending ? 'Submitting…' : 'Submit for analysis'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                    </Card>
                </div>

                {/* Recent history panel */}
                <div className="mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-none">
                    <RecentHistoryPanel />
                </div>
            </div>
        </div>
    );
}
