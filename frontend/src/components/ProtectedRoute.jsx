import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertCircle } from "lucide-react";

export default function ProtectedRoute({ children, role, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-ink-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = roles || (role ? (Array.isArray(role) ? role : [role]) : null);

  // Check if user has one of the required roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="font-display text-2xl font-bold text-red-900">Access Denied</h2>
          <p className="mt-2 text-sm text-red-700">
            You don't have permission to access this page. This section is reserved for{" "}
            <strong>{allowedRoles.join(" / ")}</strong> only.
          </p>
          <p className="mt-3 text-xs text-red-600">
            Your current role: <strong>{user.role}</strong>
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700"
          >
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  return children;
}
