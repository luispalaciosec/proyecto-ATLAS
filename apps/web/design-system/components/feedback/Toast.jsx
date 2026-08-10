import React from "react";
export function Toast({tone="info",message,onClose}){
const colors={info:"var(--color-cyan)",success:"var(--color-success)",warning:"var(--color-warning)",error:"var(--color-error)"};
return React.createElement("div",{style:{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:"var(--radius-md)",background:"var(--color-surface-elevated)",border:"1px solid var(--color-border)",boxShadow:"var(--shadow-md)",minWidth:260}},
React.createElement("span",{style:{width:8,height:8,borderRadius:"50%",background:colors[tone],flexShrink:0}}),
React.createElement("span",{style:{fontSize:"var(--text-body)",color:"var(--color-text-primary)",flex:1}},message),
React.createElement("button",{onClick:onClose,style:{background:"none",border:"none",color:"var(--color-text-muted)",cursor:"pointer",fontSize:16}},"×"));
}
