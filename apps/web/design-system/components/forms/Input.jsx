import React from "react";
export function Input({placeholder,value,onChange,type="text",error,disabled}){
return React.createElement("input",{type,placeholder,value,onChange,disabled,style:{
width:"100%",height:44,padding:"0 14px",borderRadius:"var(--radius-sm)",
background:"var(--color-bg)",border:"1px solid "+(error?"var(--color-error)":"var(--color-border)"),
color:"var(--color-text-primary)",fontFamily:"var(--font-body)",fontSize:"var(--text-body)",outline:"none",opacity:disabled?0.5:1
}});
}
