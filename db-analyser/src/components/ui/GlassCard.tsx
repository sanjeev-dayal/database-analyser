type Props={
    children:React.ReactNode
}

export default function GlassCard({children}:Props){

return(

<div
className="
rounded-3xl
border
border-violet-900/40
bg-[#12111C]/70
backdrop-blur-xl
shadow-2xl
p-8
"
>

{children}

</div>

)

}