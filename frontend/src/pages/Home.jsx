import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Video,
  Pill,
  FlaskConical,
  Heart,
  Users,
  Clock,
  Shield,
  Star,
  ArrowRight,
  Check,
  FileText,
  Siren,
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import Reveal from "../components/Reveal";
import api from "../services/api";
import heroDoctor from "../assets/hero-doctor.jpg";

export default function Home() {
  const { t } = useLanguage();

  const [topDoctors, setTopDoctors] = useState([]);

  useEffect(() => {
    api
      .get("/doctors?sort=rating&limit=4")
      .then(({ data }) => {
        setTopDoctors(data.doctors || []);
      })
      .catch(() => {
        setTopDoctors([]);
      });
  }, []);

  const services = [
    {
      icon: Video,
      titleKey: "service_video_title",
      descKey: "service_video_desc",
    },
    {
      icon: Pill,
      titleKey: "service_pharmacy_title",
      descKey: "service_pharmacy_desc",
    },
    {
      icon: FlaskConical,
      titleKey: "service_labs_title",
      descKey: "service_labs_desc",
    },
    {
      icon: Heart,
      titleKey: "service_checkup_title",
      descKey: "service_checkup_desc",
    },
    {
      icon: Users,
      titleKey: "service_specialists_title",
      descKey: "service_specialists_desc",
    },
    {
      icon: Clock,
      titleKey: "service_247_title",
      descKey: "service_247_desc",
    },
    {
      icon: Shield,
      titleKey: "service_secure_title",
      descKey: "service_secure_desc",
    },
    {
      icon: FileText,
      titleKey: "service_records_title",
      descKey: "service_records_desc",
    },
  ];

  const plans = [
    {
      nameKey: "plan_basic_name",
      price: 19,
      featureKeys: [
        "plan_basic_f1",
        "plan_basic_f2",
        "plan_basic_f3",
      ],
    },
    {
      nameKey: "plan_premium_name",
      price: 49,
      featureKeys: [
        "plan_premium_f1",
        "plan_premium_f2",
        "plan_premium_f3",
        "plan_premium_f4",
      ],
      popular: true,
    },
    {
      nameKey: "plan_family_name",
      price: 79,
      featureKeys: [
        "plan_family_f1",
        "plan_family_f2",
        "plan_family_f3",
        "plan_family_f4",
      ],
    },
  ];

  const steps = [
    {
      icon: Users,
      titleKey: "step_account_title",
      descKey: "step_account_desc",
    },
    {
      icon: FlaskConical,
      titleKey: "step_choose_title",
      descKey: "step_choose_desc",
    },
    {
      icon: Video,
      titleKey: "step_connect_title",
      descKey: "step_connect_desc",
    },
    {
      icon: Heart,
      titleKey: "step_better_title",
      descKey: "step_better_desc",
    },
  ];

  const benefits = [
    {
      icon: Star,
      titleKey: "benefit_experts_title",
      descKey: "benefit_experts_desc",
    },
    {
      icon: Shield,
      titleKey: "benefit_secure_title",
      descKey: "benefit_secure_desc",
    },
    {
      icon: Clock,
      titleKey: "benefit_247_title",
      descKey: "benefit_247_desc",
    },
    {
      icon: Pill,
      titleKey: "benefit_afford_title",
      descKey: "benefit_afford_desc",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Ali",
      textKey: "testimonial1_text",
      rating: 5,
    },
    {
      name: "Ahmed Hassan",
      textKey: "testimonial2_text",
      rating: 5,
    },
    {
      name: "Fatima Khan",
      textKey: "testimonial3_text",
      rating: 5,
    },
  ];

  return (
    <div>
      {/* ================= HERO SECTION ================= */}

      <section className="relative overflow-hidden bg-gradient-to-b from-primary-100/50 via-primary-50/30 to-transparent px-4 pb-20 pt-16 md:px-6 md:pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* ================= HERO LEFT ================= */}

            <Reveal>
              <h1 className="font-display text-5xl font-bold leading-tight text-ink-900 sm:text-6xl">
                {t("home_heroTitle1")}{" "}
                <span className="text-primary-600">
                  {t("home_heroTitle2")}
                </span>
              </h1>

              <p className="mt-6 text-lg text-ink-500">
                {t("home_heroDesc")}
              </p>

              {/* Buttons */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  <Video size={18} />
                  {t("home_heroBookBtn")}
                </Link>

                <Link
                  to="/emergency"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-red-500 px-7 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Siren size={18} />
                  {t("home_heroEmergencyBtn")}
                </Link>
              </div>

              {/* Stats */}

              <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <p className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                    15K+
                  </p>

                  <p className="text-xs text-ink-500 sm:text-sm">
                    {t("home_stat1Label")}
                  </p>
                </div>

                <div>
                  <p className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                    120+
                  </p>

                  <p className="text-xs text-ink-500 sm:text-sm">
                    {t("home_stat2Label")}
                  </p>
                </div>

                <div>
                  <p className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
                    98%
                  </p>

                  <p className="text-xs text-ink-500 sm:text-sm">
                    {t("home_stat3Label")}
                  </p>
                </div>
              </div>
            </Reveal>

            {/* ================= HERO RIGHT ================= */}

            <Reveal
              delay={150}
              className="relative hidden lg:block"
            >
              <div className="relative h-[32rem] w-full">

                {/* Background */}

                <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary-200 to-primary-100" />

                {/* Doctor Image */}

                <img
                  src={heroDoctor}
                  alt="Doctor ready to help"
                  className="absolute inset-0 h-full w-full rounded-[2.5rem] object-cover object-center shadow-2xl"
                />

                {/* ================= FLOATING CONSULTATION CARD ================= */}

                <div className="animate-float absolute -bottom-6 -right-4 z-10 rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-primary-100 sm:w-72">

                  <div className="flex items-center gap-3">

                    {/* Video Icon */}

                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">

                      <Video size={20} />

                      {/* Online Indicator */}

                      <span className="animate-soft-pulse absolute -end-0.5 -top-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />

                    </div>

                    {/* Text */}

                    <div>
                      <p className="font-semibold text-ink-900">
                        {t("home_heroCardTitle")}
                      </p>

                      <p className="text-xs text-primary-600">
                        {t("home_heroCardSub")}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}

                  <div className="mt-3 flex items-center gap-2">

                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className="fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>

                    <span className="text-xs font-medium text-ink-700">
                      {t("home_heroCardReviews")}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">

        <Reveal className="text-center">
          <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            {t("home_servicesTitle")}
          </h2>

          <p className="mt-3 text-ink-500">
            {t("home_servicesSubtitle")}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {services.map(
            ({ icon: Icon, titleKey, descKey }, i) => (
              <Reveal
                key={titleKey}
                delay={i * 60}
              >
                <div className="group h-full rounded-2xl border border-primary-100 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:ring-1 hover:ring-primary-300">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 transition group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-4 font-display font-semibold text-ink-900">
                    {t(titleKey)}
                  </h3>

                  <p className="mt-2 text-sm text-ink-500">
                    {t(descKey)}
                  </p>
                </div>
              </Reveal>
            )
          )}

        </div>

        <div className="mt-8 text-center">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            {t("home_exploreAll")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">

        <Reveal className="text-center">
          <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            {t("home_stepsTitle")}
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {steps.map(
            ({ icon: Icon, titleKey, descKey }, i) => (
              <Reveal
                key={titleKey}
                delay={i * 80}
                className="text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600 transition hover:scale-105">
                  <Icon size={28} />
                </div>

                <h3 className="mt-4 font-semibold text-ink-900">
                  {t(titleKey)}
                </h3>

                <p className="mt-2 text-sm text-ink-500">
                  {t(descKey)}
                </p>

                {i < steps.length - 1 && (
                  <div className="mt-4 hidden text-primary-400 lg:block">
                    →
                  </div>
                )}
              </Reveal>
            )
          )}

        </div>

        <div className="mt-8 text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            {t("home_getStarted")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ================= PRICING ================= */}

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">

        <Reveal className="text-center">
          <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            {t("home_pricingTitle")}
          </h2>

          <p className="mt-3 text-ink-500">
            {t("home_pricingSubtitle")}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">

          {plans.map(
            ({ nameKey, price, featureKeys, popular }, i) => (
              <Reveal
                key={nameKey}
                delay={i * 100}
              >
                <div
                  className={`relative h-full rounded-3xl border-2 bg-white p-8 text-center transition hover:-translate-y-1 hover:shadow-xl ${
                    popular
                      ? "border-primary-600 shadow-2xl"
                      : "border-primary-100"
                  }`}
                >

                  {popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                      <span className="inline-block rounded-full bg-primary-600 px-4 py-1 text-xs font-bold text-white">
                        {t("plan_popular")}
                      </span>
                    </div>
                  )}

                  <h3 className="font-display text-2xl font-bold text-ink-900">
                    {t(nameKey)}
                  </h3>

                  <div className="mt-4">

                    <span className="font-display text-4xl font-bold text-ink-900">
                      ${price}
                    </span>

                    <span className="text-ink-500">
                      {t("plan_perMonth")}
                    </span>

                  </div>

                  <ul className="mt-6 space-y-3 text-start">

                    {featureKeys.map((fk) => (
                      <li
                        key={fk}
                        className="flex items-center gap-2 text-sm text-ink-700"
                      >
                        <Check
                          size={18}
                          className="shrink-0 text-primary-600"
                        />

                        {t(fk)}
                      </li>
                    ))}

                  </ul>

                  <button
                    className={`mt-8 w-full rounded-full py-3 font-semibold transition ${
                      popular
                        ? "bg-primary-600 text-white hover:bg-primary-700"
                        : "border-2 border-primary-600 text-primary-600 hover:bg-primary-50"
                    }`}
                  >
                    {t("plan_choose")}
                  </button>
                </div>
              </Reveal>
            )
          )}

        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">

        <Reveal className="rounded-3xl bg-gradient-to-r from-primary-600 to-primary-700 p-12 text-white">

          <h2 className="font-display text-3xl font-bold">
            {t("home_whyTitle")}
          </h2>

          <p className="mt-2 text-primary-100">
            {t("home_whySubtitle")}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {benefits.map(
              ({ icon: Icon, titleKey, descKey }) => (
                <div
                  key={titleKey}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm transition hover:bg-white/20"
                >

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-4 font-semibold">
                    {t(titleKey)}
                  </h3>

                  <p className="mt-2 text-sm text-primary-100">
                    {t(descKey)}
                  </p>

                </div>
              )
            )}

          </div>
        </Reveal>
      </section>

      {/* ================= DOCTORS ================= */}

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">

        <Reveal className="flex items-center justify-between">

          <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            {t("home_doctorsTitle")}
          </h2>

          <Link
            to="/search"
            className="text-sm font-semibold text-primary-600"
          >
            {t("home_viewAllDoctors")} →
          </Link>

        </Reveal>

        {topDoctors.length === 0 ? (

          <p className="mt-8 text-center text-sm text-ink-500">
            {t("home_noDoctorsYet")}
          </p>

        ) : (

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {topDoctors.map((doc, i) => (

              <Reveal
                key={doc._id}
                delay={i * 70}
              >

                <Link
                  to={`/doctors/${doc._id}`}
                  className="group block h-full rounded-2xl border border-primary-100 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-lg"
                >

                  {doc.avatarUrl ? (

                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="mx-auto h-16 w-16 rounded-full object-cover"
                    />

                  ) : (

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 font-display text-xl font-bold text-white">
                      {doc.name?.charAt(0)}
                    </div>

                  )}

                  <p className="mt-4 font-semibold text-ink-900">
                    {doc.name}
                  </p>

                  <p className="text-sm text-primary-600">
                    {doc.specialty}
                  </p>

                  <div className="mt-3 flex items-center justify-center gap-1">

                    <Star
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />

                    <span className="text-xs font-medium text-ink-700">
                      {doc.rating?.toFixed(1) || "New"} (
                      {doc.numReviews || 0})
                    </span>

                  </div>

                  <span className="mt-4 block w-full rounded-full bg-primary-600 py-2.5 text-sm font-semibold text-white transition group-hover:bg-primary-700">
                    {t("home_bookNow")}
                  </span>

                </Link>

              </Reveal>

            ))}

          </div>
        )}
      </section>

      {/* ================= TESTIMONIALS ================= */}

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">

        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            {t("home_testimonialsTitle")}
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">

          {testimonials.map(
            ({ name, textKey, rating }, i) => (

              <Reveal
                key={name}
                delay={i * 100}
              >

                <div className="h-full rounded-2xl border border-primary-100 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md">

                  <div className="flex gap-0.5">

                    {[...Array(rating)].map((_, j) => (
                      <Star
                        key={j}
                        size={16}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}

                  </div>

                  <p className="mt-3 text-sm text-ink-700">
                    "{t(textKey)}"
                  </p>

                  <p className="mt-3 font-semibold text-ink-900">
                    {name}
                  </p>

                </div>

              </Reveal>

            )
          )}

        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">

        <Reveal className="rounded-3xl bg-gradient-to-r from-primary-600 to-primary-700 p-12 text-center text-white">

          <h2 className="font-display text-3xl font-bold">
            {t("home_ctaTitle")}
          </h2>

          <p className="mt-3 text-primary-100">
            {t("home_ctaDesc")}
          </p>

          <Link
            to="/register"
            className="mt-6 inline-block rounded-full bg-white px-8 py-3.5 font-semibold text-primary-600 transition hover:bg-primary-50"
          >
            {t("home_ctaBtn")}
          </Link>

        </Reveal>

      </section>
    </div>
  );
}