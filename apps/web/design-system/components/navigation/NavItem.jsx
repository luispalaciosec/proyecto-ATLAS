import React from "react";
export function NavItem({icon,label,active,onClick}){
return React.createElement("div",{onClick,style:{
display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:"var(--radius-sm)",cursor:"pointer",
background:active?"rgba(104,92,255,0.16)":"transparent",color:active?"var(--color-primary)":"var(--color-text-secondary)",
fontSize:"var(--text-nav)",fontWeight:active?600:500}},
React.createElement("span",{style:{width:18,display:"flex",justifyContent:"center"}},icon),label);
}
