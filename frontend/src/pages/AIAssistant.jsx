import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, AlertTriangle } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! Tell me what symptoms you're experiencing, and I'll point you in the right direction. I can't diagnose you — for emergencies, contact local emergency services." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!user) {
      setMessages((m) => [...m, { role: "assistant", content: "Please log in first so I can save your conversation securely." }]);
      return;
    }
    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/query", { message: userMsg.content, history: messages });
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: err.response?.data?.message || "The AI service is unavailable right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-2xl flex-col px-4 py-6 md:px-6">
      <div className="flex items-center gap-2">
        <Sparkles className="text-primary-600" size={22} />
        <h1 className="font-display text-xl font-semibold text-ink-900">AI Health Assistant</h1>
      </div>
      <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        General guidance only, not a diagnosis. In an emergency, contact local emergency services immediately.
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-primary-100 bg-white p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.role === "user" ? "bg-primary-600 text-white" : "bg-primary-50 text-ink-900"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-ink-500">Thinking...</div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="mt-4 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your symptoms..."
          className="flex-1 rounded-full border border-primary-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400"
        />
        <button disabled={loading} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
