import React from "react";
export function BrandCard({name,purpose,active,knowledgeCount,onClick}){
return React.createElement("div",{onClick,style:{
cursor:"pointer",background:active?"rgba(104,92,255,0.1)":"var(--color-surface)",
border:"1px solid "+(active?"var(--color-primary)":"var(--color-border)"),borderRadius:"var(--radius-lg)",padding:18,display:"flex",flexDirection:"column",gap:6}},
React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},
React.createElement("span",{style:{fontFamily:"var(--font-display)",fontWeight:600,fontSize:"var(--text-card-title)",color:"var(--color-text-primary)"}},name),
active&&React.createElement("span",{style:{width:8,height:8,borderRadius:"50%",background:"var(--color-primary)"}})
),
React.createElement("div",{style:{fontSize:"var(--text-secondary)",color:"var(--color-text-secondary)"}},purpose),
knowledgeCount!=null&&React.createElement("div",{style:{fontSize:"var(--text-metadata)",color:"var(--color-text-muted)"}},knowledgeCount+" recursos de conocimiento")
);
}
