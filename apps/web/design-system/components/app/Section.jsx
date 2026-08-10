import React from "react";
export function Section({title,action,children}){
return React.createElement("div",{style:{marginBottom:32}},
React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}},
React.createElement("div",{style:{fontFamily:"var(--font-display)",fontWeight:600,fontSize:"var(--text-section)",color:"var(--color-text-primary)"}},title),
action),
children);
}
