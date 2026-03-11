import { BillingInvoice, BillingProvider } from "./BillingProvider";

export class WisproBillingProvider implements BillingProvider {
  constructor(private readonly apiToken: string, private readonly baseUrl: string) {}

  async getPendingInvoices(params: {
    tenantCode: string;
    customerExternalId: string;
  }): Promise<BillingInvoice[]> {
    // Aquí iría la integración real con Wispro.
    // Esta implementación es un stub seguro que puedes extender.
    void params;
    return [];
  }
}

