import React, { useEffect, useState } from "react";
import {
  CalendarClock, CheckCircle, XCircle, Video, Pill, Send, Users, Clock3,
  Plus, Trash2, FlaskConical, ScanLine, ArrowLeft, X, UserRound, RotateCcw,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import BodyDiagram from "../components/BodyDiagram";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SCAN_TYPES = ["X-Ray", "MRI", "CT Scan", "Ultrasound", "Mammography", "PET Scan"];

/* ----------------------------- Prescription form ----------------------------- */

function PrescriptionForm({ patientId, appointmentId, onDone }) {
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
      await api.post("/prescriptions", { appointmentId, patientId, medicines: valid, notes });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2 rounded-xl bg-ink-50/50 p-3">
      {medicines.map((m, i) => (
        <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input placeholder="Medicine name" value={m.name} onChange={(e) => updateMed(i, "name", e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
          <input placeholder="Dosage" value={m.dosage} onChange={(e) => updateMed(i, "dosage", e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
          <input placeholder="Frequency" value={m.frequency} onChange={(e) => updateMed(i, "frequency", e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
          <input type="number" placeholder="Days" value={m.durationDays} onChange={(e) => updateMed(i, "durationDays", Number(e.target.value))} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
        </div>
      ))}
      <button onClick={() => setMedicines((m) => [...m, { name: "", dosage: "", frequency: "", durationDays: 7 }])} className="text-xs font-medium text-primary-600">
        + Add another medicine
      </button>
      <textarea placeholder="Notes for the patient" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
      <button onClick={submit} disabled={saving} className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
        <Send size={13} /> {saving ? "Sending..." : "Issue prescription"}
      </button>
    </div>
  );
}

/* ------------------------------- Request test form ------------------------------- */

function RequestTestForm({ patientId, onDone }) {
  const [labs, setLabs] = useState([]);
  const [testName, setTestName] = useState("");
  const [labId, setLabId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/labs/search").then(({ data }) => setLabs(data.labs || [])).catch(() => {});
  }, []);

  const submit = async () => {
    if (!testName.trim() || !labId) return;
    setSaving(true);
    try {
      await api.post("/tests/request-for-patient", { patientId, testName: testName.trim(), labId });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2 rounded-xl bg-ink-50/50 p-3">
      <input placeholder="Test name (e.g. CBC, Blood Sugar)" value={testName} onChange={(e) => setTestName(e.target.value)} className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
      <select value={labId} onChange={(e) => setLabId(e.target.value)} className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs">
        <option value="">Choose a lab...</option>
        {labs.map((l) => (
          <option key={l._id} value={l._id}>
            {l.name} {l.address?.city ? `— ${l.address.city}` : ""}
          </option>
        ))}
      </select>
      {labs.length === 0 && <p className="text-[11px] text-ink-400">No verified labs found yet.</p>}
      <button onClick={submit} disabled={saving || !testName.trim() || !labId} className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
        <Send size={13} /> {saving ? "Sending..." : "Request test"}
      </button>
    </div>
  );
}

/* ------------------------------- Request scan form ------------------------------- */

function RequestScanForm({ patientId, onDone }) {
  const [labs, setLabs] = useState([]);
  const [scanType, setScanType] = useState(SCAN_TYPES[0]);
  const [bodyPart, setBodyPart] = useState("");
  const [priority, setPriority] = useState("routine");
  const [labId, setLabId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/labs/search").then(({ data }) => setLabs(data.labs || [])).catch(() => {});
  }, []);

  const submit = async () => {
    if (!bodyPart.trim()) return;
    setSaving(true);
    try {
      await api.post("/radiology/request-for-patient", {
        patientId,
        scanType,
        bodyPart: bodyPart.trim(),
        priority,
        labId: labId || undefined,
      });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2 rounded-xl bg-ink-50/50 p-3">
      <div className="grid grid-cols-2 gap-2">
        <select value={scanType} onChange={(e) => setScanType(e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs">
          {SCAN_TYPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs">
          <option value="routine">Routine</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      <input placeholder="Body part (e.g. Chest, Left knee)" value={bodyPart} onChange={(e) => setBodyPart(e.target.value)} className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
      <select value={labId} onChange={(e) => setLabId(e.target.value)} className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs">
        <option value="">Choose a facility (optional)...</option>
        {labs.map((l) => (
          <option key={l._id} value={l._id}>
            {l.name} {l.address?.city ? `— ${l.address.city}` : ""}
          </option>
        ))}
      </select>
      <button onClick={submit} disabled={saving || !bodyPart.trim()} className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
        <Send size={13} /> {saving ? "Sending..." : "Request imaging"}
      </button>
    </div>
  );
}

/* ------------------------------- Mark affected body part form ------------------------------- */

function MarkCaseForm({ patientId, appointmentId, onDone }) {
  const [view, setView] = useState("front");
  const [selected, setSelected] = useState(null); // { key, label }
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!selected || !diagnosis.trim() || !treatmentPlan.trim()) return;
    setSaving(true);
    try {
      await api.post("/medical-cases", {
        patientId,
        appointmentId,
        bodyPartKey: selected.key,
        bodyPartLabel: selected.label,
        view,
        diagnosis: diagnosis.trim(),
        treatmentPlan: treatmentPlan.trim(),
        severity,
      });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl bg-ink-50/50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-ink-700">Tap the affected area on the diagram</p>
        <div className="flex gap-1 rounded-full bg-white p-1 text-xs">
          <button
            onClick={() => { setView("front"); setSelected(null); }}
            className={`rounded-full px-3 py-1 font-semibold ${view === "front" ? "bg-primary-600 text-white" : "text-ink-500"}`}
          >
            Front
          </button>
          <button
            onClick={() => { setView("back"); setSelected(null); }}
            className={`rounded-full px-3 py-1 font-semibold ${view === "back" ? "bg-primary-600 text-white" : "text-ink-500"}`}
          >
            Back
          </button>
        </div>
      </div>

      <div className="flex justify-center rounded-lg bg-white py-3">
        <BodyDiagram view={view} selectedKey={selected?.key} onSelectRegion={setSelected} width={180} />
      </div>

      {selected && (
        <p className="text-center text-xs font-semibold text-primary-700">Selected: {selected.label}</p>
      )}

      <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs">
        <option value="mild">Mild</option>
        <option value="moderate">Moderate</option>
        <option value="severe">Severe</option>
      </select>
      <textarea
        placeholder="Diagnosis / explanation of what's wrong"
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs"
      />
      <textarea
        placeholder="Treatment plan / solution"
        value={treatmentPlan}
        onChange={(e) => setTreatmentPlan(e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs"
      />
      <button
        onClick={submit}
        disabled={saving || !selected || !diagnosis.trim() || !treatmentPlan.trim()}
        className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        <Send size={13} /> {saving ? "Saving..." : "Save diagnosis"}
      </button>
    </div>
  );
}



function PatientDetailPanel({ patientId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState(null); // "prescribe" | "test" | "scan"

  const load = () => {
    setLoading(true);
    api
      .get(`/doctors/patients/${patientId}`)
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [patientId]);

  const closeAction = () => {
    setActiveAction(null);
    load();
  };

  const latestAppointment = data?.appointments?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-primary-100 px-5 py-4">
          <button onClick={onClose} className="flex items-center gap-1 text-sm text-ink-500 hover:text-primary-600">
            <ArrowLeft size={16} /> Back to patients
          </button>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-600">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-sm text-ink-500">Loading patient record...</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setActiveAction(activeAction === "prescribe" ? null : "prescribe")} className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white">
                  <Pill size={13} /> Write treatment
                </button>
                <button onClick={() => setActiveAction(activeAction === "test" ? null : "test")} className="flex items-center gap-1 rounded-full border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-700">
                  <FlaskConical size={13} /> Request lab test
                </button>
                <button onClick={() => setActiveAction(activeAction === "scan" ? null : "scan")} className="flex items-center gap-1 rounded-full border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-700">
                  <ScanLine size={13} /> Request imaging
                </button>
                <button onClick={() => setActiveAction(activeAction === "case" ? null : "case")} className="flex items-center gap-1 rounded-full border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-700">
                  <UserRound size={13} /> Mark affected area
                </button>
              </div>

              {activeAction === "prescribe" && (
                <div className="mt-3">
                  <PrescriptionForm patientId={patientId} appointmentId={latestAppointment?._id} onDone={closeAction} />
                </div>
              )}
              {activeAction === "test" && (
                <div className="mt-3">
                  <RequestTestForm patientId={patientId} onDone={closeAction} />
                </div>
              )}
              {activeAction === "scan" && (
                <div className="mt-3">
                  <RequestScanForm patientId={patientId} onDone={closeAction} />
                </div>
              )}
              {activeAction === "case" && (
                <div className="mt-3">
                  <MarkCaseForm patientId={patientId} appointmentId={latestAppointment?._id} onDone={closeAction} />
                </div>
              )}

              {/* Appointments */}
              <section className="mt-6">
                <h3 className="text-sm font-semibold text-ink-900">Appointment history</h3>
                <div className="mt-2 space-y-1.5">
                  {data.appointments.map((a) => (
                    <div key={a._id} className="flex items-center justify-between rounded-lg bg-ink-50/50 px-3 py-2 text-xs">
                      <span>{new Date(a.datetime).toLocaleString()}</span>
                      <span className="font-medium text-ink-600">{a.status}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Prescriptions */}
              <section className="mt-5">
                <h3 className="text-sm font-semibold text-ink-900">Prescriptions you've issued</h3>
                {data.prescriptions.length === 0 ? (
                  <p className="mt-2 text-xs text-ink-400">None yet.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {data.prescriptions.map((p) => (
                      <div key={p._id} className="rounded-lg border border-primary-100 p-2.5 text-xs">
                        <p className="mb-1 text-ink-400">{new Date(p.createdAt).toLocaleDateString()} · {p.status}</p>
                        {p.medicines.map((m, i) => (
                          <p key={i} className="text-ink-700">• {m.name} — {m.dosage} · {m.frequency} · {m.durationDays}d</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Tests */}
              <section className="mt-5">
                <h3 className="text-sm font-semibold text-ink-900">Lab tests you've requested</h3>
                {data.tests.length === 0 ? (
                  <p className="mt-2 text-xs text-ink-400">None yet.</p>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    {data.tests.map((t) => (
                      <div key={t._id} className="flex items-center justify-between rounded-lg bg-ink-50/50 px-3 py-2 text-xs">
                        <span>{t.testName} · {t.labId?.name}</span>
                        <span className="font-medium text-ink-600">{t.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Scans */}
              <section className="mt-5">
                <h3 className="text-sm font-semibold text-ink-900">Imaging you've requested</h3>
                {data.scans.length === 0 ? (
                  <p className="mt-2 text-xs text-ink-400">None yet.</p>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    {data.scans.map((s) => (
                      <div key={s._id} className="flex items-center justify-between rounded-lg bg-ink-50/50 px-3 py-2 text-xs">
                        <span>{s.scanType} · {s.bodyPart}</span>
                        <span className="font-medium text-ink-600">{s.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              {/* Marked conditions */}
              <section className="mt-5">
                <h3 className="text-sm font-semibold text-ink-900">Affected areas you've marked</h3>
                {data.cases.length === 0 ? (
                  <p className="mt-2 text-xs text-ink-400">None yet.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {data.cases.map((c) => (
                      <div key={c._id} className="flex gap-3 rounded-lg border border-primary-100 p-2.5 text-xs">
                        <div className="shrink-0">
                          <BodyDiagram view={c.view} highlightedKeys={[c.bodyPartKey]} width={60} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-ink-900">{c.bodyPartLabel}</span>
                            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-600">{c.severity}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.status === "resolved" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                              {c.status}
                            </span>
                          </div>
                          <p className="mt-1 text-ink-600">{c.diagnosis}</p>
                          <p className="mt-1 text-ink-500">Plan: {c.treatmentPlan}</p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-[10px] text-ink-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                            <button
                              onClick={async () => {
                                await api.patch(`/medical-cases/${c._id}`, { status: c.status === "resolved" ? "active" : "resolved" });
                                load();
                              }}
                              className="flex items-center gap-1 text-[11px] font-semibold text-primary-600"
                            >
                              <RotateCcw size={11} /> Mark {c.status === "resolved" ? "active" : "resolved"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Patients tab ------------------------------- */

function PatientsTab() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPatientId, setOpenPatientId] = useState(null);

  useEffect(() => {
    api.get("/doctors/my-patients").then(({ data }) => setPatients(data.patients || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="mt-4 text-sm text-ink-500">Loading...</p>;
  if (!patients.length) return <p className="mt-4 text-sm text-ink-500">No patients yet — they'll show up here after their first appointment with you.</p>;

  return (
    <>
      <div className="mt-4 grid gap-3">
        {patients.map(({ patient, lastAppointment, lastStatus, appointmentCount }) => (
          <button
            key={patient._id}
            onClick={() => setOpenPatientId(patient._id)}
            className="flex items-center justify-between rounded-xl border border-primary-100 bg-white p-4 text-start transition hover:shadow-md"
          >
            <div>
              <p className="font-medium text-ink-900">{patient.name}</p>
              <p className="text-xs text-ink-500">{patient.phone || patient.email}</p>
            </div>
            <div className="text-end">
              <p className="text-xs text-ink-500">Last visit: {new Date(lastAppointment).toLocaleDateString()}</p>
              <p className="text-xs text-ink-400">{appointmentCount} appointment(s) · {lastStatus}</p>
            </div>
          </button>
        ))}
      </div>
      {openPatientId && <PatientDetailPanel patientId={openPatientId} onClose={() => setOpenPatientId(null)} />}
    </>
  );
}

/* ------------------------------- Availability tab ------------------------------- */

function AvailabilityTab() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [day, setDay] = useState("Mon");
  const [from, setFrom] = useState("09:00");
  const [to, setTo] = useState("17:00");

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/doctors/${user.id}`).then(({ data }) => setSlots(data.doctor.availableSlots || [])).finally(() => setLoading(false));
  }, [user?.id]);

  const save = async (nextSlots) => {
    setSaving(true);
    try {
      await api.put("/doctors/me", { availableSlots: nextSlots });
      setSlots(nextSlots);
    } finally {
      setSaving(false);
    }
  };

  const addSlot = () => {
    if (!from || !to) return;
    save([...slots, { day, from, to }]);
  };

  const removeSlot = (idx) => {
    save(slots.filter((_, i) => i !== idx));
  };

  if (loading) return <p className="mt-4 text-sm text-ink-500">Loading...</p>;

  return (
    <div className="mt-4 space-y-5">
      <div className="rounded-xl border border-primary-100 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Add a weekly available slot</h3>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-500">Day</label>
            <select value={day} onChange={(e) => setDay(e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm">
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-500">From</label>
            <input type="time" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-500">To</label>
            <input type="time" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm" />
          </div>
          <button onClick={addSlot} disabled={saving} className="flex items-center gap-1 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            <Plus size={15} /> Add slot
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-primary-100 bg-white p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Clock3 size={15} /> Your current available slots
        </h3>
        {slots.length === 0 ? (
          <p className="text-sm text-ink-500">No available slots set — patients won't be able to see when you're free.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {slots.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-ink-50/60 px-3 py-2 text-sm">
                <span>{s.day} · {s.from} – {s.to}</span>
                <button onClick={() => removeSlot(i)} disabled={saving} className="text-red-500 hover:text-red-700">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Appointments tab ------------------------------- */

function AppointmentsTab() {
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

  if (loading) return <p className="mt-4 text-sm text-ink-500">Loading...</p>;
  if (!appointments.length) return <p className="mt-4 text-sm text-ink-500">No appointments yet.</p>;

  return (
    <div className="mt-4 grid gap-3">
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
                <a href={a.meetingLink || `/consultation/${a._id}`} className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white">
                  <Video size={14} /> Join session
                </a>
              )}
              {a.status === "confirmed" && !a.sessionStarted && (
                <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">Opens automatically at appointment time</span>
              )}
              {(a.status === "confirmed" || a.status === "completed") && (
                <button onClick={() => setPrescribingId(prescribingId === a._id ? null : a._id)} className="flex items-center gap-1 rounded-full border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-700">
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
          {prescribingId === a._id && (
            <div className="mt-3">
              <PrescriptionForm patientId={a.patientId?._id || a.patientId} appointmentId={a._id} onDone={() => setPrescribingId(null)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- Main dashboard ------------------------------- */

const TABS = [
  { key: "appointments", label: "Appointments", icon: CalendarClock },
  { key: "patients", label: "Patients", icon: Users },
  { key: "availability", label: "Availability", icon: Clock3 },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("appointments");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">Dr. {user?.name?.split(" ").slice(-1)[0]}'s dashboard</h1>
      <p className="mt-1 text-sm text-ink-500">Manage appointments, patients, treatments, and your availability.</p>

      <div className="mt-6 flex gap-1.5 rounded-full bg-ink-50 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition ${
              tab === key ? "bg-white text-primary-700 shadow-sm" : "text-ink-500"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === "appointments" && <AppointmentsTab />}
      {tab === "patients" && <PatientsTab />}
      {tab === "availability" && <AvailabilityTab />}
    </div>
  );
}
