'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuthStore, selectUser } from '@/src/features/auth';
import { Button } from '@/src/components/shadcn/button';

export default function UnauthorizedPage() {
    const router = useRouter();
    const user = useAuthStore(selectUser);

    return (
        <div className="flex w-full flex-1 items-center justify-center px-6 py-12">
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
                    <ShieldAlert className="h-7 w-7 text-destructive" />
                </div>

                <div className="space-y-3">
                    <h1 className="font-heading text-3xl font-bold tracking-tight">
                        Access denied
                    </h1>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        You don&apos;t have permission to view this page. If you think
                        this is a mistake, contact an administrator.
                    </p>
                </div>

                {user && (
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                            Signed in as
                        </span>
                        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs">
                            <span className="font-medium">{user.email}</span>
                            <span className="opacity-30">&middot;</span>
                            <span className="font-mono text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
                                {user.role}
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-2">
                    <Button variant="outline" size="lg" onClick={() => router.back()}>
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        Go back
                    </Button>
                    <Button size="lg" onClick={() => router.replace('/inference')}>
                        <Home className="mr-1.5 h-4 w-4" />
                        Return home
                    </Button>
                </div>
            </div>
        </div>
    );
}
