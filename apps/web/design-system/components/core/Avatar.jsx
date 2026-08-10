import React from "react";
export function Avatar({name="",size=36,src}){
const initials=name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
return React.createElement("div",{style:{
width:size,height:size,borderRadius:"50%",background:"var(--color-primary)",color:"#fff",
display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:600,fontFamily:"var(--font-display)",overflow:"hidden",flexShrink:0
}},src?React.createElement("img",{src,alt:name,style:{width:"100%",height:"100%",objectFit:"cover"}}):initials);
}
