import React, { useEffect, useState } from "react";
import { ScanLine, CalendarClock, User2, AlertTriangle, FileText } from "lucide-react";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { RecordPageHeader, EmptyState, StatusBadge } from "../components/RecordPage";

const TINT = { bg: "bg-blue-50", text: "text-blue-600" };

const STATUS_TONE = { scheduled: "amber", "in-progress": "blue", completed: "green", cancelled: "red" };

export default function Radiology() {
  const { t } = useLanguage();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/radiology/my")
      .then((res) => setScans(res.data.scans || []))
      .catch(() => setScans([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      <RecordPageHeader icon={ScanLine} tint={TINT} title={t("radiology_title")} subtitle={t("radiology_subtitle")} onRefresh={load} />

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {loading ? (
          <p className="py-8 text-center text-sm text-ink-500">{t("page_loading")}</p>
        ) : scans.length === 0 ? (
          <EmptyState icon={ScanLine} tint={TINT} title={t("radiology_empty_title")} description={t("radiology_empty_desc")} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {scans.map((s) => (
              <div key={s._id} className="rounded-2xl border border-primary-100 bg-white p-6 transition hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <ScanLine size={20} />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink-900">{s.scanType}</h3>
                      <p className="text-sm text-ink-500">{s.bodyPart}</p>
                    </div>
                  </div>
                  {s.priority === "urgent" && (
                    <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                      <AlertTriangle size={11} /> {t("radiology_urgent")}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
                  <span className="flex items-center gap-1">
                    <CalendarClock size={12} />
                    {s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString() : "—"}
                  </span>
                  {s.facilityName && <span>{s.facilityName}</span>}
                  {s.radiologistName && (
                    <span className="flex items-center gap-1">
                      <User2 size={12} /> {s.radiologistName}
                    </span>
                  )}
                </div>

                {s.findings && (
                  <div className="mt-4 rounded-lg border-l-4 border-blue-500 bg-blue-50/60 p-3">
                    <p className="text-xs font-semibold text-blue-700">{t("radiology_findings")}</p>
                    <p className="mt-1 text-sm text-blue-900">{s.findings}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <StatusBadge tone={STATUS_TONE[s.status] || "slate"}>
                    {t(`radiology_status_${s.status?.replace("-", "")}`)}
                  </StatusBadge>
                  {s.reportFileUrl && (
                    <a
                      href={s.reportFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800"
                    >
                      <FileText size={13} /> {t("labs_viewReport")}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
