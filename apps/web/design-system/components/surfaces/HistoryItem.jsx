import React from "react";
export function HistoryItem({question,time,onOpen}){
return React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 4px",borderBottom:"1px solid var(--color-border-subtle)"}},
React.createElement("div",null,
React.createElement("div",{style:{fontSize:"var(--text-body)",color:"var(--color-text-primary)"}},question),
React.createElement("div",{style:{fontSize:"var(--text-metadata)",color:"var(--color-text-muted)"}},time)),
React.createElement("button",{onClick:onOpen,style:{background:"var(--color-surface-elevated)",border:"1px solid var(--color-border)",color:"var(--color-text-secondary)",borderRadius:"var(--radius-sm)",padding:"6px 12px",fontSize:"var(--text-metadata)",cursor:"pointer"}},"Abrir"));
}
