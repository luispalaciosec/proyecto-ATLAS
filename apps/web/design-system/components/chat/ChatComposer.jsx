import React from "react";
export function ChatComposer({value,onChange,onSend,placeholder="Escribe tu pregunta..."}){
return React.createElement("div",{style:{display:"flex",alignItems:"flex-end",gap:10,background:"var(--color-surface)",
border:"1px solid var(--color-border)",borderRadius:"var(--radius-lg)",padding:10}},
React.createElement("textarea",{value,onChange,placeholder,rows:1,style:{flex:1,resize:"none",border:"none",outline:"none",
background:"transparent",color:"var(--color-text-primary)",fontFamily:"var(--font-body)",fontSize:"var(--text-body)",padding:"8px 6px",maxHeight:120}}),
React.createElement("button",{onClick:onSend,style:{background:"var(--color-primary)",color:"#fff",border:"none",width:40,height:40,
borderRadius:"var(--radius-sm)",cursor:"pointer",flexShrink:0,fontSize:16}},"↑"));
}
