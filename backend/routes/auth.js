const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/auth");

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  console.log("Login attempt:", username);

  try {
    const user = await User.findOne({ username });
    console.log("User found:", user);

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Signup route
router.post("/signup", async (req, res) => {
  const { username, password, name, surname, mobile } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      username,
      password,
      name,
      surname,
      mobile: mobile || 0, // Default to 0 if not provided
      role: "Citizen", // default role for signup
      inventory: [],
      location: {
        type: "Point",
        coordinates: [null, null], // Default location
      },
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ token, role: user.role });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Update user location route
router.put("/set-location", authenticateToken, async (req, res) => {
  const { location } = req.body;
  const userId = req.user?.id; // Use the authenticated user's id

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.location = location;
    await user.save();
    res.status(200).json({ message: "Location updated successfully" });
  } catch (err) {
    console.error("Error updating location:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get current user route
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get all users route (for fetching citizens)
router.get("/all-users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Fetch all users
router.get("/", authenticateToken, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
