import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { Send, MessageCircle, Users } from "lucide-react";
import api from "../services/api";

export default function Chat({ appointmentId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const { socket, sendMessage, joinRoom, sendTyping, stopTyping } = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!appointmentId) return;
    joinRoom(`room_${appointmentId}`);
    loadMessages();
  }, [appointmentId]);

  useEffect(() => {
    if (!socket || !appointmentId) return;

    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => {
      socket.off("new_message");
    };
  }, [socket, appointmentId]);

  const loadMessages = async (p = 1) => {
    try {
      const { data } = await api.get(`/consultations/${appointmentId}/messages?page=${p}&limit=50`);
      setMessages((prev) => (p === 1 ? data.messages : [...data.messages, ...prev]));
    } catch (_) {}
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    sendMessage({ room: `room_${appointmentId}`, message: input });
    setInput("");
    stopTyping({ room: `room_${appointmentId}`, userId: localStorage.getItem("userId") });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Enter" && e.shiftKey) {
      sendTyping({ room: `room_${appointmentId}`, userId: localStorage.getItem("userId") });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-primary-100">
        <MessageCircle size={20} className="text-primary-600" />
        <span className="font-semibold text-ink-900">Chat</span>
        <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Online
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender?._id === localStorage.getItem("userId") ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                msg.sender?._id === localStorage.getItem("userId")
                  ? "bg-primary-600 text-white"
                  : "bg-primary-50 text-ink-900"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content || msg.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-primary-100 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-primary-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-full bg-primary-600 p-2 text-white disabled:opacity-50 hover:bg-primary-700"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}