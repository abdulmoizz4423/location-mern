const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { getRandomLocation } = require("../utils/location");

// Create a new rescuer
router.post("/create", async (req, res) => {
  const { username, password } = req.body;

  console.log("Attempting to create rescuer:", { username, password }); // Log incoming request data

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const center = { latitude: 38.246639, longitude: 21.734573 };
    const location = getRandomLocation(center, 100); // 100 meters radius
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      password,
      role: "Rescuer",
      inventory: [],
      location: {
        type: "Point",
        coordinates: [location.latitude, location.longitude],
      },
    });
    console.log("New rescuer data:", newUser); // Log new user data before saving
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error("Error creating rescuer:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Fetch all rescuers
router.get("/", async (req, res) => {
  try {
    const rescuers = await User.find({ role: "Rescuer" });
    res.status(200).json(rescuers);
  } catch (err) {
    console.error("Error fetching rescuers:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
