import React, { useState } from "react";
import { VideoCameraIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

// Note the 'type' keyword here:
import type { CreateMeetingPayload } from "../../types/meeting";

interface MeetingFormProps {
  onSubmit: (data: CreateMeetingPayload) => void;
  isLoading?: boolean;
}

export default function MeetingForm({
  onSubmit,
  isLoading = false,
}: MeetingFormProps) {
  const [title, setTitle] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({ title: title.trim() });
  };

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl mb-4">
            <VideoCameraIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Meeting</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Set up a new online meeting in seconds
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Meeting Name
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              placeholder="Example: Mathematics Class"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Meeting</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
