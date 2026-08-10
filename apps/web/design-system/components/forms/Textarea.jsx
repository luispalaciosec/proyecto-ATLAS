import React from "react";
export function Textarea({placeholder,value,onChange,rows=4}){
return React.createElement("textarea",{placeholder,value,onChange,rows,style:{
width:"100%",padding:"12px 14px",borderRadius:"var(--radius-sm)",resize:"vertical",
background:"var(--color-bg)",border:"1px solid var(--color-border)",color:"var(--color-text-primary)",
fontFamily:"var(--font-body)",fontSize:"var(--text-body)",outline:"none"
}});
}
