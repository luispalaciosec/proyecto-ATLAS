import React from "react";
export function Dialog({open,title,description,children,onClose,actions}){
if(!open)return null;
return React.createElement("div",{style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:"var(--z-modal)"},onClick:onClose},
React.createElement("div",{onClick:e=>e.stopPropagation(),style:{background:"var(--color-surface-elevated)",border:"1px solid var(--color-border)",borderRadius:"var(--radius-xl)",padding:24,width:380,boxShadow:"var(--shadow-lg)"}},
React.createElement("div",{style:{fontFamily:"var(--font-display)",fontWeight:600,fontSize:"var(--text-section)",color:"var(--color-text-primary)",marginBottom:8}},title),
description&&React.createElement("div",{style:{fontSize:"var(--text-body)",color:"var(--color-text-secondary)",marginBottom:16}},description),
children,
actions&&React.createElement("div",{style:{display:"flex",justifyContent:"flex-end",gap:10,marginTop:18}},actions)));
}
