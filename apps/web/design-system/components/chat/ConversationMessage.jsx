import React from "react";
export function ConversationMessage({role="assistant",children,time}){
const isUser=role==="user";
return React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:isUser?"flex-end":"flex-start",gap:4,marginBottom:18}},
React.createElement("div",{style:{fontSize:"var(--text-metadata)",color:"var(--color-text-muted)",fontWeight:600}},isUser?"Tú":"ATLAS"),
React.createElement("div",{style:{maxWidth:"78%",background:isUser?"var(--color-primary)":"var(--color-surface-elevated)",
color:isUser?"#fff":"var(--color-text-primary)",border:isUser?"none":"1px solid var(--color-border)",
borderRadius:"var(--radius-lg)",padding:"12px 16px",fontSize:"var(--text-body)",lineHeight:"var(--leading-relaxed)"}},children),
time&&React.createElement("div",{style:{fontSize:"var(--text-metadata)",color:"var(--color-text-disabled)"}},time));
}
