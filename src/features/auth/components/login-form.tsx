'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '../hooks/use-auth';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Label } from '@/src/components/shadcn/label';
import {
    Shield,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    Mail,
    Lock,
    ShieldCheck,
    Activity,
    Sparkles,
} from 'lucide-react';
import {ApiError} from "@/src/lib";

export function LoginForm() {
    const router = useRouter();
    const login = useLogin();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const error = login.error as ApiError | null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email || !password) return;

        login.mutate(
            { email, password },
            {
                onSuccess: () => {
                    router.replace('/inference');
                },
            },
        );
    }

    return (
        <div className="grid min-h-screen w-full lg:grid-cols-2">
            {/* ─────────────────────────────────────────── */}
            {/* LEFT — Brand panel                          */}
            {/* ─────────────────────────────────────────── */}
            <div className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
                {/* Decorative grid background */}
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                />
                {/* Glow accent */}
                <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
                <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-foreground/5 blur-3xl" />

                {/* Top — Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/15 backdrop-blur-sm">
                        <Shield className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-heading text-lg font-bold text-primary-foreground">
                        Sentry
                    </span>
                </div>

                {/* Middle — Pitch */}
                <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                        <h2 className="font-heading text-4xl font-bold leading-tight text-primary-foreground">
                            Phishing detection,<br />
                            engineered for clarity.
                        </h2>
                        <p className="max-w-md text-base leading-relaxed text-primary-foreground/70">
                            Real-time analysis of suspicious emails. Built for security teams that need answers, not noise.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="space-y-3">
                        <FeaturePill
                            icon={<ShieldCheck className="h-4 w-4" />}
                            text="ML-powered threat classification"
                        />
                        <FeaturePill
                            icon={<Activity className="h-4 w-4" />}
                            text="Live monitoring & analytics"
                        />
                        <FeaturePill
                            icon={<Sparkles className="h-4 w-4" />}
                            text="Adaptive learning models"
                        />
                    </div>
                </div>

                {/* Bottom — Footer */}
                <div className="relative z-10 flex items-center gap-2 text-xs text-primary-foreground/50">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground/60" />
                    <span>System operational</span>
                    <span className="mx-2 opacity-30">·</span>
                    <span>v1.0</span>
                </div>
            </div>

            {/* ─────────────────────────────────────────── */}
            {/* RIGHT — Form panel                          */}
            {/* ─────────────────────────────────────────── */}
            <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
                <div className="mx-auto w-full max-w-sm space-y-8">
                    {/* Mobile logo (only visible on small screens) */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                            <Shield className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-heading text-lg font-bold">Sentry</span>
                    </div>

                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="font-heading text-3xl font-bold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Sign in to your account to continue
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 text-sm">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                                <div className="space-y-1">
                                    <p className="font-medium text-destructive">
                                        {error.getMessage()}
                                    </p>
                                    {error.hasFieldErrors() &&
                                        Object.entries(error.fieldErrors || {}).map(
                                            ([field, errors]) =>
                                                errors.map((err, i) => (
                                                    <p
                                                        key={`${field}-${i}`}
                                                        className="text-xs text-destructive/80"
                                                    >
                                                        {err}
                                                    </p>
                                                )),
                                        )}
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={login.isPending}
                                    autoComplete="email"
                                    className="h-11 pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={login.isPending}
                                    autoComplete="current-password"
                                    className="h-11 pl-10 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            size="lg"
                            className="h-11 w-full font-medium"
                            disabled={login.isPending || !email || !password}
                        >
                            {login.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="border-t border-border pt-6">
                        <p className="text-center text-xs leading-relaxed text-muted-foreground">
                            Authorized personnel only.
                            <br />
                            All access is monitored and logged.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-3 text-sm text-primary-foreground/85">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-foreground/10 text-primary-foreground">
                {icon}
            </div>
            <span>{text}</span>
        </div>
    );
}