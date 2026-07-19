import { ReactNode } from "react";

interface Props {
  icon: ReactNode;

  title: string;

  description: string;
}

export default function FeatureCard({ icon, title, description }: Props) {
  return (
    <div
      className="
    bg-white
    rounded-2xl
    p-6
    shadow-sm
    border
    hover:shadow-md
    transition
    "
    >
      <div
        className="
    w-12
    h-12
    rounded-xl
    bg-blue-100
    text-blue-600
    flex
    items-center
    justify-center
    "
      >
        {icon}
      </div>

      <h3
        className="
    mt-5
    text-xl
    font-semibold
    "
      >
        {title}
      </h3>

      <p
        className="
    mt-2
    text-gray-600
    "
      >
        {description}
      </p>
    </div>
  );
}
