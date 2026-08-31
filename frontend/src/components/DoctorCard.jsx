import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Wallet, BadgeCheck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function DoctorCard({ doctor }) {
  const { t } = useLanguage();
  const city = doctor.clinicAddresses?.[0]?.city;

  return (
    <Link
      to={`/doctors/${doctor._id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-primary-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center"
    >
      {doctor.avatarUrl ? (
        <img
          src={doctor.avatarUrl}
          alt={doctor.name}
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 font-display text-lg font-semibold text-white">
          {doctor.name?.charAt(0)}
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <p className="font-display text-lg font-semibold text-ink-900">{doctor.name}</p>
          {doctor.verified && (
            <span title={t("doctor_verified")}>
              <BadgeCheck size={16} className="fill-primary-100 text-primary-600" />
            </span>
          )}
        </div>
        <p className="text-sm text-primary-700">{doctor.specialty}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
          <span className="flex items-center gap-1">
            <Star size={14} className="fill-amber-400 text-amber-400" /> {doctor.rating?.toFixed(1) || "New"} ({doctor.numReviews || 0})
          </span>
          {city && (
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {city}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Wallet size={14} /> {doctor.consultationFees} EGP
          </span>
        </div>
      </div>
      <span className="hidden shrink-0 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white group-hover:bg-primary-700 sm:block">
        {t("doctor_book")}
      </span>
    </Link>
  );
}
