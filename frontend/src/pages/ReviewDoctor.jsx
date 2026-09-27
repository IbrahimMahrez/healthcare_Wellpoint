import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function ReviewDoctor() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    api.get(`/appointments/${appointmentId}`).then(({ data }) => {
      const appt = data.appointment || data;
      const doc = appt.providerId;
      setDoctor(doc);
      setLoading(false);
    }).catch(() => {
      setError("Couldn't load appointment");
      setLoading(false);
    });
  }, [appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError("Please select a rating");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/reviews", {
        targetType: "doctor",
        targetId: doctor?._id,
        rating,
        comment,
        appointmentId,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-ink-500">
        <Loader2 className="animate-spin" size={18} /> Loading...
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <Link to="/dashboard" className="mt-4 inline-block text-sm font-semibold text-primary-600">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link to="/dashboard" className="flex items-center gap-1 text-sm text-ink-500 hover:text-primary-600 mb-6">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <div className="rounded-2xl border border-primary-100 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-ink-900">{t("dash_leaveReview")}</h2>

        {doctor && (
          <div className="mb-6 flex items-center gap-4 rounded-xl bg-ink-50 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600">
              {doctor.name?.charAt(0) || "?"}
            </div>
            <div>
              <p className="font-semibold text-ink-900">{doctor.name}</p>
              <p className="text-sm text-ink-500">{doctor.specialty}</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.round(doctor.rating || 0) ? "fill-amber-400 text-amber-400" : "text-ink-300"} />
                ))}
                <span className="ml-2 text-sm text-ink-500">{doctor.rating?.toFixed(1) || "New"} ({doctor.numReviews || 0})</span>
              </div>
            </div>
          </div>
        )}

        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto mb-3 text-green-500" size={48} />
            <p className="text-lg font-semibold text-ink-900">Thank you for your review!</p>
            <p className="mt-2 text-sm text-ink-500">Your feedback helps other patients.</p>
            <Link to="/dashboard" className="mt-4 inline-block rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white">Back to dashboard</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-ink-900">{t("dash_yourRating") || "Your Rating"}</p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => {
                  const starRating = i + 1;
                  return (
                    <Star
                      key={i}
                      size={32}
                      className={`cursor-pointer transition ${starRating <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-ink-300"}`}
                      onClick={() => setRating(starRating)}
                      onMouseEnter={() => setHoverRating(starRating)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-900">{t("dash_reviewComment") || "Comment"}</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Write your experience..."
                className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm text-ink-900 outline-none focus:border-primary-400"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !rating}
              className="w-full rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16} /> Submitting...</span> : t("dash_submitReview") || "Submit Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}