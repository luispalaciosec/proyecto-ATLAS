function BrandsScreen({brand,onSelect,onNavigate}){
const {Sidebar,TopBar,BrandCard,Section}=window.ATLASDesignSystem_46b296;
const brands=[{name:"General",purpose:"Contexto por defecto, sin marca específica.",count:12},
{name:"Banco Machala",purpose:"Conocimiento y conversaciones del contexto Banco Machala.",count:34},
{name:"Acme Corp",purpose:"Conocimiento y conversaciones del contexto Acme Corp.",count:8}];
return React.createElement(React.Fragment,null,
React.createElement(Sidebar,{activeItem:"Marcas",logoSrc:"../../assets/logo.svg",items:window.AtlasUIKit.navItems("Marcas",onNavigate)}),
React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",minWidth:0}},
React.createElement(TopBar,{brand}),
React.createElement("div",{style:{flex:1,padding:32,maxWidth:1180,margin:"0 auto",width:"100%"}},
React.createElement("div",{style:{fontFamily:"var(--font-display)",fontSize:"var(--text-page-title)",fontWeight:600,color:"var(--color-text-primary)",marginBottom:16}},"Marcas"),
React.createElement(Section,{title:"Tus contextos de marca"},
React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}},
brands.map(b=>React.createElement(BrandCard,{key:b.name,name:b.name,purpose:b.purpose,knowledgeCount:b.count,active:b.name===brand,onClick:()=>onSelect&&onSelect(b.name)})))))));
}
window.AtlasUIKit=Object.assign(window.AtlasUIKit||{},{BrandsScreen});
