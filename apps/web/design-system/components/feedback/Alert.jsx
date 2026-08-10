import React from "react";
export function Alert({tone="info",title,children}){
const colors={info:"var(--color-cyan)",success:"var(--color-success)",warning:"var(--color-warning)",error:"var(--color-error)"};
return React.createElement("div",{style:{display:"flex",gap:10,padding:"14px 16px",borderRadius:"var(--radius-md)",background:"var(--color-surface-elevated)",border:"1px solid "+colors[tone]+"33"}},
React.createElement("span",{style:{color:colors[tone],flexShrink:0}},"●"),
React.createElement("div",null,title&&React.createElement("div",{style:{fontWeight:600,color:"var(--color-text-primary)",fontSize:"var(--text-body)",marginBottom:2}},title),
React.createElement("div",{style:{fontSize:"var(--text-secondary)",color:"var(--color-text-secondary)"}},children)));
}
