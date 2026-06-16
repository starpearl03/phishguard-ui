'use client';

import { Badge } from '@/src/components/shadcn/badge';
import type { InstallStatus } from '../api/extension-admin.types';

const VARIANT: Record<InstallStatus, 'success' | 'destructive'> = {
    ACTIVE: 'success',
    BLACKLISTED: 'destructive',
};

const LABEL: Record<InstallStatus, string> = {
    ACTIVE: 'Active',
    BLACKLISTED: 'Blacklisted',
};

export function InstallStatusBadge({ status }: { status: InstallStatus }) {
    return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
