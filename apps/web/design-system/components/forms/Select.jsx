import React from "react";
export function Select({value,options=[],onChange}){
return React.createElement("select",{value,onChange,style:{
height:44,padding:"0 12px",borderRadius:"var(--radius-sm)",background:"var(--color-surface)",
border:"1px solid var(--color-border)",color:"var(--color-text-primary)",fontFamily:"var(--font-body)",fontSize:"var(--text-body)",outline:"none"
}},options.map(o=>React.createElement("option",{key:o,value:o},o)));
}
