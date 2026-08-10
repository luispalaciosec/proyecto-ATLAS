import React from "react";
export function Badge({tone="neutral",children}){
const tones={
neutral:{bg:"var(--color-surface-elevated)",fg:"var(--color-text-secondary)"},
primary:{bg:"rgba(104,92,255,0.16)",fg:"var(--color-primary)"},
success:{bg:"rgba(16,185,129,0.16)",fg:"var(--color-success)"},
warning:{bg:"rgba(245,158,11,0.16)",fg:"var(--color-warning)"},
error:{bg:"rgba(244,63,94,0.16)",fg:"var(--color-error)"},
info:{bg:"rgba(34,211,238,0.16)",fg:"var(--color-cyan)"}
};
const t=tones[tone];
return React.createElement("span",{style:{background:t.bg,color:t.fg,fontSize:"var(--text-metadata)",fontWeight:600,padding:"3px 10px",borderRadius:"var(--radius-pill)",display:"inline-flex",alignItems:"center",gap:6}},children);
}
