'use client';


import { useProfile } from "@/src/features/auth/hooks/use-auth";
import { useAuthStore, selectIsHydrated } from "@/src/features/auth/stores/auth.store";
import { PageLoader } from "@/src/components/layout/components/page-loader";

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    // Fetches /auth/me and hydrates the Zustand store.
    // On success: sets user + isAuthenticated + isHydrated
    // On failure (401, no token): just sets isHydrated so UI can proceed
    useProfile();

    const isHydrated = useAuthStore(selectIsHydrated);

    // Global gate: show a full-screen loader on app startup / full refresh
    // until auth state has been resolved.
    if (!isHydrated) {
        return <PageLoader />;
    }

    return <>{children}</>;
}
