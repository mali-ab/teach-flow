import DashboardLayout from "../../layouts/DashboardLayout";

import { BookOpen, Video, Clock, Award } from "lucide-react";

const cards = [
  {
    title: "My Courses",
    value: "6",
    icon: <BookOpen />,
  },

  {
    title: "Live Classes",
    value: "12",
    icon: <Video />,
  },

  {
    title: "Hours Learned",
    value: "48",
    icon: <Clock />,
  },

  {
    title: "Certificates",
    value: "3",
    icon: <Award />,
  },
];

export default function StudentDashboard() {
  return (
    <DashboardLayout>
      <h1
        className="
text-3xl
font-bold
"
      >
        Welcome back, Student 👋
      </h1>

      <p
        className="
text-gray-500
mt-2
"
      >
        Here is your learning overview.
      </p>

      <div
        className="
grid
md:grid-cols-4
gap-6
mt-8
"
      >
        {cards.map((card) => (
          <div
            key={card.title}
            className="
bg-white
rounded-2xl
p-6
shadow-sm
"
          >
            <div
              className="
text-blue-600
"
            >
              {card.icon}
            </div>

            <h3
              className="
mt-4
text-gray-500
"
            >
              {card.title}
            </h3>

            <p
              className="
text-3xl
font-bold
mt-2
"
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div
        className="
mt-10
bg-white
rounded-2xl
p-6
"
      >
        <h2
          className="
text-xl
font-bold
"
        >
          Upcoming Classes
        </h2>

        <div
          className="
mt-5
flex
justify-between
items-center
border-b
pb-4
"
        >
          <div>
            <h3
              className="
font-semibold
"
            >
              Physics - Motion
            </h3>

            <p
              className="
text-gray-500
"
            >
              Today 10:00 AM
            </p>
          </div>

          <button
            className="
bg-blue-600
text-white
px-5
py-2
rounded-xl
"
          >
            Join Class
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
