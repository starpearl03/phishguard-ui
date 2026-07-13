import { API_ROUTES, apiClient } from '@/src/lib';
import type { HealthResponse } from './health.types';

/**
 * System / health API — maps to the public health probe endpoint.
 *
 * Auth is optional on the backend. The dashboard's apiClient still attaches a
 * Bearer token if one is set, but the endpoint also responds without it.
 */
export const systemApi = {
    /** GET /health — connectivity probe + model version */
    getHealth: () => apiClient.get<HealthResponse>(API_ROUTES.SYSTEM.HEALTH),
};
