import { Router, Response } from "express";
import { TenantRequest, tenantMiddleware } from "../middleware/TenantMiddleware";
import { SelfCareService } from "../services/SelfCareService";

const router = Router();
const selfCareService = new SelfCareService();

router.use(tenantMiddleware);

router.get("/invoices/pending", async (req: TenantRequest, res: Response) => {
  try {
    const tenant = req.tenant!;
    const customerExternalId = req.query.customerExternalId as string | undefined;
    if (!customerExternalId) {
      return res.status(400).json({ error: "Falta parámetro customerExternalId" });
    }

    const invoices = await selfCareService.getPendingInvoices(tenant, customerExternalId);
    return res.json({ invoices });
  } catch (err) {
    console.error("[GET] /self-care/invoices/pending error:", err);
    return res.status(500).json({ error: "Error al consultar facturas pendientes" });
  }
});

router.get("/connection/health", async (req: TenantRequest, res: Response) => {
  try {
    const tenant = req.tenant!;
    const connectionId = req.query.connectionId as string | undefined;
    if (!connectionId) {
      return res.status(400).json({ error: "Falta parámetro connectionId" });
    }

    const health = await selfCareService.getConnectionHealthScore(tenant, connectionId);
    return res.json({ health });
  } catch (err) {
    console.error("[GET] /self-care/connection/health error:", err);
    return res.status(500).json({ error: "Error al calcular salud de conexión" });
  }
});

router.post("/connection/reboot", async (req: TenantRequest, res: Response) => {
  try {
    const tenant = req.tenant!;
    const { connectionId } = req.body as { connectionId?: string };
    if (!connectionId) {
      return res.status(400).json({ error: "Falta campo connectionId" });
    }

    await selfCareService.rebootCustomerRouter(tenant, connectionId);
    return res.json({ status: "ok" });
  } catch (err) {
    console.error("[POST] /self-care/connection/reboot error:", err);
    return res.status(500).json({ error: "Error al reiniciar router" });
  }
});

export default router;

