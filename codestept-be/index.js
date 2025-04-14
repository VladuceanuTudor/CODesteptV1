const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Connect to MongoDB
mongoose
	.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("✅ Connected to MongoDB"))
	.catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
	res.send("🚀 CODestept Backend is running!");
});

// Import routes
const authRoutes = require("./routes/auth");
const problemRoutes = require("./routes/problem"); 
const userRoutes = require("./routes/user");
const homeworkRoutes = require("./routes/homework");
const managerRoutes = require("./routes/manager");
const commentRoutes = require("./routes/comment");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/comments", commentRoutes);

// Fallback for undefined routes
app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

// Start the server
app.listen(PORT, () => {
	console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
