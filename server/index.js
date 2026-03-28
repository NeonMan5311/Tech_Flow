  require("dotenv").config();

  const express = require("express");
  const cors = require("cors");
  const mongoose = require("mongoose");
  const authRoutes = require("./routes/auth");
  const groupRoutes = require("./routes/groups");
  const userRoutes = require("./routes/users");
  const forexRoutes = require("./routes/forex");

  const app = express();
  const PORT = process.env.PORT || 5000;
  const MONGO_URI = process.env.MONGO_URI;

  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/groups", groupRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/forex", forexRoutes);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/", (_req, res) => {
    res.status(200).json({ message: "Split Expense API" });
  });

  const startServer = async () => {
    try {
      if (!MONGO_URI) {
        console.warn("MONGO_URI is not set. Skipping database connection.");
      } else {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
      }

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  };

  startServer();