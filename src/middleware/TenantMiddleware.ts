import { Request, Response, NextFunction } from "express";
import { ProviderRegistry, TenantConfig } from "../providers/ProviderRegistry";

export interface TenantContext extends TenantConfig {}

export interface TenantRequest extends Request {
  tenant?: TenantContext;
}

const registry = new ProviderRegistry();

export async function tenantMiddleware(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const apiKey = req.header("x-api-key");
    if (!apiKey) {
      return res.status(401).json({ error: "Falta header x-api-key" });
    }

    const tenantConfig = await registry.getTenantConfigByApiKey(apiKey);
    if (!tenantConfig) {
      return res.status(403).json({ error: "API key inválida" });
    }

    req.tenant = tenantConfig;
    next();
  } catch (err) {
    console.error("[tenantMiddleware] Error:", err);
    return res.status(500).json({ error: "Error al resolver tenant" });
  }
}

