import React, { useEffect, useState } from "react";
import { ClipboardCheck, LogIn, LogOut, Building2, DoorOpen, CalendarDays, Stethoscope } from "lucide-react";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { RecordPageHeader, EmptyState, StatusBadge } from "../components/RecordPage";

const TINT = { bg: "bg-amber-50", text: "text-amber-600" };
const STATUS_TONE = { scheduled: "amber", admitted: "blue", discharged: "green", cancelled: "red" };

export default function AdmissionPermits() {
  const { t } = useLanguage();
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/admissions/my")
      .then((res) => setPermits(res.data.permits || []))
      .catch(() => setPermits([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white">
      <RecordPageHeader icon={ClipboardCheck} tint={TINT} title={t("admissions_title")} subtitle={t("admissions_subtitle")} onRefresh={load} />

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {loading ? (
          <p className="py-8 text-center text-sm text-ink-500">{t("page_loading")}</p>
        ) : permits.length === 0 ? (
          <EmptyState icon={ClipboardCheck} tint={TINT} title={t("admissions_empty_title")} description={t("admissions_empty_desc")} />
        ) : (
          <div className="space-y-4">
            {permits.map((p) => {
              const PermitIcon = p.permitType === "entry" ? LogIn : LogOut;
              return (
                <div key={p._id} className="rounded-2xl border border-primary-100 bg-white p-6 transition hover:shadow-md">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <PermitIcon size={20} />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-bold text-ink-900">
                          {p.permitType === "entry" ? t("admissions_entry") : t("admissions_exit")}
                        </h3>
                        <p className="flex items-center gap-1 text-sm text-ink-500">
                          <Building2 size={13} /> {p.facilityName}
                          {p.department && ` · ${p.department}`}
                        </p>
                      </div>
                    </div>
                    <StatusBadge tone={STATUS_TONE[p.status] || "slate"}>{t(`admissions_status_${p.status}`)}</StatusBadge>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-primary-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                    {p.roomNumber && (
                      <div>
                        <p className="flex items-center gap-1 text-xs font-medium text-ink-400">
                          <DoorOpen size={12} /> {t("admissions_room")}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-ink-900">{p.roomNumber}</p>
                      </div>
                    )}
                    {p.admissionDate && (
                      <div>
                        <p className="flex items-center gap-1 text-xs font-medium text-ink-400">
                          <CalendarDays size={12} /> {t("admissions_admissionDate")}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-ink-900">{new Date(p.admissionDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {p.dischargeDate && (
                      <div>
                        <p className="flex items-center gap-1 text-xs font-medium text-ink-400">
                          <CalendarDays size={12} /> {t("admissions_dischargeDate")}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-ink-900">{new Date(p.dischargeDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {p.doctorId?.name && (
                      <div>
                        <p className="flex items-center gap-1 text-xs font-medium text-ink-400">
                          <Stethoscope size={12} /> Dr.
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-ink-900">{p.doctorId.name}</p>
                      </div>
                    )}
                  </div>

                  {(p.reason || p.diagnosis || p.caseDetails) && (
                    <div className="mt-4 space-y-2 rounded-lg bg-ink-50/40 p-4">
                      {p.reason && (
                        <p className="text-sm text-ink-700">
                          <span className="font-semibold text-ink-900">{t("admissions_reason")}: </span>
                          {p.reason}
                        </p>
                      )}
                      {p.diagnosis && (
                        <p className="text-sm text-ink-700">
                          <span className="font-semibold text-ink-900">{t("admissions_diagnosis")}: </span>
                          {p.diagnosis}
                        </p>
                      )}
                      {p.caseDetails && (
                        <p className="text-sm text-ink-700">
                          <span className="font-semibold text-ink-900">{t("admissions_caseDetails")}: </span>
                          {p.caseDetails}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
