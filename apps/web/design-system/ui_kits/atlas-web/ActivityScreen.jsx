function ActivityScreen({brand,onNavigate}){
const {Sidebar,TopBar,Card,ActivityItem,Section}=window.ATLASDesignSystem_46b296;
const items=[["💬",'Conversaste sobre "¿Qué contratos tengo con Acme?"',"Ahora","primary"],
["🔍",'Buscaste "contratos de servicio"',"Hace 8 min","cyan"],
["✎","Corregiste una respuesta de ATLAS","Hace 25 min","warning"],
["📖","Abriste el Manual de bienvenida","Hace 40 min","cyan"],
["💬",'Conversaste sobre "Resumen de RRHH"',"Hace 1 hora","primary"]];
return React.createElement(React.Fragment,null,
React.createElement(Sidebar,{activeItem:"Actividad",logoSrc:"../../assets/logo.svg",items:window.AtlasUIKit.navItems("Actividad",onNavigate)}),
React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",minWidth:0}},
React.createElement(TopBar,{brand}),
React.createElement("div",{style:{flex:1,padding:32,maxWidth:1180,margin:"0 auto",width:"100%"}},
React.createElement("div",{style:{fontFamily:"var(--font-display)",fontSize:"var(--text-page-title)",fontWeight:600,color:"var(--color-text-primary)",marginBottom:6}},"Actividad"),
React.createElement("div",{style:{fontSize:14,color:"var(--color-text-muted)",marginBottom:20}},"Actividad de esta sesión."),
React.createElement(Section,{title:"Esta sesión"},React.createElement(Card,null,items.map((it,i)=>React.createElement(ActivityItem,{key:i,icon:it[0],text:it[1],time:it[2],tone:it[3]})))))));
}
window.AtlasUIKit=Object.assign(window.AtlasUIKit||{},{ActivityScreen});
