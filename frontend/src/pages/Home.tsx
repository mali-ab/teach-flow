import { Link } from "react-router-dom";


export default function Home(){


return (

<div className="
min-h-screen
flex
items-center
justify-center
bg-slate-50
">


<div className="
text-center
">


<h1 className="
text-6xl
font-bold
text-blue-600
">

TeachFlow

</h1>



<p className="
mt-5
text-xl
text-gray-600
">

Simple video meetings for everyone

</p>



<div className="
mt-8
flex
gap-4
justify-center
">


<Link

to="/login"

className="
bg-blue-600
text-white
px-6
py-3
rounded-xl
"

>

Login

</Link>



<Link

to="/register"

className="
border
px-6
py-3
rounded-xl
"

>

Register

</Link>


</div>


</div>


</div>

)

}