import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Search, MessageCircle, User } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export default function BottomNav() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const items = [
    { to: "/", label: t("bottom_home"), icon: Home },
    { to: "/search", label: t("bottom_search"), icon: Search },
    { to: "/ai-assistant", label: t("bottom_ai"), icon: MessageCircle },
    { to: "/dashboard", label: t("bottom_profile"), icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-primary-100 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-6xl justify-around px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
                isActive ? "text-primary-700" : "text-ink-500"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}