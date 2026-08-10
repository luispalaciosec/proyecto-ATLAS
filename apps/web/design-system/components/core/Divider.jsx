import React from "react";
export function Divider({spacing=24}){
return React.createElement("div",{style:{height:1,background:"var(--color-border-subtle)",margin:spacing+"px 0"}});
}
