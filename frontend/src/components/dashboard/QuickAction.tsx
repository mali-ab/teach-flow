import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface Props {
  title: string;
  icon: ReactNode;
  link: string;
}

export default function QuickAction({ title, icon, link }: Props) {
  return (
    <NavLink
      to={link}
      className="
    bg-white
    border
    rounded-2xl
    p-5
    hover:border-blue-500
    hover:shadow
    transition
    flex
    items-center
    gap-4
    "
    >
      <div
        className="
    bg-blue-100
    text-blue-600
    p-3
    rounded-xl
    "
      >
        {icon}
      </div>

      <span
        className="
    font-semibold
    "
      >
        {title}
      </span>
    </NavLink>
  );
}
