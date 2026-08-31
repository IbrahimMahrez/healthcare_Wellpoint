import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LayoutGrid,
  Receipt,
  ScanLine,
  HeartPulse,
  ClipboardCheck,
  FlaskConical,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

// Every "Care Hub" destination gets its own accent so a patient can
// recognize a record type by color alone, the same way a hospital
// wing is color-coded on a wayfinding map.
const HUB_ITEMS = [
  {
    to: "/invoices",
    icon: Receipt,
    labelKey: "nav_invoices",
    descKey: "nav_invoices_desc",
    tint: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
  },
  {
    to: "/radiology",
    icon: ScanLine,
    labelKey: "nav_radiology",
    descKey: "nav_radiology_desc",
    tint: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
  },
  {
    to: "/health-status",
    icon: HeartPulse,
    labelKey: "nav_healthStatus",
    descKey: "nav_healthStatus_desc",
    tint: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
  },
  {
    to: "/admission-permits",
    icon: ClipboardCheck,
    labelKey: "nav_admissions",
    descKey: "nav_admissions_desc",
    tint: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
  },
  {
    to: "/lab-tests",
    icon: FlaskConical,
    labelKey: "nav_labTests",
    descKey: "nav_labTests_desc",
    tint: "bg-primary-50 text-primary-600 group-hover:bg-primary-100",
  },
];

function initialsOf(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";
}

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium text-ink-900 shadow-sm ring-1 transition ${
          open ? "ring-primary-400" : "ring-primary-100 hover:ring-primary-300"
        }`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white">
          {initialsOf(user.name)}
        </span>
        <span className="hidden max-w-[8rem] truncate lg:inline">{user.name?.split(" ")[0]}</span>
        <ChevronDown size={15} className={`text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute end-0 z-50 mt-3 w-[21rem] origin-top-right rounded-2xl border border-primary-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-[fadeIn_.15s_ease-out]"
          role="menu"
        >
          {/* Identity strip */}
          <div className="flex items-center gap-3 rounded-xl bg-primary-50/60 p-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white">
              {initialsOf(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold text-ink-900">{user.name}</p>
              <p className="truncate text-xs text-ink-500">{user.email}</p>
            </div>
          </div>

          {/* Section label */}
          {user.role === "patient" && (
            <>
              <div className="mt-3 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                <LayoutGrid size={12} />
                {t("profile_careHub")}
              </div>

              {/* Grid of health record destinations */}
              <div className="mt-1.5 grid grid-cols-1 gap-1 p-1">
                {HUB_ITEMS.map(({ to, icon: Icon, labelKey, descKey, tint }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    role="menuitem"
                    className="group flex items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-primary-50/70"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${tint}`}>
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink-900">{t(labelKey)}</span>
                      <span className="block truncate text-xs text-ink-500">{t(descKey)}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}

          <div className="my-1.5 border-t border-primary-100" />

          <Link
            to={dashboardPath}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 hover:bg-primary-50/70"
          >
            <Settings size={16} className="text-ink-400" />
            {t("nav_dashboard")}
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              logout();
              navigate("/");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} />
            {t("nav_logout")}
          </button>
        </div>
      )}
    </div>
  );
}
