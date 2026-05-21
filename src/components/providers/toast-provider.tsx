'use client';

import { Toaster } from '@/src/components/shadcn/sonner';

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
        />
    );
}