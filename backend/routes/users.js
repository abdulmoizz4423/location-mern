const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/auth");

// Getting admin details
router.get("/admin", authenticateToken, async (req, res) => {
  try {
    const admin = await User.findOne({ role: "Admin" });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json({ _id: admin._id, username: admin.username });
  } catch (err) {
    console.error("Error fetching admin:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Route to add a task to a user's activeTasks list
router.post("/add-task", authenticateToken, async (req, res) => {
  const { userId, taskId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Citizen not found" });
    }

    if (!user.activeTasks.includes(taskId)) {
      user.activeTasks.push(taskId);
      await user.save();
      return res.status(200).json({ message: "Task added successfully" });
    } else {
      return res.status(400).json({ message: "Task already in the list" });
    }
  } catch (err) {
    console.error("Error adding task to citizen:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Remove task from user's activeTasks list
router.post("/remove-task", authenticateToken, async (req, res) => {
  const { userId, taskId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.activeTasks = user.activeTasks.filter(
      (task) => task.toString() !== taskId
    );
    await user.save();

    res.status(200).json({ message: "Task removed from active tasks" });
  } catch (err) {
    console.error("Error removing task from active tasks:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Existing routes here...

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  console.log("Login attempt:", username, password);

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
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({ token, role: user.role });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Update user location route
router.put("/set-location", authenticateToken, async (req, res) => {
  const { location, userId } = req.body; // Include userId in the request body
  const id = userId || req.user?.id; // Use provided userId or fallback to req.user.id

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.location = location;
    await user.save();
    res.status(200).json({ message: "Location updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/user", authenticateToken, async (req, res) => {
  const userId = req.query.userId || req.user?.id; // Use query parameter or fallback to req.user.id

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/current", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("_id username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
