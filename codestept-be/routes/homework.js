// routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Problem = require('../models/Problem'); // Assuming you have a Problem model



// Route: Assign one or more homework problems to a user (admin-only)
router.post("/assign/:userId", auth, admin, async (req, res) => {
    try {
      const { problemIds } = req.body; // expecting an array of problem IDs
      const userId = req.params.userId;
  
      console.log("BODY:", req.body);
  
      // Validate input
      if (!Array.isArray(problemIds) || problemIds.length === 0) {
        return res.status(400).json({ error: "No problems provided" });
      }
  
      // Validate user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      let assignedCount = 0;
  
      for (const problemId of problemIds) {
        const problem = await Problem.findById(problemId);
        if (!problem) {
          console.warn(`⚠️ Problem not found: ${problemId}`);
          continue; // skip invalid problems
        }
  
        const isAlreadyAssigned = user.homework.some(
          (hw) => hw.problemId.toString() === problemId
        );
        const isAlreadySolved = user.solvedProblems.includes(problemId);
  
        if (!isAlreadyAssigned && !isAlreadySolved) {
          user.homework.push({ problemId });
          assignedCount++;
        }
      }
  
      await user.save();
  
      res.json({
        message: `Homework assigned successfully. ${assignedCount} problem(s) added.`,
        homework: user.homework,
      });
    } catch (error) {
      console.error("❌ Error assigning homework:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  

// Route: View a user's homework (any authenticated user)
router.get("/:userId", auth, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find user and populate homework problem details
    const user = await User.findById(userId)
      .select("username homework solvedProblems")
      .populate("homework.problemId", "title _id");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove homework problems that are in solvedProblems
    const solvedProblemIds = user.solvedProblems.map((id) => id.toString());
    user.homework = user.homework.filter(
      (hw) => !solvedProblemIds.includes(hw.problemId.toString())
    );
    await user.save();

    // Prepare response
    const homework = user.homework.map((hw) => ({
      problemId: hw.problemId._id,
      title: hw.problemId.title,
      assignedAt: hw.assignedAt,
    }));

    res.json({
      username: user.username,
      homework,
    });
  } catch (error) {
    console.error("❌ Error fetching homework:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route: Delete a homework problem (admin-only)
router.delete("/:userId/:problemId", auth, admin, async (req, res) => {
  try {
    const { userId, problemId } = req.params;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if homework exists
    const homeworkIndex = user.homework.findIndex(
      (hw) => hw.problemId.toString() === problemId
    );
    if (homeworkIndex === -1) {
      return res.status(404).json({ error: "Homework not found" });
    }

    // Remove homework
    user.homework.splice(homeworkIndex, 1);
    await user.save();

    res.json({ message: "Homework deleted successfully", homework: user.homework });
  } catch (error) {
    console.error("❌ Error deleting homework:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Existing routes (unchanged, for completeness)
// ... (promote, search, username, profile-pic, profile, star routes)

module.exports = router;