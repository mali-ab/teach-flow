interface Props {
  title: string;

  date: string;

  link: string;
}

export default function MeetingCard({ title, date, link }: Props) {
  return (
    <div
      className="
    bg-white
    rounded-2xl
    p-6
    shadow-sm
    border
    "
    >
      <h3
        className="
    text-xl
    font-bold
    "
      >
        {title}
      </h3>

      <p
        className="
    text-gray-500
    mt-2
    "
      >
        {date}
      </p>

      <div
        className="
    mt-5
    flex
    gap-3
    "
      >
        <button
          className="
    bg-blue-600
    text-white
    px-4
    py-2
    rounded-xl
    "
        >
          Join
        </button>

        <button
          className="
    border
    px-4
    py-2
    rounded-xl
    "
        >
          Copy Link
        </button>
      </div>
    </div>
  );
}
