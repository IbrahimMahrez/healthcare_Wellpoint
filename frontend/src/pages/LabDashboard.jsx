import React, { useEffect, useState } from "react";
import { FlaskConical, Upload, CheckCircle } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  requested: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
};

function ResultForm({ test, onSaved }) {
  const [notes, setNotes] = useState(test.interpretationNotes || "");
  const [fileUrl, setFileUrl] = useState(test.resultsFileUrl || "");
  const [rows, setRows] = useState(
    test.numericResults?.length ? test.numericResults : [{ label: "", value: "", unit: "", normalRange: "" }]
  );
  const [saving, setSaving] = useState(false);

  const updateRow = (i, field, value) => {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  };

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
          <input
            placeholder="Label (e.g. Hemoglobin)"
            value={row.label}
            onChange={(e) => updateRow(i, "label", e.target.value)}
            className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs"
          />
          <input
            placeholder="Value"
            value={row.value}
            onChange={(e) => updateRow(i, "value", e.target.value)}
            className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs"
          />
          <input
            placeholder="Unit"
            value={row.unit}
            onChange={(e) => updateRow(i, "unit", e.target.value)}
            className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs"
          />
          <input
            placeholder="Normal range"
            value={row.normalRange}
            onChange={(e) => updateRow(i, "normalRange", e.target.value)}
            className="rounded-lg border border-ink-200 px-2 py-1.5 text-xs"
          />
        </div>
      ))}
      <button
        onClick={() => setRows((r) => [...r, { label: "", value: "", unit: "", normalRange: "" }])}
        className="text-xs font-medium text-primary-600"
      >
        + Add another value
      </button>

      <input
        placeholder="Results file URL (optional, e.g. PDF link)"
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
        className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs"
      />
      <textarea
        placeholder="Interpretation notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs"
      />

      <div className="flex gap-2">
        <button
          disabled={saving}
          onClick={() => submit("processing")}
          className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 disabled:opacity-50"
        >
          Save as processing
        </button>
        <button
          disabled={saving}
          onClick={() => submit("completed")}
          className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          <CheckCircle size={13} /> Mark completed & notify patient
        </button>
      </div>
    </div>
  );
}

export default function LabDashboard() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/tests/lab-queue")
      .then(({ data }) => setTests(data.tests || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{user?.name}'s test queue</h1>
      <p className="mt-1 text-sm text-ink-500">Enter results — patients are notified automatically once you mark a test completed.</p>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
          <FlaskConical size={18} /> Assigned tests
        </h2>
        {loading ? (
          <p className="mt-3 text-sm text-ink-500">Loading...</p>
        ) : tests.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No tests assigned yet.</p>
        ) : (
          <div className="mt-3 grid gap-3">
            {tests.map((t) => (
              <div key={t._id} className="rounded-xl border border-primary-100 bg-white p-4">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-medium text-ink-900">{t.testName}</p>
                    <p className="text-sm text-ink-500">
                      {t.patientId?.name} · {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                    {t.status !== "completed" && (
                      <button
                        onClick={() => setOpenId(openId === t._id ? null : t._id)}
                        className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700"
                      >
                        <Upload size={13} /> {openId === t._id ? "Close" : "Enter results"}
                      </button>
                    )}
                  </div>
                </div>
                {openId === t._id && (
                  <ResultForm
                    test={t}
                    onSaved={() => {
                      setOpenId(null);
                      load();
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
