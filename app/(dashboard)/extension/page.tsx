'use client';

import { USER_ROLES } from '@/src/lib';
import { AuthGuard } from '@/src/features/auth/guards';
import { InstallsPage } from '@/src/features/extension-admin';

export default function ExtensionInstallsPage() {
    return (
        <AuthGuard roles={[USER_ROLES.ADMIN]}>
            <InstallsPage />
        </AuthGuard>
    );
}
