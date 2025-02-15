const express = require("express");
const router = express.Router();

// Mock data for statistics, replace with real data fetching logic
router.get("/", async (req, res) => {
  try {
    const stats = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      data: [65, 59, 80, 81, 56, 55, 40],
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
