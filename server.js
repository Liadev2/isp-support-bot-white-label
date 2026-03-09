require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { detectIntent } = require("./engine/aiEngine");
const { getNode, getNextNode } = require("./engine/decisionEngine");

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
// CARGA DE FLUJO (una sola vez)
// =====================
const flow = require("./flows/flow.json");
console.log("✅ flow.json cargado correctamente");

// =====================
// ENDPOINT PRINCIPAL: IA + CLASIFICACIÓN
// =====================
app.post("/ai-chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "El campo 'message' es obligatorio y debe ser texto" });
    }

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
app.post("/chat", (req, res) => {
  const { nodeId, option } = req.body;
  if (!nodeId) {
    return res.json({ node: "start", data: getNode() });
  }
  const next = getNextNode(nodeId, option);
  res.json({ data: next });
});

app.get("/flows", (req, res) => res.json(flow));

// =====================
// ADMIN: UPDATE + PERSISTENCIA REAL EN DISCO
// =====================
app.post("/update", (req, res) => {
  try {
    const { node, message } = req.body;
    if (!node || !message) {
      return res.status(400).json({ error: "Datos incompletos" });
    }
    if (!flow[node]) {
      return res.status(404).json({ error: "Nodo no encontrado" });
    }

    flow[node].message = message;

    // Persistencia real
    const fs = require("fs");
    const path = require("path");
    const flowPath = path.join(__dirname, "flows", "flow.json");
    fs.writeFileSync(flowPath, JSON.stringify(flow, null, 2));

    console.log(`✅ Nodo "${node}" actualizado y guardado en disco`);
    res.json({ status: "ok" });
  } catch (error) {
    console.error("❌ Error al actualizar flow:", error.message);
    res.status(500).json({ error: "Error interno al guardar cambios" });
  }
});

app.get("/test", (req, res) => res.send("✅ Servidor ISP Bot funcionando correctamente"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ISP Bot corriendo correctamente en http://localhost:${PORT}`);
  console.log(`   Prueba con: http://localhost:${PORT}/test`);
});