const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Problem = require("../models/Problem");
const auth = require("../middleware/auth");
const manager = require("../middleware/manager"); // Custom manager middleware

// GET all comments for a problem
router.get("/:problemId/comments", auth, async (req, res) => {
    try {
      const problemId = req.params.problemId;
  
      // Verify problem exists
      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: "Problem not found" });
      }
  
      // Fetch comments
      const comments = await Comment.find({ problemId })
        .populate("userId", "username")
        .sort({ createdAt: -1 });
  
      // Include problem title in the response
      res.json({
        comments,
        problemTitle: problem.title, // Assuming the Problem model has a 'title' field
      });
    } catch (err) {
      res.status(500).json({ error: "Error fetching comments" });
    }
  });

// POST a new comment to a problem
router.post("/:problemId/comments", auth, async (req, res) => {
  try {
    const problemId = req.params.problemId;
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "Comment text is required" });
    }

    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Create new comment
    const comment = new Comment({
      text: text.trim(),
      problemId,
      userId: req.user._id, // Set authenticated user as author
    });

    // Save comment
    await comment.save();

    // Populate user details for response
    await comment.populate("userId", "username");

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: "Error creating comment" });
  }
});

// DELETE a comment (manager only)
router.delete("/comments/:commentId", auth, manager, async (req, res) => {
  try {
    const commentId = req.params.commentId;

    // Find and delete comment
    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting comment" });
  }
});

module.exports = router;