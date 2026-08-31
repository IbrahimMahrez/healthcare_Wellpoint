import React from "react";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-16 border-t border-primary-100 bg-white py-8 text-center text-sm text-ink-500">
      <p>© {new Date().getFullYear()} Wellpoint Healthcare Super App — MVP build.</p>
      <p className="mt-1">{t("footer_notice")}</p>
    </footer>
  );
}
