import { dbPool } from "../db/pool";
import { TenantContext } from "../middleware/TenantMiddleware";

export interface BrandingConfig {
  botName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export class BrandingService {
  async getBranding(tenant: TenantContext): Promise<BrandingConfig> {
    const res = await dbPool.query(
      `
      SELECT
        bot_name      AS "botName",
        logo_url      AS "logoUrl",
        primary_color AS "primaryColor",
        secondary_color AS "secondaryColor"
      FROM tenant_branding
      WHERE tenant_id = $1
      `,
      [tenant.id]
    );

    if (res.rowCount === 0) {
      return {
        botName: tenant.name ?? tenant.code ?? "Soporte",
      };
    }

    return res.rows[0] as BrandingConfig;
  }
}

