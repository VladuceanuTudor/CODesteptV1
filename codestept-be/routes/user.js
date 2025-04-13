const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const admin = require("../middleware/admin");

router.get("/", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("username profilePic xp createdAt role") // Select fields to display
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    const totalUsers = await User.countDocuments();

    res.json({
      users,
      hasMore: skip + limit < totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leaderboard", auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default to top 10
    const users = await User.find()
      .select("username profilePic xp")
      .limit(limit)
      .sort({ xp: -1 }); // Sort by XP descending

    res.json({ users });
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/promote/:userId", auth, admin, async (req, res) => {
  try {
    const userToPromote = await User.findById(req.params.userId);
    if (!userToPromote) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userToPromote.role === "admin") {
      return res.status(400).json({ error: "User is already an admin" });
    }

    userToPromote.role = "admin"; // Change role to admin
    await userToPromote.save();

    res.json({ message: "User promoted to admin successfully", user: userToPromote });
  } catch (error) {
    console.error("❌ Error promoting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Search users with suggestions
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const users = await User.find(
      { username: { $regex: query, $options: "i" } }, // Case-insensitive search
      "username profilePic"
    ).limit(10); // Limit suggestions to 10

    res.json({ users });
  } catch (error) {
    console.error("❌ Error searching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Update username
router.put('/username', auth, async (req, res) => {
  try {
    const { username } = req.body;

    // Check if username exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Numele de utilizator este deja folosit" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    res.json({ message: "Nume de utilizator actualizat", user });
  } catch (err) {
    res.status(500).json({ error: "Eroare server" });
  }
});

router.put('/profile-pic', auth, async (req, res) => {
  try {
    const { profilePic } = req.body;

    if (!profilePic) {
      return res.status(400).json({ error: "Imaginea este necesară" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    res.json({ message: "Poza de profil actualizată", profilePic: user.profilePic });
  } catch (err) {
    res.status(500).json({ error: "Eroare server" });
  }
});

// Get public profile by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .select('-password -resetPasswordToken -resetPasswordExpires -email')
      .populate('starredProblems', 'title _id')   // ← populate with just title and _id
      .populate('solvedProblems', 'title _id');   // ← same here

    if (!user) return res.status(404).json({ error: "Profilul nu a fost găsit" });

    res.json({
      username: user.username,
      xp: user.xp,
      starredProblems: user.starredProblems,
      solvedProblems: user.solvedProblems,
      profilePic: user.profilePic,
      memberSince: user.createdAt
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Eroare server" });
  }
});


// Toggle star a problem
router.put("/star/:problemId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const problemId = req.params.problemId;

    if (!user) return res.status(404).json({ error: "User not found" });

    const isStarred = user.starredProblems.includes(problemId);
    if (isStarred) {
      user.starredProblems = user.starredProblems.filter((id) => id.toString() !== problemId);
    } else {
      user.starredProblems.push(problemId);
    }

    await user.save();
    res.json({ starredProblems: user.starredProblems });
  } catch (err) {
    console.error("❌ Error starring problem:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

  

module.exports = router;