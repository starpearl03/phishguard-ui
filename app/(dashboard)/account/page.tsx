'use client';

import { useRouter } from 'next/navigation';
import { LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/src/components/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/shadcn/card';
import { useAuthStore, selectUser, useLogout } from '@/src/features/auth';
import { AccountForm } from '@/src/features/auth/components/account-form';

function Breadcrumb() {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-muted-foreground"
        >
            <span>Account</span>
            <ChevronRight className="size-3 shrink-0" />
            <span className="font-medium text-foreground">Profile</span>
        </nav>
    );
}

export default function AccountPage() {
    const router = useRouter();
    const user = useAuthStore(selectUser);
    const logout = useLogout();

    function handleLogout() {
        logout.mutate(undefined, {
            onSuccess: () => router.replace('/login'),
        });
    }

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-1">
                <Breadcrumb />
                <h1 className="text-lg font-semibold text-foreground">Account</h1>
            </div>

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            Update the name shown on your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AccountForm />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Session</CardTitle>
                        <CardDescription>
                            Sign out of this browser. All tokens for your account will be revoked.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-xs text-muted-foreground">
                                Signed in as{' '}
                                <span className="font-medium text-foreground">
                                    {user?.email ?? '—'}
                                </span>
                                {user && (
                                    <>
                                        {' · '}
                                        <span className="font-mono text-[0.7rem] uppercase tracking-wider">
                                            {user.role}
                                        </span>
                                    </>
                                )}
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleLogout}
                                disabled={logout.isPending}
                            >
                                <LogOut />
                                {logout.isPending ? 'Signing out…' : 'Sign out'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
