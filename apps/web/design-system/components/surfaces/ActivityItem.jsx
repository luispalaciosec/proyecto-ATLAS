import React from "react";
export function ActivityItem({icon,text,time,tone="primary"}){
const colors={primary:"var(--color-primary)",cyan:"var(--color-cyan)",warning:"var(--color-warning)",success:"var(--color-success)"};
return React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 4px"}},
React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10}},
React.createElement("span",{style:{color:colors[tone]}},icon),
React.createElement("span",{style:{fontSize:"var(--text-body)",color:"var(--color-text-primary)"}},text)),
React.createElement("span",{style:{fontSize:"var(--text-metadata)",color:"var(--color-text-muted)",flexShrink:0}},time));
}
