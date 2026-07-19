import { ReactNode } from "react";
import Navbar from "../components/Navbar";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div
      className="
min-h-screen
bg-slate-50
"
    >
      <Navbar />

      <main
        className="
max-w-6xl
mx-auto
p-6
"
      >
        {children}
      </main>
    </div>
  );
}
