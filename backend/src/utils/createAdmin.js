// Creates (or resets the password of) an admin account from the command line.
// Usage: npm run create-admin -- admin@example.com "StrongPass123!" "Admin Name"
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  const [, , email, password, name = "Admin"] = process.argv;
  if (!email || !password) {
    console.error('Usage: npm run create-admin -- admin@example.com "StrongPass123!" "Admin Name"');
    process.exit(1);
  }

  await connectDB();

  let admin = await User.findOne({ email });
  if (admin) {
    admin.passwordHash = password; // re-hashed by the pre-save hook
    admin.role = "admin";
    await admin.save();
    console.log(`Existing account ${email} promoted to admin / password reset.`);
  } else {
    admin = await User.create({ name, email, phone: "N/A", passwordHash: password, role: "admin" });
    console.log(`Admin account created: ${email}`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
