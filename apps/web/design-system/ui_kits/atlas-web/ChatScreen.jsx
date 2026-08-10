function ChatScreen({brand,onNavigate}){
const {Sidebar,TopBar,ConversationMessage,ChatComposer}=window.ATLASDesignSystem_46b296;
const [messages,setMessages]=React.useState([
{role:"user",text:"¿Qué contratos tengo con Acme?",time:"10:42"},
{role:"assistant",text:"Tienes 3 contratos activos con Acme Corp. El más reciente fue firmado en marzo de 2026 e incluye una cláusula de renovación automática a 12 meses.",time:"10:42"},
{role:"user",text:"¿Cuáles son las cláusulas más importantes?",time:"10:43"},
{role:"assistant",text:"Las cláusulas clave son: confidencialidad (sección 4), renovación automática (sección 7) y penalización por incumplimiento (sección 9).",time:"10:43"}
]);
const [value,setValue]=React.useState("");
function send(){
if(!value.trim())return;
setMessages(m=>[...m,{role:"user",text:value,time:"ahora"}]);
setValue("");
}
return React.createElement(React.Fragment,null,
React.createElement(Sidebar,{activeItem:"Conversar",logoSrc:"../../assets/logo.svg",items:window.AtlasUIKit.navItems("Conversar",onNavigate)}),
React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",minWidth:0}},
React.createElement(TopBar,{brand}),
React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",maxWidth:760,margin:"0 auto",width:"100%",padding:"28px 32px"}},
React.createElement("div",{style:{flex:1,overflowY:"auto"}},messages.map((m,i)=>React.createElement(ConversationMessage,{key:i,role:m.role,time:m.time},m.text))),
React.createElement(ChatComposer,{value,onChange:e=>setValue(e.target.value),onSend:send,placeholder:"Escribe tu pregunta..."}))));
}
window.AtlasUIKit=Object.assign(window.AtlasUIKit||{},{ChatScreen});
