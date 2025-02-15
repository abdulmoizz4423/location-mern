const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

// Citizen creation route
router.post("/create", async (req, res) => {
  const { username, password, name, surname } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      password: hashedPassword,
      role: "Citizen",
      name,
      surname,
      inventory: [],
      location: {
        type: "Point",
        coordinates: [null, null],
      },
    });

    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating citizen:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Route to fetch all citizens
router.get("/", async (req, res) => {
  try {
    const citizens = await User.find({ role: "Citizen" });
    res.status(200).json(citizens);
  } catch (err) {
    console.error("Error fetching citizens:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
