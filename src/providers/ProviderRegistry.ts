import { dbPool } from "../db/pool";
import { BillingProvider } from "./billing/BillingProvider";
import { WisproBillingProvider } from "./billing/WisproBillingProvider";
import { SplynxBillingProvider } from "./billing/SplynxBillingProvider";
import { MikrowispBillingProvider } from "./billing/MikrowispBillingProvider";
import { NetworkProvider } from "./network/NetworkProvider";
import { MikrotikNetworkProvider } from "./network/MikrotikNetworkProvider";
import { HuaweiOltNetworkProvider } from "./network/HuaweiOltNetworkProvider";
import { ZteOltNetworkProvider } from "./network/ZteOltNetworkProvider";

export interface TenantConfig {
  id: string;
  code: string;
  billingType: "wispro" | "splynx" | "mikrowisp";
  billingBaseUrl: string;
  billingApiToken: string;
  networkType: "mikrotik" | "huawei_olt" | "zte_olt";
  networkHost: string;
  networkUsername: string;
  networkPassword: string;
}

export class ProviderRegistry {
  async getTenantConfigByApiKey(apiKey: string): Promise<TenantConfig | null> {
    const res = await dbPool.query(
      `
      SELECT
        t.id,
        t.code,
        cfg.billing_type      AS "billingType",
        cfg.billing_base_url  AS "billingBaseUrl",
        cfg.billing_api_token AS "billingApiToken",
        cfg.network_type      AS "networkType",
        cfg.network_host      AS "networkHost",
        cfg.network_username  AS "networkUsername",
        cfg.network_password  AS "networkPassword"
      FROM tenants t
      JOIN tenant_config cfg ON cfg.tenant_id = t.id
      WHERE t.api_key_hash = crypt($1, t.api_key_hash)
      `,
      [apiKey]
    );

    if (res.rowCount === 0) return null;
    return res.rows[0] as TenantConfig;
  }

  getBillingProvider(cfg: TenantConfig): BillingProvider {
    switch (cfg.billingType) {
      case "wispro":
        return new WisproBillingProvider(cfg.billingApiToken, cfg.billingBaseUrl);
      case "splynx":
        return new SplynxBillingProvider(cfg.billingApiToken, cfg.billingBaseUrl);
      case "mikrowisp":
        return new MikrowispBillingProvider(cfg.billingApiToken, cfg.billingBaseUrl);
      default:
        throw new Error(`Tipo de billing no soportado: ${cfg.billingType}`);
    }
  }

  getNetworkProvider(cfg: TenantConfig): NetworkProvider {
    switch (cfg.networkType) {
      case "mikrotik":
        return new MikrotikNetworkProvider(cfg.networkHost, cfg.networkUsername, cfg.networkPassword);
      case "huawei_olt":
        return new HuaweiOltNetworkProvider(cfg.networkHost, cfg.networkUsername, cfg.networkPassword);
      case "zte_olt":
        return new ZteOltNetworkProvider(cfg.networkHost, cfg.networkUsername, cfg.networkPassword);
      default:
        throw new Error(`Tipo de red no soportado: ${cfg.networkType}`);
    }
  }
}

