import React from "react";
import {NavItem} from "./NavItem.jsx";
export function Sidebar({activeItem="Inicio",items,footer,logoSrc="assets/logo.svg"}){
const defaultItems=[["house","Inicio"],["message-circle","Conversar"],["book-open","Conocimiento"],["building-2","Marcas"],["trending-up","Actividad"]];
const list=items||defaultItems.map(([ic,label])=>({icon:ic,label}));
return React.createElement("div",{style:{width:220,minHeight:600,background:"var(--color-navy-950,var(--color-bg))",borderRight:"1px solid var(--color-border)",display:"flex",flexDirection:"column",padding:16,gap:4}},
React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"6px 8px 20px"}},
React.createElement("img",{src:logoSrc,style:{height:22,filter:"invert(1)"}}),
React.createElement("span",{style:{fontFamily:"var(--font-display)",fontWeight:600,fontSize:16,letterSpacing:"var(--tracking-heading)",color:"var(--color-text-primary)"}},"ATLAS")),
list.map(it=>React.createElement(NavItem,{key:it.label,icon:it.icon,label:it.label,active:it.active!=null?it.active:it.label===activeItem,onClick:it.onClick})),
React.createElement("div",{style:{flex:1}}),
footer);
}
