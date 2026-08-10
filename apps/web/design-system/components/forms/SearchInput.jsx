import React from "react";
export function SearchInput({placeholder="Buscar...",value,onChange}){
return React.createElement("div",{style:{position:"relative"}},
React.createElement("span",{style:{position:"absolute",left:14,top:0,bottom:0,display:"flex",alignItems:"center",color:"var(--color-text-muted)",fontSize:15}},"⌕"),
React.createElement("input",{placeholder,value,onChange,style:{
width:"100%",height:44,padding:"0 14px 0 38px",borderRadius:"var(--radius-sm)",
background:"var(--color-surface)",border:"1px solid var(--color-border)",color:"var(--color-text-primary)",
fontFamily:"var(--font-body)",fontSize:"var(--text-body)",outline:"none"
}}));
}
