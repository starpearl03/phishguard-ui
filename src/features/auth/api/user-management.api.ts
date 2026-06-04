import {
    CreateUserRequest,
    UpdateUserRequest,
    GetUsersParams, UserDto,
} from './auth.types';
import {API_ROUTES, apiClient} from "@/src/lib";

/**
 * User Management API — maps to user_controller.py (admin-only)
 */
export const userManagementApi = {
    /** GET /users */
    getUsers: (params?: GetUsersParams) =>
        apiClient.getPaginated<UserDto>(API_ROUTES.USERS.BASE, {
            params: {
                page: params?.page,
                pageSize: params?.pageSize,
                role: params?.role,
                isActive: params?.isActive,
            },
        }),

    /** GET /users/:id */
    getUser: (id: string) =>
        apiClient.get<UserDto>(API_ROUTES.USERS.BY_ID(id)),

    /** POST /users */
    createUser: (data: CreateUserRequest) =>
        apiClient.post<UserDto>(API_ROUTES.USERS.BASE, data),

    /** PATCH /users/:id */
    updateUser: (id: string, data: UpdateUserRequest) =>
        apiClient.patch<UserDto>(API_ROUTES.USERS.BY_ID(id), data),

    /** DELETE /users/:id */
    deleteUser: (id: string) =>
        apiClient.delete<null>(API_ROUTES.USERS.BY_ID(id)),

    /** POST /users/:id/deactivate */
    deactivateUser: (id: string) =>
        apiClient.post<UserDto>(API_ROUTES.USERS.DEACTIVATE(id)),

    /** POST /users/:id/activate */
    activateUser: (id: string) =>
        apiClient.post<UserDto>(API_ROUTES.USERS.ACTIVATE(id)),
};