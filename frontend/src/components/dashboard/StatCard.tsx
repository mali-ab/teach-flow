import { ReactNode } from "react";

interface Props {
  title: string;

  value: string;

  icon: ReactNode;

  color: string;
}

export default function StatCard({ title, value, icon, color }: Props) {
  return (
    <div
      className="
    bg-white
    rounded-2xl
    p-6
    border
    shadow-sm
    "
    >
      <div
        className={`
    w-12
    h-12
    rounded-xl
    flex
    items-center
    justify-center
    ${color}
    `}
      >
        {icon}
      </div>

      <p
        className="
    mt-5
    text-gray-500
    "
      >
        {title}
      </p>

      <h2
        className="
    text-3xl
    font-bold
    mt-1
    text-slate-900
    "
      >
        {value}
      </h2>
    </div>
  );
}
