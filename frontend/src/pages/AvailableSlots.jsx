import React, { useEffect, useState } from "react";
import { CalendarClock, Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 8;
  return `${String(h).padStart(2, "0")}:00`;
});
const MINUTES = ["00", "15", "30", "45"];

export default function AvailableSlots() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/doctors/me").then(({ data }) => {
      const doctor = data.doctor || data.user;
      setSlots(doctor?.availableSlots || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const addSlot = () => {
    setSlots([...slots, { day: "Mon", from: "09:00", to: "10:00" }]);
  };

  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, value) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const { data } = await api.put("/doctors/slots", { availableSlots: slots });
      setMessage("Available slots updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save slots");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-ink-500">
        <CalendarClock className="animate-spin" size={18} /> Loading your slots...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/30 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => window.history.back()} className="flex items-center gap-1 text-sm text-ink-500 hover:text-primary-600">
            <ArrowLeft size={16} /> Back
          </button>
          <CalendarClock size={24} className="text-primary-600" />
          <h1 className="font-display text-2xl font-bold text-ink-900">My Available Slots</h1>
        </div>

        {message && (
          <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${
            message.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {message}
          </div>
        )}

        <p className="text-sm text-ink-500 mb-4">Set your weekly available hours. Patients can book appointments within these times.</p>

        <div className="space-y-4">
          {slots.map((slot, index) => (
            <div key={index} className="flex flex-col gap-2 rounded-xl border border-primary-100 bg-white p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <select value={slot.day} onChange={(e) => updateSlot(index, "day", e.target.value)} className="rounded-lg border border-primary-200 px-3 py-2 text-sm font-semibold text-ink-900">
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <span className="text-ink-400 text-sm">from</span>
                <select value={slot.from} onChange={(e) => updateSlot(index, "from", e.target.value)} className="rounded-lg border border-primary-200 px-3 py-2 text-sm text-ink-900">
                  {HOURS.map((h) => MINUTES.map((m) => (
                    <option key={`${h}-${m}`} value={`${h}:${m}`}>{`${h}:${m}`}</option>
                  )))}
                </select>
                <span className="text-ink-400 text-sm">to</span>
                <select value={slot.to} onChange={(e) => updateSlot(index, "to", e.target.value)} className="rounded-lg border border-primary-200 px-3 py-2 text-sm text-ink-900">
                  {HOURS.map((h) => MINUTES.map((m) => (
                    <option key={`${h}-${m}`} value={`${h}:${m}`}>{`${h}:${m}`}</option>
                  )))}
                </select>
                <button onClick={() => removeSlot(index)} className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button onClick={addSlot} className="flex items-center gap-2 rounded-full border border-primary-300 px-5 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-50">
            <Plus size={18} /> Add Slot
          </button>
          <button onClick={handleSave} disabled={saving || slots.length === 0} className="flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
            {saving ? <span className="animate-spin">⟳</span> : <Save size={18} />} {saving ? "Saving..." : "Save Slots"}
          </button>
        </div>

        {slots.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-ink-900 mb-3">Your Weekly Schedule</h2>
            <div className="overflow-x-auto">
              <table className="w-full rounded-xl border border-primary-100">
                <thead>
                  <tr className="bg-primary-50">
                    {DAYS.map((d) => <th key={d} className="px-4 py-3 text-xs font-semibold text-ink-700">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {DAYS.map((d) => {
                      const daySlots = slots.filter((s) => s.day === d);
                      return (
                        <td key={d} className="px-4 py-3 text-sm text-ink-700">
                          {daySlots.length > 0 ? daySlots.map((s, i) => (
                            <span key={i} className="mr-2 inline-block rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700">
                              {s.from} - {s.to}
                            </span>
                          )) : <span className="text-ink-300">-</span>}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}