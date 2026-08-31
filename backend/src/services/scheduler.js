const Appointment = require("../models/Appointment");
const notify = require("./notify");

const TICK_MS = 20 * 1000; // check every 20s — fine-grained enough without hammering the DB
const GRACE_MS = 15 * 60 * 1000; // 15 minutes past the scheduled time before an unconfirmed request auto-cancels

// 1) Appointments that were confirmed and whose time has arrived: open the
//    in-app consultation room automatically and notify both sides. This is
//    the fix for "the appointment time comes and nothing happens" — nobody
//    has to remember to click anything.
async function startDueSessions() {
  const due = await Appointment.find({
    status: "confirmed",
    sessionStarted: false,
    datetime: { $lte: new Date() },
  });

  for (const appt of due) {
    appt.sessionStarted = true;
    appt.sessionStartedAt = new Date();
    if (!appt.meetingLink) appt.meetingLink = `/consultation/${appt._id}`;
    await appt.save();

    const roomLink = `/consultation/${appt._id}`;

    await notify({
      userId: appt.patientId,
      userRole: "patient",
      type: "appointment_started",
      title: "Your consultation is ready",
      message: "It's time for your appointment — join the chat or video call now.",
      link: roomLink,
    });

    await notify({
      userId: appt.providerId,
      userRole: appt.providerType === "lab" ? "lab" : "doctor",
      type: "appointment_started",
      title: "Your consultation is ready",
      message: "It's time for your appointment — join the chat or video call now.",
      link: roomLink,
    });
  }
}

// 2) Appointments still "pending" (doctor never confirmed or declined) once
//    their time has passed by GRACE_MS: auto-cancel and tell the patient,
//    instead of leaving them with a silently stale request forever.
async function autoCancelUnconfirmed() {
  const cutoff = new Date(Date.now() - GRACE_MS);
  const stale = await Appointment.find({
    status: "pending",
    datetime: { $lte: cutoff },
  });

  for (const appt of stale) {
    appt.status = "cancelled";
    appt.autoCancelled = true;
    await appt.save();

    await notify({
      userId: appt.patientId,
      userRole: "patient",
      type: "appointment_cancelled",
      title: "Appointment auto-cancelled",
      message: "The provider didn't confirm your appointment in time, so it was automatically cancelled. Please book another slot.",
      link: "/dashboard",
    });
  }
}

async function tick() {
  try {
    await startDueSessions();
    await autoCancelUnconfirmed();
  } catch (err) {
    // A scheduler failure should never crash the server — log and retry next tick.
    console.error("scheduler tick failed:", err.message);
  }
}

let intervalHandle = null;

function startScheduler() {
  if (intervalHandle) return; // idempotent — avoid double-starting on hot reload
  tick(); // run once immediately on boot so nothing waits a full TICK_MS on startup
  intervalHandle = setInterval(tick, TICK_MS);
}

function stopScheduler() {
  if (intervalHandle) clearInterval(intervalHandle);
  intervalHandle = null;
}

module.exports = { startScheduler, stopScheduler };
