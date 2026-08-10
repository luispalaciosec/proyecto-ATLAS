function KnowledgeScreen({brand,onNavigate}){
const {Sidebar,TopBar,SearchInput,Card,KnowledgeCard,Section}=window.ATLASDesignSystem_46b296;
const docs=[["Manual de bienvenida","Guía"],["Política de gastos","Documento"],["Guía de procesos comerciales","Documento"],["Contrato marco Acme Corp","Contrato"],["Plantilla de propuesta comercial","Plantilla"],["Reglamento interno de trabajo","Documento"]];
return React.createElement(React.Fragment,null,
React.createElement(Sidebar,{activeItem:"Conocimiento",logoSrc:"../../assets/logo.svg",items:window.AtlasUIKit.navItems("Conocimiento",onNavigate)}),
React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",minWidth:0}},
React.createElement(TopBar,{brand}),
React.createElement("div",{style:{flex:1,padding:32,maxWidth:1180,margin:"0 auto",width:"100%"}},
React.createElement("div",{style:{fontFamily:"var(--font-display)",fontSize:"var(--text-page-title)",fontWeight:600,color:"var(--color-text-primary)",marginBottom:16}},"Conocimiento"),
React.createElement("div",{style:{maxWidth:420,marginBottom:24}},React.createElement(SearchInput,{placeholder:"Buscar documentos, guías y recursos..."})),
React.createElement(Section,{title:"Todos los recursos"},React.createElement(Card,null,docs.map(([t,ty])=>React.createElement(KnowledgeCard,{key:t,title:t,type:ty})))))));
}
window.AtlasUIKit=Object.assign(window.AtlasUIKit||{},{KnowledgeScreen});
