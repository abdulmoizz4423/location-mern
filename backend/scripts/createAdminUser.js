const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const createAdminUser = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const username = "admin";
  const password = "admin";
  const role = "Admin";

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    console.log("Admin user already exists");
    return;
  }

  const adminUser = new User({
    username,
    password, // Plain text password, will be hashed by the middleware
    role,
    inventory: [],
    location: {
      type: "Point",
      coordinates: [38.246639, 21.734573], // Center of Patras
    },
  });

  await adminUser.save();
  console.log("Admin user created successfully");
};

module.exports = createAdminUser;
