const express = require("express");
const router = express.Router();
const EmergencyGood = require("../models/EmergencyGood");
const User = require("../models/User");
const authenticateToken = require("../middleware/auth");

// Get all emergency goods with location information
router.get("/", authenticateToken, async (req, res) => {
  try {
    const goods = await EmergencyGood.find();
    res.json(goods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new emergency good (Admin only)
router.post("/admin/add", authenticateToken, async (req, res) => {
  const { name, category, volume } = req.body;

  try {
    // Add good to EmergencyGood collection without volume
    const existingGood = await EmergencyGood.findOne({ name, category });
    if (!existingGood) {
      const good = new EmergencyGood({ name, category });
      await good.save();
    }

    // Add good to admin's inventory with volume
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Only admins can add goods" });
    }

    const existingGoodInInventory = admin.inventory.find(
      (item) => item.name === name && item.category === category
    );

    if (existingGoodInInventory) {
      existingGoodInInventory.volume += volume;
    } else {
      admin.inventory.push({ name, category, volume });
    }

    await admin.save();
    res.status(200).json({
      message:
        "Goods added to admin inventory and EmergencyGood collection successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove emergency good (Admin only)
router.delete("/admin/remove", authenticateToken, async (req, res) => {
  const { name, category, volume } = req.body;

  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Only admins can remove goods" });
    }

    const existingGoodInInventory = admin.inventory.find(
      (item) => item.name === name && item.category === category
    );

    if (!existingGoodInInventory || existingGoodInInventory.volume < volume) {
      return res
        .status(400)
        .json({ message: "Insufficient goods in inventory" });
    }

    existingGoodInInventory.volume -= volume;
    if (existingGoodInInventory.volume === 0) {
      admin.inventory = admin.inventory.filter(
        (item) => item.name !== name || item.category !== category
      );
    }

    await admin.save();
    res
      .status(200)
      .json({ message: "Goods removed from admin inventory successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Load goods from someone to rescuer
router.post("/rescuer/load", authenticateToken, async (req, res) => {
  const { rescuerId, donorId, category, goodName, volume } = req.body;

  try {
    const rescuer = await User.findById(rescuerId);
    const donor = await User.findById(donorId);
    if (!rescuer) {
      return res.status(404).json({ message: "Rescuer not found" });
    }
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const donorGood = donor.inventory.find(
      (item) => item.name === goodName && item.category === category
    );
    if (!donorGood || donorGood.volume < volume) {
      return res
        .status(400)
        .json({ message: "Insufficient goods in donor's inventory" });
    }

    donorGood.volume -= volume;
    if (donorGood.volume === 0) {
      donor.inventory = donor.inventory.filter(
        (item) => item.name !== goodName || item.category !== category
      );
    }
    await donor.save();

    const existingGoodInInventory = rescuer.inventory.find(
      (item) => item.name === goodName && item.category === category
    );

    if (existingGoodInInventory) {
      existingGoodInInventory.volume += volume;
    } else {
      rescuer.inventory.push({ name: goodName, category, volume });
    }

    await rescuer.save();

    res.status(200).json({ message: "Goods loaded successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unload goods from rescuer to someone
router.post("/rescuer/unload", authenticateToken, async (req, res) => {
  const { rescuerId, recipientId, category, goodName, volume } = req.body;

  try {
    const rescuer = await User.findById(rescuerId);
    const recipient = await User.findById(recipientId);
    if (!rescuer) {
      return res.status(404).json({ message: "Rescuer not found" });
    }
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    const rescuerGood = rescuer.inventory.find(
      (item) => item.name === goodName && item.category === category
    );
    if (!rescuerGood || rescuerGood.volume < volume) {
      return res
        .status(400)
        .json({ message: "Insufficient goods in rescuer's inventory" });
    }

    rescuerGood.volume -= volume;
    if (rescuerGood.volume === 0) {
      rescuer.inventory = rescuer.inventory.filter(
        (item) => item.name !== goodName || item.category !== category
      );
    }
    await rescuer.save();

    const existingGoodInInventory = recipient.inventory.find(
      (item) => item.name === goodName && item.category === category
    );

    if (existingGoodInInventory) {
      existingGoodInInventory.volume += volume;
    } else {
      recipient.inventory.push({ name: goodName, category, volume });
    }

    await recipient.save();

    res.status(200).json({ message: "Goods unloaded successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add emergency good to citizen inventory
router.post("/citizen/add", authenticateToken, async (req, res) => {
  const { userId, name, category, volume } = req.body;

  try {
    const citizen = await User.findById(userId);
    if (!citizen || citizen.role !== "Citizen") {
      return res.status(404).json({ message: "Citizen not found" });
    }

    const existingGoodInInventory = citizen.inventory.find(
      (item) => item.name === name && item.category === category
    );

    if (existingGoodInInventory) {
      existingGoodInInventory.volume += volume;
    } else {
      citizen.inventory.push({ name, category, volume });
    }

    await citizen.save();
    res.status(200).json({ message: "Goods added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove emergency good from citizen inventory
router.post("/citizen/remove", authenticateToken, async (req, res) => {
  const { userId, name, category, volume } = req.body;

  try {
    const citizen = await User.findById(userId);
    if (!citizen || citizen.role !== "Citizen") {
      return res.status(404).json({ message: "Citizen not found" });
    }

    const existingGoodInInventory = citizen.inventory.find(
      (item) => item.name === name && item.category === category
    );

    if (!existingGoodInInventory || existingGoodInInventory.volume < volume) {
      return res
        .status(400)
        .json({ message: "Insufficient goods in inventory" });
    }

    existingGoodInInventory.volume -= volume;
    if (existingGoodInInventory.volume === 0) {
      citizen.inventory = citizen.inventory.filter(
        (item) => item.name !== name || item.category !== category
      );
    }

    await citizen.save();
    res.status(200).json({ message: "Goods removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch goods for any user by ID
router.get("/user/:userId/goods", authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
