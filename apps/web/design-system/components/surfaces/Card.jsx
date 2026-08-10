import React from "react";
export function Card({children,padding=24}){
return React.createElement("div",{style:{
background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:"var(--radius-lg)",padding
}},children);
}
