'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    useAuthStore,
    selectIsAuthenticated,
    selectIsHydrated,
    selectUser,
} from '../stores/auth.store';
import {UserRole} from "@/src/lib";
import { PageLoader } from "@/src/components/layout/components/page-loader";

interface AuthGuardProps {
    children: React.ReactNode;
    roles?: UserRole[];
    /** Custom loading component while hydrating */
    fallback?: React.ReactNode;
    /** Redirect path when not authenticated (default: /login) */
    loginPath?: string;
    /** Redirect path when authenticated but unauthorized (default: /unauthorized) */
    unauthorizedPath?: string;
}

export function AuthGuard({
                              children,
                              roles,
                              fallback,
                              loginPath = '/login',
                              unauthorizedPath = '/unauthorized',
                          }: AuthGuardProps) {
    const router = useRouter();
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const isHydrated = useAuthStore(selectIsHydrated);
    const user = useAuthStore(selectUser);

    const hasRequiredRole =
        !roles || (user?.role && roles.includes(user.role as UserRole));

    useEffect(() => {
        if (!isHydrated) return;

        if (!isAuthenticated) {
            router.replace(loginPath);
            return;
        }

        if (!hasRequiredRole) {
            router.replace(unauthorizedPath);
        }
    }, [isHydrated, isAuthenticated, hasRequiredRole, router, loginPath, unauthorizedPath]);

    // Still checking auth status (global AuthProvider gate normally handles this;
    // kept here as a defensive fallback for any guard rendered outside it).
    if (!isHydrated) {
        return <>{fallback ?? <PageLoader />}</>;
    }

    // Not authenticated or wrong role — redirect in progress, show the global loader
    // rather than flashing a partial UI.
    if (!isAuthenticated || !hasRequiredRole) {
        return <>{fallback ?? <PageLoader />}</>;
    }

    return <>{children}</>;
}
