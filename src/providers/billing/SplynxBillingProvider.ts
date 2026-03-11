import { BillingInvoice, BillingProvider } from "./BillingProvider";

export class SplynxBillingProvider implements BillingProvider {
  constructor(private readonly apiToken: string, private readonly baseUrl: string) {}

  async getPendingInvoices(params: {
    tenantCode: string;
    customerExternalId: string;
  }): Promise<BillingInvoice[]> {
    void params;
    return [];
  }
}

