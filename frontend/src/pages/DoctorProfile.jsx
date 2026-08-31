import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Star, MapPin, Wallet, Heart, Share2, BadgeCheck,
  CheckCircle, Clock, Users, GraduationCap, AlertCircle
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// Turn the doctor's weekly availableSlots (e.g. { day: "Mon", from: "10:00" })
// into concrete upcoming dates the patient can tap on, instead of showing
// arbitrary "next 3 days" that the doctor might not even work on.
function computeUpcomingSlots(availableSlots = [], count = 4) {
  if (!availableSlots.length) return [];
  const now = new Date();
  const candidates = [];

  availableSlots.forEach((slot) => {
    const targetDay = DAY_INDEX[slot.day];
    if (targetDay === undefined || !slot.from) return;
    for (let weekOffset = 0; weekOffset < 3; weekOffset++) {
      const d = new Date(now);
      const diff = (targetDay - d.getDay() + 7) % 7;
      d.setDate(d.getDate() + diff + weekOffset * 7);
      const [h, m] = slot.from.split(":").map(Number);
      d.setHours(h || 0, m || 0, 0, 0);
      if (d > now) {
        candidates.push(d);
        break; // only need the nearest occurrence of this slot per pass
      }
    }
  });

  return candidates.sort((a, b) => a - b).slice(0, count);
}

