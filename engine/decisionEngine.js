const flow = require("../flows/flow.json")

function getNode(nodeId){

 if(!nodeId){
  return flow["start"]
 }

 return flow[nodeId]
}

function getNextNode(currentNode, option){

 const node = flow[currentNode]

 if(!node){
  return null
 }

 const selected = node.options[option]

 if(!selected){
  return null
 }

 return flow[selected.next]
}

module.exports = {
 getNode,
 getNextNode
}