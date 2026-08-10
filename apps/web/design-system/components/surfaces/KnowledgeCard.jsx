import React from "react";
export function KnowledgeCard({title,type="Documento",updated,onOpen}){
return React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 4px",borderBottom:"1px solid var(--color-border-subtle)"}},
React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10}},
React.createElement("span",{style:{color:"var(--color-cyan)"}},"▤"),
React.createElement("div",null,
React.createElement("div",{style:{fontSize:"var(--text-body)",color:"var(--color-text-primary)"}},title),
React.createElement("div",{style:{fontSize:"var(--text-metadata)",color:"var(--color-text-muted)"}},type+(updated?" · "+updated:"")))
),
React.createElement("button",{onClick:onOpen,style:{background:"none",border:"none",color:"var(--color-cyan)",fontSize:"var(--text-secondary)",cursor:"pointer"}},"Abrir")
);
}
