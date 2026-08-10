import React from "react";
export function Button({variant="primary",size="md",icon,children,disabled,onClick,type="button"}){
const pad=size==="sm"?"8px 14px":size==="lg"?"14px 22px":"11px 18px";
const base={fontFamily:"var(--font-body)",fontSize:"var(--text-button)",fontWeight:600,borderRadius:"var(--radius-sm)",padding:pad,display:"inline-flex",alignItems:"center",gap:8,cursor:disabled?"not-allowed":"pointer",border:"1px solid transparent",transition:"background var(--motion-fast) var(--motion-ease),border-color var(--motion-fast) var(--motion-ease)",opacity:disabled?0.5:1,minHeight:44};
const variants={
primary:{background:"var(--color-primary)",color:"#fff"},
secondary:{background:"transparent",color:"var(--color-text-primary)",borderColor:"var(--color-border)"},
tertiary:{background:"transparent",color:"var(--color-primary)"},
danger:{background:"var(--color-error)",color:"#fff"}
};
return React.createElement("button",{type,disabled,onClick,style:{...base,...variants[variant]}},icon,children);
}
