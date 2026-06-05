import { create } from 'zustand';
import {AuthTokens, clearAuthAndRedirect, setAuthCookies, UserDto} from "@/src/lib";

// ─────────────────────────────────────────────
// State shape
// ─────────────────────────────────────────────

interface AuthState {
    user: UserDto | null;
    isAuthenticated: boolean;
    isHydrated: boolean; // true once we've checked /auth/me on mount
}

interface AuthActions {
    /** Set user + tokens after login/register */
    setAuth: (user: UserDto, tokens: AuthTokens) => void;

    /** Update user data (after profile edit, /auth/me refetch, etc.) */
    setUser: (user: UserDto) => void;

    /** Mark hydration complete (called after initial /auth/me check) */
    setHydrated: () => void;

    /** Clear everything and redirect to login */
    logout: () => void;

    /** Reset state without redirect (for testing, SSR, etc.) */
    reset: () => void;
}

type AuthStore = AuthState & AuthActions;

// ─────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isHydrated: false,
};

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

export const useAuthStore = create<AuthStore>((set) => ({
    ...initialState,

    setAuth: (user, tokens) => {
        setAuthCookies(tokens);
        set({ user, isAuthenticated: true });
    },

    setUser: (user) => {
        set({ user, isAuthenticated: true });
    },

    setHydrated: () => {
        set({ isHydrated: true });
    },

    logout: () => {
        set({ ...initialState, isHydrated: true });
        clearAuthAndRedirect();
    },

    reset: () => {
        set(initialState);
    },
}));

// ─────────────────────────────────────────────
// Selectors (prevents unnecessary re-renders)
// ─────────────────────────────────────────────

export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsHydrated = (state: AuthStore) => state.isHydrated;