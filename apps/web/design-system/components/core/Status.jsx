import React from "react";
export function Status({tone="neutral",label}){
const colors={neutral:"var(--color-text-muted)",primary:"var(--color-primary)",success:"var(--color-success)",warning:"var(--color-warning)",error:"var(--color-error)",info:"var(--color-cyan)"};
return React.createElement("span",{style:{display:"inline-flex",alignItems:"center",gap:7,fontSize:"var(--text-secondary)",color:"var(--color-text-secondary)"}},
React.createElement("span",{style:{width:8,height:8,borderRadius:"50%",background:colors[tone],flexShrink:0}}),label);
}
