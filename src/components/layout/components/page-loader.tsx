import { Shield } from 'lucide-react';

export function PageLoader() {
    return (
        <div className="fixed inset-0 z-[100] flex min-h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                    <span className="absolute inset-0 animate-ping rounded-xl bg-primary/40" />
                </div>
                <span className="font-heading text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Sentry
                </span>
            </div>
        </div>
    );
}
