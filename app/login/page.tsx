'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, selectIsAuthenticated, selectIsHydrated } from '@/src/features/auth';
import { LoginForm } from '@/src/features/auth/components';

export default function LoginPage() {
    const router = useRouter();
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const isHydrated = useAuthStore(selectIsHydrated);

    useEffect(() => {
        if (isHydrated && isAuthenticated) {
            router.replace('/inference');
        }
    }, [isHydrated, isAuthenticated, router]);

    if (isHydrated && isAuthenticated) {
        return null;
    }

    return <LoginForm />;
}