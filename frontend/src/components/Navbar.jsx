import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Stethoscope, Receipt, ScanLine, HeartPulse, ClipboardCheck, FlaskConical, Siren } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import NotificationBell from "./NotificationBell";
import LanguageToggle from "./LanguageToggle";
import ProfileMenu from "./ProfileMenu";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const links = [
    { to: "/search", label: t("nav_findDoctor") },
    { to: "/pharmacies", label: t("nav_pharmacies") },
    { to: "/ai-assistant", label: t("nav_ai") },
  ];

  const dashboardPath =
    user?.role === "doctor"
      ? "/doctor-dashboard"
      : user?.role === "admin"
      ? "/admin"
      : user?.role === "lab"
      ? "/lab-dashboard"
      : user?.role === "pharmacy"
      ? "/pharmacy-dashboard"
      : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-primary-100 bg-primary-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-primary-50">
            <Stethoscope size={18} />
          </span>
          <span className="font-display text-xl font-semibold text-ink-900">Wellpoint</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-primary-700" : "text-ink-500 hover:text-primary-700"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `text-sm font-medium ${isActive ? "text-primary-700" : "text-ink-500 hover:text-primary-700"}`}
            >
              {t("nav_admin")}
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/emergency"
            className="flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-1.5 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-100"
          >
            <Siren size={15} /> {t("emergency_navLabel")}
          </Link>
          <LanguageToggle />
          <NotificationBell />
          {user ? (
            <ProfileMenu />
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-ink-500 hover:text-primary-700">
                {t("nav_login")}
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                {t("nav_getStarted")}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/emergency"
            className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200"
          >
            <Siren size={13} /> {t("emergency_navLabel")}
          </Link>
          <NotificationBell />
          <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-primary-100 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-primary-50"
              >
                {l.label}
              </NavLink>
            ))}
            {user?.role === "admin" && (
              <NavLink to="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-primary-50">
                {t("nav_admin")}
              </NavLink>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-primary-100 pt-3">
              <LanguageToggle />
            </div>
            <div className="mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to={dashboardPath}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-primary-50"
                  >
                    {t("nav_dashboard")}
                  </Link>

                  <p className="mt-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    {t("profile_careHub")}
                  </p>
                  <div className="grid grid-cols-2 gap-2 px-3">
                    {[
                      { to: "/invoices", icon: Receipt, label: t("nav_invoices"), tint: "bg-violet-50 text-violet-600" },
                      { to: "/radiology", icon: ScanLine, label: t("nav_radiology"), tint: "bg-blue-50 text-blue-600" },
                      { to: "/health-status", icon: HeartPulse, label: t("nav_healthStatus"), tint: "bg-rose-50 text-rose-600" },
                      { to: "/admission-permits", icon: ClipboardCheck, label: t("nav_admissions"), tint: "bg-amber-50 text-amber-600" },
                      { to: "/lab-tests", icon: FlaskConical, label: t("nav_labTests"), tint: "bg-primary-50 text-primary-600" },
                    ].map(({ to, icon: Icon, label, tint }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-lg border border-primary-100 px-2.5 py-2 text-xs font-semibold text-ink-700 hover:border-primary-300"
                      >
                        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${tint}`}>
                          <Icon size={14} />
                        </span>
                        <span className="truncate">{label}</span>
                      </Link>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate("/");
                    }}
                    className="rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-700 hover:bg-primary-50"
                  >
                    {t("nav_logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-primary-50"
                  >
                    {t("nav_login")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="rounded-lg bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white"
                  >
                    {t("nav_getStarted")}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
