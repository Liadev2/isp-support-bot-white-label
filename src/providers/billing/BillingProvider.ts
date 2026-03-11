export interface BillingInvoice {
  id: string;
  externalId: string;
  amountCents: number;
  currency: string;
  dueDate: string; // ISO date
  status: "pending" | "paid" | "cancelled";
}

export interface BillingProvider {
  /**
   * Devuelve todas las facturas pendientes de un cliente dado.
   * `tenantCode` permite a la implementación seleccionar credenciales/configuración por ISP.
   */
  getPendingInvoices(params: {
    tenantCode: string;
    customerExternalId: string;
  }): Promise<BillingInvoice[]>;
}

