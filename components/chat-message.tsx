import React from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`py-4 ${role === "assistant" ? "bg-[#f9fafb]" : "bg-white"}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-start gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-white
          ${role === "assistant" ? "bg-[#22c55e]" : "bg-[#9ca3af]"}`}>
          {role === "assistant" ? "AI" : "You"}
        </div>
        <div className="min-w-0 flex-1">
          {content.split('\n').map((paragraph, i) => (
            paragraph.trim() ? <p key={i} className="my-1">{paragraph}</p> : <br key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}