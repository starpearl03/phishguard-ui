'use client';

import { USER_ROLES } from '@/src/lib';
import { AuthGuard } from '@/src/features/auth/guards';
import { InstallDetailPage } from '@/src/features/extension-admin';

export default function ExtensionInstallDetailPage() {
    return (
        <AuthGuard roles={[USER_ROLES.ADMIN]}>
            <InstallDetailPage />
        </AuthGuard>
    );
}
