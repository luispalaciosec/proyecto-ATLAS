function IconRocket({size=120}){
return React.createElement("div",{style:{position:"relative",width:size*2.4,height:size*1.6,display:"flex",alignItems:"flex-end",justifyContent:"center",overflow:"hidden"}},
React.createElement("div",{style:{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 100%, rgba(104,92,255,0.25), transparent 60%)"}}),
React.createElement("div",{style:{position:"absolute",bottom:size*0.28,left:"50%",width:size*2,height:1,background:"var(--color-border)",transform:"translateX(-50%)",borderRadius:"50%"}}),
React.createElement("img",{src:"../../assets/logo.svg",style:{height:size,filter:"invert(1) drop-shadow(0 0 24px rgba(104,92,255,0.5))",position:"relative",zIndex:1}}));
}
window.AtlasUIKit=Object.assign(window.AtlasUIKit||{},{IconRocket});
window.AtlasUIKit.navItems=function(active,onNavigate){
const rows=[["🏠","Inicio","home"],["💬","Conversar","chat"],["📖","Conocimiento","knowledge"],["🏢","Marcas","brands"],["📈","Actividad","activity"]];
return rows.map(([icon,label,route])=>({icon,label,active:label===active,onClick:()=>onNavigate&&onNavigate(route)}));
};
