import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Video,
  FileText,
  Settings,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

const studentLinks = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard />,
    path: "/student/dashboard",
  },

  {
    name: "Courses",
    icon: <BookOpen />,
    path: "/student/courses",
  },

  {
    name: "Calendar",
    icon: <Calendar />,
    path: "#",
  },

  {
    name: "Live Classes",
    icon: <Video />,
    path: "#",
  },

  {
    name: "Assignments",
    icon: <FileText />,
    path: "#",
  },

  {
    name: "Settings",
    icon: <Settings />,
    path: "#",
  },
];

export default function Sidebar() {
  return (
    <aside
      className="
  w-64
  min-h-screen
  bg-white
  border-r
  hidden
  md:block
  "
    >
      <div
        className="
  p-6
  "
      >
        <h2
          className="
  text-2xl
  font-bold
  text-blue-600
  "
        >
          TeachFlow
        </h2>
      </div>

      <nav
        className="
  px-4
  space-y-2
  "
      >
        {studentLinks.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="
  flex
  items-center
  gap-3
  px-4
  py-3
  rounded-xl
  text-gray-600
  hover:bg-blue-50
  hover:text-blue-600
  transition
  "
          >
            {item.icon}

            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
