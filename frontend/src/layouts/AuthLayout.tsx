import { ReactNode } from "react";
import { Video } from "lucide-react";

interface Props {
  children: ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div
      className="
min-h-screen
grid
md:grid-cols-2
"
    >
      <div
        className="
hidden
md:flex
bg-blue-600
text-white
items-center
justify-center
"
      >
        <div className="text-center">
          <Video size={80} className="mx-auto" />

          <h1
            className="
text-5xl
font-bold
mt-5
"
          >
            TeachFlow
          </h1>

          <p
            className="
mt-4
text-blue-100
text-xl
"
          >
            Create and join video meetings easily
          </p>
        </div>
      </div>

      <div
        className="
flex
items-center
justify-center
bg-slate-50
p-6
"
      >
        {children}
      </div>
    </div>
  );
}
