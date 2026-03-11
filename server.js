require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { detectIntent } = require("./engine/aiEngine");
const { getNode } = require("./engine/decisionEngine");
const { tenantIsolation } = require("./middleware/tenantIsolation");
const { loadTenantFlowSync, saveTenantFlowSync } = require("./lib/tenantFlowStore");

const app = express();

// =====================
// SEGURIDAD (nivel producción)
// =====================
app.use(helmet()); // Cabeceras de seguridad
app.use(cors());   // Para desarrollo. En producción cambiaremos a whitelist.
app.use(express.json());

// Rate limiting: máximo 10 peticiones por minuto por IP
const limiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minuto
  max: 10,               // máximo 10 peticiones
  message: { error: "Demasiadas peticiones. Inténtalo más tarde." }
});
app.use(limiter);

// =====================
// CARGA DE FLUJO (plantilla por defecto)
// =====================
require("./flows/flow.json");
console.log("✅ flow.json (default) cargado correctamente");

// =====================
// HEALTHCHECK (público)
// =====================
app.get("/test", (req, res) => res.send("✅ Servidor ISP Bot funcionando correctamente"));

// =====================
// TENANT ISOLATION (multi-tenant)
// =====================
// Aplica sólo a endpoints que leen/escriben datos “del ISP”.
const tenantRouter = express.Router();
tenantRouter.use(tenantIsolation);

// =====================
// ENDPOINT PRINCIPAL: IA + CLASIFICACIÓN
// =====================
tenantRouter.post("/ai-chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "El campo 'message' es obligatorio y debe ser texto" });
    }

    const flow = loadTenantFlowSync(req.tenant.id);

    const intent = await detectIntent(message.trim());
    const node = flow[intent] || flow.default || flow.start || {
      message: "No entendí tu consulta. ¿Puedes reformularla?",
      options: {}
    };

    res.json({
      intent,
      response: node
    });
  } catch (error) {
    console.error("❌ Error en /ai-chat:", error.message);
    res.status(503).json({
      error: "Servicio de IA temporalmente no disponible",
      message: "Inténtalo de nuevo en unos segundos."
    });
  }
});

// =====================
// ENDPOINTS ORIGINALES (árbol de decisiones)
// =====================
async function runSlowInternetDiagnostics(tenantId, context) {
  // Stub seguro: aquí podrías integrar un NetworkProvider real.
  // No accede a secretos ni a estado global.
  void tenantId;
  void context;
  return {
    latencyMs: null,
    packetLossPercent: null,
    status: "pending_integration",
    summary:
      "Diagnóstico básico ejecutado. Para producción, aquí se integraría con el sistema de red (ping, interfaz, etc.).",
  };
}

tenantRouter.post("/chat", async (req, res) => {
  const { nodeId, option } = req.body;
  const flow = loadTenantFlowSync(req.tenant.id);

  if (!nodeId) {
    return res.json({ node: "start", data: getNode(flow) });
  }

  const current = flow[nodeId];
  if (!current || !current.options) {
    return res.json({ data: null });
  }

  const selected = current.options[option];
  if (!selected || !selected.next) {
    return res.json({ data: null });
  }

  const nextId = selected.next;
  let node = getNode(flow, nextId);

  if (nextId === "slow_internet" && node) {
    const diagnostic = await runSlowInternetDiagnostics(req.tenant.id, {
      nodeId,
      option,
    });
    node = { ...node, diagnostic };
  }

  res.json({ data: node });
});

tenantRouter.get("/flows", (req, res) => {
  const flow = loadTenantFlowSync(req.tenant.id);
  return res.json(flow);
});

// =====================
// ADMIN: UPDATE + PERSISTENCIA REAL EN DISCO
// =====================
tenantRouter.post("/update", (req, res) => {
  try {
    const { node, message } = req.body;
    if (!node || !message) {
      return res.status(400).json({ error: "Datos incompletos" });
    }
    const flow = loadTenantFlowSync(req.tenant.id);

    if (!flow[node]) {
      return res.status(404).json({ error: "Nodo no encontrado" });
    }

    flow[node].message = message;

    // Persistencia por tenant (evita fugas cross-tenant)
    saveTenantFlowSync(req.tenant.id, flow);

    console.log(`✅ [${req.tenant.id}] Nodo "${node}" actualizado y guardado en disco`);
    res.json({ status: "ok" });
  } catch (error) {
    console.error("❌ Error al actualizar flow:", error.message);
    res.status(500).json({ error: "Error interno al guardar cambios" });
  }
});
app.use(tenantRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ISP Bot corriendo correctamente en http://localhost:${PORT}`);
  console.log(`   Prueba con: http://localhost:${PORT}/test`);
});