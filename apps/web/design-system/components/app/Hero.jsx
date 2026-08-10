import React from "react";
export function Hero({title,subtitle,description,visual}){
return React.createElement("div",{style:{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:"var(--radius-xl)",
padding:32,display:"flex",alignItems:"center",justifyContent:"space-between",gap:24,overflow:"hidden",position:"relative"}},
React.createElement("div",{style:{maxWidth:480}},
React.createElement("div",{style:{fontFamily:"var(--font-display)",fontSize:"var(--text-display)",fontWeight:600,color:"var(--color-text-primary)",letterSpacing:"var(--tracking-heading)"}},title),
subtitle&&React.createElement("div",{style:{fontSize:"var(--text-section)",color:"var(--color-text-secondary)",marginTop:6,fontFamily:"var(--font-display)",fontWeight:600}},subtitle),
description&&React.createElement("div",{style:{fontSize:"var(--text-body)",color:"var(--color-text-muted)",marginTop:10,lineHeight:"var(--leading-relaxed)"}},description)),
visual);
}
