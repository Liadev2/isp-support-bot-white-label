function getNode(flow, nodeId) {
  if (!flow || typeof flow !== "object") return null;

  if (!nodeId) return flow["start"] || null;
  return flow[nodeId] || null;
}

function getNextNode(flow, currentNode, option) {
  if (!flow || typeof flow !== "object") return null;

  const node = flow[currentNode];
  if (!node || !node.options) return null;

  const selected = node.options[option];
  if (!selected || !selected.next) return null;

  return flow[selected.next] || null;
}

module.exports = { getNode, getNextNode };