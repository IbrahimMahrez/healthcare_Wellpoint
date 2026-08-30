import React, { useEffect, useState } from "react";
import { HeartPulse, Activity, Droplet, Wind, Ruler, Weight, ShieldAlert, Pill, StickyNote, CalendarCheck } from "lucide-react";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { RecordPageHeader, EmptyState, StatCard } from "../components/RecordPage";

const TINT = { bg: "bg-rose-50", text: "text-rose-600" };

const STATUS_TONE = {
  excellent: { bg: "bg-green-50", text: "text-green-700", ring: "ring-green-200" },
  good: { bg: "bg-primary-50", text: "text-primary-700", ring: "ring-primary-200" },
  fair: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" },
  "needs-attention": { bg: "bg-orange-50", text: "text-orange-700", ring: "ring-orange-200" },
  critical: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
};

export default function HealthStatus() {
  const { t } = useLanguage();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/health-records/my")
      .then((res) => setRecord(res.data.record))
      .catch(() => setRecord(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const statusKey = (record?.overallStatus || "good").replace("-", "");
  const statusTone = STATUS_TONE[record?.overallStatus || "good"];

  const list = (arr) => (arr && arr.length > 0 ? arr.join(" • ") : t("health_none"));

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 to-white">
      <RecordPageHeader icon={HeartPulse} tint={TINT} title={t("health_title")} subtitle={t("health_subtitle")} onRefresh={load} />

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {loading ? (
          <p className="py-8 text-center text-sm text-ink-500">{t("page_loading")}</p>
        ) : !record ? (
          <EmptyState icon={HeartPulse} tint={TINT} title={t("health_empty_title")} description={t("health_empty_desc")} />
        ) : (
          <>
            {/* Overall status banner */}
            <div className={`flex flex-col justify-between gap-4 rounded-2xl border ${statusTone.ring} ${statusTone.bg} p-6 sm:flex-row sm:items-center`}>
              <div className="flex items-center gap-4">
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white ${statusTone.text}`}>
                  <HeartPulse size={26} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{t("health_overall")}</p>
                  <p className={`font-display text-2xl font-bold ${statusTone.text}`}>{t(`health_status_${statusKey}`)}</p>
                </div>
              </div>
              {record.lastCheckupDate && (
                <div className="flex items-center gap-2 text-sm text-ink-600">
                  <CalendarCheck size={16} />
                  {t("health_lastCheckup")}: {new Date(record.lastCheckupDate).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Vitals grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <StatCard
                icon={Activity}
                tint={TINT}
                label={t("health_bloodPressure")}
                value={record.bloodPressure?.systolic ? `${record.bloodPressure.systolic}/${record.bloodPressure.diastolic}` : "—"}
              />
              <StatCard icon={HeartPulse} tint={TINT} label={t("health_heartRate")} value={record.heartRateBpm ? `${record.heartRateBpm} bpm` : "—"} />
              <StatCard icon={Droplet} tint={TINT} label={t("health_glucose")} value={record.glucoseLevelMgDl ? `${record.glucoseLevelMgDl} mg/dL` : "—"} />
              <StatCard icon={Wind} tint={TINT} label={t("health_oxygen")} value={record.oxygenSaturation ? `${record.oxygenSaturation}%` : "—"} />
              <StatCard icon={Droplet} tint={TINT} label={t("health_bloodType")} value={record.bloodType || "—"} />
              <StatCard icon={Ruler} tint={TINT} label={t("health_height")} value={record.heightCm ? `${record.heightCm} cm` : "—"} />
              <StatCard icon={Weight} tint={TINT} label={t("health_weight")} value={record.weightKg ? `${record.weightKg} kg` : "—"} />
            </div>

            {/* Detail panels */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-primary-100 bg-white p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <ShieldAlert size={15} className="text-rose-600" /> {t("health_allergies")}
                </p>
                <p className="mt-2 text-sm text-ink-600">{list(record.allergies)}</p>
              </div>
              <div className="rounded-2xl border border-primary-100 bg-white p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <Activity size={15} className="text-rose-600" /> {t("health_conditions")}
                </p>
                <p className="mt-2 text-sm text-ink-600">{list(record.chronicConditions)}</p>
              </div>
              <div className="rounded-2xl border border-primary-100 bg-white p-5 md:col-span-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <Pill size={15} className="text-rose-600" /> {t("health_medications")}
                </p>
                <p className="mt-2 text-sm text-ink-600">{list(record.currentMedications)}</p>
              </div>
              {record.doctorNotes && (
                <div className="rounded-2xl border-l-4 border-rose-500 bg-rose-50/60 p-5 md:col-span-2">
                  <p className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                    <StickyNote size={15} /> {t("health_doctorNotes")}
                  </p>
                  <p className="mt-2 text-sm text-rose-900">{record.doctorNotes}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
