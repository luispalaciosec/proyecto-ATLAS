import React from "react";
export function AppShell({sidebar,topBar,children}){
return React.createElement("div",{style:{display:"flex",minHeight:"100vh",background:"var(--color-bg)",fontFamily:"var(--font-body)"}},
sidebar,
React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",minWidth:0}},
topBar,
React.createElement("div",{style:{flex:1,padding:32,maxWidth:1180,margin:"0 auto",width:"100%"}},children)));
}
