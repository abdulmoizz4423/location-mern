const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const authenticateToken = require("./middleware/auth");
const emergencyGoodsRoutes = require("./routes/emergencyGoods");
const taskRoutes = require("./routes/tasks");
const rescuerRoutes = require("./routes/rescuers");
const citizenRoutes = require("./routes/citizens");
const statisticsRoutes = require("./routes/statistics");
const createAdminUser = require("./scripts/createAdminUser");
const baseRoutes = require("./routes/base");
const userRoutes = require("./routes/users");

const app = express();

dotenv.config();

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    createAdminUser();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/emergency-goods", authenticateToken, emergencyGoodsRoutes);
app.use("/api/tasks", authenticateToken, taskRoutes);
app.use("/api/rescuers", authenticateToken, rescuerRoutes);
app.use("/api/citizens", authenticateToken, citizenRoutes);
app.use("/api/statistics", authenticateToken, statisticsRoutes);
app.use("/api/base", authenticateToken, baseRoutes);
app.use("/api/users", authenticateToken, userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
