import React, { useEffect, useState } from "react";
import {
  CalendarClock, Video, FileText, Plus, MoreVertical, Download,
  Pill, Clock, CheckCircle, AlertCircle, Phone, MessageSquare, XCircle,
  Receipt, ScanLine, HeartPulse, ClipboardCheck, FlaskConical, ArrowUpRight,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";

const CARE_HUB_ITEMS = [
  { to: "/invoices", icon: Receipt, labelKey: "nav_invoices", descKey: "nav_invoices_desc", tint: "bg-violet-50 text-violet-600", ring: "hover:border-violet-300" },
  { to: "/radiology", icon: ScanLine, labelKey: "nav_radiology", descKey: "nav_radiology_desc", tint: "bg-blue-50 text-blue-600", ring: "hover:border-blue-300" },
  { to: "/health-status", icon: HeartPulse, labelKey: "nav_healthStatus", descKey: "nav_healthStatus_desc", tint: "bg-rose-50 text-rose-600", ring: "hover:border-rose-300" },
  { to: "/admission-permits", icon: ClipboardCheck, labelKey: "nav_admissions", descKey: "nav_admissions_desc", tint: "bg-amber-50 text-amber-600", ring: "hover:border-amber-300" },
  { to: "/lab-tests", icon: FlaskConical, labelKey: "nav_labTests", descKey: "nav_labTests_desc", tint: "bg-primary-50 text-primary-600", ring: "hover:border-primary-300" },
];

const CONSULT_ICON = { video: Video, audio: Phone, text: MessageSquare };

export default function PatientDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appointments");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [sendingId, setSendingId] = useState(null);

  const loadAll = () => {
    Promise.all([api.get("/appointments/my"), api.get("/prescriptions/my")])
      .then(([a, p]) => {
        setAppointments(a.data.appointments || []);
        setPrescriptions(p.data.prescriptions || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenuId]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      confirmed: "bg-primary-50 text-primary-700 border-primary-200",
      completed: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-600 border-red-200",
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={14} />;
      case "confirmed":
        return <CheckCircle size={14} />;
      case "completed":
        return <CheckCircle size={14} />;
      case "cancelled":
        return <AlertCircle size={14} />;
      default:
        return null;
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm(t("dash_cancelConfirm"))) return;
    setCancellingId(id);
    setOpenMenuId(null);
    try {
      await api.patch(`/appointments/${id}`, { status: "cancelled" });
      setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status: "cancelled" } : a)));
    } catch {
      // Silently ignore — the appointment list simply won't update if this fails.
    } finally {
      setCancellingId(null);
    }
  };

  const sendToPharmacy = async (prescriptionId) => {
    setSendingId(prescriptionId);
    try {
      await api.post(`/prescriptions/${prescriptionId}/send-to-pharmacy`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't send this prescription to a pharmacy.");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/30 to-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">
              {t("dash_welcome")}, <span className="text-primary-600">{user?.name?.split(" ")[0]}</span>
            </h1>
            <p className="mt-1 text-ink-500">{t("dash_subtitle")}</p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            <Plus size={18} /> {t("dash_bookAppt")}
          </Link>
        </div>

        {/* Care Hub — quick access to every health record type */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-900">{t("profile_careHub")}</h2>
            <span className="text-xs text-ink-400">{t("profile_viewAll")}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CARE_HUB_ITEMS.map(({ to, icon: Icon, labelKey, descKey, tint, ring }) => (
              <Link
                key={to}
                to={to}
                className={`group flex flex-col justify-between rounded-2xl border border-primary-100 bg-white p-4 transition hover:shadow-md ${ring}`}
              >
                <div className="flex items-start justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
                    <Icon size={18} />
                  </span>
                  <ArrowUpRight size={14} className="text-ink-300 opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-ink-900">{t(labelKey)}</p>
                  <p className="mt-0.5 truncate text-xs text-ink-500">{t(descKey)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-primary-100 bg-white p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-500">{t("dash_upcomingAppts")}</p>
                <p className="mt-2 font-display text-2xl font-bold text-ink-900">
                  {appointments.filter((a) => a.status === "confirmed").length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <CalendarClock size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary-100 bg-white p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-500">{t("dash_activePresc")}</p>
                <p className="mt-2 font-display text-2xl font-bold text-ink-900">{prescriptions.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Pill size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary-100 bg-white p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-500">{t("dash_completedVisits")}</p>
                <p className="mt-2 font-display text-2xl font-bold text-ink-900">
                  {appointments.filter((a) => a.status === "completed").length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-primary-100">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`pb-4 text-sm font-semibold transition ${
                activeTab === "appointments"
                  ? "border-b-2 border-primary-600 text-primary-700"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {t("dash_tabAppointments")} ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab("prescriptions")}
              className={`pb-4 text-sm font-semibold transition ${
                activeTab === "prescriptions"
                  ? "border-b-2 border-primary-600 text-primary-700"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {t("dash_tabPrescriptions")} ({prescriptions.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          {loading ? (
            <p className="py-8 text-center text-sm text-ink-500">{t("dash_loading")}</p>
          ) : activeTab === "appointments" ? (
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/50 py-12 text-center">
                  <CalendarClock size={48} className="mx-auto mb-3 text-primary-300" />
                  <p className="font-semibold text-ink-900">{t("dash_noAppts_title")}</p>
                  <p className="mt-1 text-sm text-ink-500">{t("dash_noAppts_desc")}</p>
                  <Link
                    to="/search"
                    className="mt-4 inline-block rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    {t("dash_browseDoctors")}
                  </Link>
                </div>
              ) : (
                appointments.map((a) => {
                  const ConsultIcon = CONSULT_ICON[a.consultationType] || Video;
                  const canCancel = a.status === "pending" || a.status === "confirmed";
                  return (
                    <div
                      key={a._id}
                      className="group rounded-2xl border border-primary-100 bg-white p-6 transition hover:border-primary-300 hover:shadow-lg"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        {/* Left */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-display text-lg font-bold text-ink-900">{a.providerId?.name}</h3>
                              <p className="mt-0.5 text-sm text-primary-600">{a.providerId?.specialty}</p>
                            </div>
                            <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusColor(a.status)}`}>
                              {getStatusIcon(a.status)}
                              {t(`status_${a.status}`)}
                            </div>
                          </div>

                          <div className="mt-3 space-y-1.5 text-sm text-ink-600">
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              {new Date(a.datetime).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <ConsultIcon size={14} />
                              <span>{t(`consult_${a.consultationType}`)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right - Actions */}
                        <div className="flex flex-col gap-2 sm:items-end">
                          {a.status === "confirmed" && a.sessionStarted && (
                            <Link
                              to={a.meetingLink || `/consultation/${a._id}`}
                              className="flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                            >
                              <Video size={16} /> {t("dash_joinCall")}
                            </Link>
                          )}
                          {a.status === "confirmed" && !a.sessionStarted && (
                            <p className="text-xs font-medium text-primary-600">
                              Chat/video opens automatically at {new Date(a.datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                          {a.status === "completed" && (
                            <Link
                              to={`/review/${a._id}`}
                              className="flex items-center justify-center gap-2 rounded-full border-2 border-primary-600 px-5 py-2 text-sm font-semibold text-primary-600 transition hover:bg-primary-50"
                            >
                              {t("dash_leaveReview")}
                            </Link>
                          )}
                          {a.status === "pending" && (
                            <p className="text-xs font-medium text-amber-600">{t("dash_waitingConfirm")}</p>
                          )}

                          {canCancel && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === a._id ? null : a._id);
                                }}
                                className="text-ink-400 hover:text-ink-600"
                              >
                                <MoreVertical size={18} />
                              </button>
                              {openMenuId === a._id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute end-0 z-10 mt-2 w-52 rounded-xl border border-primary-100 bg-white p-1.5 shadow-lg"
                                >
                                  <button
                                    onClick={() => cancelAppointment(a._id)}
                                    disabled={cancellingId === a._id}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                                  >
                                    <XCircle size={15} />
                                    {cancellingId === a._id ? t("dash_cancelling") : t("dash_cancelAppt")}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            // Prescriptions Tab
            <div className="space-y-4">
              {prescriptions.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/50 py-12 text-center">
                  <Pill size={48} className="mx-auto mb-3 text-primary-300" />
                  <p className="font-semibold text-ink-900">{t("dash_noPresc_title")}</p>
                  <p className="mt-1 text-sm text-ink-500">{t("dash_noPresc_desc")}</p>
                </div>
              ) : (
                prescriptions.map((p) => (
                  <div key={p._id} className="rounded-2xl border border-primary-100 bg-white p-6 transition hover:shadow-lg">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-lg font-bold text-ink-900">Dr. {p.doctorId?.name}</h3>
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            {t("dash_active")}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-ink-500">
                          {t("dash_prescribedOn")} {new Date(p.createdAt).toLocaleDateString()}
                        </p>

                        <div className="mt-4 space-y-2">
                          {p.medicines && p.medicines.length > 0 ? (
                            p.medicines.map((m, i) => (
                              <div key={i} className="flex items-start gap-3 rounded-lg bg-ink-50/30 p-3">
                                <Pill size={16} className="mt-0.5 shrink-0 text-primary-600" />
                                <div className="flex-1">
                                  <p className="font-medium text-ink-900">{m.name}</p>
                                  <p className="text-xs text-ink-600">
                                    {m.dosage} • {m.frequency} • {m.durationDays} days
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-ink-500">{t("dash_noMedicines")}</p>
                          )}
                        </div>

                        {p.notes && (
                          <div className="mt-3 rounded-lg border-l-4 border-primary-600 bg-primary-50 p-3">
                            <p className="text-xs font-medium text-primary-700">{t("dash_doctorNotes")}:</p>
                            <p className="mt-1 text-sm text-primary-900">{p.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 sm:items-end">
                        {(!p.status || p.status === "pending") && (
                          <button
                            onClick={() => sendToPharmacy(p._id)}
                            disabled={sendingId === p._id}
                            className="flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                          >
                            <Plus size={16} /> {sendingId === p._id ? "Finding nearest pharmacy..." : "Send to nearest pharmacy"}
                          </button>
                        )}
                        {p.status === "sent" && (
                          <span className="rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
                            Sent to {p.pharmacyOrderId?.name || "pharmacy"} ({p.pharmacyDistanceKm}km) · awaiting confirmation
                          </span>
                        )}
                        {p.status === "fulfilled" && (
                          <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-700">
                            Ready at {p.pharmacyOrderId?.name || "pharmacy"}
                          </span>
                        )}
                        {p.status === "rejected" && (
                          <button
                            onClick={() => sendToPharmacy(p._id)}
                            className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600"
                          >
                            Pharmacy couldn't fulfill — try another
                          </button>
                        )}
                        <button className="flex items-center gap-2 rounded-full border-2 border-ink-200 px-4 py-2 text-xs font-medium text-ink-700 transition hover:border-ink-300">
                          <Download size={14} /> {t("dash_download")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
