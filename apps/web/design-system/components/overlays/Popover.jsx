import React from "react";
export function Popover({open,children,anchorStyle}){
if(!open)return null;
return React.createElement("div",{style:{position:"absolute",top:"calc(100% + 6px)",left:0,minWidth:220,background:"var(--color-surface-elevated)",
border:"1px solid var(--color-border)",borderRadius:"var(--radius-md)",boxShadow:"var(--shadow-md)",padding:6,zIndex:"var(--z-dropdown)",...anchorStyle}},children);
}
