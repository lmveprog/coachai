"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { chatApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour ! Je suis CoachAI Assistant. Pose-moi n'importe quelle question sur les challenges, les formations, ou la data science en général 🤖",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const { data } = await chatApi.message(next.slice(-20));
      setMessages([...next, { role: "assistant", content: data.content }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Désolé, une erreur s'est produite. Réessaie dans un instant." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ouvrir le chat"
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
          "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
          open && "scale-0 opacity-0"
        )}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-900/40 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
          open ? "scale-100 opacity-100" : "scale-90 opacity-0 pointer-events-none"
        )}
        style={{ height: "500px" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-blue-900/20" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">CoachAI Assistant</p>
            <p className="text-xs text-blue-200">Powered by AI</p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Fermer le chat" className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-white dark:bg-slate-950">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                msg.role === "assistant" ? "bg-blue-100 dark:bg-blue-900/40" : "bg-slate-100 dark:bg-slate-800"
              )}>
                {msg.role === "assistant"
                  ? <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  : <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                }
              </div>
              <div className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === "assistant"
                  ? "bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                  : "bg-blue-600 text-white rounded-tr-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-3 flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Pose ta question..."
            className="flex-1 text-sm bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 outline-none focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            aria-label="Envoyer le message"
            className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </>
  );
}
