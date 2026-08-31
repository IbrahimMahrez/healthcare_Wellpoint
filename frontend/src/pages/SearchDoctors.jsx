import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, Search, Stethoscope } from "lucide-react";
import api from "../services/api";
import DoctorCard from "../components/DoctorCard";
import { EmptyState } from "../components/RecordPage";
import { useLanguage } from "../context/LanguageContext";

const POPULAR_SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Dentistry",
  "Orthopedics",
  "ENT",
  "Psychiatry",
  "Gynecology",
];

const TINT = { bg: "bg-primary-50", text: "text-primary-600" };

function DoctorCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3 rounded-2xl border border-primary-100 bg-white p-4 sm:flex-row sm:items-center">
      <div className="h-14 w-14 shrink-0 rounded-full bg-primary-100" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 rounded bg-primary-100" />
        <div className="h-3 w-28 rounded bg-primary-50" />
        <div className="h-3 w-56 rounded bg-primary-50" />
      </div>
      <div className="hidden h-9 w-20 shrink-0 rounded-full bg-primary-100 sm:block" />
    </div>
  );
}

export default function SearchDoctors() {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [specialtyInput, setSpecialtyInput] = useState(params.get("specialty") || "");
  const [cityInput, setCityInput] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState("rating");

  // Debounce free-text inputs so we don't fire a request on every keystroke.
  const [filters, setFilters] = useState({ specialty: specialtyInput, city: cityInput });
  useEffect(() => {
    const id = setTimeout(() => setFilters({ specialty: specialtyInput, city: cityInput }), 350);
    return () => clearTimeout(id);
  }, [specialtyInput, cityInput]);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams(
          Object.entries({ ...filters, minRating, sort }).filter(([, v]) => v)
        ).toString();
        const { data } = await api.get(`/doctors?${query}`);
        setDoctors(data.doctors || []);
        setTotal(data.total ?? data.doctors?.length ?? 0);
      } catch (err) {
        setError(err.response?.data?.message || t("search_error"));
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, minRating, sort]);

  const hasActiveFilters = specialtyInput || cityInput || minRating;

  const setSpecialty = (value) => {
    setSpecialtyInput(value);
    setParams(value ? { specialty: value } : {});
  };

  const clearFilters = () => {
    setSpecialtyInput("");
    setCityInput("");
    setMinRating("");
    setParams({});
  };

  const skeletons = useMemo(() => Array.from({ length: 5 }), []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{t("search_title")}</h1>
      <p className="mt-1 text-sm text-ink-500">{t("search_subtitle")}</p>

      {/* Popular specialty chips */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-ink-400">{t("search_popularSpecialties")}:</span>
        {POPULAR_SPECIALTIES.map((s) => (
          <button
            key={s}
            onClick={() => setSpecialty(specialtyInput === s ? "" : s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              specialtyInput === s
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-primary-200 bg-white text-ink-600 hover:border-primary-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-primary-100 bg-white p-4 sm:flex-row sm:items-center">
        <SlidersHorizontal size={18} className="hidden shrink-0 text-primary-600 sm:block" />
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={specialtyInput}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder={t("search_specialtyPlaceholder")}
            className="w-full rounded-lg border border-primary-100 py-2 ps-9 pe-3 text-sm outline-none focus:border-primary-400"
          />
        </div>
        <input
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          placeholder={t("search_cityPlaceholder")}
          className="flex-1 rounded-lg border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-400"
        />
        <select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="rounded-lg border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-400"
        >
          <option value="">{t("search_anyRating")}</option>
          <option value="4">4+ ★</option>
          <option value="4.5">4.5+ ★</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-400"
        >
          <option value="rating">{t("search_sort_rating")}</option>
          <option value="price_asc">{t("search_sort_priceAsc")}</option>
          <option value="price_desc">{t("search_sort_priceDesc")}</option>
          <option value="reviews">{t("search_sort_reviews")}</option>
        </select>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-700"
          >
            <X size={14} /> {t("search_clearFilters")}
          </button>
        )}
      </div>

      {error && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {!loading && !error && (
        <p className="mt-6 text-sm text-ink-500">{t("search_resultsCount", { count: total })}</p>
      )}

      {loading ? (
        <div className="mt-3 grid gap-3">
          {skeletons.map((_, i) => (
            <DoctorCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="mt-3 grid gap-3">
          {doctors.length === 0 && !error && (
            <EmptyState
              icon={Stethoscope}
              tint={TINT}
              title={t("search_empty_title")}
              description={t("search_empty_desc")}
              action={
                hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    className="mt-4 inline-block rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    {t("search_clearFilters")}
                  </button>
                ) : null
              }
            />
          )}
          {doctors.map((doc) => (
            <DoctorCard key={doc._id} doctor={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
