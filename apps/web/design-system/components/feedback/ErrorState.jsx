import React from "react";
export function ErrorState({title="Algo salió mal",description,onRetry}){
return React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:10,padding:"40px 24px"}},
React.createElement("div",{style:{fontSize:28,color:"var(--color-error)"}},"⚠"),
React.createElement("div",{style:{fontFamily:"var(--font-display)",fontWeight:600,color:"var(--color-text-primary)",fontSize:"var(--text-card-title)"}},title),
description&&React.createElement("div",{style:{fontSize:"var(--text-secondary)",color:"var(--color-text-secondary)",maxWidth:320}},description),
onRetry&&React.createElement("button",{onClick:onRetry,style:{marginTop:4,background:"var(--color-primary)",color:"#fff",border:"none",borderRadius:"var(--radius-sm)",padding:"10px 18px",fontSize:"var(--text-button)",fontWeight:600,cursor:"pointer"}},"Reintentar"));
}
