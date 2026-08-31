const Appointment = require("../models/Appointment");

// Throws a 403 (via res.status + Error, following this codebase's error
// convention) unless the given doctor has at least one appointment with the
// given patient.
async function assertDoctorTreatsPatient(res, doctorId, patientId) {
  const hasHistory = await Appointment.exists({ providerId: doctorId, patientId });
  if (!hasHistory) {
    res.status(403);
    throw new Error("You can only do this for patients you have an appointment with");
  }
}

module.exports = { assertDoctorTreatsPatient };
