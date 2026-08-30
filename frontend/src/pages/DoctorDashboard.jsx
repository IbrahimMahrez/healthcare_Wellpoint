import React, { useEffect, useState } from "react";
import { CalendarClock, CheckCircle, XCircle, Video, Pill, Send } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function PrescriptionForm({ appointment, onDone }) {
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", frequency: "", durationDays: 7 }]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const updateMed = (i, field, value) => {
    setMedicines((meds) => meds.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  };

  const submit = async () => {
    const valid = medicines.filter((m) => m.name.trim());
    if (!valid.length) return;
    setSaving(true);
    try {
      await api.post("/prescriptions", {
        appointmentId: appointment._id,
        patientId: appointment.patientId?._id || appointment.patientId,
        medicines: valid,
        notes,
      });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 space-y-2 rounded-xl bg-ink-50/50 p-3">
      {medicines.map((m, i) => (
        <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input placeholder="Medicine name" value={m.name} onChange={(e) => updateMed(i, "name", e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
          <input placeholder="Dosage" value={m.dosage} onChange={(e) => updateMed(i, "dosage", e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
          <input placeholder="Frequency" value={m.frequency} onChange={(e) => updateMed(i, "frequency", e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
          <input type="number" placeholder="Days" value={m.durationDays} onChange={(e) => updateMed(i, "durationDays", Number(e.target.value))} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
        </div>
      ))}
      <button
        onClick={() => setMedicines((m) => [...m, { name: "", dosage: "", frequency: "", durationDays: 7 }])}
        className="text-xs font-medium text-primary-600"
      >
        + Add another medicine
      </button>
      <textarea placeholder="Notes for the patient" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
      <button
        onClick={submit}
        disabled={saving}
        className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        <Send size={13} /> {saving ? "Sending..." : "Issue prescription"}
      </button>
    </div>
  );
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prescribingId, setPrescribingId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/appointments/my").then(({ data }) => setAppointments(data.appointments || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/appointments/${id}`, { status });
    load();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">Dr. {user?.name?.split(" ").slice(-1)[0]}'s schedule</h1>
      <p className="mt-1 text-sm text-ink-500">Manage incoming appointment requests.</p>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
          <CalendarClock size={18} /> Appointments
        </h2>
        {loading ? (
          <p className="mt-3 text-sm text-ink-500">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No appointments yet.</p>
        ) : (
          <div className="mt-3 grid gap-3">
            {appointments.map((a) => (
              <div key={a._id} className="rounded-xl border border-primary-100 bg-white p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-medium text-ink-900">{a.patientId?.name}</p>
                    <p className="text-sm text-ink-500">{new Date(a.datetime).toLocaleString()} · {a.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(a._id, "confirmed")} className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white">
                          <CheckCircle size={14} /> Confirm
                        </button>
                        <button onClick={() => updateStatus(a._id, "cancelled")} className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                          <XCircle size={14} /> Decline
                        </button>
                      </>
                    )}
                    {a.status === "confirmed" && a.sessionStarted && (
                      <a
                        href={a.meetingLink || `/consultation/${a._id}`}
                        className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        <Video size={14} /> Join session
                      </a>
                    )}
                    {a.status === "confirmed" && !a.sessionStarted && (
                      <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                        Opens automatically at appointment time
                      </span>
                    )}
                    {(a.status === "confirmed" || a.status === "completed") && (
                      <button
                        onClick={() => setPrescribingId(prescribingId === a._id ? null : a._id)}
                        className="flex items-center gap-1 rounded-full border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-700"
                      >
                        <Pill size={14} /> {prescribingId === a._id ? "Close" : "Prescribe"}
                      </button>
                    )}
                    {a.status === "confirmed" && (
                      <button onClick={() => updateStatus(a._id, "completed")} className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700">
                        Mark completed
                      </button>
                    )}
                  </div>
                </div>
                {prescribingId === a._id && <PrescriptionForm appointment={a} onDone={() => setPrescribingId(null)} />}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
