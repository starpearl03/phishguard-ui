// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────
export { authApi } from './api/auth.api';
export { userManagementApi } from './api/user-management.api';
export type {
    LoginRequest,
    UpdateProfileRequest,
    CreateUserRequest,
    UpdateUserRequest,
    GetUsersParams,
    AuthResponse,
    UserDto,
    AuthTokens,
} from './api/auth.types';

// ─────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────
export { useLogin, useLogout, useProfile, useUpdateProfile } from './hooks/use-auth';
export {
    useUsers,
    useUser,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useActivateUser,
    useDeactivateUser,
} from './hooks/use-users';

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────
export { useAuthStore, selectUser, selectIsAuthenticated, selectIsHydrated } from './stores/auth.store';

// ─────────────────────────────────────────────
// Guards
// ─────────────────────────────────────────────
export { AuthGuard } from './guards';