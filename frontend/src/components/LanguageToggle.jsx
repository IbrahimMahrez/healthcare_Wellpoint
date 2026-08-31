import React from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageToggle({ className = "" }) {
  const { lang, toggleLang } = useLanguage();
  return (
    <button
      onClick={toggleLang}
      className={`flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-sm ring-1 ring-primary-100 hover:ring-primary-300 ${className}`}
      aria-label="Toggle language"
    >
      <Languages size={14} />
      {lang === "en" ? "العربية" : "English"}
    </button>
  );
}
