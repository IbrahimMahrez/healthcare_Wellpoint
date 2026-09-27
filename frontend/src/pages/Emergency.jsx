import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// Lucide icons are used for consistent, lightweight SVG icons across the app.
import {
  Siren, MapPin, Phone, Navigation, AlertTriangle, LocateFixed,
  Stethoscope, Building2, Loader2, Star,
} from "lucide-react";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { distanceKm } from "../utils/geo";

// Leaflet's default marker icon references image files that don't resolve
// under a bundler — divIcons sidestep that entirely and let each marker
// type carry its own color/meaning at a glance.
function pin(color, Icon) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${color};
      width:34px;height:34px;border-radius:9999px 9999px 9999px 2px;
      transform:rotate(45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,.35);
      border:2px solid white;">
      <div style="transform:rotate(-45deg);color:white;">${Icon}</div>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30],
  });
}

const USER_ICON = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,.35);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});
const HOSPITAL_ICON = pin("#dc2626", "🏥");
const HOSPITAL_ICON_DIM = pin("#f59e0b", "🏥");
const DOCTOR_ICON = pin("#118a64", "🩺");

function FitBounds({ points }) {
  const map = useMap();
  React.useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
}

const STAGES = {
  idle: "idle",
  locating: "locating",
  hospitals: "hospitals",
  doctors: "doctors",
  routing: "routing",
  done: "done",
  denied: "denied",
  error: "error",
};

