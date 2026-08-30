import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import SearchDoctors from "./pages/SearchDoctors";
import DoctorProfile from "./pages/DoctorProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AIAssistant from "./pages/AIAssistant";
import Pharmacies from "./pages/Pharmacies";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Invoices from "./pages/Invoices";
import Radiology from "./pages/Radiology";
import HealthStatus from "./pages/HealthStatus";
import AdmissionPermits from "./pages/AdmissionPermits";
import LabTests from "./pages/LabTests";
import Consultation from "./pages/Consultation";
import LabDashboard from "./pages/LabDashboard";
import PharmacyDashboard from "./pages/PharmacyDashboard";
const Emergency = React.lazy(() => import("./pages/Emergency"));

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchDoctors />} />
        <Route path="/doctors/:id" element={<DoctorProfile />} />
        <Route path="/pharmacies" element={<Pharmacies />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute role="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute role="patient">
              <Invoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/radiology"
          element={
            <ProtectedRoute role="patient">
              <Radiology />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health-status"
          element={
            <ProtectedRoute role="patient">
              <HealthStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admission-permits"
          element={
            <ProtectedRoute role="patient">
              <AdmissionPermits />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab-tests"
          element={
            <ProtectedRoute role="patient">
              <LabTests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultation/:id"
          element={
            <ProtectedRoute roles={["patient", "doctor"]}>
              <Consultation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lab-dashboard"
          element={
            <ProtectedRoute role="lab">
              <LabDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy-dashboard"
          element={
            <ProtectedRoute role="pharmacy">
              <PharmacyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency"
          element={
            <React.Suspense fallback={<div className="py-24 text-center text-sm text-ink-500">Loading…</div>}>
              <Emergency />
            </React.Suspense>
          }
        />
      </Routes>
    </MainLayout>
  );
}
