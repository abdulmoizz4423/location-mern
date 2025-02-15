const express = require("express");
const router = express.Router();
const User = require("../models/User");

/// Fetch base location
router.get("/location", async (req, res) => {
  try {
    const admin = await User.findOne({ role: "Admin" });
    if (admin && admin.location && admin.location.coordinates.length === 2) {
      res.status(200).json(admin);
    } else {
      res.status(404).json({ message: "Base location not found" });
    }
  } catch (err) {
    console.error("Error fetching base location:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Update base location
router.put("/location", async (req, res) => {
  const { location } = req.body;
  if (
    !location ||
    !location.coordinates ||
    location.coordinates.length !== 2 ||
    typeof location.coordinates[0] !== "number" ||
    typeof location.coordinates[1] !== "number"
  ) {
    return res.status(400).json({ message: "Invalid coordinates" });
  }
  try {
    const admin = await User.findOne({ role: "Admin" });
    if (admin) {
      admin.location.coordinates = location.coordinates;
      await admin.save();
      res.status(200).json(admin);
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (err) {
    console.error("Error updating base location:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
