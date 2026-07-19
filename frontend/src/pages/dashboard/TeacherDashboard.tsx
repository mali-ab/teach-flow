import DashboardLayout from "../../layouts/DashboardLayout";

export default function TeacherDashboard() {
  return (
    <DashboardLayout>
      <h1
        className="
text-3xl
font-bold
"
      >
        Teacher Dashboard 👨‍🏫
      </h1>

      <div
        className="
grid
md:grid-cols-3
gap-6
mt-8
"
      >
        <div
          className="
bg-white
rounded-2xl
p-6
"
        >
          <h3>Students</h3>

          <p
            className="
text-4xl
font-bold
"
          >
            120
          </p>
        </div>

        <div
          className="
bg-white
rounded-2xl
p-6
"
        >
          <h3>Courses</h3>

          <p
            className="
text-4xl
font-bold
"
          >
            8
          </p>
        </div>

        <div
          className="
bg-white
rounded-2xl
p-6
"
        >
          <h3>Live Classes</h3>

          <p
            className="
text-4xl
font-bold
"
          >
            24
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
