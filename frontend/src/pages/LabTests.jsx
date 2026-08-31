import React, { useEffect, useMemo, useState } from "react";
import { FlaskConical, Search, Building2, FileText, Plus } from "lucide-react";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { RecordPageHeader, EmptyState, StatusBadge } from "../components/RecordPage";

const TINT = { bg: "bg-primary-50", text: "text-primary-600" };
const STATUS_TONE = { requested: "amber", processing: "blue", completed: "green" };

const TABS = [
  { key: "all", labelKey: "labs_tab_all" },
  { key: "requested", labelKey: "labs_tab_requested" },
  { key: "processing", labelKey: "labs_tab_processing" },
  { key: "completed", labelKey: "labs_tab_completed" },
];

export default function LabTests() {
  const { t } = useLanguage();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/tests/my")
      .then((res) => setTests(res.data.tests || []))
      .catch(() => setTests([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const counts = useMemo(() => {
    const c = { all: tests.length, requested: 0, processing: 0, completed: 0 };
    tests.forEach((t) => (c[t.status] = (c[t.status] || 0) + 1));
    return c;
  }, [tests]);

  const filtered = useMemo(() => {
    return tests.filter((tst) => {
      const matchesTab = tab === "all" || tst.status === tab;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || tst.testName?.toLowerCase().includes(q) || tst.labId?.name?.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [tests, tab, query]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/30 to-white">
      <RecordPageHeader icon={FlaskConical} tint={TINT} title={t("labs_title")} subtitle={t("labs_subtitle")} onRefresh={load} />

      {/* The professional top bar: segmented status tabs + live search, sticky just below the page header */}
      <div className="sticky top-[0px] z-30 border-b border-primary-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div className="flex flex-wrap gap-1.5 rounded-full bg-primary-50/70 p-1">
            {TABS.map(({ key, labelKey }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  tab === key ? "bg-primary-600 text-white shadow-sm" : "text-ink-600 hover:bg-white"
                }`}
              >
                {t(labelKey)}
                <span
                  className={`rounded-full px-1.5 text-[11px] ${
                    tab === key ? "bg-white/20 text-white" : "bg-white text-ink-400"
                  }`}
                >
                  {counts[key] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("labs_searchPlaceholder")}
              className="w-full rounded-full border border-primary-200 bg-white py-2 ps-9 pe-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-primary-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {loading ? (
          <p className="py-8 text-center text-sm text-ink-500">{t("page_loading")}</p>
        ) : tests.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            tint={TINT}
            title={t("labs_empty_title")}
            description={t("labs_empty_desc")}
          />
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-500">{t("page_noResults")}</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((tst) => (
              <div key={tst._id} className="rounded-2xl border border-primary-100 bg-white p-6 transition hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <FlaskConical size={20} />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink-900">{tst.testName}</h3>
                      {tst.labId?.name && (
                        <p className="flex items-center gap-1 text-sm text-ink-500">
                          <Building2 size={13} /> {tst.labId.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge tone={STATUS_TONE[tst.status] || "slate"}>{t(`labs_status_${tst.status}`)}</StatusBadge>
                </div>

                {tst.numericResults?.length > 0 && (
                  <div className="mt-4 overflow-x-auto rounded-lg border border-primary-100">
                    <table className="w-full text-sm">
                      <thead className="bg-primary-50/60 text-xs text-ink-500">
                        <tr>
                          <th className="px-3 py-2 text-start font-medium">Test</th>
                          <th className="px-3 py-2 text-start font-medium">Value</th>
                          <th className="px-3 py-2 text-start font-medium">{t("labs_normalRange")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tst.numericResults.map((r, i) => (
                          <tr key={i} className="border-t border-primary-50">
                            <td className="px-3 py-2 text-ink-700">{r.label}</td>
                            <td className="px-3 py-2 font-semibold text-ink-900">
                              {r.value} {r.unit}
                            </td>
                            <td className="px-3 py-2 text-ink-500">{r.normalRange}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {tst.interpretationNotes && (
                  <div className="mt-4 rounded-lg border-l-4 border-primary-600 bg-primary-50/60 p-3">
                    <p className="text-xs font-semibold text-primary-700">{t("labs_interpretation")}</p>
                    <p className="mt-1 text-sm text-primary-900">{tst.interpretationNotes}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-ink-400">
                  <span>{new Date(tst.createdAt).toLocaleDateString()}</span>
                  {tst.resultsFileUrl && (
                    <a
                      href={tst.resultsFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 font-semibold text-primary-700 hover:text-primary-800"
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
