import React, { useEffect, useMemo, useState } from "react";
import { Users, FlaskConical, ScanLine, Upload, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const TEST_STATUS_COLORS = {
  requested: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
};
const SCAN_STATUS_COLORS = {
  scheduled: "bg-amber-50 text-amber-700 border-amber-200",
  "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

function TestResultForm({ test, onSaved }) {
  const [notes, setNotes] = useState(test.interpretationNotes || "");
  const [fileUrl, setFileUrl] = useState(test.resultsFileUrl || "");
  const [rows, setRows] = useState(test.numericResults?.length ? test.numericResults : [{ label: "", value: "", unit: "", normalRange: "" }]);
  const [saving, setSaving] = useState(false);

  const updateRow = (i, field, value) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const submit = async (status) => {
    setSaving(true);
    try {
      await api.patch(`/tests/${test._id}/results`, {
        interpretationNotes: notes,
        resultsFileUrl: fileUrl,
        numericResults: rows.filter((r) => r.label.trim()),
        status,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 rounded-xl bg-ink-50/50 p-3">
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input placeholder="Label (e.g. Hemoglobin)" value={row.label} onChange={(e) => updateRow(i, "label", e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
          <input placeholder="Value" value={row.value} onChange={(e) => updateRow(i, "value", e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
          <input placeholder="Unit" value={row.unit} onChange={(e) => updateRow(i, "unit", e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
          <input placeholder="Normal range" value={row.normalRange} onChange={(e) => updateRow(i, "normalRange", e.target.value)} className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
        </div>
      ))}
      <button onClick={() => setRows((r) => [...r, { label: "", value: "", unit: "", normalRange: "" }])} className="text-xs font-medium text-primary-600">
        + Add another value
      </button>
      <input placeholder="Results file URL (optional)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
      <textarea placeholder="Interpretation notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
      <div className="flex gap-2">
        <button disabled={saving} onClick={() => submit("processing")} className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 disabled:opacity-50">
          Save as processing
        </button>
        <button disabled={saving} onClick={() => submit("completed")} className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
          <CheckCircle size={13} /> Mark completed & notify patient
        </button>
      </div>
    </div>
  );
}

function ScanReportForm({ scan, onSaved }) {
  const [findings, setFindings] = useState(scan.findings || "");
  const [reportFileUrl, setReportFileUrl] = useState(scan.reportFileUrl || "");
  const [radiologistName, setRadiologistName] = useState(scan.radiologistName || "");
  const [saving, setSaving] = useState(false);

  const submit = async (status) => {
    setSaving(true);
    try {
      await api.patch(`/radiology/${scan._id}/report`, { findings, reportFileUrl, radiologistName, status });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 rounded-xl bg-ink-50/50 p-3">
      <input placeholder="Radiologist name" value={radiologistName} onChange={(e) => setRadiologistName(e.target.value)} className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
      <input placeholder="Report/image file URL" value={reportFileUrl} onChange={(e) => setReportFileUrl(e.target.value)} className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
      <textarea placeholder="Findings" value={findings} onChange={(e) => setFindings(e.target.value)} rows={3} className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs" />
      <div className="flex gap-2">
        <button disabled={saving} onClick={() => submit("in-progress")} className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 disabled:opacity-50">
          Save as in-progress
        </button>
        <button disabled={saving} onClick={() => submit("completed")} className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
          <CheckCircle size={13} /> Mark completed & notify patient
        </button>
      </div>
    </div>
  );
}

function PatientGroup({ patient, tests, scans, onChanged }) {
  const [expanded, setExpanded] = useState(true);
  const [openId, setOpenId] = useState(null);
  const pendingCount = tests.filter((t) => t.status !== "completed").length + scans.filter((s) => s.status !== "completed" && s.status !== "cancelled").length;

  return (
    <div className="rounded-xl border border-primary-100 bg-white">
      <button onClick={() => setExpanded((v) => !v)} className="flex w-full items-center justify-between px-4 py-3 text-start">
        <div>
          <p className="font-medium text-ink-900">{patient?.name || "Unknown patient"}</p>
          <p className="text-xs text-ink-500">{patient?.phone || ""} · {tests.length} test(s) · {scans.length} scan(s){pendingCount ? ` · ${pendingCount} pending` : ""}</p>
        </div>
        {expanded ? <ChevronUp size={18} className="text-ink-400" /> : <ChevronDown size={18} className="text-ink-400" />}
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-primary-100 p-3">
          {tests.map((t) => (
            <div key={t._id} className="rounded-lg border border-ink-100 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm font-medium text-ink-900">
                  <FlaskConical size={14} className="text-primary-600" /> {t.testName}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${TEST_STATUS_COLORS[t.status]}`}>{t.status}</span>
                  {t.status !== "completed" && (
                    <button onClick={() => setOpenId(openId === t._id ? null : `test-${t._id}`)} className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700">
                      <Upload size={12} /> {openId === `test-${t._id}` ? "Close" : "Enter results"}
                    </button>
                  )}
                </div>
              </div>
              {openId === `test-${t._id}` && <TestResultForm test={t} onSaved={() => { setOpenId(null); onChanged(); }} />}
            </div>
          ))}

          {scans.map((s) => (
            <div key={s._id} className="rounded-lg border border-ink-100 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm font-medium text-ink-900">
                  <ScanLine size={14} className="text-primary-600" /> {s.scanType} · {s.bodyPart}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${SCAN_STATUS_COLORS[s.status]}`}>{s.status}</span>
                  {s.status !== "completed" && s.status !== "cancelled" && (
                    <button onClick={() => setOpenId(openId === s._id ? null : `scan-${s._id}`)} className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700">
                      <Upload size={12} /> {openId === `scan-${s._id}` ? "Close" : "Enter report"}
                    </button>
                  )}
                </div>
              </div>
              {openId === `scan-${s._id}` && <ScanReportForm scan={s} onSaved={() => { setOpenId(null); onChanged(); }} />}
            </div>
          ))}

          {tests.length === 0 && scans.length === 0 && <p className="text-xs text-ink-400">Nothing assigned for this patient yet.</p>}
        </div>
      )}
    </div>
  );
}

export default function LabDashboard() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/tests/lab-queue"), api.get("/radiology/lab-queue")])
      .then(([t, s]) => {
        setTests(t.data.tests || []);
        setScans(s.data.scans || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const groups = useMemo(() => {
    const byPatient = new Map();
    const ensure = (patient) => {
      const pid = patient?._id || "unknown";
      if (!byPatient.has(pid)) byPatient.set(pid, { patient, tests: [], scans: [] });
      return byPatient.get(pid);
    };
    tests.forEach((t) => ensure(t.patientId).tests.push(t));
    scans.forEach((s) => ensure(s.patientId).scans.push(s));
    return Array.from(byPatient.values());
  }, [tests, scans]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{user?.name}'s patients</h1>
      <p className="mt-1 text-sm text-ink-500">Every patient with a test or imaging request assigned to you, in one place.</p>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
          <Users size={18} /> Patients ({groups.length})
        </h2>
        {loading ? (
          <p className="mt-3 text-sm text-ink-500">Loading...</p>
        ) : groups.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No patients assigned to you yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {groups.map((g) => (
              <PatientGroup key={g.patient?._id || Math.random()} patient={g.patient} tests={g.tests} scans={g.scans} onChanged={load} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
