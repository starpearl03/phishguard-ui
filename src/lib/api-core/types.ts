// Backend API Response Types
// Backend serializes with by_alias=True, so all wire keys are camelCase.

/**
 * Error detail structure from backend (camelCase on the wire)
 */
export interface ErrorDetail {
    title: string;
    code: string;
    status: number;
    details?: string[];
    fieldErrors?: Record<string, string[]>;
}

/**
 * Generic API response wrapper (matches backend ApiResponse)
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    value?: T;
    error?: ErrorDetail;
}

/**
 * Pagination info (matches backend PaginationInfo)
 */
export interface PaginationInfo {
    page: number;
    total: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Paginated response structure (matches backend PaginatedResponse)
 */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
    pagination?: PaginationInfo;
}

/**
 * Structured error messages returned by getAllMessages()
 */
export interface ApiErrorMessages {
    message: string;
    details: string[];
    fieldErrors: Record<string, string[]>;
}

/**
 * Auth token payload from backend
 */
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

/**
 * User response from backend (camelCase)
 */
export interface UserDto {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'IT_ANALYST';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Full auth response (login/register)
 */
export interface AuthResponseDto {
    user: UserDto;
    tokens: AuthTokens;
}

/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
    public statusCode: number;
    public code?: string;
    public details?: string[];
    public fieldErrors?: Record<string, string[]>;
    public backendMessage?: string;

    constructor(error: ErrorDetail, message?: string) {
        super(error.title);
        this.name = 'ApiError';
        this.statusCode = error.status;
        this.code = error.code;
        this.details = error.details;
        this.fieldErrors = error.fieldErrors;
        this.backendMessage = message;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    /** Primary user-facing message (for toasts, alerts) */
    getMessage(): string {
        return this.backendMessage || this.message;
    }

    /** Structured breakdown of all messages */
    getAllMessages(): ApiErrorMessages {
        return {
            message: this.getMessage(),
            details: this.details || [],
            fieldErrors: this.fieldErrors || {},
        };
    }

    /** All messages joined into a single string (useful for logging) */
    getFullMessage(): string {
        const messages: string[] = [this.getMessage()];

        if (this.details && this.details.length > 0) {
            messages.push(...this.details);
        }

        if (this.fieldErrors) {
            Object.entries(this.fieldErrors).forEach(([field, errors]) => {
                errors.forEach(err => {
                    messages.push(`${field}: ${err}`);
                });
            });
        }

        return messages.join('. ');
    }

    hasDetails(): boolean {
        return (this.details && this.details.length > 0) || false;
    }

    hasFieldErrors(): boolean {
        return !!this.fieldErrors && Object.keys(this.fieldErrors).length > 0;
    }

    /** Get errors for a specific form field */
    getFieldErrors(fieldName: string): string[] {
        return this.fieldErrors?.[fieldName] || [];
    }
}