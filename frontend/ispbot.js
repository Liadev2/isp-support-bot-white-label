const chat = document.createElement("div")

chat.innerHTML = `
<div id="ispbot-widget" style="
position:fixed;
bottom:20px;
right:20px;
width:320px;
height:420px;
background:white;
border-radius:12px;
box-shadow:0 10px 30px rgba(0,0,0,0.2);
display:flex;
flex-direction:column;
font-family:Arial;
">

<div style="background:#0066ff;color:white;padding:10px;">
ISP Soporte
</div>

<div id="ispbot-messages" style="flex:1;padding:10px;overflow:auto;"></div>

<div id="ispbot-options" style="padding:10px;"></div>

</div>
`

document.body.appendChild(chat)

let currentNode=null

async function startChat(){

const res = await fetch("http://localhost:3000/chat",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({})
})

const data = await res.json()

currentNode="start"

renderNode(data.data)

}

async function selectOption(option){

const res = await fetch("http://localhost:3000/chat",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
nodeId:currentNode,
option:option
})
})

const data = await res.json()

renderNode(data.data)

}

function renderNode(node){

const messages=document.getElementById("ispbot-messages")
const options=document.getElementById("ispbot-options")

messages.innerHTML+=`<div>${node.message}</div>`

options.innerHTML=""

if(node.options){

Object.keys(node.options).forEach(key=>{

const btn=document.createElement("button")

btn.innerText=node.options[key].text

btn.onclick=()=>{
currentNode=node.options[key].next
selectOption(key)
}

options.appendChild(btn)

})

}

}

startChat()