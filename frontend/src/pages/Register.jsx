import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function Register() {
  const { register, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "patient",
    name: "",
    email: "",
    phone: "",
    password: "",
    specialty: "",
    consultationFees: "",
  });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form };
      if (form.role !== "doctor") {
        delete payload.specialty;
        delete payload.consultationFees;
      } else {
        payload.consultationFees = Number(form.consultationFees) || 0;
      }
      const user = await register(payload);
      navigate(user.role === "doctor" ? "/doctor-dashboard" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink-900">{t("register_title")}</h1>
      <p className="mt-1 text-sm text-ink-500">{t("register_subtitle")}</p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="rounded-lg border border-primary-100 px-3 py-2.5 text-sm outline-none focus:border-primary-400"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="lab">Lab</option>
          <option value="pharmacy">Pharmacy</option>
        </select>
        <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-primary-100 px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg border border-primary-100 px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
        <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg border border-primary-100 px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
        <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-lg border border-primary-100 px-3 py-2.5 text-sm outline-none focus:border-primary-400" />

        {form.role === "doctor" && (
          <>
            <input required placeholder="Specialty (e.g. Cardiology)" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="rounded-lg border border-primary-100 px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
            <input required type="number" placeholder="Consultation fee (EGP)" value={form.consultationFees} onChange={(e) => setForm({ ...form, consultationFees: e.target.value })} className="rounded-lg border border-primary-100 px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">
          {loading ? "..." : t("register_button")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        {t("register_haveAccount")} <Link to="/login" className="font-medium text-primary-700">{t("login_button")}</Link>
      </p>
    </div>
  );
}
