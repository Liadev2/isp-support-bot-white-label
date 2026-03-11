const fs = require("fs");
const path = require("path");
const { normalizeTenantId } = require("../middleware/tenantIsolation");

const FLOWS_DIR = path.join(__dirname, "..", "flows");
const TENANTS_DIR = path.join(FLOWS_DIR, "tenants");
const DEFAULT_FLOW_PATH = path.join(FLOWS_DIR, "flow.json");

function tenantFlowPath(tenantId) {
  const normalized = normalizeTenantId(tenantId);
  if (!normalized) throw new Error("Invalid tenantId");
  return path.join(TENANTS_DIR, normalized, "flow.json");
}

function ensureDirSync(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonSync(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function writeJsonSync(filePath, data) {
  const dir = path.dirname(filePath);
  ensureDirSync(dir);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function getDefaultFlow() {
  return readJsonSync(DEFAULT_FLOW_PATH);
}

/**
 * Load a tenant's flow. If not present yet, seed it from default `flows/flow.json`.
 */
function loadTenantFlowSync(tenantId) {
  const flowPath = tenantFlowPath(tenantId);
  try {
    return readJsonSync(flowPath);
  } catch (err) {
    if (err && (err.code === "ENOENT" || err.code === "ENOTDIR")) {
      const seeded = getDefaultFlow();
      writeJsonSync(flowPath, seeded);
      return seeded;
    }
    throw err;
  }
}

function saveTenantFlowSync(tenantId, flow) {
  const flowPath = tenantFlowPath(tenantId);
  writeJsonSync(flowPath, flow);
}

module.exports = {
  loadTenantFlowSync,
  saveTenantFlowSync,
};

