import React from "react";
export function Tooltip({label,children}){
const [show,setShow]=React.useState(false);
return React.createElement("span",{style:{position:"relative",display:"inline-flex"},onMouseEnter:()=>setShow(true),onMouseLeave:()=>setShow(false)},
children,
show&&React.createElement("span",{style:{position:"absolute",bottom:"calc(100% + 8px)",left:"50%",transform:"translateX(-50%)",
background:"var(--color-surface-elevated)",border:"1px solid var(--color-border)",color:"var(--color-text-primary)",
fontSize:"var(--text-metadata)",padding:"5px 10px",borderRadius:"var(--radius-sm)",whiteSpace:"nowrap",boxShadow:"var(--shadow-sm)",zIndex:"var(--z-dropdown)"}},label));
}
