import React from "react";
export function TopBar({brand="General",onThemeToggle,userName="Ana García"}){
const label=brand==="General"?"Trabajando en":"Trabajando con";
return React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 24px",borderBottom:"1px solid var(--color-border-subtle)"}},
React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,fontSize:"var(--text-body)",color:"var(--color-text-secondary)"}},
label,React.createElement("span",{style:{color:"var(--color-text-primary)",fontWeight:600}},brand),React.createElement("span",{style:{color:"var(--color-text-muted)"}},"▾")),
React.createElement("div",{style:{display:"flex",alignItems:"center",gap:14}},
React.createElement("button",{onClick:onThemeToggle,style:{background:"none",border:"none",color:"var(--color-text-secondary)",cursor:"pointer",fontSize:16}},"☾"),
React.createElement("div",{style:{width:32,height:32,borderRadius:"50%",background:"var(--color-primary)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600}},userName.split(" ").map(w=>w[0]).slice(0,2).join(""))));
}
