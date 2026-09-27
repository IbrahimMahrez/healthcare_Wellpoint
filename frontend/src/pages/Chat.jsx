import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ChevronRight } from "lucide-react";
import api from "../services/api";

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/appointments/my").then(({ data }) => {
      const active = (data.appointments || []).filter((a) => a.status === "confirmed");
      setConversations(active);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink-500">
        Loading conversations...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/30 to-white">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">Chat</h1>
        <p className="mt-2 text-sm text-ink-500">Open a conversation with your doctor or provider.</p>

        {conversations.length === 0 ? (
          <div className="mt-12 text-center">
            <MessageCircle size={48} className="mx-auto text-primary-200" />
            <p className="mt-4 text-ink-500">No active conversations yet.</p>
            <p className="text-sm text-ink-400">Book an appointment to start chatting with your doctor.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {conversations.map((appt) => {
              const otherName = appt.providerId?.name || appt.patientId?.name || "Unknown";
              return (
                <Link key={appt._id} to={`/consultation/${appt._id}`} className="flex items-center gap-4 rounded-2xl border border-primary-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                    <MessageCircle size={20} className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ink-900">{otherName}</p>
                    <p className="text-xs text-ink-500">{appt.consultationType} consultation • {new Date(appt.datetime).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight size={20} className="text-ink-300" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}