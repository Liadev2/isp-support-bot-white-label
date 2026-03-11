const crypto = require("crypto");

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function parseTenantsEnv(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function normalizeTenantId(value) {
  if (typeof value !== "string") return null;
  const tenantId = value.trim();
  if (!tenantId) return null;
  // Prevent path traversal and weird chars: allow letters, numbers, underscore, dash.
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(tenantId)) return null;
  return tenantId;
}

function extractBearerToken(req) {
  const auth = req.headers.authorization;
  if (!auth || typeof auth !== "string") return null;
  const [scheme, token] = auth.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token.trim() || null;
}

/**
 * Tenant isolation middleware.
 *
 * Expects:
 * - x-tenant-id: ISP/tenant identifier
 * - x-tenant-key (or Authorization: Bearer <key>): shared secret for that tenant
 *
 * Configure allowed tenants via env:
 * - TENANTS='{"ispA":{"key":"..."},"ispB":{"key":"..."}}'
 */
function tenantIsolation(req, res, next) {
  const tenantId = normalizeTenantId(req.headers["x-tenant-id"]);
  if (!tenantId) {
    return res.status(400).json({ error: "Falta o es inválido el header x-tenant-id" });
  }

  const providedKey =
    (typeof req.headers["x-tenant-key"] === "string" && req.headers["x-tenant-key"].trim()) ||
    extractBearerToken(req);

  if (!providedKey) {
    return res.status(401).json({ error: "Falta credencial del tenant (x-tenant-key o Bearer token)" });
  }

  const tenants = parseTenantsEnv(process.env.TENANTS);
  const record = tenants[tenantId];
  const expectedKey = record && typeof record.key === "string" ? record.key : null;

  if (!expectedKey || !safeEqual(providedKey, expectedKey)) {
    return res.status(403).json({ error: "Credencial inválida para el tenant solicitado" });
  }

  req.tenant = { id: tenantId };
  return next();
}

module.exports = { tenantIsolation, normalizeTenantId };

