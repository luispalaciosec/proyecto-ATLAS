import React from "react";
export function Listbox({items=[],selected,onSelect}){
return React.createElement("div",{style:{background:"var(--color-surface-elevated)",border:"1px solid var(--color-border)",borderRadius:"var(--radius-md)",overflow:"hidden"}},
items.map(it=>React.createElement("div",{key:it,onClick:()=>onSelect&&onSelect(it),style:{
padding:"10px 14px",fontSize:"var(--text-body)",cursor:"pointer",
background:it===selected?"rgba(104,92,255,0.16)":"transparent",
color:it===selected?"var(--color-primary)":"var(--color-text-primary)"
}},it)));
}
