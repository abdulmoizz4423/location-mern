const express = require("express");
const Task = require("../models/Task");
const User = require("../models/User");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

// Create a new task
router.post("/", async (req, res) => {
  const { type, issuedBy, goodsCategory, goods, volume } = req.body;

  try {
    const task = new Task({
      type,
      issuedBy: issuedBy || null, // If no issuer is provided, it's from the admin
      goodsCategory,
      goods,
      volume,
    });

    await task.save();

    if (type === "offer" && issuedBy) {
      // Update the user's inventory
      const user = await User.findById(issuedBy);
      if (user && user.role === "Citizen") {
        const inventoryItemIndex = user.inventory.findIndex(
          (item) => item.goods === goods
        );

        if (inventoryItemIndex >= 0) {
          // If the item already exists in the inventory, update the volume
          user.inventory[inventoryItemIndex].volume += volume;
        } else {
          // If the item doesn't exist, add a new item to the inventory
          user.inventory.push({ goods, volume });
        }

        await user.save();
      }
    }

    res.status(201).json(task);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Fetch all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().populate("issuedBy acceptedBy");
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Fetch task by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id).populate("issuedBy acceptedBy");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Update task status (accept or complete task)
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { dateTimeAccepted, acceptedBy, dateTimeCompleted, issuedBy } =
    req.body;

  try {
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (acceptedBy !== undefined) {
      task.acceptedBy = acceptedBy;
    }
    if (dateTimeAccepted !== undefined) {
      task.dateTimeAccepted = dateTimeAccepted;
    }

    if (dateTimeCompleted !== undefined) {
      task.dateTimeCompleted = dateTimeCompleted;
    }

    if (issuedBy !== undefined) {
      task.issuedBy = issuedBy;
    }

    await task.save();
    res.status(200).json(task);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
