import React from "react";
import {Popover} from "../overlays/Popover.jsx";
import {Listbox} from "../forms/Listbox.jsx";
export function BrandSelector({brands=["General"],selected="General",onSelect}){
const [open,setOpen]=React.useState(false);
return React.createElement("div",{style:{position:"relative",display:"inline-block"}},
React.createElement("button",{onClick:()=>setOpen(!open),style:{display:"flex",alignItems:"center",gap:8,background:"var(--color-surface-elevated)",border:"1px solid var(--color-border)",borderRadius:"var(--radius-sm)",padding:"8px 12px",color:"var(--color-text-primary)",fontSize:"var(--text-body)",cursor:"pointer"}},selected,React.createElement("span",{style:{color:"var(--color-text-muted)"}},"▾")),
React.createElement(Popover,{open},React.createElement(Listbox,{items:brands,selected,onSelect:v=>{onSelect&&onSelect(v);setOpen(false)}})));
}
