import React, { useEffect, useState } from "react";
import { Pill, CheckCircle, XCircle, MapPin } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  sent: "bg-amber-50 text-amber-700 border-amber-200",
  fulfilled: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
};

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/pharmacies/orders")
      .then(({ data }) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const act = async (id, status) => {
    setBusyId(id);
    try {
      await api.patch(`/pharmacies/orders/${id}`, { status });
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{user?.name}'s incoming orders</h1>
      <p className="mt-1 text-sm text-ink-500">
        Prescriptions patients nearby have sent you. Mark fulfilled once prepared — the patient is notified automatically.
      </p>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
          <Pill size={18} /> Orders
        </h2>
        {loading ? (
          <p className="mt-3 text-sm text-ink-500">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No incoming prescription orders yet.</p>
        ) : (
          <div className="mt-3 grid gap-3">
            {orders.map((o) => (
              <div key={o._id} className="rounded-xl border border-primary-100 bg-white p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink-900">{o.patientId?.name}</p>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[o.status] || ""}`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
                      <MapPin size={12} /> ~{o.pharmacyDistanceKm ?? "?"}km away · from Dr. {o.doctorId?.name}
                    </p>
                    <div className="mt-2 space-y-1">
                      {(o.medicines || []).map((m, i) => (
                        <p key={i} className="text-sm text-ink-700">
                          • {m.name} — {m.dosage} · {m.frequency} · {m.durationDays} days
                        </p>
                      ))}
                    </div>
                    {o.notes && <p className="mt-1 text-xs italic text-ink-500">"{o.notes}"</p>}
                  </div>
                  {o.status === "sent" && (
                    <div className="flex gap-2">
                      <button
                        disabled={busyId === o._id}
                        onClick={() => act(o._id, "fulfilled")}
                        className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        <CheckCircle size={13} /> Fulfilled
                      </button>
                      <button
                        disabled={busyId === o._id}
                        onClick={() => act(o._id, "rejected")}
                        className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 disabled:opacity-50"
                      >
                        <XCircle size={13} /> Can't fulfill
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
