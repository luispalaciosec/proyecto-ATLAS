import React from "react";
export function ActionCard({icon,tone="primary",title,description,cta,onClick}){
const colors={primary:"var(--color-primary)",cyan:"var(--color-cyan)",success:"var(--color-success)",warning:"var(--color-warning)"};
return React.createElement("div",{style:{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:"var(--radius-lg)",padding:20,display:"flex",flexDirection:"column",gap:10}},
React.createElement("div",{style:{width:36,height:36,borderRadius:"var(--radius-sm)",background:"rgba(148,163,184,0.1)",color:colors[tone],display:"flex",alignItems:"center",justifyContent:"center"}},icon),
React.createElement("div",{style:{fontFamily:"var(--font-display)",fontSize:"var(--text-card-title)",fontWeight:600,color:"var(--color-text-primary)"}},title),
React.createElement("div",{style:{fontSize:"var(--text-secondary)",color:"var(--color-text-secondary)",lineHeight:"var(--leading-normal)"}},description),
React.createElement("button",{onClick,style:{marginTop:4,alignSelf:"flex-start",background:"none",border:"none",color:colors[tone],fontSize:"var(--text-secondary)",fontWeight:600,cursor:"pointer",padding:0}},cta)
);
}
