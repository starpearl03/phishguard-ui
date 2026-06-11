'use client';

import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Label } from '@/src/components/shadcn/label';
import { cn } from '@/src/lib/utils';
import { USER_ROLES, UserRole } from '@/src/lib';
import { useCreateUser } from '../hooks/use-users';
import type { CreateUserRequest } from '../api/auth.types';

const SELECT_CLS =
    'h-7 w-full rounded-md border border-input bg-input/20 px-2 py-0.5 text-xs/relaxed ' +
    'outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 ' +
    'focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 ' +
    'dark:bg-input/30 text-foreground';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    role: UserRole;
};

const INITIAL: FormState = {
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    role: USER_ROLES.IT_ANALYST,
};

type FormErrors = Partial<Record<keyof CreateUserRequest, string>>;

function validate(s: FormState): FormErrors {
    const e: FormErrors = {};
    if (!s.email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(s.email.trim())) e.email = 'Enter a valid email';
    if (!s.username.trim()) e.username = 'Username is required';
    else if (s.username.trim().length < 3) e.username = 'At least 3 characters';
    if (!s.firstName.trim()) e.first_name = 'First name is required';
    if (!s.lastName.trim()) e.last_name = 'Last name is required';
    if (!s.password) e.password = 'Password is required';
    else if (s.password.length < 8) e.password = 'At least 8 characters';
    return e;
}

type UserCreateDialogProps = {
    open: boolean;
    onClose: () => void;
};

export function UserCreateDialog({ open, onClose }: UserCreateDialogProps) {
    const [form, setForm] = useState<FormState>(INITIAL);
    const [errors, setErrors] = useState<FormErrors>({});
    const createUser = useCreateUser();

    function update<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function resetForm() {
        setForm(INITIAL);
        setErrors({});
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setErrors({});

        const payload: CreateUserRequest = {
            email: form.email.trim(),
            username: form.username.trim(),
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
            password: form.password,
            role: form.role,
        };

        createUser.mutate(payload, {
            onSuccess: () => {
                toast.success('User created');
                resetForm();
                onClose();
            },
            onError: (err) => {
                if (err.hasFieldErrors() && err.fieldErrors) {
                    const next: FormErrors = {};
                    for (const [field, msgs] of Object.entries(err.fieldErrors)) {
                        next[field as keyof FormErrors] = msgs[0];
                    }
                    setErrors(next);
                }
                toast.error(err.getMessage());
            },
        });
    }

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(o) => {
                if (!o && !createUser.isPending) {
                    resetForm();
                    onClose();
                }
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay
                    className={cn(
                        'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm',
                        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
                        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
                    )}
                />
                <Dialog.Content
                    className={cn(
                        'fixed left-1/2 top-1/2 z-50 w-full max-w-md',
                        '-translate-x-1/2 -translate-y-1/2',
                        'rounded-lg bg-card p-5 shadow-xl ring-1 ring-foreground/10',
                        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                    )}
                    aria-describedby={undefined}
                >
                    <div className="flex items-center justify-between gap-3">
                        <Dialog.Title className="text-sm font-semibold text-foreground">
                            Create user
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Close"
                                disabled={createUser.isPending}
                            >
                                <X />
                            </Button>
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="cu-first">
                                    First name<span className="ml-1 text-destructive">*</span>
                                </Label>
                                <Input
                                    id="cu-first"
                                    value={form.firstName}
                                    onChange={(e) => update('firstName', e.target.value)}
                                    disabled={createUser.isPending}
                                    aria-invalid={!!errors.first_name}
                                />
                                {errors.first_name && (
                                    <p className="text-xs text-destructive">{errors.first_name}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="cu-last">
                                    Last name<span className="ml-1 text-destructive">*</span>
                                </Label>
                                <Input
                                    id="cu-last"
                                    value={form.lastName}
                                    onChange={(e) => update('lastName', e.target.value)}
                                    disabled={createUser.isPending}
                                    aria-invalid={!!errors.last_name}
                                />
                                {errors.last_name && (
                                    <p className="text-xs text-destructive">{errors.last_name}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="cu-email">
                                Email<span className="ml-1 text-destructive">*</span>
                            </Label>
                            <Input
                                id="cu-email"
                                type="email"
                                value={form.email}
                                onChange={(e) => update('email', e.target.value)}
                                disabled={createUser.isPending}
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="cu-username">
                                Username<span className="ml-1 text-destructive">*</span>
                            </Label>
                            <Input
                                id="cu-username"
                                value={form.username}
                                onChange={(e) => update('username', e.target.value)}
                                disabled={createUser.isPending}
                                aria-invalid={!!errors.username}
                            />
                            {errors.username && (
                                <p className="text-xs text-destructive">{errors.username}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="cu-password">
                                Password<span className="ml-1 text-destructive">*</span>
                            </Label>
                            <Input
                                id="cu-password"
                                type="password"
                                value={form.password}
                                onChange={(e) => update('password', e.target.value)}
                                disabled={createUser.isPending}
                                aria-invalid={!!errors.password}
                                autoComplete="new-password"
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="cu-role">
                                Role<span className="ml-1 text-destructive">*</span>
                            </Label>
                            <select
                                id="cu-role"
                                value={form.role}
                                onChange={(e) => update('role', e.target.value as UserRole)}
                                disabled={createUser.isPending}
                                className={SELECT_CLS}
                            >
                                <option value={USER_ROLES.IT_ANALYST}>IT Analyst</option>
                                <option value={USER_ROLES.ADMIN}>Admin</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                            <Dialog.Close asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={createUser.isPending}
                                >
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button type="submit" size="sm" disabled={createUser.isPending}>
                                {createUser.isPending ? 'Creating…' : 'Create user'}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
