import { TenantContext } from "../middleware/TenantMiddleware";
import { ProviderRegistry } from "../providers/ProviderRegistry";
import { BillingInvoice } from "../providers/billing/BillingProvider";
import { ConnectionHealth } from "../providers/network/NetworkProvider";
import { AuditLogger } from "./AuditLogger";

export class SelfCareService {
  private readonly registry = new ProviderRegistry();
  private readonly audit = new AuditLogger();

  async getPendingInvoices(tenant: TenantContext, customerExternalId: string): Promise<BillingInvoice[]> {
    const billingProvider = this.registry.getBillingProvider(tenant);
    const invoices = await billingProvider.getPendingInvoices({
      tenantCode: tenant.code,
      customerExternalId,
    });

    await this.audit.log({
      tenant,
      actorType: "bot",
      action: "INVOICE_QUERY",
      targetType: "customer",
      targetId: customerExternalId,
      metadata: { count: invoices.length },
    });

    return invoices;
  }

  async getConnectionHealthScore(tenant: TenantContext, connectionId: string): Promise<ConnectionHealth> {
    const networkProvider = this.registry.getNetworkProvider(tenant);
    const health = await networkProvider.getConnectionHealth({
      tenantCode: tenant.code,
      connectionId,
    });

    await this.audit.log({
      tenant,
      actorType: "bot",
      action: "HEALTH_CHECK",
      targetType: "connection",
      targetId: connectionId,
      metadata: { score: health.score },
    });

    return health;
  }

  async rebootCustomerRouter(tenant: TenantContext, connectionId: string): Promise<void> {
    const networkProvider = this.registry.getNetworkProvider(tenant);

    await networkProvider.rebootRouter({
      tenantCode: tenant.code,
      connectionId,
    });

    await this.audit.log({
      tenant,
      actorType: "bot",
      action: "ROUTER_REBOOT",
      targetType: "connection",
      targetId: connectionId,
    });
  }
}

