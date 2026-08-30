// Seeds a handful of demo doctors so the frontend has data to display.
// Run: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Doctor = require("../models/Doctor");

const demoDoctors = [
  {
    name: "Dr. Sara Ahmed",
    email: "sara.ahmed@example.com",
    phone: "01000000001",
    passwordHash: "Password123!",
    specialty: "Cardiology",
    qualifications: ["MD", "Cairo University"],
    consultationFees: 300,
    rating: 4.8,
    numReviews: 120,
    verified: true,
    clinicAddresses: [{ label: "Nasr City Clinic", city: "Cairo", street: "Makram Ebeid St", coordinates: { lat: 30.05, lng: 31.34 } }],
    availableSlots: [{ day: "Mon", from: "10:00", to: "16:00" }],
  },
  {
    name: "Dr. Omar Khalil",
    email: "omar.khalil@example.com",
    phone: "01000000002",
    passwordHash: "Password123!",
    specialty: "Dermatology",
    qualifications: ["MD", "Alexandria University"],
    consultationFees: 250,
    rating: 4.5,
    numReviews: 87,
    verified: true,
    clinicAddresses: [{ label: "Smouha Clinic", city: "Alexandria", street: "Fouad St", coordinates: { lat: 31.2, lng: 29.9 } }],
    availableSlots: [{ day: "Wed", from: "12:00", to: "18:00" }],
  },
  {
    name: "Dr. Mona Fathy",
    email: "mona.fathy@example.com",
    phone: "01000000003",
    passwordHash: "Password123!",
    specialty: "Pediatrics",
    qualifications: ["MD", "Ain Shams University"],
    consultationFees: 200,
    rating: 4.9,
    numReviews: 210,
    verified: true,
    clinicAddresses: [{ label: "Heliopolis Clinic", city: "Cairo", street: "El Nozha St", coordinates: { lat: 30.09, lng: 31.32 } }],
    availableSlots: [{ day: "Sun", from: "09:00", to: "15:00" }],
  },
];

const run = async () => {
  await connectDB();
  await Doctor.deleteMany({ email: { $in: demoDoctors.map((d) => d.email) } });
  for (const d of demoDoctors) {
    await Doctor.create(d);
  }
  console.log(`Seeded ${demoDoctors.length} demo doctors.`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
