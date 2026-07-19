import {
  VideoCameraIcon,
  UserGroupIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface Props {
  title: string;

  host: string;

  time: string;

  participants: number;
}

export default function MeetingInfo({
  title,
  host,
  time,
  participants,
}: Props) {
  return (
    <div
      className="
    bg-white
    rounded-2xl
    shadow
    p-8
    max-w-lg
    w-full
    "
    >
      <div
        className="
    flex
    items-center
    gap-3
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
          <VideoCameraIcon
            className="
    w-8
    h-8
    "
          />
        </div>

        <h1
          className="
    text-2xl
    font-bold
    "
        >
          {title}
        </h1>
      </div>

      <div
        className="
    mt-8
    space-y-4
    text-gray-600
    "
      >
        <div
          className="
    flex
    items-center
    gap-3
    "
        >
          <UserGroupIcon
            className="
    w-6
    h-6
    "
          />

          <span>
            Host:
            {host}
          </span>
        </div>

        <div
          className="
    flex
    items-center
    gap-3
    "
        >
          <ClockIcon
            className="
    w-6
    h-6
    "
          />

          <span>{time}</span>
        </div>

        <div>
          Participants:
          {participants}
        </div>
      </div>
    </div>
  );
}
