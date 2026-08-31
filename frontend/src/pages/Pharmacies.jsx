import React, { useEffect, useState } from "react";
import { Pill, MapPin } from "lucide-react";
import api from "../services/api";

export default function Pharmacies() {
  const [medicine, setMedicine] = useState("");
  const [city, setCity] = useState("");
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ ...(medicine && { medicine }), ...(city && { city }) }).toString();
      const { data } = await api.get(`/pharmacies/search?${query}`);
      setPharmacies(data.pharmacies || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(); }, []); // eslint-disable-line

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">Pharmacies & medicines</h1>
      <p className="mt-1 text-sm text-ink-500">Order medicine straight from your prescription.</p>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-primary-100 bg-white p-4 sm:flex-row">
        <input value={medicine} onChange={(e) => setMedicine(e.target.value)} placeholder="Medicine name" className="flex-1 rounded-lg border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-400" />
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="flex-1 rounded-lg border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-400" />
        <button onClick={search} className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Search</button>
      </div>

      <div className="mt-6 grid gap-3">
        {loading && <p className="text-sm text-ink-500">Loading...</p>}
        {!loading && pharmacies.length === 0 && <p className="text-sm text-ink-500">No pharmacies found yet.</p>}
        {pharmacies.map((ph) => (
          <div key={ph._id} className="flex items-center gap-3 rounded-xl border border-primary-100 bg-white p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700"><Pill size={18} /></span>
            <div className="flex-1">
              <p className="font-medium text-ink-900">{ph.name}</p>
              <p className="flex items-center gap-1 text-sm text-ink-500"><MapPin size={14} /> {ph.address?.street}, {ph.address?.city}</p>
            </div>
            {ph.delivery && <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">Delivery</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
