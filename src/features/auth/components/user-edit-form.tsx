'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Label } from '@/src/components/shadcn/label';
import { USER_ROLES, UserDto, UserRole } from '@/src/lib';
import { useUpdateUser } from '../hooks/use-users';
import type { UpdateUserRequest } from '../api/auth.types';

const SELECT_CLS =
    'h-7 w-full rounded-md border border-input bg-input/20 px-2 py-0.5 text-xs/relaxed ' +
    'outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 ' +
    'focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 ' +
    'dark:bg-input/30 text-foreground';

type FormErrors = Partial<Record<keyof UpdateUserRequest, string>>;

function diff(
    user: { firstName: string; lastName: string; username: string; role: UserRole; isActive: boolean },
    form: { firstName: string; lastName: string; username: string; role: UserRole; isActive: boolean },
): UpdateUserRequest {
    const out: UpdateUserRequest = {};
    if (form.firstName.trim() !== user.firstName) out.first_name = form.firstName.trim();
    if (form.lastName.trim() !== user.lastName) out.last_name = form.lastName.trim();
    if (form.username.trim() !== user.username) out.username = form.username.trim();
    if (form.role !== user.role) out.role = form.role;
    if (form.isActive !== user.isActive) out.is_active = form.isActive;
    return out;
}

type UserEditFormProps = {
    user: UserDto;
    /** Disable role/active switches when editing self */
    isSelf: boolean;
};

export function UserEditForm({ user, isSelf }: UserEditFormProps) {
    const updateUser = useUpdateUser();

    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [username, setUsername] = useState(user.username);
    const [role, setRole] = useState<UserRole>(user.role);
    const [isActive, setIsActive] = useState(user.isActive);
    const [errors, setErrors] = useState<FormErrors>({});

    const patch = diff(
        {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            role: user.role,
            isActive: user.isActive,
        },
        { firstName, lastName, username, role, isActive },
    );
    const isDirty = Object.keys(patch).length > 0;

    function validate(p: UpdateUserRequest): FormErrors {
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
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setUsername(user.username);
        setRole(user.role);
        setIsActive(user.isActive);
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

        updateUser.mutate(
            { id: user.id, data: patch },
            {
                onSuccess: () => toast.success('User updated'),
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
            },
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ue-first">
                        First name<span className="ml-1 text-destructive">*</span>
                    </Label>
                    <Input
                        id="ue-first"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={updateUser.isPending}
                        aria-invalid={!!errors.first_name}
                    />
                    {errors.first_name && (
                        <p className="text-xs text-destructive">{errors.first_name}</p>
                    )}
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ue-last">
                        Last name<span className="ml-1 text-destructive">*</span>
                    </Label>
                    <Input
                        id="ue-last"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={updateUser.isPending}
                        aria-invalid={!!errors.last_name}
                    />
                    {errors.last_name && (
                        <p className="text-xs text-destructive">{errors.last_name}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="ue-username">
                    Username<span className="ml-1 text-destructive">*</span>
                </Label>
                <Input
                    id="ue-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={updateUser.isPending}
                    aria-invalid={!!errors.username}
                />
                {errors.username && (
                    <p className="text-xs text-destructive">{errors.username}</p>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="ue-email">Email</Label>
                <Input id="ue-email" value={user.email} disabled readOnly />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ue-role">Role</Label>
                    <select
                        id="ue-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        disabled={updateUser.isPending || isSelf}
                        className={SELECT_CLS}
                    >
                        <option value={USER_ROLES.IT_ANALYST}>IT Analyst</option>
                        <option value={USER_ROLES.ADMIN}>Admin</option>
                    </select>
                    {isSelf && (
                        <p className="text-xs text-muted-foreground">
                            You cannot change your own role.
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ue-active">Status</Label>
                    <select
                        id="ue-active"
                        value={isActive ? 'active' : 'inactive'}
                        onChange={(e) => setIsActive(e.target.value === 'active')}
                        disabled={updateUser.isPending || isSelf}
                        className={SELECT_CLS}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    {isSelf && (
                        <p className="text-xs text-muted-foreground">
                            You cannot deactivate yourself.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    disabled={!isDirty || updateUser.isPending}
                >
                    Reset
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    disabled={!isDirty || updateUser.isPending}
                >
                    {updateUser.isPending ? (
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