export default function Emergency() {
  const { t } = useLanguage();
  const [stage, setStage] = useState(STAGES.idle);
  const [userPos, setUserPos] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [route, setRoute] = useState(null); // { coords: [[lat,lng],...], distanceKm, minutes }

  const locate = () => {
    setStage(STAGES.locating);
    if (!navigator.geolocation) {
      setStage(STAGES.error);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos({ lat: latitude, lng: longitude });
        await findHospitals(latitude, longitude);
      },
      () => setStage(STAGES.denied),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const findHospitals = async (lat, lng) => {
    setStage(STAGES.hospitals);
    try {
      const query = `[out:json][timeout:20];(node["amenity"="hospital"](around:8000,${lat},${lng});way["amenity"="hospital"](around:8000,${lat},${lng}););out center tags 20;`;
      const res = await fetch("https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query));
      const data = await res.json();
      const list = (data.elements || [])
        .map((el) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLon = el.lon ?? el.center?.lon;
          if (!elLat || !elLon) return null;
          return {
            id: el.id,
            name: el.tags?.name || "Hospital",
            phone: el.tags?.phone || el.tags?.["contact:phone"],
            lat: elLat,
            lng: elLon,
            distance: distanceKm(lat, lng, elLat, elLon),
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);

      setHospitals(list);
      await findDoctors(lat, lng);
      if (list.length > 0) await routeTo(lat, lng, list[0]);
      else setStage(STAGES.done);
    } catch {
      setHospitals([]);
      await findDoctors(lat, lng);
      setStage(STAGES.done);
    }
  };

  const findDoctors = async (lat, lng) => {
    setStage(STAGES.doctors);
    try {
      const { data } = await api.get("/doctors?limit=100");
      const list = (data.doctors || [])
        .map((doc) => {
          const coords = doc.clinicAddresses?.[0]?.coordinates;
          if (!coords?.lat || !coords?.lng) return null;
          return { ...doc, distance: distanceKm(lat, lng, coords.lat, coords.lng) };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
      setDoctors(list);
    } catch {
      setDoctors([]);
    }
  };

  const routeTo = async (lat, lng, hospital) => {
    setStage(STAGES.routing);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${hospital.lng},${hospital.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      const r = data.routes?.[0];
      if (r) {
        setRoute({
          coords: r.geometry.coordinates.map(([lo, la]) => [la, lo]),
          distanceKm: (r.distance / 1000).toFixed(1),
          minutes: Math.round(r.duration / 60),
        });
      }
    } catch {
      setRoute(null);
    } finally {
      setStage(STAGES.done);
    }
  };

  const primaryHospital = hospitals[0];
  const otherHospitals = hospitals.slice(1, 4);

  const mapPoints = [
    ...(userPos ? [[userPos.lat, userPos.lng]] : []),
    ...(primaryHospital ? [[primaryHospital.lat, primaryHospital.lng]] : []),
  ];

  const StageLabel = {
    [STAGES.locating]: t("emergency_locating"),
    [STAGES.hospitals]: t("emergency_searchingHospitals"),
    [STAGES.doctors]: t("emergency_searchingDoctors"),
    [STAGES.routing]: t("emergency_routing"),
  }[stage];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/40 to-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <Siren size={26} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{t("emergency_title")}</h1>
            <p className="mt-1 text-sm text-ink-500">{t("emergency_subtitle")}</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{t("emergency_disclaimer")}</p>
        </div>

        {stage === STAGES.idle && (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-red-200 bg-white py-16 text-center">
            <LocateFixed className="mx-auto mb-4 text-red-500" size={40} />
            <button
              onClick={locate}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700"
            >
              <LocateFixed size={18} /> {t("emergency_locate_cta")}
            </button>
          </div>
        )}

        {stage === STAGES.denied && (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 py-12 text-center">
            <AlertTriangle className="mx-auto mb-3 text-amber-500" size={36} />
            <p className="font-semibold text-amber-900">{t("emergency_deniedTitle")}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-amber-700">{t("emergency_deniedDesc")}</p>
            <button
              onClick={locate}
              className="mt-4 rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
            >
              {t("emergency_retry")}
            </button>
          </div>
        )}

        {[STAGES.locating, STAGES.hospitals, STAGES.doctors, STAGES.routing].includes(stage) && (
          <div className="mt-8 flex flex-col items-center gap-3 py-16 text-center">
            <Loader2 size={32} className="animate-spin text-red-500" />
            <p className="text-sm font-medium text-ink-600">{StageLabel}</p>
          </div>
        )}

        {stage === STAGES.done && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Map */}
            <div className="overflow-hidden rounded-2xl border border-primary-100 shadow-sm lg:col-span-2">
              <MapContainer center={[userPos.lat, userPos.lng]} zoom={13} style={{ height: "26rem", width: "100%" }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[userPos.lat, userPos.lng]} icon={USER_ICON}>
                  <Popup>{t("emergency_yourLocation")}</Popup>
                </Marker>
                {primaryHospital && (
                  <Marker position={[primaryHospital.lat, primaryHospital.lng]} icon={HOSPITAL_ICON}>
                    <Popup>{primaryHospital.name}</Popup>
                  </Marker>
                )}
                {otherHospitals.map((h) => (
                  <Marker key={h.id} position={[h.lat, h.lng]} icon={HOSPITAL_ICON_DIM}>
                    <Popup>{h.name}</Popup>
                  </Marker>
                ))}
                {doctors.map((d) => {
                  const c = d.clinicAddresses?.[0]?.coordinates;
                  return (
                    <Marker key={d._id} position={[c.lat, c.lng]} icon={DOCTOR_ICON}>
                      <Popup>{d.name} — {d.specialty}</Popup>
                    </Marker>
                  );
                })}
                {route && <Polyline positions={route.coords} pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.75 }} />}
                <FitBounds points={mapPoints} />
              </MapContainer>
            </div>

            {/* Side panel */}
            <div className="space-y-4">
              {primaryHospital ? (
                <div className="rounded-2xl border border-red-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-600">{t("emergency_nearestHospital")}</p>
                  <div className="mt-2 flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <Building2 size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg font-bold text-ink-900">{primaryHospital.name}</p>
                      <p className="text-sm text-ink-500">
                        {t("emergency_distanceAway", { distance: primaryHospital.distance.toFixed(1) })}
                        {route && ` · ${t("emergency_etaDriving", { minutes: route.minutes })}`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {primaryHospital.phone && (
                      <a
                        href={`tel:${primaryHospital.phone}`}
                        className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        <Phone size={13} /> {t("emergency_callHospital")}
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${primaryHospital.lat},${primaryHospital.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Navigation size={13} /> {t("emergency_getDirections")}
                    </a>
                  </div>
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-red-200 bg-white p-5 text-center text-sm text-ink-500">
                  {t("emergency_noHospitals")}
                </p>
              )}

              {otherHospitals.length > 0 && (
                <div className="rounded-2xl border border-primary-100 bg-white p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                    <MapPin size={12} /> {t("emergency_otherHospitals")}
                  </p>
                  <div className="space-y-2">
                    {otherHospitals.map((h) => (
                      <a
                        key={h.id}
                        href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-primary-50"
                      >
                        <span className="truncate text-ink-700">{h.name}</span>
                        <span className="shrink-0 text-xs text-ink-400">{h.distance.toFixed(1)} km</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-primary-100 bg-white p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <Stethoscope size={12} /> {t("emergency_nearestDoctors")}
                </p>
                {doctors.length === 0 ? (
                  <p className="px-2 py-1.5 text-sm text-ink-500">{t("emergency_noDoctors")}</p>
                ) : (
                  <div className="space-y-1">
                    {doctors.map((d) => (
                      <Link
                        key={d._id}
                        to={`/doctors/${d._id}`}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-primary-50"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white">
                          {d.name?.charAt(0)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink-900">{d.name}</p>
                          <p className="truncate text-xs text-ink-500">{d.specialty} · {d.distance.toFixed(1)} km</p>
                        </div>
                        <span className="flex shrink-0 items-center gap-0.5 text-xs text-ink-400">
                          <Star size={11} className="fill-amber-400 text-amber-400" /> {d.rating?.toFixed(1) || "—"}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
