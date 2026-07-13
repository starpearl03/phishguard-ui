// ─────────────────────────────────────────────
// Response DTO — GET /health
//
// Note: `model_version` is intentionally snake_case on the wire — the
// extension client reads this field directly without transformation
// (see backend_contract.md § GET /api/v1/health).
// ─────────────────────────────────────────────

export interface HealthResponse {
    status: 'ok';
    name: string;
    version: string;
    model_version: string;
}
