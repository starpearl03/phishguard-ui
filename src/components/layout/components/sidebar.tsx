'use client';

import { useState } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import {
    Shield,
    LayoutDashboard,
    History,
    Send,
    Layers,
    ChevronLeft,
    ChevronRight,
    Brain,
    ChevronDown,
    User,
    Users,
    Plug,
    LogOut,
} from 'lucide-react';
import { useAuthStore, selectUser, useLogout } from '@/src/features/auth';
import { ConnectivityDot } from '@/src/features/system';
import { USER_ROLES } from '@/src/lib';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/src/components/shadcn/dropdown-menu';

interface SidebarProps {
    collapsed: boolean;
    onToggleCollapse: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
}

const inferenceItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tab: 'dashboard' },
    { id: 'history', label: 'History', icon: History, tab: 'history' },
    { id: 'submit', label: 'Submit', icon: Send, tab: 'submit' },
    { id: 'batch', label: 'Batch Submit', icon: Layers, tab: 'batch' },
] as const;

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const user = useAuthStore(selectUser);
    const logout = useLogout();

    const [inferenceExpanded, setInferenceExpanded] = useState(true);

    const initials =
        (user
            ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
            : '') || '?';

    const activeTab = searchParams.get('tab') || 'dashboard';
    const isInferencePage = pathname === '/inference';
    const isAccountPage = pathname === '/account';
    const isUsersPage = pathname.startsWith('/users');
    const isExtensionPage = pathname.startsWith('/extension');
    const isAdmin = user?.role === USER_ROLES.ADMIN;

    function navigateToTab(tab: string) {
        router.push(`/inference?tab=${tab}`, { scroll: false });
        onMobileClose();
    }

    function navigateTo(path: string) {
        router.push(path);
        onMobileClose();
    }

    function handleLogout() {
        logout.mutate(undefined, {
            onSuccess: () => router.replace('/login'),
        });
    }

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onMobileClose}
                />
            )}

            <aside
                className={cn(
                    'fixed top-0 left-0 z-50 flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300',
                    collapsed ? 'w-16' : 'w-64',
                    'lg:translate-x-0',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                )}
            >
                {/* ── Logo ──────────────────────────────────── */}
                <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
                        <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
                    </div>
                    {!collapsed && (
                        <span className="font-heading text-sm font-bold tracking-wider">
                            SENTRY
                        </span>
                    )}
                </div>

                {/* ── Navigation ────────────────────────────── */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                    {/* Inference section header */}
                    <button
                        onClick={() => {
                            if (collapsed) {
                                navigateToTab('dashboard');
                            } else {
                                setInferenceExpanded((v) => !v);
                            }
                        }}
                        className={cn(
                            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isInferencePage
                                ? 'text-sidebar-primary'
                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                        )}
                        title={collapsed ? 'Inference' : undefined}
                    >
                        <Brain className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                            <>
                                <span className="flex-1 text-left">Inference</span>
                                <ChevronDown
                                    className={cn(
                                        'h-3.5 w-3.5 transition-transform',
                                        inferenceExpanded ? 'rotate-0' : '-rotate-90',
                                    )}
                                />
                            </>
                        )}
                    </button>

                    {/* Expanded sub-items */}
                    {!collapsed && inferenceExpanded && (
                        <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                            {inferenceItems.map((item) => {
                                const isActive = isInferencePage && activeTab === item.tab;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => navigateToTab(item.tab)}
                                        className={cn(
                                            'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                                            isActive
                                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                        )}
                                    >
                                        <item.icon className="h-3.5 w-3.5 shrink-0" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Collapsed sub-items (icon-only) */}
                    {collapsed && (
                        <div className="mt-1 space-y-0.5">
                            {inferenceItems.map((item) => {
                                const isActive = isInferencePage && activeTab === item.tab;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => navigateToTab(item.tab)}
                                        title={item.label}
                                        className={cn(
                                            'flex w-full items-center justify-center rounded-md p-2 transition-colors',
                                            isActive
                                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                        )}
                                    >
                                        <item.icon className="h-3.5 w-3.5" />
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Account / Admin section ──────────── */}
                    <div className={cn('mt-4 space-y-0.5 border-t border-sidebar-border', collapsed ? 'pt-3' : 'pt-2')}>
                        <button
                            onClick={() => navigateTo('/account')}
                            title={collapsed ? 'Account' : undefined}
                            className={cn(
                                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                collapsed && 'justify-center px-2',
                                isAccountPage
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                            )}
                        >
                            <User className="h-4 w-4 shrink-0" />
                            {!collapsed && <span>Account</span>}
                        </button>

                        {isAdmin && (
                            <button
                                onClick={() => navigateTo('/users')}
                                title={collapsed ? 'Users' : undefined}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    collapsed && 'justify-center px-2',
                                    isUsersPage
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                                )}
                            >
                                <Users className="h-4 w-4 shrink-0" />
                                {!collapsed && <span>Users</span>}
                            </button>
                        )}

                        {isAdmin && (
                            <button
                                onClick={() => navigateTo('/extension')}
                                title={collapsed ? 'Extension installs' : undefined}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    collapsed && 'justify-center px-2',
                                    isExtensionPage
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                                )}
                            >
                                <Plug className="h-4 w-4 shrink-0" />
                                {!collapsed && <span>Extension installs</span>}
                            </button>
                        )}
                    </div>
                </nav>

                {/* ── Bottom section — user dropdown + collapse ─ */}
                <div className="border-t border-sidebar-border p-3">
                    {collapsed ? (
                        <div className="flex flex-col items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        title={user ? `${user.firstName} ${user.lastName}` : undefined}
                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground outline-none ring-offset-sidebar transition-colors hover:bg-sidebar-accent/80 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                                    >
                                        {initials}
                                    </button>
                                </DropdownMenuTrigger>
                                <UserMenuContent
                                    user={user}
                                    onAccount={() => navigateTo('/account')}
                                    onLogout={handleLogout}
                                    logoutPending={logout.isPending}
                                />
                            </DropdownMenu>
                            <button
                                onClick={onToggleCollapse}
                                className="hidden h-6 w-6 items-center justify-center rounded-md text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:flex"
                                title="Expand sidebar"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left outline-none ring-offset-sidebar transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                                        {initials}
                                    </div>
                                    <div className="min-w-0 flex-1 text-xs">
                                        <p className="truncate font-medium">
                                            {user ? `${user.firstName} ${user.lastName}` : '—'}
                                        </p>
                                        {user && (
                                            <p className="truncate text-[11px] text-sidebar-foreground/50">
                                                {user.role}
                                            </p>
                                        )}
                                    </div>
                                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/50" />
                                </button>
                            </DropdownMenuTrigger>
                            <UserMenuContent
                                user={user}
                                onAccount={() => navigateTo('/account')}
                                onLogout={handleLogout}
                                logoutPending={logout.isPending}
                            />
                        </DropdownMenu>
                    )}

                    {/* ── Connectivity probe ─────────────────── */}
                    <div
                        className={cn(
                            'mt-2 flex items-center',
                            collapsed ? 'justify-center' : 'px-2.5',
                        )}
                    >
                        <ConnectivityDot compact={collapsed} />
                    </div>

                    {!collapsed && (
                        <button
                            onClick={onToggleCollapse}
                            className="mt-2 hidden h-6 w-full items-center justify-center gap-1 rounded-md text-[11px] text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:flex"
                            title="Collapse sidebar"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            Collapse
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}

type UserMenuContentProps = {
    user: ReturnType<typeof selectUser>;
    onAccount: () => void;
    onLogout: () => void;
    logoutPending: boolean;
};

function UserMenuContent({ user, onAccount, onLogout, logoutPending }: UserMenuContentProps) {
    return (
        <DropdownMenuContent align="end" sideOffset={8} className="min-w-[200px]">
            {user && (
                <>
                    <DropdownMenuLabel className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-foreground">
                            {user.firstName} {user.lastName}
                        </span>
                        <span className="truncate text-[11px] font-normal text-muted-foreground">
                            {user.email}
                        </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                </>
            )}
            <DropdownMenuItem onSelect={onAccount}>
                <User />
                Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                variant="destructive"
                onSelect={onLogout}
                disabled={logoutPending}
            >
                <LogOut />
                {logoutPending ? 'Signing out…' : 'Sign out'}
            </DropdownMenuItem>
        </DropdownMenuContent>
    );
}
