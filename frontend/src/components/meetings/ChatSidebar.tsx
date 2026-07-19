import React, { useState } from "react";
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface ChatSidebarProps {
  onClose: () => void;
}

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isSelf?: boolean;
}

export default function ChatSidebar({ onClose }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "Dr. Sarah Jenkins", text: "Welcome everyone to CS-101!", time: "10:00 AM" },
    { id: 2, sender: "Alex Rivera", text: "Can you share the slides later?", time: "10:02 AM" },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "You",
        text: inputMessage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isSelf: true,
      },
    ]);
    setInputMessage("");
  };

  return (
    <aside className="w-80 h-full bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col backdrop-blur-md overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-slate-200 text-sm">In-Meeting Chat</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[11px] font-medium text-slate-400">{msg.sender}</span>
              <span className="text-[10px] text-slate-500">{msg.time}</span>
            </div>
            <div
              className={`max-w-[85%] text-xs px-3 py-2 rounded-xl ${
                msg.isSelf
                  ? "bg-emerald-600 text-white rounded-br-none"
                  : "bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="Send a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 transition"
        />
        <button
          type="submit"
          className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition flex items-center justify-center"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
}