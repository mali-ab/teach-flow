interface Props {
  name: string;
  isMain?: boolean;
}

export default function VideoCard({ name, isMain = false }: Props) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`
        relative
        h-full
        w-full
        bg-black
        rounded-xl
        overflow-hidden
        border
        ${isMain ? "border-gray-600" : "border-gray-700"}
      `}
    >
      {/* Camera Area */}
      <div
        className="
          absolute
          inset-0
          flex
          flex-col
          items-center
          justify-center
          bg-gradient-to-br
          from-gray-800
          via-gray-900
          to-black
          text-white
        "
      >
        {/* Avatar */}
        <div
          className="
            w-20
            h-20
            rounded-full
            bg-blue-600
            flex
            items-center
            justify-center
            text-2xl
            font-bold
            shadow-lg
          "
        >
          {initials}
        </div>

        <span
          className="
            mt-4
            text-gray-300
            text-sm
          "
        >
          Camera Off
        </span>
      </div>

      {/* Bottom gradient */}
      <div
        className="
          absolute
          inset-x-0
          bottom-0
          h-20
          bg-gradient-to-t
          from-black/80
          to-transparent
        "
      />

      {/* Name + status */}
      <div
        className="
          absolute
          bottom-3
          left-3
          flex
          items-center
          gap-2
          bg-black/60
          backdrop-blur-sm
          text-white
          px-3
          py-1.5
          rounded-lg
          text-sm
        "
      >
        <span>{name}</span>

        {/* microphone status */}
        <span className="text-gray-400">🎤</span>
      </div>

      {/* Main speaker badge */}
      {isMain && (
        <div
          className="
            absolute
            top-3
            left-3
            bg-blue-600
            text-white
            text-xs
            px-3
            py-1
            rounded-full
            font-medium
          "
        >
          Speaker
        </div>
      )}
    </div>
  );
}
