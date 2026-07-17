import { AuthGuard } from '@/src/features/auth';
import { AppShell } from '@/src/components/layout';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <AppShell>{children}</AppShell>
        </AuthGuard>
    );
}
