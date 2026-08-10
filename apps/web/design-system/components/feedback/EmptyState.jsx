import React from "react";
export function EmptyState({icon="📄",title,description,action}){
return React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:8,padding:"40px 24px",color:"var(--color-text-secondary)"}},
React.createElement("div",{style:{fontSize:28,opacity:0.6}},icon),
React.createElement("div",{style:{fontFamily:"var(--font-display)",fontWeight:600,color:"var(--color-text-primary)",fontSize:"var(--text-card-title)"}},title),
description&&React.createElement("div",{style:{fontSize:"var(--text-secondary)",maxWidth:320}},description),
action);
}
