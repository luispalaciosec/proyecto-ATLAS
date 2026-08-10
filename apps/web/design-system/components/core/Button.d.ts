export interface ButtonProps{
variant?:"primary"|"secondary"|"tertiary"|"danger";
size?:"sm"|"md"|"lg";
icon?:React.ReactNode;
children:React.ReactNode;
disabled?:boolean;
onClick?:()=>void;
type?:"button"|"submit";
}
