import React from "react";
export function Skeleton({width="100%",height=16,radius="var(--radius-sm)"}){
return React.createElement("div",{style:{width,height,borderRadius:radius,background:"linear-gradient(90deg,var(--color-surface-elevated),var(--color-border),var(--color-surface-elevated))",
backgroundSize:"200% 100%",animation:"atlas-skeleton 1.4s ease-in-out infinite"}});
}
