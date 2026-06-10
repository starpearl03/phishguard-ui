'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Label } from '@/src/components/shadcn/label';
import { useAuthStore, selectUser } from '../stores/auth.store';
import { useUpdateProfile } from '../hooks/use-auth';
import type { UpdateProfileRequest } from '../api/auth.types';

type FormErrors = Partial<Record<keyof UpdateProfileRequest, string>>;

function diff(
    user: { firstName: string; lastName: string; username: string },
    form: { firstName: string; lastName: string; username: string },
): UpdateProfileRequest {
    const out: UpdateProfileRequest = {};
    if (form.firstName.trim() !== user.firstName) out.first_name = form.firstName.trim();
    if (form.lastName.trim() !== user.lastName) out.last_name = form.lastName.trim();
    if (form.username.trim() !== user.username) out.username = form.username.trim();
    return out;
}

export function AccountForm() {
    const user = useAuthStore(selectUser);
    const updateProfile = useUpdateProfile();

    const [firstName, setFirstName] = useState(user?.firstName ?? '');
    const [lastName, setLastName] = useState(user?.lastName ?? '');
    const [username, setUsername] = useState(user?.username ?? '');
    const [errors, setErrors] = useState<FormErrors>({});

    if (!user) return null;

    const patch = diff(
        { firstName: user.firstName, lastName: user.lastName, username: user.username },
        { firstName, lastName, username },
    );
    const isDirty = Object.keys(patch).length > 0;

    function validate(p: UpdateProfileRequest): FormErrors {
        const e: FormErrors = {};
        if (p.first_name !== undefined && p.first_name.length < 1)
            e.first_name = 'First name is required';
        if (p.last_name !== undefined && p.last_name.length < 1)
            e.last_name = 'Last name is required';
        if (p.username !== undefined && p.username.length < 3)
            e.username = 'Username must be at least 3 characters';
        return e;
    }

    function handleReset() {
        setFirstName(user!.firstName);
        setLastName(user!.lastName);
        setUsername(user!.username);
        setErrors({});
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!isDirty) return;

        const errs = validate(patch);
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setErrors({});

        updateProfile.mutate(patch, {
            onSuccess: () => toast.success('Profile updated'),
            onError: (err) => {
                if (err.hasFieldErrors() && err.fieldErrors) {
                    const next: FormErrors = {};
                    for (const [field, msgs] of Object.entries(err.fieldErrors)) {
                        if (field in ({ first_name: 1, last_name: 1, username: 1 } as const)) {
                            next[field as keyof FormErrors] = msgs[0];
                        }
                    }
                    setErrors(next);
                }
                toast.error(err.getMessage());
            },
        });
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="account-first-name">
                        First name<span className="ml-1 text-destructive">*</span>
                    </Label>
                    <Input
                        id="account-first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={updateProfile.isPending}
                        aria-invalid={!!errors.first_name}
                    />
                    {errors.first_name && (
                        <p className="text-xs text-destructive">{errors.first_name}</p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="account-last-name">
                        Last name<span className="ml-1 text-destructive">*</span>
                    </Label>
                    <Input
                        id="account-last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={updateProfile.isPending}
                        aria-invalid={!!errors.last_name}
                    />
                    {errors.last_name && (
                        <p className="text-xs text-destructive">{errors.last_name}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="account-username">
                    Username<span className="ml-1 text-destructive">*</span>
                </Label>
                <Input
                    id="account-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={updateProfile.isPending}
                    aria-invalid={!!errors.username}
                />
                {errors.username && (
                    <p className="text-xs text-destructive">{errors.username}</p>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="account-email">Email</Label>
                <Input id="account-email" value={user.email} disabled readOnly />
                <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact an administrator if you need to update it.
                </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={!isDirty || updateProfile.isPending}
                >
                    Reset
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    disabled={!isDirty || updateProfile.isPending}
                >
                    {updateProfile.isPending ? (
                        <>
                            <Loader2 className="animate-spin" />
                            Saving…
                        </>
                    ) : (
                        'Save changes'
                    )}
                </Button>
            </div>
        </form>
    );
}
