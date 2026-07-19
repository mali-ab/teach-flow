import { LinkIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";

export default function MeetingLinkCard() {
  const link = "https://teachflow.com/join/abc123";

  function copyLink() {
    navigator.clipboard.writeText(link);
  }

  return (
    <div
      className="
    bg-white
    rounded-3xl
    border
    p-8
    max-w-xl
    "
    >
      <h2
        className="
    text-2xl
    font-bold
    "
      >
        Your Meeting is Ready 🎉
      </h2>

      <p
        className="
    text-gray-500
    mt-2
    "
      >
        Share this link with participants.
      </p>

      <div
        className="
    mt-6
    flex
    items-center
    gap-3
    bg-slate-100
    p-4
    rounded-xl
    "
      >
        <LinkIcon
          className="
    w-5
    h-5
    text-blue-600
    "
        />

        <p
          className="
    flex-1
    truncate
    text-sm
    "
        >
          {link}
        </p>

        <button onClick={copyLink}>
          <ClipboardDocumentIcon
            className="
    w-6
    h-6
    text-gray-600
    "
          />
        </button>
      </div>
    </div>
  );
}
