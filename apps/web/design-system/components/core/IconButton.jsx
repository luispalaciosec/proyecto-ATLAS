import React from "react";
export function IconButton({icon,label,active,onClick,size=36}){
return React.createElement("button",{onClick,"aria-label":label,title:label,style:{
width:size,height:size,minWidth:44>size?44:size,minHeight:44>size?44:size,display:"inline-flex",alignItems:"center",justifyContent:"center",
borderRadius:"var(--radius-sm)",border:"1px solid "+(active?"transparent":"var(--color-border)"),
background:active?"var(--color-primary)":"transparent",color:active?"#fff":"var(--color-text-secondary)",cursor:"pointer"
}},icon);
}