function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  const [doctor, setDoctor] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [datetime, setDatetime] = useState("");
  const [consultationType, setConsultationType] = useState("video");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [formError, setFormError] = useState("");
  const [liked, setLiked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    api
      .get(`/doctors/${id}`)
      .then(({ data }) => setDoctor(data.doctor))
      .catch(() => setNotFound(true));
  }, [id]);

  const upcomingSlots = useMemo(() => computeUpcomingSlots(doctor?.availableSlots), [doctor]);
  const minDateTime = useMemo(() => toLocalInputValue(new Date()), []);

  const book = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!user) {
      navigate("/login");
      return;
    }
    if (!datetime) {
      setFormError(t("doctor_noDateError"));
      return;
    }
    if (new Date(datetime) <= new Date()) {
      setFormError(t("doctor_pastDateError"));
      return;
    }

    setStatus("booking");
    try {
      await api.post("/appointments", {
        providerId: id,
        providerType: "doctor",
        datetime,
        consultationType,
        notes,
      });
      setStatus("booked");
    } catch (err) {
      setStatus("");
      setFormError(err.response?.data?.message || "Could not book appointment");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — fail silently.
    }
  };

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 text-red-500" size={40} />
        <p className="text-ink-700">{t("doctor_notFound")}</p>
        <Link to="/search" className="mt-4 inline-block text-sm font-semibold text-primary-700 hover:text-primary-800">
          {t("doctor_back")}
        </Link>
      </div>
    );
  }

  if (!doctor)
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-primary-100" />
          <div className="h-48 rounded-3xl bg-primary-50" />
        </div>
      </div>
    );

  const dateFormatter = new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <button
          onClick={() => navigate("/search")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← {t("doctor_back")}
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Doctor Info */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-primary-100 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex flex-col items-center sm:items-start">
                  {doctor.avatarUrl ? (
                    <img src={doctor.avatarUrl} alt={doctor.name} className="h-24 w-24 rounded-full object-cover shadow-lg" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 font-display text-4xl font-bold text-white shadow-lg">
                      {doctor.name?.charAt(0)}
                    </div>
                  )}
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`mt-4 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                      liked ? "bg-red-50 text-red-600" : "bg-primary-50 text-primary-600 hover:bg-primary-100"
                    }`}
                  >
                    <Heart size={16} className={liked ? "fill-red-600" : ""} />
                    {liked ? t("doctor_saved") : t("doctor_save")}
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h1 className="font-display text-3xl font-bold text-ink-900">{doctor.name}</h1>
                        {doctor.verified && (
                          <span title={t("doctor_verified")}>
                            <BadgeCheck size={22} className="fill-primary-100 text-primary-600" />
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-medium text-primary-600">{doctor.specialty}</p>
                    </div>
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 rounded-full border-2 border-primary-600 px-4 py-2 text-primary-600 hover:bg-primary-50"
                    >
                      <Share2 size={16} /> {shareCopied ? t("doctor_linkCopied") : t("doctor_share")}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={i < Math.round(doctor.rating) ? "fill-amber-400 text-amber-400" : "text-ink-300"}
                        />
                      ))}
                      <span className="ml-2 font-semibold text-ink-900">{doctor.rating?.toFixed(1) || "New"}</span>
                      <span className="text-sm text-ink-500">({doctor.numReviews || 0})</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <p className="text-2xl font-bold text-primary-600">{doctor.consultationFees}</p>
                      <p className="text-xs text-ink-500">{t("doctor_perSession")}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-lg font-semibold text-ink-900">
                        <Clock size={18} /> 30 min
                      </p>
                      <p className="text-xs text-ink-500">{t("doctor_avgSession")}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-lg font-semibold text-ink-900">
                        <Users size={18} /> {doctor.numReviews > 0 ? `${doctor.numReviews}+` : "—"}
                      </p>
                      <p className="text-xs text-ink-500">{t("doctor_happyPatients")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-primary-100 pt-8">
                <h2 className="font-display text-xl font-bold text-ink-900">{t("doctor_about")}</h2>
                <p className="mt-3 text-ink-700">
                  {doctor.bio || t("doctor_aboutFallback", { name: doctor.name, specialty: doctor.specialty })}
                </p>
              </div>

              <div className="mt-8 border-t border-primary-100 pt-8">
                <h2 className="font-display text-xl font-bold text-ink-900">{t("doctor_qualifications")}</h2>
                <ul className="mt-4 space-y-2">
                  {doctor.qualifications && doctor.qualifications.length > 0 ? (
                    doctor.qualifications.map((q, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <GraduationCap size={16} className="shrink-0 text-primary-600" />
                        <span className="text-ink-700">{q}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-ink-500">{t("doctor_qualificationsFallback", { specialty: doctor.specialty })}</li>
                  )}
                </ul>
              </div>

              {doctor.clinicAddresses && doctor.clinicAddresses.length > 0 && (
                <div className="mt-8 border-t border-primary-100 pt-8">
                  <h2 className="font-display text-xl font-bold text-ink-900">{t("doctor_clinics")}</h2>
                  <div className="mt-4 space-y-3">
                    {doctor.clinicAddresses.map((clinic, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl bg-primary-50 p-4">
                        <MapPin size={18} className="mt-1 shrink-0 text-primary-600" />
                        <div>
                          <p className="font-medium text-ink-900">{clinic.label || "Clinic"}</p>
                          <p className="text-sm text-ink-600">
                            {clinic.street}, {clinic.city}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="sticky top-24 h-fit">
            <div className="rounded-3xl border-2 border-primary-200 bg-white p-8 shadow-xl">
              <h2 className="font-display text-2xl font-bold text-ink-900">{t("doctor_bookTitle")}</h2>
              <p className="mt-1 text-sm text-ink-500">{doctor.consultationFees} {t("doctor_perSession")}</p>

              {status === "booked" ? (
                <div className="mt-6 rounded-2xl bg-green-50 p-6 text-center">
                  <CheckCircle size={40} className="mx-auto mb-3 text-green-600" />
                  <p className="font-display text-lg font-bold text-green-900">{t("doctor_bookedTitle")}</p>
                  <p className="mt-1 text-sm text-green-700">{t("doctor_bookedDesc")}</p>
                  <Link
                    to="/dashboard"
                    className="mt-4 inline-block rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    {t("doctor_viewDashboard")}
                  </Link>
                </div>
              ) : (
                <form onSubmit={book} className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-600">{t("doctor_typeLabel")}</label>
                    <div className="mt-2 space-y-2">
                      {[
                        { value: "video", label: t("doctor_type_video"), desc: t("doctor_type_video_desc") },
                        { value: "audio", label: t("doctor_type_audio"), desc: t("doctor_type_audio_desc") },
                        { value: "text", label: t("doctor_type_text"), desc: t("doctor_type_text_desc") },
                      ].map((type) => (
                        <label
                          key={type.value}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-primary-100 p-3 hover:border-primary-300 hover:bg-primary-50"
                        >
                          <input
                            type="radio"
                            name="type"
                            value={type.value}
                            checked={consultationType === type.value}
                            onChange={(e) => setConsultationType(e.target.value)}
                            className="h-4 w-4"
                          />
                          <div>
                            <p className="text-sm font-medium text-ink-900">{type.label}</p>
                            <p className="text-xs text-ink-500">{type.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-600">{t("doctor_dateLabel")}</label>

                    {upcomingSlots.length > 0 ? (
                      <>
                        <p className="mt-2 text-xs text-ink-500">{t("doctor_nextAvailable")}:</p>
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          {upcomingSlots.map((d, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setDatetime(toLocalInputValue(d))}
                              className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                                datetime === toLocalInputValue(d)
                                  ? "border-primary-600 bg-primary-600 text-white"
                                  : "border-primary-100 bg-primary-50 text-primary-700 hover:bg-primary-100"
                              }`}
                            >
                              {dateFormatter.format(d)}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">{t("doctor_noSlots")}</p>
                    )}

                    <p className="mt-3 text-xs text-ink-500">{t("doctor_pickManually")}:</p>
                    <input
                      type="datetime-local"
                      required
                      min={minDateTime}
                      value={datetime}
                      onChange={(e) => setDatetime(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border-2 border-primary-100 px-4 py-3 text-sm outline-none focus:border-primary-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-600">{t("doctor_notesLabel")}</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("doctor_notesPlaceholder")}
                      className="mt-2 w-full rounded-lg border-2 border-primary-100 px-4 py-3 text-sm outline-none focus:border-primary-400"
                      rows="3"
                    />
                  </div>

                  {formError && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                      <AlertCircle size={15} className="shrink-0" /> {formError}
                    </div>
                  )}

                  <button
                    disabled={status === "booking"}
                    className="mt-2 w-full rounded-full bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-60"
                  >
                    {status === "booking" ? t("doctor_submitting") : t("doctor_submit")}
                  </button>

                  <div className="rounded-lg bg-ink-50 px-4 py-3 text-xs text-ink-600">
                    <p>{t("doctor_infoEmail")}</p>
                  </div>
                </form>
              )}
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 rounded-lg border border-primary-100 bg-white p-4">
                <CheckCircle size={16} className="shrink-0 text-primary-600" />
                <span className="text-ink-700">{t("doctor_trustSecure")}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-primary-100 bg-white p-4">
                <Clock size={16} className="shrink-0 text-primary-600" />
                <span className="text-ink-700">{t("doctor_trustCancel")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
