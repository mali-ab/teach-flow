import { useState } from "react";
import {
  VideoCameraIcon,
  ArrowPathIcon,
  SparklesIcon,
  ClockIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BoltIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

import type { CreateMeetingPayload } from "../../types/meeting";
import { useAuth } from "../../contexts/AuthContext";

interface MeetingFormProps {
  onSubmit: (data: CreateMeetingPayload) => void;
  isLoading?: boolean;
}

const DURATION_OPTIONS = [
  { value: 15, label: "15 мин" },
  { value: 30, label: "30 мин" },
];

export default function MeetingForm({
  onSubmit,
  isLoading = false,
}: MeetingFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState<string>("");
  const [duration, setDuration] = useState<number>(30);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");

  const isPro = user?.subscription === "pro";

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    const payload: CreateMeetingPayload = {
      creator_id: Number(user.id),
      title: title.trim(),
      duration_minutes: isPro ? undefined : duration,
    };

    if (isScheduled && scheduledDate && scheduledTime) {
      payload.scheduled_at = `${scheduledDate}T${scheduledTime}:00`;
    }

    onSubmit(payload);
  };

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col items-center text-center mb-8">
          <img className="h-18" src="/logo.svg" />
          <h1 className="text-3xl font-bold text-gray-900">Создать встречу</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Создайте новую онлайн-встречу за несколько секунд
          </p>
        </div>

        <div
          className={`mb-6 rounded-2xl border overflow-hidden ${
            isPro
              ? "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/80"
              : "border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50"
          }`}
        >
          <div
            className={`h-1.5 w-full ${
              isPro
                ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                : "bg-gradient-to-r from-slate-300 to-slate-400"
            }`}
          />

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isPro ? (
                  <div className="bg-blue-100 p-1.5 rounded-lg">
                    <SparklesIcon className="w-4 h-4 text-blue-600" />
                  </div>
                ) : (
                  <div className="bg-slate-200 p-1.5 rounded-lg">
                    <BoltIcon className="w-4 h-4 text-slate-600" />
                  </div>
                )}
                <span
                  className={`text-sm font-bold ${
                    isPro ? "text-blue-700" : "text-slate-700"
                  }`}
                >
                  {isPro ? "Pro-тариф" : "Бесплатный тариф"}
                </span>
              </div>

              {!isPro && (
                <Link
                  to="/pricing"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Улучшить
                </Link>
              )}
              {isPro && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  Активен
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs">
                <ClockIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">Длительность</span>
                <div className="flex-1" />
                <div className="flex items-center gap-1.5">
                  {isPro ? (
                    <>
                      <span className="text-slate-400 line-through text-[11px]">30 мин</span>
                      <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md text-[11px]">
                        Безлимитно
                      </span>
                    </>
                  ) : (
                    <span className="font-medium text-slate-700">Макс. 30 мин</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <UserGroupIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">Участники</span>
                <div className="flex-1" />
                <div className="flex items-center gap-1.5">
                  {isPro ? (
                    <>
                      <span className="text-slate-400 line-through text-[11px]">5</span>
                      <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md text-[11px]">
                        До 30
                      </span>
                    </>
                  ) : (
                    <span className="font-medium text-slate-700">До 5</span>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Участники</span>
                  <span>{isPro ? "Макс. 30" : "Макс. 5"}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPro
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 w-full"
                        : "bg-gradient-to-r from-amber-400 to-orange-400 w-1/6"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 mb-1.5"
            >
              Название встречи
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              placeholder="Например: Урок математики"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
            />
          </div>

          {!isPro && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span>Длительность встречи</span>
                </div>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDuration(opt.value)}
                    disabled={isLoading}
                    className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                      duration === opt.value
                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-4 ring-blue-100"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
                    } disabled:opacity-50`}
                  >
                    {duration === opt.value && (
                      <CheckIcon className="w-4 h-4 stroke-[3]" />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-amber-600 flex items-center gap-1">
                <BoltIcon className="w-3.5 h-3.5" />
                Бесплатный тариф: макс. 30 минут на встречу
              </p>
            </div>
          )}

          {isPro && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span>Длительность встречи</span>
                </div>
              </label>
              <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 px-4 py-3 flex items-center gap-2.5">
                <div className="bg-blue-100 p-1 rounded-lg">
                  <SparklesIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-700">
                    Безлимитная длительность
                  </span>
                  <p className="text-[11px] text-blue-500/70">
                    Без ограничений по времени на Pro-тарифе
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-1.5">
                  <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                  <span>Запланировать</span>
                </div>
              </label>
              <button
                type="button"
                onClick={() => setIsScheduled(!isScheduled)}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                  isScheduled ? "bg-blue-600" : "bg-gray-200"
                }`}
                role="switch"
                aria-checked={isScheduled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    isScheduled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {isScheduled ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Дата
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    disabled={isLoading}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Время
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-2.5 mt-2">
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <BoltIcon className="w-3.5 h-3.5" />
                  Встреча начнётся сразу
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Создание...</span>
              </>
            ) : (
              <span>{isScheduled ? "Запланировать встречу" : "Создать встречу"}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

