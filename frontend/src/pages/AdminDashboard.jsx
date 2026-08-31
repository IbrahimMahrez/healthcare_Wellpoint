import React, { useEffect, useState } from "react";
import {
  Users, Stethoscope, CalendarClock, Wallet, Star, FileText,
  ShieldCheck, ShieldX, FlaskConical, Pill, LayoutDashboard,
  TrendingUp, AlertCircle, CheckCircle, Clock, DollarSign,
  Download, Filter, Search as SearchIcon, Settings, HelpCircle,
} from "lucide-react";
import api from "../services/api";

const TABS = [
  { id: "overview", label: "📊 Overview", icon: LayoutDashboard },
  { id: "doctors", label: "👨‍⚕️ Doctors", icon: Stethoscope },
  { id: "appointments", label: "📅 Appointments", icon: CalendarClock },
  { id: "payments", label: "💰 Payments", icon: Wallet },
  { id: "patients", label: "👥 Patients", icon: Users },
  { id: "providers", label: "🏥 Providers", icon: FlaskConical },
  { id: "analytics", label: "📈 Analytics", icon: TrendingUp },
  { id: "settings", label: "⚙️ Settings", icon: Settings },
];

function StatCard({ icon: Icon, label, value, accent = "primary", trend, trendText }) {
  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink-900">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend > 0 ? "text-primary-600" : "text-red-600"}`}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% {trendText}
            </p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-${accent}-100 text-${accent}-700`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-primary-50 text-primary-700 border-primary-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
    paid: "bg-primary-50 text-primary-700 border-primary-200",
    failed: "bg-red-50 text-red-600 border-red-200",
    verified: "bg-green-50 text-green-700 border-green-200",
    unverified: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const classes = styles[status] || "bg-ink-900/5 text-ink-700 border-ink-200";
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}>{status}</span>;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [appointments, setAppointments] = useState([]);
  const [appointmentFilter, setAppointmentFilter] = useState("all");
  const [payments, setPayments] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [patients, setPatients] = useState([]);
  const [providers, setProviders] = useState({ labs: [], pharmacies: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadOverview = () =>
    api
      .get("/admin/stats")
      .then(({ data }) => {
        setStats(data.stats);
        setRecentAppointments(data.recentAppointments || []);
      })
      .catch((e) => setError(e.response?.data?.message || "Failed to load"));

  const loadDoctors = (status) => {
    const filter = status === "all" ? "" : `?status=${status}`;
    api.get(`/admin/doctors${filter}`).then(({ data }) => setDoctors(data.doctors || [])).catch(() => {});
  };

  const loadAppointments = (status) => {
    const filter = status === "all" ? "" : `?status=${status}`;
    api.get(`/admin/appointments${filter}`).then(({ data }) => setAppointments(data.appointments || [])).catch(() => {});
  };

  const loadPayments = (status) => {
    const filter = status === "all" ? "" : `?status=${status}`;
    api.get(`/admin/payments${filter}`).then(({ data }) => setPayments(data.payments || [])).catch(() => {});
  };

  const loadPatients = () => api.get("/admin/patients").then(({ data }) => setPatients(data.patients || [])).catch(() => {});
  const loadProviders = () => api.get("/admin/providers").then(({ data }) => setProviders(data)).catch(() => {});

  useEffect(() => {
    setLoading(true);
    setError("");
    loadOverview().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "doctors") loadDoctors(doctorFilter);
    if (tab === "appointments") loadAppointments(appointmentFilter);
    if (tab === "payments") loadPayments(paymentFilter);
    if (tab === "patients") loadPatients();
    if (tab === "providers") loadProviders();
  }, [tab, doctorFilter, appointmentFilter, paymentFilter]);

  const verifyDoctor = async (id, verified) => {
    await api.patch(`/admin/doctors/${id}/verify`, { verified });
    loadDoctors(doctorFilter);
  };

  const exportData = (type) => {
    const data = {
      doctors: doctors,
      appointments: appointments,
      payments: payments,
      patients: patients,
    }[type];
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-export-${new Date().toISOString()}.json`;
    a.click();
  };

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="font-display text-2xl font-bold text-red-900">Access Denied</h2>
          <p className="mt-2 text-sm text-red-700">
            You don't have permission to access the admin dashboard. This section is reserved for admins only.
          </p>
          <p className="mt-3 text-xs text-red-600">
            Error: <strong>{error}</strong>
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700"
          >
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Manage your healthcare platform from here</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportData(TABS.find(t => t.id === tab)?.id)} className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium shadow-sm ring-1 ring-primary-100 hover:ring-primary-300">
            <Download size={16} /> Export
          </button>
          <button className="flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
            <HelpCircle size={16} /> Help
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition ${
              tab === id ? "bg-primary-600 text-white shadow-lg" : "bg-white text-ink-700 ring-1 ring-primary-100 hover:ring-primary-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-8">
        {loading && <p className="text-sm text-ink-500">Loading...</p>}

        {/* OVERVIEW TAB */}
        {tab === "overview" && stats && (
          <div className="space-y-8">
            {/* Top Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} trend={5} trendText="vs last month" />
              <StatCard icon={Stethoscope} label="Total Doctors" value={stats.totalDoctors} accent="blue" />
              <StatCard icon={CalendarClock} label="Appointments" value={stats.totalAppointments} trend={12} trendText="vs last month" accent="green" />
              <StatCard icon={DollarSign} label="Total Revenue" value={`${stats.totalRevenue.toLocaleString()} EGP`} accent="purple" trend={8} trendText="growth" />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="rounded-xl border border-primary-100 bg-white p-4 text-center">
                <CheckCircle className="mx-auto text-primary-600" size={24} />
                <p className="mt-2 text-2xl font-bold text-ink-900">{stats.verifiedDoctors}</p>
                <p className="text-xs text-ink-500">Verified Doctors</p>
              </div>
              <div className="rounded-xl border border-primary-100 bg-white p-4 text-center">
                <AlertCircle className="mx-auto text-amber-600" size={24} />
                <p className="mt-2 text-2xl font-bold text-ink-900">{stats.pendingDoctors}</p>
                <p className="text-xs text-ink-500">Pending Verification</p>
              </div>
              <div className="rounded-xl border border-primary-100 bg-white p-4 text-center">
                <Clock className="mx-auto text-amber-600" size={24} />
                <p className="mt-2 text-2xl font-bold text-ink-900">{stats.appointmentsByStatus.pending}</p>
                <p className="text-xs text-ink-500">Pending Appointments</p>
              </div>
              <div className="rounded-xl border border-primary-100 bg-white p-4 text-center">
                <CheckCircle className="mx-auto text-primary-600" size={24} />
                <p className="mt-2 text-2xl font-bold text-ink-900">{stats.appointmentsByStatus.completed}</p>
                <p className="text-xs text-ink-500">Completed</p>
              </div>
              <div className="rounded-xl border border-primary-100 bg-white p-4 text-center">
                <Pill className="mx-auto text-primary-600" size={24} />
                <p className="mt-2 text-2xl font-bold text-ink-900">{stats.totalPrescriptions}</p>
                <p className="text-xs text-ink-500">Prescriptions</p>
              </div>
              <div className="rounded-xl border border-primary-100 bg-white p-4 text-center">
                <Star className="mx-auto text-amber-400" size={24} />
                <p className="mt-2 text-2xl font-bold text-ink-900">{stats.totalReviews}</p>
                <p className="text-xs text-ink-500">Total Reviews</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl border border-primary-100 bg-white p-6">
              <h3 className="font-display font-bold text-ink-900">Recent Appointments</h3>
              <div className="mt-4 divide-y">
                {recentAppointments.map((a) => (
                  <div key={a._id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex-1">
                      <p className="font-medium text-ink-900">{a.patientId?.name} → {a.providerId?.name}</p>
                      <p className="text-xs text-ink-500">{new Date(a.datetime).toLocaleString()}</p>
                    </div>
                    <StatusPill status={a.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DOCTORS TAB */}
        {tab === "doctors" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctor name or email..."
                className="flex-1 rounded-lg border border-primary-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400"
              />
              <div className="flex gap-2">
                {["all", "verified", "pending"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setDoctorFilter(f)}
                    className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                      doctorFilter === f ? "bg-primary-600 text-white" : "bg-white text-ink-700 ring-1 ring-primary-100"
                    }`}
                  >
                    {f === "all" ? "All" : f === "verified" ? "✓ Verified" : "⏳ Pending"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              {doctors.length === 0 && <p className="py-8 text-center text-sm text-ink-500">No doctors found</p>}
              {doctors
                .filter((d) => searchQuery === "" || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.email.includes(searchQuery))
                .map((d) => (
                  <div key={d._id} className="flex flex-col justify-between gap-3 rounded-xl border border-primary-100 bg-white p-4 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-ink-900">
                        {d.name} <span className="text-primary-600">• {d.specialty}</span>
                      </p>
                      <p className="text-xs text-ink-500">
                        {d.email} • {d.consultationFees} EGP • Rating: {d.rating?.toFixed(1) || "New"} ({d.numReviews} reviews)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill status={d.verified ? "verified" : "unverified"} />
                      {d.verified ? (
                        <button onClick={() => verifyDoctor(d._id, false)} className="rounded-full bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                          Revoke
                        </button>
                      ) : (
                        <button onClick={() => verifyDoctor(d._id, true)} className="flex items-center gap-1.5 rounded-full bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-700">
                          <CheckCircle size={14} /> Verify
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {tab === "appointments" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
                <button
                  key={f}
                  onClick={() => setAppointmentFilter(f)}
                  className={`rounded-full px-3.5 py-2 text-xs font-medium transition ${
                    appointmentFilter === f ? "bg-primary-600 text-white" : "bg-white text-ink-700 ring-1 ring-primary-100"
                  }`}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {appointments.length === 0 && <p className="py-8 text-center text-sm text-ink-500">No appointments</p>}
              {appointments.map((a) => (
                <div key={a._id} className="flex items-center justify-between gap-3 rounded-xl border border-primary-100 bg-white p-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-900">
                      {a.patientId?.name} → {a.providerId?.name}
                    </p>
                    <p className="text-xs text-ink-500">{new Date(a.datetime).toLocaleString()}</p>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAYMENTS TAB */}
        {tab === "payments" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {["all", "paid", "pending", "failed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setPaymentFilter(f)}
                  className={`rounded-full px-3.5 py-2 text-xs font-medium transition ${
                    paymentFilter === f ? "bg-primary-600 text-white" : "bg-white text-ink-700 ring-1 ring-primary-100"
                  }`}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {payments.length === 0 && <p className="py-8 text-center text-sm text-ink-500">No payments</p>}
              {payments.map((p) => (
                <div key={p._id} className="flex items-center justify-between gap-3 rounded-xl border border-primary-100 bg-white p-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-900">{p.userId?.name}</p>
                    <p className="text-xs text-ink-500">{p.method} • {p.reference}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ink-900">{p.amount} EGP</p>
                    <StatusPill status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PATIENTS TAB */}
        {tab === "patients" && (
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {patients.length === 0 && <p className="py-8 text-center text-sm text-ink-500">No patients</p>}
            {patients.map((p) => (
              <div key={p._id} className="rounded-xl border border-primary-100 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-ink-900">{p.name}</p>
                    <p className="text-xs text-ink-500">{p.email} • {p.phone}</p>
                    <p className="text-xs text-ink-500">Joined {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right text-xs text-ink-500">
                    <p>ID: {p._id.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROVIDERS TAB */}
        {tab === "providers" && (
          <div className="grid gap-6">
            <div>
              <h3 className="font-semibold text-ink-900 mb-3">Labs ({providers.labs.length})</h3>
              <div className="grid gap-3">
                {providers.labs.length === 0 && <p className="text-sm text-ink-500">No labs registered</p>}
                {providers.labs.map((l) => (
                  <div key={l._id} className="rounded-xl border border-primary-100 bg-white p-4">
                    <p className="font-medium text-ink-900">{l.name}</p>
                    <p className="text-xs text-ink-500">{l.email} • {l.address?.city}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-ink-900 mb-3">Pharmacies ({providers.pharmacies.length})</h3>
              <div className="grid gap-3">
                {providers.pharmacies.length === 0 && <p className="text-sm text-ink-500">No pharmacies registered</p>}
                {providers.pharmacies.map((ph) => (
                  <div key={ph._id} className="rounded-xl border border-primary-100 bg-white p-4">
                    <p className="font-medium text-ink-900">{ph.name}</p>
                    <p className="text-xs text-ink-500">{ph.email} • {ph.address?.city}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-primary-100 bg-white p-6">
                <h4 className="font-semibold text-ink-900">Appointment Conversion</h4>
                <p className="mt-2 font-display text-2xl text-primary-600">{stats?.appointmentsByStatus.completed || 0} / {stats?.totalAppointments || 1}</p>
              </div>
              <div className="rounded-xl border border-primary-100 bg-white p-6">
                <h4 className="font-semibold text-ink-900">Avg Revenue per Patient</h4>
                <p className="mt-2 font-display text-2xl text-primary-600">
                  {stats?.totalPatients ? Math.round(stats.totalRevenue / stats.totalPatients) : 0} EGP
                </p>
              </div>
              <div className="rounded-xl border border-primary-100 bg-white p-6">
                <h4 className="font-semibold text-ink-900">Doctor Verification Rate</h4>
                <p className="mt-2 font-display text-2xl text-primary-600">
                  {stats?.totalDoctors ? Math.round((stats.verifiedDoctors / stats.totalDoctors) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary-100 bg-white p-6">
              <h3 className="font-semibold text-ink-900">Platform Settings</h3>
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <span className="text-sm text-ink-700">Enable new doctor registrations</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <span className="text-sm text-ink-700">Require doctor verification</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <span className="text-sm text-ink-700">Allow online payments</span>
                </label>
              </div>
              <button className="mt-4 rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
