import React, { useEffect, useState } from "react";
import { Receipt, Wallet, Clock3, Hash, CreditCard, Download } from "lucide-react";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { RecordPageHeader, EmptyState, StatCard, StatusBadge } from "../components/RecordPage";

const TINT = { bg: "bg-violet-50", text: "text-violet-600" };

const STATUS_TONE = { paid: "green", pending: "amber", failed: "red", refunded: "blue" };
const METHOD_LABEL = {
  stripe: "Stripe",
  paypal: "PayPal",
  fawry: "Fawry",
  vodafone_cash: "Vodafone Cash",
  cash: "Cash",
};

export default function Invoices() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/payments/my")
      .then((res) => setPayments(res.data.payments || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/30 to-white">
      <RecordPageHeader icon={Receipt} tint={TINT} title={t("invoices_title")} subtitle={t("invoices_subtitle")} onRefresh={load} />

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={Wallet} tint={TINT} label={t("invoices_totalPaid")} value={`${totalPaid.toLocaleString()} EGP`} />
          <StatCard icon={Clock3} tint={{ bg: "bg-amber-50", text: "text-amber-600" }} label={t("invoices_pending")} value={`${totalPending.toLocaleString()} EGP`} />
          <StatCard icon={Receipt} tint={TINT} label={t("invoices_totalInvoices")} value={payments.length} />
        </div>

        <div className="mt-8">
          {loading ? (
            <p className="py-8 text-center text-sm text-ink-500">{t("page_loading")}</p>
          ) : payments.length === 0 ? (
            <EmptyState icon={Receipt} tint={TINT} title={t("invoices_empty_title")} description={t("invoices_empty_desc")} />
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div
                  key={p._id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-primary-100 bg-white p-5 transition hover:shadow-md sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <Receipt size={20} />
                    </span>
                    <div>
                      <p className="font-display text-lg font-bold text-ink-900">{p.amount?.toLocaleString()} EGP</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                        <span className="flex items-center gap-1">
                          <CreditCard size={12} /> {t("invoices_method")}: {METHOD_LABEL[p.method] || p.method}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash size={12} /> {t("invoices_reference")}: {p.reference}
                        </span>
                        <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:justify-end">
                    <StatusBadge tone={STATUS_TONE[p.status] || "slate"}>{t(`invoices_status_${p.status}`)}</StatusBadge>
                    <button
                      className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-ink-300"
                      title={t("page_download")}
                    >
                      <Download size={13} /> {t("page_download")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
