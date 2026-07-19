import { VideoCameraIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function UpcomingMeeting() {
  return (
    <div
      className="
    bg-white
    rounded-3xl
    p-8
    border
    shadow-sm
    "
    >
      <div
        className="
    flex
    justify-between
    items-start
    "
      >
        <div>
          <h2
            className="
    text-xl
    font-bold
    "
          >
            Physics Class
          </h2>

          <div
            className="
    flex
    items-center
    gap-2
    text-gray-500
    mt-2
    "
          >
            <ClockIcon
              className="
    w-5
    h-5
    "
            />
            Today • 10:00 AM
          </div>
        </div>

        <div
          className="
    bg-blue-100
    text-blue-600
    p-3
    rounded-xl
    "
        >
          <VideoCameraIcon
            className="
    w-7
    h-7
    "
          />
        </div>
      </div>

      <button
        className="
    mt-8
    bg-green-500
    hover:bg-green-600
    text-white
    px-8
    py-3
    rounded-xl
    font-semibold
    "
      >
        Join Meeting
      </button>
    </div>
  );
}
