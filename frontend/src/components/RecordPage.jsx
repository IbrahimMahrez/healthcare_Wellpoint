import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

/**
 * Shared hero header used across every "Care Hub" record page
 * (Invoices, Radiology, Health Status, Admission Permits, Lab Tests).
 * Keeping this in one place is what makes the five pages feel like
 * one cohesive, professionally designed module instead of five
 * one-off screens.
 */
export function RecordPageHeader({ icon: Icon, tint, title, subtitle, onRefresh }) {
  const { dir } = useLanguage();
  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="border-b border-primary-100 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-primary-700"
        >
          <BackIcon size={15} />
          {useLanguage().t("page_back")}
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${tint.bg} ${tint.text}`}
            >
              <Icon size={26} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h1>
              <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
            </div>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 self-start rounded-full border border-primary-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:border-primary-300 hover:text-primary-700 sm:self-auto"
            >
              <RefreshCw size={14} />
              {useLanguage().t("page_refresh")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, tint, action }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/40 px-6 py-16 text-center">
      <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${tint.bg} ${tint.text}`}>
        <Icon size={30} />
      </div>
      <p className="font-display text-lg font-bold text-ink-900">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>
      {action}
    </div>
  );
}

export function StatCard({ icon: Icon, tint, label, value }) {
  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-5 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-ink-500">{label}</p>
          <p className="mt-1.5 font-display text-xl font-bold text-ink-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${tint.bg} ${tint.text}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ tone, children }) {
  const tones = {
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-600 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    slate: "bg-ink-50 text-ink-600 border-ink-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}
